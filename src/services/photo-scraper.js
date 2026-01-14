/**
 * Aircraft Photo Scraper
 * Smart strategy voor het vinden van de beste foto's zonder veel AI credits te gebruiken
 * 
 * Strategie:
 * 1. Probeer eerst Nederlandse Wikipedia
 * 2. Als niet gevonden, Engels Wikipedia
 * 3. Filter schematische tekeningen (simpele heuristieken)
 * 4. Alleen AI gebruiken als laatste redmiddel
 */

/**
 * Get Wikipedia photo URL without using AI
 * @param {string} aircraftName - Name of aircraft
 * @returns {Promise<Object>} - Photo data with URL and attribution
 */
export async function getWikipediaPhoto(aircraftName) {
  // Strategie 1: Probeer Nederlandse Wikipedia eerst
  let photoData = await tryWikipediaLanguage(aircraftName, 'nl');
  
  // Strategie 2: Als Nederlands niet werkt, probeer Engels
  if (!photoData || photoData.isSchematic) {
    photoData = await tryWikipediaLanguage(aircraftName, 'en');
  }
  
  return photoData;
}

/**
 * Try to get photo from specific Wikipedia language
 */
async function tryWikipediaLanguage(aircraftName, lang) {
  const baseUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/`;
  const searchTerm = encodeURIComponent(aircraftName);
  
  try {
    const response = await fetch(baseUrl + searchTerm);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Check if we have an image
    if (!data.thumbnail || !data.originalimage) {
      return null;
    }
    
    const imageUrl = data.originalimage.source;
    const thumbnailUrl = data.thumbnail.source;
    
    // Heuristic filtering: detecteer schematische tekeningen
    const isSchematic = detectSchematicDrawing(imageUrl, data.description);
    
    return {
      url: imageUrl,
      thumbnail: thumbnailUrl,
      width: data.originalimage.width,
      height: data.originalimage.height,
      description: data.description,
      title: data.title,
      language: lang,
      isSchematic: isSchematic,
      pageUrl: data.content_urls.desktop.page,
      // Wikipedia attribution (altijd vereist)
      attribution: {
        required: true,
        text: `Bron: Wikipedia (${lang.toUpperCase()})`,
        license: "CC BY-SA 3.0 / Public Domain",
        link: data.content_urls.desktop.page
      }
    };
  } catch (error) {
    console.error(`Error fetching from ${lang}.wikipedia.org:`, error);
    return null;
  }
}

/**
 * Simple heuristics to detect schematic drawings vs real photos
 * Geen AI nodig - gewoon patroon herkenning
 */
function detectSchematicDrawing(imageUrl, description) {
  const url = imageUrl.toLowerCase();
  const desc = (description || '').toLowerCase();
  
  // Red flags voor schematische tekeningen
  const schematicKeywords = [
    'drawing', 'diagram', 'schematic', 'illustration', 
    'orthographic', 'side_view', 'top_view', 'blueprint',
    'tekening', 'schema', 'schets', 'three-view',
    '.svg', // SVG files zijn meestal tekeningen
  ];
  
  // Green flags voor echte foto's
  const photoKeywords = [
    'photo', 'photograph', 'image', 'aircraft',
    'foto', 'vliegtuig', 'flight', 'flying',
    'museum', 'airshow', 'display'
  ];
  
  let schematicScore = 0;
  let photoScore = 0;
  
  // Check URL en description
  schematicKeywords.forEach(keyword => {
    if (url.includes(keyword) || desc.includes(keyword)) {
      schematicScore++;
    }
  });
  
  photoKeywords.forEach(keyword => {
    if (url.includes(keyword) || desc.includes(keyword)) {
      photoScore++;
    }
  });
  
  // Als het een .svg is, bijna zeker een tekening
  if (url.endsWith('.svg')) return true;
  
  return schematicScore > photoScore;
}

/**
 * IPMS photo scraper (als fallback)
 * IPMS heeft vaak goede foto's, maar lastiger te scrapen
 */
export async function getIPMSPhoto(ipmsUrl) {
  // Deze functie zou je met Claude in de chat kunnen implementeren
  // Want IPMS scraping vereist HTML parsing
  
  // Placeholder voor nu:
  return {
    note: "IPMS photos require HTML parsing - use Claude chat for scraping",
    suggestion: "Ask Claude: 'Haal foto's op van deze IPMS pagina: " + ipmsUrl + "'"
  };
}

/**
 * Wikimedia Commons API - voor meer controle
 * Hier kun je specifiek zoeken op categorie "Aircraft" + land
 */
export async function searchWikimediaCommons(aircraftName) {
  const baseUrl = 'https://commons.wikimedia.org/w/api.php';
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${aircraftName} aircraft Netherlands -drawing -diagram`,
    gsrlimit: 5,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    origin: '*' // CORS
  });
  
  try {
    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();
    
    if (!data.query || !data.query.pages) return [];
    
    const images = Object.values(data.query.pages)
      .filter(page => page.imageinfo)
      .map(page => {
        const info = page.imageinfo[0];
        return {
          url: info.url,
          thumbnail: info.thumburl || info.url,
          width: info.width,
          height: info.height,
          title: page.title,
          description: info.extmetadata?.ImageDescription?.value || '',
          license: info.extmetadata?.License?.value || 'Unknown',
          attribution: {
            required: true,
            text: info.extmetadata?.Attribution?.value || 'Wikimedia Commons',
            license: info.extmetadata?.LicenseShortName?.value || 'CC BY-SA',
            link: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`
          }
        };
      });
    
    return images;
  } catch (error) {
    console.error('Error searching Wikimedia Commons:', error);
    return [];
  }
}

/**
 * AI-assisted filtering (ALLEEN als laatste redmiddel)
 * Gebruik dit ALLEEN als je echt niet anders kunt
 */
export async function aiPhotoFilter(imageUrls) {
  // Dit kost credits, dus alleen gebruiken als echt nodig!
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        { 
          role: "user", 
          content: `Van deze afbeelding URLs, welke is een echte FOTO van een vliegtuig (geen tekening)?
URLs: ${imageUrls.join(', ')}

Geef ALLEEN het nummer (0, 1, 2, etc.) van de beste foto. Geen uitleg.`
        }
      ]
    })
  });
  
  const data = await response.json();
  const index = parseInt(data.content[0].text.trim());
  
  return imageUrls[index] || imageUrls[0];
}

/**
 * RECOMMENDED WORKFLOW - Step by step zonder AI
 */
export async function getBestAircraftPhoto(aircraftName, ipmsUrl = null) {
  console.log(`🔍 Searching photo for: ${aircraftName}`);
  
  // STAP 1: Nederlandse Wikipedia
  console.log('📍 Step 1: Trying Dutch Wikipedia...');
  let photo = await getWikipediaPhoto(aircraftName);
  
  if (photo && !photo.isSchematic) {
    console.log('✅ Found good photo on Dutch/English Wikipedia!');
    return photo;
  }
  
  // STAP 2: Wikimedia Commons search
  console.log('📍 Step 2: Searching Wikimedia Commons...');
  const commonsPhotos = await searchWikimediaCommons(aircraftName);
  
  if (commonsPhotos.length > 0) {
    console.log(`✅ Found ${commonsPhotos.length} photos on Wikimedia Commons!`);
    // Return eerste die niet schematisch lijkt
    const goodPhoto = commonsPhotos.find(p => 
      !detectSchematicDrawing(p.url, p.description)
    );
    if (goodPhoto) return goodPhoto;
  }
  
  // STAP 3: IPMS (requires manual scraping via Claude chat)
  if (ipmsUrl) {
    console.log('📍 Step 3: IPMS available - use Claude chat to scrape');
    return {
      source: 'ipms',
      url: null,
      message: `Vraag Claude in de chat: "Haal de eerste goede foto op van ${ipmsUrl}"`,
      manualScrapeNeeded: true
    };
  }
  
  // STAP 4: Fallback - gebruik schematische tekening
  console.log('⚠️ No photo found, using schematic if available');
  return photo || null;
}

/**
 * BULK PROCESSING - voor alle vliegtuigen
 * Gebruik dit om in één keer alle foto's op te halen
 */
export async function bulkFetchPhotos(aircraftList, delayMs = 1000) {
  const results = [];
  
  for (const aircraft of aircraftList) {
    console.log(`Processing: ${aircraft.name}...`);
    
    const photo = await getBestAircraftPhoto(aircraft.name, aircraft.ipmsUrl);
    
    results.push({
      aircraft: aircraft.name,
      photo: photo,
      timestamp: new Date().toISOString()
    });
    
    // Wacht even tussen requests om Wikipedia API niet te overbelasten
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  // Save results to JSON
  const json = JSON.stringify(results, null, 2);
  console.log('✅ Bulk fetch complete! Results:', json);
  
  return results;
}

/**
 * EXAMPLE USAGE:
 */

// Eenvoudig - één vliegtuig
// const photo = await getBestAircraftPhoto("Fokker G.1");

// Bulk - alle vliegtuigen
// import { AIRCRAFT_DATABASE } from './ipms-reference.js';
// const allPhotos = await bulkFetchPhotos(AIRCRAFT_DATABASE);

// AI filtering (ALLEEN als nodig!)
// const bestUrl = await aiPhotoFilter([url1, url2, url3]);