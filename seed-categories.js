// Script pour créer les catégories e-commerce typiques du Sénégal
// À exécuter dans le SQL Editor de Supabase

const categories = [
  // 1. Électronique & Téléphonie
  {
    nom: "Électronique & Téléphonie",
    slug: "electronique-telephonie",
    description: "Smartphones, ordinateurs, accessoires électroniques",
    sousCategories: [
      { nom: "Smartphones", slug: "smartphones", description: "Téléphones mobiles et smartphones" },
      { nom: "Ordinateurs Portables", slug: "ordinateurs-portables", description: "Laptops et notebooks" },
      { nom: "Tablettes", slug: "tablettes", description: "Tablettes tactiles" },
      { nom: "Accessoires Téléphone", slug: "accessoires-telephone", description: "Coques, chargeurs, écouteurs" },
      { nom: "Audio & Son", slug: "audio-son", description: "Écouteurs, haut-parleurs, casques" },
    ]
  },
  
  // 2. Mode & Vêtements
  {
    nom: "Mode & Vêtements",
    slug: "mode-vetements",
    description: "Vêtements, chaussures, accessoires de mode",
    sousCategories: [
      { nom: "Vêtements Homme", slug: "vetements-homme", description: "Chemises, pantalons, tenues traditionnelles" },
      { nom: "Vêtements Femme", slug: "vetements-femme", description: "Robes, jupes, tenues traditionnelles" },
      { nom: "Vêtements Enfant", slug: "vetements-enfant", description: "Vêtements pour enfants" },
      { nom: "Chaussures", slug: "chaussures", description: "Chaussures homme, femme, enfant" },
      { nom: "Sacs & Maroquinerie", slug: "sacs-maroquinerie", description: "Sacs à main, portefeuilles, ceintures" },
      { nom: "Bijoux & Montres", slug: "bijoux-montres", description: "Bijoux, montres, accessoires" },
    ]
  },
  
  // 3. Maison & Décoration
  {
    nom: "Maison & Décoration",
    slug: "maison-decoration",
    description: "Meubles, décoration, articles ménagers",
    sousCategories: [
      { nom: "Meubles", slug: "meubles", description: "Tables, chaises, armoires" },
      { nom: "Décoration", slug: "decoration", description: "Objets décoratifs, tableaux" },
      { nom: "Cuisine & Maison", slug: "cuisine-maison", description: "Ustensiles de cuisine, électroménager" },
      { nom: "Linge de Maison", slug: "linge-maison", description: "Draps, serviettes, rideaux" },
      { nom: "Éclairage", slug: "eclairage", description: "Lampes, lustres, appliques" },
    ]
  },
  
  // 4. Beauté & Santé
  {
    nom: "Beauté & Santé",
    slug: "beaute-sante",
    description: "Cosmétiques, soins, produits de santé",
    sousCategories: [
      { nom: "Soins Visage", slug: "soins-visage", description: "Crèmes, sérums, nettoyants" },
      { nom: "Soins Corps", slug: "soins-corps", description: "Lotions, gels douche, huiles" },
      { nom: "Maquillage", slug: "maquillage", description: "Fond de teint, rouge à lèvres, mascara" },
      { nom: "Parfums", slug: "parfums", description: "Parfums homme et femme" },
      { nom: "Santé & Bien-être", slug: "sante-bien-etre", description: "Compléments, produits naturels" },
      { nom: "Hygiène", slug: "hygiene", description: "Savons, dentifrices, déodorants" },
    ]
  },
  
  // 5. Alimentation & Épicerie
  {
    nom: "Alimentation & Épicerie",
    slug: "alimentation-epicerie",
    description: "Produits alimentaires, épicerie fine",
    sousCategories: [
      { nom: "Épicerie Salée", slug: "epicerie-salee", description: "Riz, huile, conserves, épices" },
      { nom: "Épicerie Sucrée", slug: "epicerie-sucree", description: "Sucre, chocolat, biscuits" },
      { nom: "Boissons", slug: "boissons", description: "Eau, jus, sodas, thé, café" },
      { nom: "Produits Frais", slug: "produits-frais", description: "Fruits, légumes, produits laitiers" },
      { nom: "Surgelés", slug: "surgeles", description: "Produits congelés" },
    ]
  },
  
  // 6. Bébé & Enfant
  {
    nom: "Bébé & Enfant",
    slug: "bebe-enfant",
    description: "Articles pour bébés et enfants",
    sousCategories: [
      { nom: "Vêtements Bébé", slug: "vetements-bebe", description: "Body, pyjamas, tenues" },
      { nom: "Puericulture", slug: "puericulture", description: "Poussettes, sièges auto, biberons" },
      { nom: "Jeux & Jouets", slug: "jeux-jouets", description: "Jouets éducatifs, jeux de société" },
      { nom: "Articles Scolaires", slug: "articles-scolaires", description: "Fournitures scolaires, cartables" },
    ]
  },
  
  // 7. Sport & Loisirs
  {
    nom: "Sport & Loisirs",
    slug: "sport-loisirs",
    description: "Équipements sportifs, loisirs",
    sousCategories: [
      { nom: "Fitness & Musculation", slug: "fitness-musculation", description: "Haltères, tapis de course" },
      { nom: "Sports Collectifs", slug: "sports-collectifs", description: "Football, basketball, volleyball" },
      { nom: "Vélo", slug: "velo", description: "Vélos, accessoires vélo" },
      { nom: "Camping & Randonnée", slug: "camping-randonnee", description: "Tentes, sacs à dos" },
      { nom: "Jeux Vidéo", slug: "jeux-video", description: "Consoles, jeux, accessoires" },
    ]
  },
  
  // 8. Auto & Moto
  {
    nom: "Auto & Moto",
    slug: "auto-moto",
    description: "Pièces et accessoires automobiles",
    sousCategories: [
      { nom: "Pièces Auto", slug: "pieces-auto", description: "Pièces de rechange" },
      { nom: "Accessoires Auto", slug: "accessoires-auto", description: "GPS, housses, nettoyants" },
      { nom: "Moto & Scooter", slug: "moto-scooter", description: "Pièces et accessoires moto" },
      { nom: "Outillage", slug: "outillage", description: "Outils de réparation" },
    ]
  },
  
  // 9. Bricolage & Jardin
  {
    nom: "Bricolage & Jardin",
    slug: "bricolage-jardin",
    description: "Outils, matériaux, jardinage",
    sousCategories: [
      { nom: "Outils", slug: "outils", description: "Outils manuels et électriques" },
      { nom: "Matériaux", slug: "materiaux", description: "Bois, peinture, quincaillerie" },
      { nom: "Jardinage", slug: "jardinage", description: "Plantes, outils de jardin" },
      { nom: "Équipement Extérieur", slug: "equipement-exterieur", description: "Mobilier de jardin, barbecue" },
    ]
  },
  
  // 10. Livres & Médias
  {
    nom: "Livres & Médias",
    slug: "livres-medias",
    description: "Livres, musique, films",
    sousCategories: [
      { nom: "Livres", slug: "livres", description: "Romans, essais, manuels" },
      { nom: "Musique", slug: "musique", description: "CDs, vinyles, instruments" },
      { nom: "Films & Séries", slug: "films-series", description: "DVDs, Blu-rays" },
    ]
  },
];

// Générer les instructions SQL
console.log("-- Catégories pour Pratisig E-commerce (Sénégal)");
console.log("-- Exécutez ce script dans le SQL Editor de Supabase\n");

categories.forEach(cat => {
  console.log(`-- Catégorie: ${cat.nom}`);
  console.log(`INSERT INTO "CategorieEcommerce" (nom, slug, description, "createdAt", "updatedAt")`);
  console.log(`VALUES ('${cat.nom}', '${cat.slug}', '${cat.description}', NOW(), NOW());`);
  console.log("");
  
  cat.sousCategories.forEach(sousCat => {
    console.log(`  -- Sous-catégorie: ${sousCat.nom}`);
    console.log(`  INSERT INTO "CategorieEcommerce" (nom, slug, description, "parentId", "createdAt", "updatedAt")`);
    console.log(`  VALUES ('${sousCat.nom}', '${sousCat.slug}', '${sousCat.description}',`);
    console.log(`  (SELECT id FROM "CategorieEcommerce" WHERE slug = '${cat.slug}'), NOW(), NOW());`);
    console.log("");
  });
  
  console.log("---\n");
});

console.log("-- Fin du script de création des catégories");
