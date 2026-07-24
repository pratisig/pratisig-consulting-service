const XLSX = require('xlsx');
const fs = require('fs');

// Lire le fichier Excel
const workbook = XLSX.readFile('sen_admin_boundaries.xlsx');

console.log('Feuilles disponibles:', workbook.SheetNames);

// Analyser chaque feuille
workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`\n=== Feuille ${index + 1}: ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  if (data.length > 0) {
    console.log('Colonnes:', Object.keys(data[0]));
    console.log('Nombre de lignes:', data.length);
    console.log('Exemple:', data[0]);
  }
});
