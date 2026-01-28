/**
 * Aircraft Cache Generator
 *
 * This script reads the Excel file and generates stories for all aircraft,
 * by scraping IPMS.nl and Wikipedia content, then using AI to summarize.
 *
 * Priority order:
 * 1. IPMS.nl article (preferred source)
 * 2. Wikipedia article
 * 3. AI knowledge (last resort)
 *
 * Usage:
 *   npm run generate-cache          # Generate missing stories only
 *   npm run generate-cache:force    # Regenerate all stories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const EXCEL_PATH = path.join(projectRoot, 'public', 'data_v3.xlsx');
const CACHE_PATH = path.join(projectRoot, 'public', 'cache', 'aircraft-stories.json');
const IPMS_REFERENCE_PATH = path.join(projectRoot, 'src', 'services', 'ipms-aircraft-reference.ts');

// Parse command line arguments
const forceRegenerate = process.argv.includes('--force');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});
const MODEL = 'gpt-4o-mini';

// Retry settings
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// IPMS.nl base URL
const IPMS_BASE_URL = 'https://www.ipms.nl';

/**
 * Load IPMS aircraft reference database from TypeScript file
 */
function loadIPMSDatabase() {
  try {
    const content = fs.readFileSync(IPMS_REFERENCE_PATH, 'utf8');
    // Extract the database entries using regex
    const entries = [];
    const regex = /\{\s*name:\s*"([^"]+)",\s*url:\s*"([^"]+)"(?:,\s*aliases:\s*\[([^\]]*)\])?\s*\}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const entry = {
        name: match[1],
        url: match[2],
        aliases: match[3] ? match[3].split(',').map(a => a.trim().replace(/"/g, '')) : []
      };
      entries.push(entry);
    }
    console.log(`Loaded ${entries.length} IPMS reference entries`);
    return entries;
  } catch (error) {
    console.warn('Could not load IPMS reference database:', error.message);
    return [];
  }
}

/**
 * Find IPMS URL for an aircraft name
 */
function findIPMSUrl(ipmsDatabase, aircraftName) {
  const normalizedName = aircraftName.toLowerCase().trim();

  for (const entry of ipmsDatabase) {
    if (entry.name.toLowerCase() === normalizedName) {
      return IPMS_BASE_URL + entry.url;
    }
    for (const alias of entry.aliases) {
      if (alias.toLowerCase() === normalizedName) {
        return IPMS_BASE_URL + entry.url;
      }
    }
  }

  // Try partial matching
  for (const entry of ipmsDatabase) {
    if (normalizedName.includes(entry.name.toLowerCase()) ||
        entry.name.toLowerCase().includes(normalizedName)) {
      return IPMS_BASE_URL + entry.url;
    }
  }

  return null;
}

/**
 * Fetch webpage content and extract text
 */
async function fetchWebContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Simple HTML to text conversion
    let text = html
      // Remove scripts and styles
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML tags but keep content
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Limit text length to avoid token limits
    if (text.length > 8000) {
      text = text.substring(0, 8000) + '...';
    }

    return text.length > 200 ? text : null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch content from IPMS.nl
 */
async function fetchIPMSContent(url) {
  console.log(`    Trying IPMS: ${url}`);
  const content = await fetchWebContent(url);
  if (content) {
    console.log(`    IPMS content: ${content.length} chars`);
    return { content, source: 'IPMS.nl', url };
  }
  return null;
}

/**
 * Fetch content from Wikipedia
 */
