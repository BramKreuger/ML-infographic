import XLSX from 'xlsx';

// Read both files
const oldFile = XLSX.readFile('public/data.xlsx');
const newFile = XLSX.readFile('public/data_v2.xlsx');

const oldSheet = oldFile.Sheets[oldFile.SheetNames[0]];
const newSheet = newFile.Sheets[newFile.SheetNames[0]];

const oldData = XLSX.utils.sheet_to_json(oldSheet);

// Check the raw sheet range first
console.log('=== RAW SHEET INFO ===');
console.log('Sheet range:', newSheet['!ref']);

// Try reading with defval to include empty cells
const newDataRaw = XLSX.utils.sheet_to_json(newSheet, { defval: '' });
console.log('\nFirst row (header row):');
console.log(JSON.stringify(newDataRaw[0], null, 2));

console.log('\nSecond row (first data row):');
console.log(JSON.stringify(newDataRaw[1], null, 2));

console.log('\nThird row:');
console.log(JSON.stringify(newDataRaw[2], null, 2));

// Skip first row (legend) in new data
const newData = newDataRaw.slice(1).filter(row => row.Typenaam);

console.log('=== COMPARISON SUMMARY ===\n');

console.log('Old data:');
console.log('  Rows:', oldData.length);
console.log('  Columns:', Object.keys(oldData[0]).join(', '));

console.log('\nNew data:');
console.log('  Rows:', newData.length);
console.log('  Columns:', Object.keys(newData[0]).filter(k => k !== '__EMPTY').join(', '));

console.log('\n=== NEW COLUMNS ===');
const oldCols = Object.keys(oldData[0]);
const newCols = Object.keys(newData[0]).filter(k => k !== '__EMPTY');
const addedCols = newCols.filter(col => !oldCols.includes(col));
addedCols.forEach(col => console.log(`  ✨ ${col}`));

console.log('\n=== NEW AIRCRAFT ===');
const oldNames = new Set(oldData.map(a => a.Typenaam));
const newAircraft = newData.filter(a => !oldNames.has(a.Typenaam));
console.log(`Found ${newAircraft.length} new aircraft:`);
newAircraft.slice(0, 10).forEach(a => console.log(`  ✈️  ${a.Typenaam} (${a.Gebruikers}, ${a['Jaar invoering']}-${a['Jaar uit dienst']})`));
if (newAircraft.length > 10) console.log(`  ... and ${newAircraft.length - 10} more`);

console.log('\n=== SAMPLE ROW COMPARISON ===');
const sampleName = 'F-16 Fighting Falcon';
const oldSample = oldData.find(a => a.Typenaam.includes('F-16')) || oldData[10];
const newSample = newData.find(a => a.Typenaam.includes('F-16')) || newData[10];

console.log('\nOld format:');
console.log(JSON.stringify(oldSample, null, 2));

console.log('\nNew format:');
console.log(JSON.stringify(newSample, null, 2));

console.log('\n=== MUSEUM/WRECK DATA PREVIEW ===');
const withMuseum = newData.filter(a => a['Wrak - museaal - vliegend'] && a['Wrak - museaal - vliegend'] !== 'Geen resten');
console.log(`${withMuseum.length} aircraft have museum/wreck data:`);
withMuseum.slice(0, 5).forEach(a => {
  console.log(`  🏛️  ${a.Typenaam}: ${a['Wrak - museaal - vliegend']}`);
});

console.log('\n=== WRECK ASSESSMENT VALUES ===');
const assessments = {};
newData.forEach(a => {
  const val = a['Wrak assesment'];
  assessments[val] = (assessments[val] || 0) + 1;
});
console.log('Distribution:', assessments);

console.log('\n=== ALL COLUMNS IN NEW DATA ===');
const allColsSet = new Set();
newData.forEach(row => {
  Object.keys(row).forEach(col => allColsSet.add(col));
});
const allColsList = Array.from(allColsSet).filter(k => k !== '__EMPTY');
console.log('All columns found:', allColsList);

console.log('\n=== FOTO COLUMN ===');
const withFoto = newData.filter(a => a.Foto && a.Foto !== '');
console.log(`${withFoto.length} aircraft have Foto data`);
console.log('\nSample Foto values:');
withFoto.slice(0, 20).forEach(a => {
  console.log(`  ${a.Typenaam}: ${a.Foto}`);
});

if (withFoto.length === 0) {
  console.log('  (No Foto data found - column exists but appears empty)');
}

console.log('\n=== SAMPLE FULL ROW ===');
console.log(JSON.stringify(newData[5], null, 2));
