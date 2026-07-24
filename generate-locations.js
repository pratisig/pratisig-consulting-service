const XLSX = require('xlsx');
const fs = require('fs');

// Lire le fichier Excel
const workbook = XLSX.readFile('sen_admin_boundaries.xlsx');

// Extraire les régions (admin1)
const regionsSheet = workbook.Sheets['sen_admin1'];
const regions = XLSX.utils.sheet_to_json(regionsSheet);

// Extraire les départements (admin2)
const departmentsSheet = workbook.Sheets['sen_admin2'];
const departments = XLSX.utils.sheet_to_json(departmentsSheet);

// Extraire les communes (admin3)
const communesSheet = workbook.Sheets['sen_admin3'];
const communes = XLSX.utils.sheet_to_json(communesSheet);

// Construire la hiérarchie
const hierarchy = {};

// Ajouter les régions
regions.forEach(region => {
  hierarchy[region.adm1_name] = {
    name: region.adm1_name,
    code: region.adm1_pcode,
    lat: region.center_lat,
    lon: region.center_lon,
    departments: {}
  };
});

// Ajouter les départements
departments.forEach(dept => {
  if (hierarchy[dept.adm1_name]) {
    hierarchy[dept.adm1_name].departments[dept.adm2_name] = {
      name: dept.adm2_name,
      code: dept.adm2_pcode,
      lat: dept.center_lat,
      lon: dept.center_lon,
      communes: {}
    };
  }
});

// Ajouter les communes
communes.forEach(commune => {
  if (hierarchy[commune.adm1_name] && 
      hierarchy[commune.adm1_name].departments[commune.adm2_name]) {
    hierarchy[commune.adm1_name].departments[commune.adm2_name].communes[commune.adm3_name] = {
      name: commune.adm3_name,
      code: commune.adm3_pcode,
      lat: commune.center_lat,
      lon: commune.center_lon,
      quartiers: [] // Sera rempli manuellement pour Dakar
    };
  }
});

// Ajouter quelques quartiers connus de Dakar
const dakarQuartiers = {
  'Dakar': {
    'Plateau': [],
    'Médina': [],
    'Grand Dakar': [],
    'HLM': [],
    'Grand Yoff': [],
    'Biscuiterie': [],
    'Fann': [],
    'Point E': [],
    'Mermoz': [],
    'Sacré-Cœur': []
  },
  'Almadies': {
    'Ouakam': [],
    'Ngor': [],
    'Yoff': [],
    'Guinaw Rails': []
  },
  'Parcelles Assainies': {
    'Parcelles Assainies Unité 1': [],
    'Parcelles Assainies Unité 2': [],
    'Parcelles Assainies Unité 3': [],
    'Parcelles Assainies Unité 4': [],
    'Guinaw Rails Sud': [],
    'Guinaw Rails Nord': []
  },
  'Grand Dakar': {
    'Grand Dakar': [],
    'Baux Marais': [],
    'Colobane': []
  }
};

// Appliquer les quartiers de Dakar
if (hierarchy['Dakar']) {
  Object.keys(dakarQuartiers).forEach(commune => {
    if (hierarchy['Dakar'].departments[commune]) {
      hierarchy['Dakar'].departments[commune].quartiers = Object.keys(dakarQuartiers[commune]);
    }
  });
}

// Sauvegarder
const outputPath = 'lib/data/senegal-locations.json';
fs.writeFileSync(outputPath, JSON.stringify(hierarchy, null, 2));

console.log('✅ Fichier généré avec succès !');
console.log(`📍 ${Object.keys(hierarchy).length} régions`);
console.log(`📍 ${departments.length} départements`);
console.log(`📍 ${communes.length} communes`);
console.log(`\n💾 Sauvegardé dans: ${outputPath}`);

// Afficher un exemple
console.log('\n📋 Exemple (Dakar):');
console.log(JSON.stringify(hierarchy['Dakar'], null, 2).substring(0, 1000) + '...');
