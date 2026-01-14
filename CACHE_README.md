# 📦 Cache Systeem - AI Verhalen

Dit project gebruikt een **static cache systeem** om AI-gegenereerde verhalen op te slaan. Dit voorkomt dat elke gebruiker OpenAI API credits verbruikt.

## 🎯 Voordelen

- ✅ **Eenmalige kosten** - ~€2 voor alle 200+ vliegtuigen
- ⚡ **Instant loading** - geen API calls, direct uit cache
- 🚀 **Onbeperkt schaalbaar** - miljoenen users, geen extra kosten
- 💾 **Versie controle** - cache zit in git, iedereen heeft dezelfde verhalen

## 📁 Structuur

```
public/
└── cache/
    └── aircraft-stories.json    # Cached stories + metadata
scripts/
└── generate-cache.js            # Generator script
```

## 🚀 Cache Genereren

### Eerste keer (alle vliegtuigen)
```bash
npm run generate-cache
```

### Forceer regeneratie (overschrijf bestaande cache)
```bash
npm run generate-cache:force
```

### Progress tijdens generatie:
```
🚀 Starting cache generation...

📂 Loading aircraft data from Excel...
✅ Loaded 215 aircraft types

[1/215] 🔄 Generating: Curtiss P-40...
[1/215] ✅ Generated: Curtiss P-40 (source: IPMS.nl)

[2/215] ⏭️  Skipped: Spitfire (already cached)

[3/215] 🔄 Generating: F-16...
[3/215] ✅ Generated: F-16 (source: IPMS.nl)

...

📊 Generation Summary:
   ✅ Generated: 180
   ⏭️  Skipped: 35
   ❌ Failed: 0
   📁 Total in cache: 215

💾 Cache saved to: public/cache/aircraft-stories.json
```

## ⚙️ Hoe het werkt

### 1. Generator Script (`npm run generate-cache`)
- Leest alle vliegtuigen uit `public/data.xlsx`
- Voor elk vliegtuig:
  1. Check of al in cache → skip
  2. Zoek IPMS.nl URL in database
  3. Probeer IPMS.nl pagina te scrapen
  4. Als IPMS niet werkt → probeer Wikipedia
  5. Als beide falen → gebruik AI kennis
  6. Genereer verhaal met OpenAI
  7. Sla op in cache
- Slaat op na elke generatie (geen progress verlies bij crash)
- Rate limiting: 1 seconde tussen requests

### 2. Runtime (gebruiker bezoekt website)
```typescript
// In ipmsService.ts
async function fetchAircraftInfo(name) {
  // 1. Load cache (eenmalig)
  await loadCache();

  // 2. Check cache
  if (cacheData?.stories[name]) {
    return cacheData.stories[name];  // 💨 Instant!
  }

  // 3. Generate if missing (fallback)
  return await generateStory(name);
}
```

## 📊 Cache File Format

```json
{
  "version": "1.0",
  "generated": "2025-10-20T10:30:00.000Z",
  "stories": {
    "Curtiss P-40": {
      "story": "De Curtiss P-40 Warhawk...",
      "imageUrl": null,
      "source": "IPMS.nl",
      "sourceUrl": "https://www.ipms.nl/.../curtiss-p40",
      "generatedAt": "2025-10-20T10:30:05.123Z"
    },
    "F-16": {
      "story": "De General Dynamics F-16...",
      "imageUrl": null,
      "source": "IPMS.nl",
      "sourceUrl": "https://www.ipms.nl/.../f16",
      "generatedAt": "2025-10-20T10:30:10.456Z"
    }
  }
}
```

## 💰 Kosten Berekening

**OpenAI API kosten (gpt-4o-mini):**
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

**Per vliegtuig (schatting):**
- Input: ~1500 tokens (IPMS pagina)
- Output: ~400 tokens (verhaal)
- Kosten: ~$0.001 per vliegtuig

**Totaal voor 215 vliegtuigen:**
- 215 × $0.001 = **~$0.22** (€0.20)

Zelfs met wat overhead: **< €2 totaal** 🎉

## 🔄 Updates

### Wanneer cache regenereren?
- ✅ Nieuwe vliegtuigen toegevoegd aan Excel
- ✅ Je wilt verhalen updaten/verbeteren
- ✅ Je hebt IPMS URLs gecorrigeerd

### Workflow:
```bash
# 1. Update data.xlsx of ipms-aircraft-reference.ts
# 2. Regenereer alleen nieuwe/gewijzigde entries
npm run generate-cache

# 3. Commit cache updates
git add public/cache/aircraft-stories.json
git commit -m "Update aircraft stories cache"
git push
```

## 🚨 Troubleshooting

### "OpenAI API key niet geconfigureerd"
- Check `.env` file: `VITE_OPENAI_API_KEY=sk-...`

### Generator crasht halverwege
- Geen probleem! Progress is opgeslagen
- Run gewoon opnieuw: `npm run generate-cache`
- Skipped already cached entries

### Cache wordt niet geladen in browser
- Check of file bestaat: `public/cache/aircraft-stories.json`
- Check browser console voor errors
- Hard refresh: `Ctrl+Shift+R`

### Rate limiting errors
- Script wacht al 1 seconde tussen requests
- Verhoog timeout in `generate-cache.js` regel 230

## 📝 Best Practices

1. **Genereer lokaal** - run script op je eigen machine
2. **Commit cache** - cache file zit in git repository
3. **Incrementele updates** - script skipped bestaande entries
4. **Backup** - commit voor je force regenereert
5. **Monitor kosten** - check OpenAI dashboard

## 🎓 Technische Details

**Waarom static cache ipv database?**
- Geen hosting kosten
- Geen database onderhoud
- CDN snelheid (Netlify/Vercel)
- Perfect voor historische data (wijzigt niet)

**Kan ik dit opschalen?**
- Ja! Static cache schaalt lineair
- 1000 vliegtuigen? Nog steeds < €10
- 10000 users? Nog steeds instant
- Cache zit op CDN = onbeperkte schaalbaarheid
