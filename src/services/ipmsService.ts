import OpenAI from 'openai';
import { findAircraftUrl } from './ipms-aircraft-reference';
import { getBestAircraftPhoto } from './photo-scraper';

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key niet geconfigureerd. Vul je API key in .env bestand in.');
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Voor client-side gebruik
  });
};

interface AircraftInfo {
  story: string;
  imageUrl: string | null;
  imageData?: {
    url: string;
    thumbnail: string;
    width: number;
    height: number;
    description: string;
    title: string;
    language: string;
    isSchematic: boolean;
    attribution: {
      required: boolean;
      text: string;
      license: string;
      link: string;
    };
  } | null;
  source: string;
  sourceUrl: string;
}


/**
 * Fetch the actual IPMS.nl page content using a CORS proxy
 */
const fetchIPMSPageContent = async (url: string): Promise<string | null> => {
  try {
    // Use a CORS proxy to fetch the page
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const proxyUrl = corsProxy + encodeURIComponent(url);

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.warn('Could not fetch IPMS page:', response.status);
      return null;
    }

    const html = await response.text();

    // Extract main content (remove scripts, styles, navigation)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get the main article content
    const article = doc.querySelector('article') || doc.querySelector('.item-page') || doc.querySelector('main');
    if (!article) {
      console.warn('Could not find article content on page');
      return null;
    }

    // Clean up the content
    const text = article.textContent || '';
    // Limit to first 3000 characters to save tokens
    return text.slice(0, 3000).trim();
  } catch (error) {
    console.error('Error fetching IPMS page:', error);
    return null;
  }
};

// Cache for aircraft stories
let cacheData: { stories: { [key: string]: AircraftInfo } } | null = null;

/**
 * Load cache from public/cache/aircraft-stories.json
 */
async function loadCache(): Promise<void> {
  if (cacheData) return; // Already loaded

  try {
    const response = await fetch('/cache/aircraft-stories.json');
    if (response.ok) {
      cacheData = await response.json();
      console.log(`✅ Cache loaded: ${Object.keys(cacheData?.stories || {}).length} stories`);
    } else {
      cacheData = { stories: {} };
    }
  } catch (error) {
    console.warn('⚠️ Could not load cache:', error);
    cacheData = { stories: {} };
  }
}

/**
 * Scrape IPMS.nl for aircraft information
 * Uses OpenAI to fetch and parse the IPMS.nl article page
 */
