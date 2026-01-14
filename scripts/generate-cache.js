/**
 * Cache Generator Script
 *
 * Generates AI stories for all aircraft and saves them to a cache file
 * Run with: npm run generate-cache
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { findAircraftUrl } from '../src/services/ipms-aircraft-reference.ts';
import { getBestAircraftPhoto } from '../src/services/photo-scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const CACHE_FILE = path.join(__dirname, '../public/cache/aircraft-stories.json');
const DATA_FILE = path.join(__dirname, '../public/data.xlsx');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

/**
 * Load aircraft data from Excel
 */
function loadAircraftData() {
  console.log('📂 Loading aircraft data from Excel...');

  const workbook = XLSX.readFile(DATA_FILE);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(firstSheet);

  const cleaned = rawData
    .filter(a => a.Typenaam && a['Jaar invoering'])
    .map(a => {
      const startYear = a['Jaar invoering'];
      let endYear = a['Jaar uit dienst'];

      // Handle "heden" or empty endYear
      if (!endYear || endYear === 'heden' || isNaN(endYear)) {
        endYear = 2025;
      }

      // If endYear === startYear, add 1 year minimum visibility
      if (endYear === startYear) {
        endYear = startYear + 1;
      }

      return {
        name: a.Typenaam,
        user: a.Gebruikers || 'Onbekend',
        startYear: startYear,
        endYear: endYear,
        totalCount: a.Totaal || 0,
        klu: a['Aantal Klu'] || 0,
        mld: a['Aantal MLD'] || 0,
        mlknil: a['Aantal MLKNIL'] || 0,
        notes: a.Bijzonderheden || '',
        museum: a['Wrak - museaal - vliegend'] || ''
      };
    });

  console.log(`✅ Loaded ${cleaned.length} aircraft types`);
  return cleaned;
}

/**
 * Fetch IPMS page content using CORS proxy (simplified for Node.js)
 */
async function fetchPageContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Simple text extraction - in Node we could use cheerio, but let's keep it simple
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return textContent.slice(0, 3000);
  } catch (error) {
    return null;
  }
}

/**
 * Generate story for a single aircraft
 */
async function generateStory(aircraft) {
  const model = process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

  // Look up IPMS URL
  const ipmsUrl = findAircraftUrl(aircraft.name) || 'https://www.ipms.nl/artikelen/nedmil-luchtvaart';

  // Fetch photo (Wikipedia → Wikimedia Commons cascade, geen AI credits!)
  console.log('  📷 Fetching photo...');
  const photoData = await getBestAircraftPhoto(aircraft.name, ipmsUrl);

  // Try to fetch page content
  const pageContent = await fetchPageContent(ipmsUrl);

  let systemPrompt = '';
  let userPrompt = '';
  let sourceUrl = ipmsUrl;
  let sourceName = 'IPMS.nl';

  if (pageContent && pageContent.length > 100) {
    // We have IPMS content
    systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Je krijgt de tekstinhoud van een IPMS.nl artikel over een specifiek vliegtuigtype.

Je taak is om deze informatie te verwerken tot een boeiend, lopend verhaaltje van 2-3 alinea's. Focus op:
- Historische context en inzet
- Rol in de Nederlandse militaire luchtvaart
- Interessante feiten of missies
- Technische highlights (bondig)

Schrijf in een toegankelijke, vertellende stijl alsof je een museum bezoeker informeert.
Gebruik ALLEEN informatie uit de gegeven brontekst. Verzin niets.`;

    userPrompt = `Hier is de tekstinhoud van de IPMS.nl pagina over de ${aircraft.name}:

---
${pageContent}
---

Schrijf een informatief en boeiend verhaal op basis van deze informatie.

Geef je antwoord als JSON met deze structuur:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's), gebaseerd op de brontekst",
  "imageUrl": null
}

BELANGRIJK: Gebruik alleen feiten uit de gegeven tekst.`;
  } else {
    // Try Wikipedia
    const wikiUrl = `https://nl.wikipedia.org/wiki/${encodeURIComponent(aircraft.name.replace(/\s+/g, '_'))}`;
    const wikiContent = await fetchPageContent(wikiUrl);

    if (wikiContent && wikiContent.length > 100) {
      sourceUrl = wikiUrl;
      sourceName = 'Wikipedia';

      systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Je krijgt tekstinhoud van een Wikipedia artikel over een vliegtuigtype.

Je taak is om deze informatie te verwerken tot een boeiend, lopend verhaaltje van 2-3 alinea's, met focus op de Nederlandse militaire context.`;

      userPrompt = `Hier is de tekstinhoud van Wikipedia over de ${aircraft.name}:

---
${wikiContent}
---

Schrijf een informatief en boeiend verhaal over dit vliegtuig in Nederlandse militaire dienst.

Geef je antwoord als JSON met deze structuur:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's)",
  "imageUrl": null
}`;
    } else {
      // AI knowledge as last resort
      sourceUrl = wikiUrl;
      sourceName = 'AI Kennis (geen online bron beschikbaar)';

      systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Noch IPMS.nl noch Wikipedia waren beschikbaar, dus je gebruikt je algemene kennis.`;

      userPrompt = `Schrijf een informatief en boeiend verhaal over de ${aircraft.name} in militaire context.

Geef je antwoord als JSON met deze structuur:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's)",
  "imageUrl": null
}`;
    }
  }

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: "json_object" },
    max_tokens: parseInt(process.env.VITE_OPENAI_MAX_TOKENS) || 2000,
  });

  const content = response.choices[0].message.content;
  const parsedData = JSON.parse(content);

  return {
    story: parsedData.story || 'Geen informatie beschikbaar.',
    imageUrl: photoData?.url || null,
    imageData: photoData ? {
      url: photoData.url,
      thumbnail: photoData.thumbnail,
      width: photoData.width,
      height: photoData.height,
      description: photoData.description,
      title: photoData.title,
      language: photoData.language,
      isSchematic: photoData.isSchematic,
      attribution: photoData.attribution
    } : null,
    source: sourceName,
    sourceUrl: sourceUrl,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Load existing cache
 */
function loadCache() {
  try {
    const cacheData = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(cacheData);
  } catch {
    return {
      version: "1.0",
      generated: null,
      stories: {}
    };
  }
}

/**
 * Save cache
 */
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Main generator function
 */
async function generateCache() {
  console.log('🚀 Starting cache generation...\n');

  const aircraft = loadAircraftData();
  const cache = loadCache();

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < aircraft.length; i++) {
    const plane = aircraft[i];
    const progress = `[${i + 1}/${aircraft.length}]`;

    // Check if already cached
    if (cache.stories[plane.name]) {
      console.log(`${progress} ⏭️  Skipped: ${plane.name} (already cached)`);
      skipped++;
      continue;
    }

    try {
      console.log(`${progress} 🔄 Generating: ${plane.name}...`);
      const story = await generateStory(plane);
      cache.stories[plane.name] = story;

      // Save after each generation (so we don't lose progress)
      cache.generated = new Date().toISOString();
      saveCache(cache);

      console.log(`${progress} ✅ Generated: ${plane.name} (source: ${story.source})`);
      generated++;

      // Rate limiting - wait 1 second between requests to avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`${progress} ❌ Failed: ${plane.name}`, error.message);
      failed++;
    }
  }

  console.log('\n📊 Generation Summary:');
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total in cache: ${Object.keys(cache.stories).length}`);
  console.log(`\n💾 Cache saved to: ${CACHE_FILE}`);
}

// Run the generator
generateCache().catch(console.error);
