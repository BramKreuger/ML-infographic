# Nederlandse Militaire Luchtvaart Tijdlijn
## Project Documentatie voor Claude Code

### 📋 Project Overzicht
Interactieve tijdlijn visualisatie van alle vliegtuigen gebruikt door de Nederlandse militaire luchtvaart (KLu, MLD, MLKNIL, LVA, LSK) van 1817-2025.

### 🎯 Huidige Status
- **Platform**: React artifact (React + Tailwind CSS)
- **Data bron**: Excel bestand (`Alle vliegtuigen KLu MLD MLKNIL concept.xlsx`)
- **Bibliotheken**: 
  - SheetJS (xlsx) voor Excel parsing
  - Lucide React voor icons
  - Tailwind CSS voor styling

### ✨ Geïmplementeerde Features

#### 1. **Interactieve Tijdlijn**
- Horizontale tijdlijn van 1817-2025 (2500px breed voor veel scroll ruimte)
- Elk vliegtuig = horizontale balk van invoering tot uit dienst
- Kleurcodering per dienst (KLu blauw, MLD donkerblauw, MLKNIL oranje, etc.)
- Hover voor quick info tooltip
- Klik voor uitgebreid infopaneel

#### 2. **Zoek & Filter Functionaliteit**
- Zoekbalk voor vliegtuigtype (real-time filtering)
- Dropdown filter voor diensten (KLu, MLD, MLKNIL, LVA, LSK)
- Live updates van statistieken bij filtering

#### 3. **Dashboard Statistieken**
- Aantal vliegtuigtypen
- Totaal aantal toestellen
- Toestellen met museumstatus
- Gemiddelde dienstjaren (alleen uitgeschakelde toestellen)

#### 4. **Infopaneel per Vliegtuig**
Wanneer gebruiker op vliegtuig klikt:
- Periode & diensttijd
- Aantallen per dienst (KLu/MLD/MLKNIL)
- Bijzonderheden uit Excel
- Museum & behoudstatus
- Links naar IPMS.nl voor uitgebreide info
- Tip om Claude chat te gebruiken voor gedetailleerde informatie

#### 5. **Design Elementen**
- Dark theme met gradient (slate-900 → blue-900)
- Custom scrollbars (blauw-oranje gradient)
- Responsive design
- Smooth animations en hover effecten
- Glassmorphism effecten

### 📊 Data Structuur
Excel bestand heeft deze kolommen:
- **Typenaam**: Naam van vliegtuig
- **Gebruikers**: KLu, MLD, MLKNIL, LVA, LSK, etc.
- **Jaar invoering**: Start diensttijd
- **Jaar uit dienst**: Einde diensttijd
- **Aantal Klu/MLD/MLKNIL**: Aantallen per dienst
- **Totaal**: Som van alle aantallen
- **Bijzonderheden**: Notes, crashes, verkoop info
- **Wrak - museaal - vliegend**: Museumstatus

### 🎨 Kleurenschema
```javascript
KLu/Klu/KLU: '#0055A4' (blauw)
MLD: '#003DA5' (donkerblauw)
MLKNIL: '#FF6B35' (oranje)
LVA: '#8B4513' (bruin)
LSK: '#4A7C59' (groen)
ML: '#2E5C8A' (middenblauw)
RAF: '#5B92E5' (lichtblauw)
```

### 🔗 IPMS.nl Integratie
- Infopaneel bevat directe zoeklink naar IPMS.nl
- Link naar alfabetische vliegtuigenlijst
- Tip voor gebruiker om Claude chat te gebruiken voor web scraping
- **Note**: Claude API in artifacts heeft GEEN toegang tot web_search/web_fetch tools

### 🚀 Toekomstige Verbeteringen (Ideeën)

#### Prioriteit Hoog
- [ ] File upload via drag-and-drop
- [ ] Export functionaliteit (gefilterde data naar CSV/PDF)
- [ ] Historische periode markers (WO1, WO2, Koude Oorlog, etc.)
- [ ] Zoom functionaliteit (inzoomen op specifieke jaren)

#### Prioriteit Midden
- [ ] Meerdere visualisatie views:
  - [ ] Bar chart race animatie door de tijd
  - [ ] Cirkeldiagram per periode
  - [ ] Netwerkgraph van relaties tussen typen
- [ ] Print-friendly versie
- [ ] Deel functionaliteit (link naar specifiek vliegtuig)

#### Prioriteit Laag
- [ ] 3D Globe voor deployment locaties
- [ ] AI chatbot sidebar voor vragen over de dataset
- [ ] Foto's van vliegtuigen (via IPMS scraping)
- [ ] Audio uitspraak van vliegtuignamen

### 🐛 Bekende Issues / Beperkingen
1. **Excel import**: Werkt alleen via file input, niet via chat upload
2. **IPMS data**: Claude API in artifacts kan niet zelf scrapen
3. **Browser storage**: localStorage/sessionStorage NIET beschikbaar in artifacts
4. **Responsive**: Timeline breedte fixed op 2500px (niet responsive)

### 💡 Technische Notities

#### Excel Data Laden
```javascript
const arrayBuffer = await file.arrayBuffer();
const workbook = XLSX.read(arrayBuffer);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
```

#### Tijdlijn Berekening
```javascript
const minYear = 1817;
const maxYear = 2025;
const getXPosition = (year) => ((year - minYear) / (maxYear - minYear)) * 100;
```

#### Gemiddelde Dienstjaren
Alleen vliegtuigen met `endYear < 2025` (uitgeschakelde toestellen) worden meegeteld.

### 📝 Code Conventies
- React functional components met hooks
- Tailwind utility classes (geen custom CSS)
- Lucide React icons
- State management met useState
- useMemo voor performance bij filtering

### 🔧 Dependencies (in artifact beschikbaar)
```json
{
  "react": "latest",
  "lucide-react": "0.263.1",
  "xlsx": "latest"
}
```

### 📞 Contact / Support
Voor vragen over IPMS.nl data of historische context:
- Website: https://www.ipms.nl/artikelen/nedmil-luchtvaart
- Vraag Claude in de chat voor web scraping

---

**Laatste update**: Oktober 2025  
**Versie**: 1.0  
**Status**: Werkend prototype klaar voor verdere ontwikkeling in Claude Code