export const fetchAircraftInfo = async (aircraftName: string): Promise<AircraftInfo> => {
  try {
    // Load cache if not already loaded
    await loadCache();

    // Check cache first
    if (cacheData?.stories[aircraftName]) {
      console.log(`💾 Cache hit: ${aircraftName}`);
      return cacheData.stories[aircraftName];
    }

    console.log(`🔄 Cache miss: ${aircraftName} - generating...`);

    const openai = getOpenAIClient();
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

    // Look up the specific IPMS URL from our database
    const ipmsUrl = findAircraftUrl(aircraftName) || 'https://www.ipms.nl/artikelen/nedmil-luchtvaart';
    console.log('Aircraft:', aircraftName, '| IPMS URL:', ipmsUrl);

    // Fetch photo (Wikipedia → Wikimedia Commons cascade, geen AI credits!)
    console.log('📷 Fetching photo for:', aircraftName);
    await getBestAircraftPhoto(aircraftName, ipmsUrl);

    // Try to fetch the actual page content
    const pageContent = await fetchIPMSPageContent(ipmsUrl);

    let systemPrompt = '';
    let userPrompt = '';

    if (pageContent) {
      // We have the actual IPMS page content!
      systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Je krijgt de tekstinhoud van een IPMS.nl artikel over een specifiek vliegtuigtype.

Je taak is om deze informatie te verwerken tot een boeiend, lopend verhaaltje van 2-3 alinea's. Focus op:
- Historische context en inzet
- Rol in de Nederlandse militaire luchtvaart
- Interessante feiten of missies
- Technische highlights (bondig)

Schrijf in een toegankelijke, vertellende stijl alsof je een museum bezoeker informeert.
Gebruik ALLEEN informatie uit de gegeven brontekst. Verzin niets.`;

      userPrompt = `Hier is de tekstinhoud van de IPMS.nl pagina over de ${aircraftName}:

---
${pageContent}
---

Schrijf een informatief en boeiend verhaal op basis van deze informatie.

Geef je antwoord als JSON met deze structuur:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's), gebaseerd op de brontekst",
  "imageUrl": null,
  "sourceUrl": "${ipmsUrl}",
  "sourceName": "IPMS.nl"
}

BELANGRIJK: Gebruik alleen feiten uit de gegeven tekst. Als er weinig informatie in de tekst staat, geef dat dan aan.`;
    } else {
      // Fallback: Try Wikipedia
      console.log('IPMS page not available, trying Wikipedia...');

      // Construct Wikipedia URL
      const wikiUrl = `https://nl.wikipedia.org/wiki/${encodeURIComponent(aircraftName.replace(/\s+/g, '_'))}`;
      const wikiContent = await fetchIPMSPageContent(wikiUrl);

      if (wikiContent) {
        // We have Wikipedia content
        systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Je krijgt tekstinhoud van een Wikipedia artikel over een vliegtuigtype.

Je taak is om deze informatie te verwerken tot een boeiend, lopend verhaaltje van 2-3 alinea's, met focus op de Nederlandse militaire context. Focus op:
- Historische context en inzet door Nederlandse strijdkrachten
- Rol in de Nederlandse militaire luchtvaart
- Interessante feiten of missies
- Technische highlights (bondig)

Schrijf in een toegankelijke, vertellende stijl alsof je een museum bezoeker informeert.
Gebruik ALLEEN informatie uit de gegeven brontekst.`;

        userPrompt = `Hier is de tekstinhoud van Wikipedia over de ${aircraftName}:

---
${wikiContent}
---

Schrijf een informatief en boeiend verhaal over dit vliegtuig in Nederlandse militaire dienst.

Geef je antwoord als JSON met deze structuur:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's), focus op Nederlandse militaire context",
  "imageUrl": null,
  "sourceUrl": "${wikiUrl}",
  "sourceName": "Wikipedia"
}`;
      } else {
        // Last resort: AI knowledge
        systemPrompt = `Je bent een expert in Nederlandse militaire luchtvaartgeschiedenis.
Noch IPMS.nl noch Wikipedia waren beschikbaar, dus je gebruikt je algemene kennis.

Geef een boeiend, lopend verhaaltje van 2-3 alinea's over het vliegtuig. Focus op:
- Historische context en inzet
- Rol in de Nederlandse militaire luchtvaart (indien van toepassing)
- Interessante feiten of missies
- Technische highlights (bondig)

Schrijf in een toegankelijke, vertellende stijl alsof je een museum bezoeker informeert.`;

        userPrompt = `Schrijf een informatief en boeiend verhaal over de ${aircraftName} in militaire context.

Geef je antwoord als JSON met deze structuur:
{
  "story": "Het lopende verhaal over dit vliegtuig (2-3 alinea's)",
  "imageUrl": null,
  "sourceUrl": "https://nl.wikipedia.org/wiki/${encodeURIComponent(aircraftName.replace(/\s+/g, '_'))}",
  "sourceName": "AI Kennis (geen online bron beschikbaar)"
}`;
      }
    }

    // Use OpenAI to analyze and create the story
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Geen response van OpenAI ontvangen');
    }

    const parsedData = JSON.parse(content);

    return {
      story: parsedData.story || 'Geen informatie beschikbaar.',
      imageUrl: parsedData.imageUrl || null,
      source: parsedData.sourceName || 'IPMS.nl',
      sourceUrl: parsedData.sourceUrl || ipmsUrl
    };

  } catch (error) {
    console.error('Error fetching aircraft info:', error);

    const fallbackUrl = findAircraftUrl(aircraftName) || 'https://www.ipms.nl/artikelen/nedmil-luchtvaart';

    // Return fallback data
    return {
      story: `Helaas kon er geen gedetailleerde informatie worden opgehaald over de ${aircraftName}.

Probeer handmatig te zoeken op IPMS.nl voor meer informatie over dit vliegtuigtype.`,
      imageUrl: null,
      source: 'Fout bij ophalen',
      sourceUrl: fallbackUrl
    };
  }
};

export type { AircraftInfo };
