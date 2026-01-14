import XLSX from 'xlsx';

const newFile = XLSX.readFile('public/data_v2.xlsx');
const newSheet = newFile.Sheets[newFile.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(newSheet, { defval: '' });

console.log('=== IMAGE MAPPING VERIFICATION ===\n');

let rowIndex = 0;
const aircraftWithImages = rawData
  .slice(1) // Skip legend row
  .filter(a => a.Typenaam && a['Jaar invoering'])
  .map(a => {
    rowIndex++;
    const imageNumber = String(rowIndex).padStart(3, '0');
    const imagePath = `/data_v2.xlsx.files/image${imageNumber}.png`;

    return {
      row: rowIndex,
      aircraft: a.Typenaam,
      imagePath: imagePath
    };
  });

console.log('First 10 aircraft with their image paths:');
aircraftWithImages.slice(0, 10).forEach(item => {
  console.log(`Row ${item.row}: ${item.aircraft.padEnd(30)} -> ${item.imagePath}`);
});

console.log(`\n... ${aircraftWithImages.length} aircraft total\n`);

console.log('Last 5 aircraft:');
aircraftWithImages.slice(-5).forEach(item => {
  console.log(`Row ${item.row}: ${item.aircraft.padEnd(30)} -> ${item.imagePath}`);
});
