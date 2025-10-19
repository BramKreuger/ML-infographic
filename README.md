# Nederlandse Militaire Luchtvaart Tijdlijn

Interactieve tijdlijn visualisatie van alle vliegtuigen gebruikt door de Nederlandse militaire luchtvaart (KLu, MLD, MLKNIL, LVA, LSK) van 1817-2025.

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open browser op http://localhost:5173
```

De data uit `public/data.xlsx` wordt automatisch geladen bij het starten van de applicatie. Geen handmatige upload nodig!

## 📋 Project Overzicht

- **Tech Stack**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Data bron**: Excel bestand automatisch geladen uit `public/data.xlsx`
- **Bibliotheken**:
  - SheetJS (xlsx) voor Excel parsing
  - Lucide React voor icons
  - Tailwind CSS voor styling

## ✨ Features

### 1. **Interactieve Tijdlijn**
- Horizontale tijdlijn van 1817-2025 (2500px breed)
- Elk vliegtuig = horizontale balk van invoering tot uit dienst
- Kleurcodering per dienst (KLu blauw, MLD donkerblauw, MLKNIL oranje, etc.)
- Hover voor quick info tooltip
- Klik voor uitgebreid infopaneel

### 2. **Zoek & Filter Functionaliteit**
- Zoekbalk voor vliegtuigtype (real-time filtering)
- Dropdown filter voor diensten (KLu, MLD, MLKNIL, LVA, LSK)
- Live updates van statistieken bij filtering

### 3. **Dashboard Statistieken**
- Aantal vliegtuigtypen
- Totaal aantal toestellen
- Toestellen met museumstatus
- Gemiddelde dienstjaren (alleen uitgeschakelde toestellen)

### 4. **Infopaneel per Vliegtuig**
Wanneer gebruiker op vliegtuig klikt:
- Periode & diensttijd
- Aantallen per dienst (KLu/MLD/MLKNIL)
- Bijzonderheden uit Excel
- Museum & behoudstatus
- Links naar IPMS.nl voor uitgebreide info

### 5. **Design Elementen**
- Dark theme met gradient (slate-900 → blue-900)
- Custom scrollbars (blauw-oranje gradient)
- Responsive design
- Smooth animations en hover effects
- Glassmorphism effecten

## 📊 Data Structuur

Het Excel bestand (`public/data.xlsx`) wordt automatisch geladen en heeft deze kolommen:
- **Typenaam**: Naam van vliegtuig
- **Gebruikers**: KLu, MLD, MLKNIL, LVA, LSK, etc.
- **Jaar invoering**: Start diensttijd
- **Jaar uit dienst**: Einde diensttijd
- **Aantal Klu/MLD/MLKNIL**: Aantallen per dienst
- **Totaal**: Som van alle aantallen
- **Bijzonderheden**: Notes, crashes, verkoop info
- **Wrak - museaal - vliegend**: Museumstatus

## 🎨 Kleurenschema

```javascript
KLu/Klu/KLU: '#0055A4' (blauw)
MLD: '#003DA5' (donkerblauw)
MLKNIL: '#FF6B35' (oranje)
LVA: '#8B4513' (bruin)
LSK: '#4A7C59' (groen)
ML: '#2E5C8A' (middenblauw)
RAF: '#5B92E5' (lichtblauw)
```

## 🔧 Project Structuur

```
ML-infographic/
├── public/                      # Static assets
│   └── data.xlsx               # Excel data bestand
├── src/
│   ├── aircraft-timeline.tsx   # Main component
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind imports
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build voor productie
npm run preview  # Preview productie build
```

## 🔗 IPMS.nl Integratie

- Infopaneel bevat directe zoeklink naar IPMS.nl
- Link naar alfabetische vliegtuigenlijst
- Tip voor gebruiker om Claude chat te gebruiken voor uitgebreide informatie

## 🚀 Toekomstige Verbeteringen

### Prioriteit Hoog
- [ ] Historische periode markers (WO1, WO2, Koude Oorlog, etc.)
- [ ] Zoom functionaliteit (inzoomen op specifieke jaren)
- [ ] Export functionaliteit (gefilterde data naar CSV/PDF)

### Prioriteit Midden
- [ ] Meerdere visualisatie views (bar chart, cirkeldiagram, etc.)
- [ ] Print-friendly versie
- [ ] Deel functionaliteit (link naar specifiek vliegtuig)

### Prioriteit Laag
- [ ] 3D Globe voor deployment locaties
- [ ] Foto's van vliegtuigen (via IPMS scraping)
- [ ] Timeline markers voor belangrijke gebeurtenissen

## 💡 Technische Notities

### Automatisch Excel Data Laden
Het Excel bestand wordt automatisch geladen bij het starten:
```javascript
// Auto-load bij component mount
useEffect(() => {
  const loadData = async () => {
    const response = await fetch('/data.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    setAircraftData(data);
  };
  loadData();
}, []);
```

**Let op**: Zorg ervoor dat `public/data.xlsx` up-to-date is met het bronbestand.

### Tijdlijn Berekening
```javascript
const minYear = 1817;
const maxYear = 2025;
const getXPosition = (year) => ((year - minYear) / (maxYear - minYear)) * 100;
```

## 📝 Code Conventies

- React functional components met hooks
- Tailwind utility classes (geen custom CSS)
- Lucide React icons
- State management met useState
- useMemo voor performance bij filtering

---

**Versie**: 2.0
**Status**: Productie-ready met auto-load functionaliteit