async function fetchWikipediaContent(aircraftName) {
  // Try Dutch Wikipedia first
  const nlUrl = `https://nl.wikipedia.org/wiki/${encodeURIComponent(aircraftName.replace(/\s+/g, '_'))}`;
  console.log(`    Trying NL Wikipedia: ${nlUrl}`);
  let content = await fetchWebContent(nlUrl);
  if (content) {
    console.log(`    NL Wikipedia content: ${content.length} chars`);
    return { content, source: 'Wikipedia (NL)', url: nlUrl };
  }

  // Try English Wikipedia
  const enUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(aircraftName.replace(/\s+/g, '_'))}`;
  console.log(`    Trying EN Wikipedia: ${enUrl}`);
  content = await fetchWebContent(enUrl);
  if (content) {
    console.log(`    EN Wikipedia content: ${content.length} chars`);
    return { content, source: 'Wikipedia (EN)', url: enUrl };
  }

  return null;
}

/**
 * Generate story from source content using OpenAI
 */
async function generateStoryFromSource(aircraft, sourceContent, retryCount = 0) {
  const systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Je krijgt de tekstinhoud van een webpagina over een vliegtuigtype.

Je taak is om deze informatie te verwerken tot een boeiend, lopend verhaaltje van 2-3 alinea's.

Focus op:
- Historische context en inzet door Nederlandse strijdkrachten
- Rol in de Nederlandse militaire luchtvaart
- Interessante feiten of missies
- Technische highlights (bondig)

Schrijf in een toegankelijke, vertellende stijl alsof je een museum bezoeker informeert.
Gebruik ALLEEN informatie uit de gegeven brontekst. Verzin niets.
Het verhaal moet minimaal 400 karakters lang zijn.`;

  const userPrompt = `Hier is de tekstinhoud van de ${sourceContent.source} pagina over de ${aircraft.name}:

---
${sourceContent.content}
---

Extra context:
- Gebruiker: ${aircraft.user}
- In dienst: ${aircraft.startYear} - ${aircraft.endYear}
- Aantal: ${aircraft.totalCount}

Schrijf een informatief en boeiend verhaal op basis van deze informatie.

Geef je antwoord als JSON:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's, minimaal 400 karakters)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    const parsed = JSON.parse(content);
    if (!parsed.story || parsed.story.length < 200) {
      throw new Error(`Story too short: ${parsed.story?.length || 0} chars`);
    }

    return {
      success: true,
      story: parsed.story,
      source: sourceContent.source,
      sourceUrl: sourceContent.url
    };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (retryCount + 1));
      return generateStoryFromSource(aircraft, sourceContent, retryCount + 1);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Generate story from AI knowledge (fallback)
 */
async function generateStoryFromAI(aircraft, retryCount = 0) {
  const systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Schrijf een boeiend, informatief verhaaltje van 2-3 alinea's over het opgegeven vliegtuigtype.

Focus op:
- Historische context en inzet door Nederlandse strijdkrachten
- Rol in de Nederlandse militaire luchtvaart
- Interessante feiten of missies
- Technische highlights (bondig)

Schrijf in een toegankelijke, vertellende stijl.
Het verhaal moet minimaal 400 karakters lang zijn.`;

  const userPrompt = `Schrijf een informatief verhaal over de ${aircraft.name} in Nederlandse militaire dienst.

Details:
- Gebruiker: ${aircraft.user}
- In dienst: ${aircraft.startYear} - ${aircraft.endYear}
- Aantal: ${aircraft.totalCount}
- Type: ${aircraft.aircraftType}

Geef je antwoord als JSON:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's, minimaal 400 karakters)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    const parsed = JSON.parse(content);
    if (!parsed.story || parsed.story.length < 200) {
      throw new Error(`Story too short: ${parsed.story?.length || 0} chars`);
    }

    return {
      success: true,
      story: parsed.story,
      source: 'AI Kennis',
      sourceUrl: `https://nl.wikipedia.org/wiki/${encodeURIComponent(aircraft.name.replace(/\s+/g, '_'))}`
    };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (retryCount + 1));
      return generateStoryFromAI(aircraft, retryCount + 1);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Main story generation function with source priority
 */
async function generateStory(aircraft, ipmsDatabase) {
  // 1. Try IPMS.nl first
  const ipmsUrl = findIPMSUrl(ipmsDatabase, aircraft.name);
  if (ipmsUrl) {
    const ipmsContent = await fetchIPMSContent(ipmsUrl);
    if (ipmsContent) {
      const result = await generateStoryFromSource(aircraft, ipmsContent);
      if (result.success) return result;
    }
  }

  // 2. Try Wikipedia
  const wikiContent = await fetchWikipediaContent(aircraft.name);
  if (wikiContent) {
    const result = await generateStoryFromSource(aircraft, wikiContent);
    if (result.success) return result;
  }

  // 3. Fall back to AI knowledge
  console.log(`    Using AI knowledge (no source found)`);
  return generateStoryFromAI(aircraft);
}

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadExistingCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const data = fs.readFileSync(CACHE_PATH, 'utf8');
      const cache = JSON.parse(data);
      // Filter out fallback entries
      const validStories = {};
      for (const [name, story] of Object.entries(cache.stories || {})) {
        if (story.source !== 'Fallback' && !story.story?.includes('Helaas kon er geen')) {
          validStories[name] = story;
        }
      }
      cache.stories = validStories;
      return cache;
    }
  } catch (error) {
    console.warn('Could not load existing cache');
  }
  return { stories: {}, generatedAt: null, version: 1 };
}

