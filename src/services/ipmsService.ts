/**
 * IPMS Service - Aircraft Stories Cache
 *
 * This service loads pre-generated aircraft stories from cache.
 * Stories are generated at build time using: npm run generate-cache
 *
 * No API calls are made in the browser - all data comes from the static cache file.
 */

import { findAircraftUrl } from './ipms-aircraft-reference';

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

// Cache for aircraft stories
let cacheData: {
  stories: { [key: string]: AircraftInfo };
  generatedAt?: string;
  version?: number;
} | null = null;

let cacheLoadPromise: Promise<void> | null = null;

/**
 * Load cache from public/cache/aircraft-stories.json
 */
async function loadCache(): Promise<void> {
  // If already loaded, return
  if (cacheData) return;

  // If currently loading, wait for that to finish
  if (cacheLoadPromise) {
    await cacheLoadPromise;
    return;
  }

  // Start loading
  cacheLoadPromise = (async () => {
    try {
      const response = await fetch('/cache/aircraft-stories.json');
      if (response.ok) {
        cacheData = await response.json();
        const storyCount = Object.keys(cacheData?.stories || {}).length;
        console.log(`Cache geladen: ${storyCount} verhalen`);
        if (cacheData?.generatedAt) {
          console.log(`Gegenereerd op: ${new Date(cacheData.generatedAt).toLocaleDateString('nl-NL')}`);
        }
      } else {
        console.warn('Cache bestand niet gevonden. Voer "npm run generate-cache" uit om verhalen te genereren.');
        cacheData = { stories: {} };
      }
    } catch (error) {
      console.warn('Kon cache niet laden:', error);
      cacheData = { stories: {} };
    }
  })();

  await cacheLoadPromise;
}

/**
 * Get aircraft information from cache
 * Returns cached story or fallback message if not found
 */
export const fetchAircraftInfo = async (aircraftName: string): Promise<AircraftInfo> => {
  // Load cache if not already loaded
  await loadCache();

  // Normalize the name (trim whitespace)
  const normalizedName = aircraftName.trim();

  // Check if story exists in cache (try exact match first, then trimmed)
  if (cacheData?.stories[normalizedName]) {
    return cacheData.stories[normalizedName];
  }

  // Not in cache - return clean fallback without error styling
  const fallbackUrl = findAircraftUrl(normalizedName) || `https://www.ipms.nl/zoeken?searchword=${encodeURIComponent(normalizedName)}`;

  return {
    story: `Over de ${normalizedName} is nog geen uitgebreide informatie beschikbaar in onze database.

Klik op de bronlink hieronder om meer te lezen over dit vliegtuigtype op IPMS.nl of Wikipedia.`,
    imageUrl: null,
    source: 'IPMS.nl',
    sourceUrl: fallbackUrl
  };
};

/**
 * Check if cache is loaded and get statistics
 */
export const getCacheStats = async (): Promise<{
  loaded: boolean;
  storyCount: number;
  generatedAt: string | null;
}> => {
  await loadCache();

  return {
    loaded: cacheData !== null,
    storyCount: Object.keys(cacheData?.stories || {}).length,
    generatedAt: cacheData?.generatedAt || null
  };
};

export type { AircraftInfo };
