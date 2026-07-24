import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

const categories = [
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
    ]
  },
  {
    nom: "Alimentation & Épicerie",
    slug: "alimentation-epicerie",
    description: "Produits alimentaires, épicerie",
    sousCategories: [
      { nom: "Épicerie Salée", slug: "epicerie-salee", description: "Riz, huile, conserves, épices" },
      { nom: "Épicerie Sucrée", slug: "epicerie-sucree", description: "Sucre, chocolat, biscuits" },
      { nom: "Boissons", slug: "boissons", description: "Eau, jus, sodas, thé, café" },
      { nom: "Produits Frais", slug: "produits-frais", description: "Fruits, légumes, produits laitiers" },
    ]
  },
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
  {
    nom: "Sport & Loisirs",
    slug: "sport-loisirs",
    description: "Équipements sportifs et loisirs",
    sousCategories: [
      { nom: "Fitness & Musculation", slug: "fitness-musculation", description: "Haltères, tapis de course" },
      { nom: "Sports Collectifs", slug: "sports-collectifs", description: "Football, basketball, volleyball" },
      { nom: "Vélo", slug: "velo", description: "Vélos, accessoires vélo" },
      { nom: "Camping & Randonnée", slug: "camping-randonnee", description: "Tentes, sacs à dos" },
    ]
  },
  {
    nom: "Auto & Moto",
    slug: "auto-moto",
    description: "Pièces et accessoires automobiles",
    sousCategories: [
      { nom: "Pièces Auto", slug: "pieces-auto", description: "Pièces de rechange" },
      { nom: "Accessoires Auto", slug: "accessoires-auto", description: "GPS, housses, nettoyants" },
      { nom: "Outillage", slug: "outillage", description: "Outils de réparation" },
    ]
  },
];

export async function POST() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé - Super Admin uniquement' }, { status: 403 });
  }

  try {
    const created: string[] = [];
    const skipped: string[] = [];

    for (const cat of categories) {
      // Vérifier si la catégorie existe déjà
      let parentCat = await prisma.categorieEcommerce.findUnique({
        where: { slug: cat.slug },
      });

      if (!parentCat) {
        parentCat = await prisma.categorieEcommerce.create({
          data: {
            nom: cat.nom,
            slug: cat.slug,
            description: cat.description,
          },
        });
        created.push(cat.nom);
      } else {
        skipped.push(cat.nom);
      }

      // Créer les sous-catégories
      for (const sousCat of cat.sousCategories) {
        const existing = await prisma.categorieEcommerce.findUnique({
          where: { slug: sousCat.slug },
        });

        if (!existing) {
          await prisma.categorieEcommerce.create({
            data: {
              nom: sousCat.nom,
              slug: sousCat.slug,
              description: sousCat.description,
              parentId: parentCat.id,
            },
          });
          created.push(`  └── ${sousCat.nom}`);
        } else {
          skipped.push(`  └── ${sousCat.nom}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed catégories terminé',
      created,
      skipped,
      totalCreated: created.length,
      totalSkipped: skipped.length,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur lors du seed',
      details: error.message 
    }, { status: 500 });
  }
}