function saveCache(cache) {
  cache.generatedAt = new Date().toISOString();
  cache.version = 1;
  const cacheDir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\nCache saved to ${CACHE_PATH}`);
}

function readAircraftFromExcel() {
  console.log(`Reading Excel file: ${EXCEL_PATH}`);
  const buffer = fs.readFileSync(EXCEL_PATH);
  const workbook = XLSX.read(buffer);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(firstSheet);

  let rowIndex = 0;
  const aircraft = rawData
    .filter(a => a.Typenaam && a['Jaar invoering'])
    .map(a => {
      rowIndex++;
      const startYear = a['Jaar invoering'];
      let endYear = a['Jaar uit dienst'];
      if (!endYear || endYear === 'heden' || isNaN(endYear)) endYear = 2025;
      if (endYear === startYear) endYear = startYear + 1;

      const imageNumber = String(rowIndex).padStart(3, '0');
      return {
        name: a.Typenaam.trim(),
        user: a.Gebruikers || 'Onbekend',
        startYear, endYear,
        totalCount: a.Totaal || a['Aantal Klu'] || 0,
        aircraftType: a.type || a.Type || 'vliegtuig',
        localImage: `/data_v2.xlsx.files/image${imageNumber}.jpg`,
        rowIndex
      };
    });

  console.log(`Found ${aircraft.length} aircraft\n`);
  return aircraft;
}

function checkLocalImage(localImagePath) {
  return fs.existsSync(path.join(projectRoot, 'public', localImagePath));
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Aircraft Cache Generator (with Web Scraping)');
  console.log('='.repeat(60));
  console.log(`Model: ${MODEL}`);
  console.log(`Force regenerate: ${forceRegenerate}`);
  console.log('Priority: 1. IPMS.nl  2. Wikipedia  3. AI Knowledge\n');

  if (!process.env.VITE_OPENAI_API_KEY) {
    console.error('ERROR: VITE_OPENAI_API_KEY not set');
    process.exit(1);
  }

  // Test API
  console.log('Testing API connection...');
  try {
    const test = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 10,
    });
    console.log(`API OK: ${test.choices[0]?.message?.content}\n`);
  } catch (error) {
    console.error(`API failed: ${error.message}`);
    process.exit(1);
  }

  // Load resources
  const ipmsDatabase = loadIPMSDatabase();
  const cache = loadExistingCache();
  console.log(`Existing cache: ${Object.keys(cache.stories).length} stories`);

  const aircraft = readAircraftFromExcel();
  const toGenerate = forceRegenerate
    ? aircraft
    : aircraft.filter(a => !cache.stories[a.name]);

  console.log(`Need to generate: ${toGenerate.length}`);
  console.log(`Already cached: ${aircraft.length - toGenerate.length}\n`);

  if (toGenerate.length === 0) {
    console.log('All done! Use --force to regenerate.');
    return;
  }

  // Stats
  let stats = { ipms: 0, wiki: 0, ai: 0, failed: 0 };

  for (let i = 0; i < toGenerate.length; i++) {
    const ac = toGenerate[i];
    console.log(`[${i + 1}/${toGenerate.length}] ${ac.name}`);

    const result = await generateStory(ac, ipmsDatabase);

    if (result.success) {
      const hasImage = checkLocalImage(ac.localImage);
      cache.stories[ac.name] = {
        story: result.story,
        imageUrl: hasImage ? ac.localImage : null,
        source: result.source,
        sourceUrl: result.sourceUrl,
        localImage: ac.localImage,
        hasLocalImage: hasImage,
        generatedAt: new Date().toISOString()
      };

      if (result.source === 'IPMS.nl') stats.ipms++;
      else if (result.source.includes('Wikipedia')) stats.wiki++;
      else stats.ai++;

      console.log(`    OK [${result.source}] (${result.story.length} chars)\n`);
    } else {
      stats.failed++;
      console.log(`    FAILED: ${result.error}\n`);
    }

    // Save periodically
    if ((i + 1) % 10 === 0) {
      saveCache(cache);
      console.log(`[Checkpoint saved]\n`);
    }

    // Rate limit
    if (i < toGenerate.length - 1) {
      await sleep(1500);
    }
  }

  saveCache(cache);

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total: ${aircraft.length} | In cache: ${Object.keys(cache.stories).length}`);
  console.log(`Sources: IPMS=${stats.ipms} | Wikipedia=${stats.wiki} | AI=${stats.ai} | Failed=${stats.failed}`);
}

main().catch(console.error);
