const XLSX = require('xlsx');
const fs = require('fs');

// Lire le fichier Excel
const workbook = XLSX.readFile('sen_admin_boundaries.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir en JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Colonnes disponibles:', Object.keys(data[0] || {}));
console.log('\nPremières lignes:');
console.log(data.slice(0, 5));
console.log('\nTotal de lignes:', data.length);

// Créer la structure hiérarchique
const hierarchy = {};

data.forEach(row => {
  // Adapter selon les colonnes trouvées
  const region = row.ADM1_FR || row.region || row.REGION;
  const department = row.ADM2_FR || row.department || row.DEPARTMENT;
  const commune = row.ADM3_FR || row.commune || row.COMMUNE;
  const locality = row.ADM4_FR || row.locality || row.VILLAGE || row.QUARTIER;
  
  if (!region) return;
  
  if (!hierarchy[region]) {
    hierarchy[region] = {};
  }
  
  if (!department) return;
  
  if (!hierarchy[region][department]) {
    hierarchy[region][department] = {};
  }
  
  if (!commune) return;
  
  if (!hierarchy[region][department][commune]) {
    hierarchy[region][department][commune] = [];
  }
  
  if (locality && !hierarchy[region][department][commune].includes(locality)) {
    hierarchy[region][department][commune].push(locality);
  }
});

// Sauvegarder en JSON
fs.writeFileSync(
  'lib/data/senegal-locations.json',
  JSON.stringify(hierarchy, null, 2)
);

console.log('\n✅ Données sauvegardées dans lib/data/senegal-locations.json');
console.log('\nRégions trouvées:', Object.keys(hierarchy));
