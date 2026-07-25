-- ═══════════════════════════════════════════════════════════════════════════════
-- CRÉATION DES TABLES MANQUANTES POUR ALIMENTATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Table des catégories d'alimentation
CREATE TABLE IF NOT EXISTS "CategorieAlimentation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nom TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insérer des catégories par défaut
INSERT INTO "CategorieAlimentation" (nom) VALUES
  ('Épicerie'),
  ('Boissons'),
  ('Hygiène'),
  ('Produits frais'),
  ('Surgelés'),
  ('Boulangerie'),
  ('Viandes'),
  ('Fruits et Légumes')
ON CONFLICT (nom) DO NOTHING;

-- Table des articles d'alimentation
CREATE TABLE IF NOT EXISTS "ArticleAlimentation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nom TEXT NOT NULL,
  prix FLOAT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unite TEXT NOT NULL DEFAULT 'unité',
  "categorieId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "ArticleAlimentation_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieAlimentation"(id) ON DELETE SET NULL
);

-- Table des sessions de caisse
CREATE TABLE IF NOT EXISTS "CaisseSession" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "caissierId" TEXT NOT NULL,
  "montantOuverture" FLOAT NOT NULL DEFAULT 0,
  "montantFermeture" FLOAT,
  statut TEXT NOT NULL DEFAULT 'OUVERTE',
  "openedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "closedAt" TIMESTAMP,
  CONSTRAINT "CaisseSession_caissierId_fkey" FOREIGN KEY ("caissierId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Table des ventes
CREATE TABLE IF NOT EXISTS "VenteAlimentation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  total FLOAT NOT NULL,
  "modePaiement" TEXT NOT NULL DEFAULT 'ESPECES',
  statut TEXT NOT NULL DEFAULT 'FERMEE',
  "caisseSessionId" TEXT,
  "caissierNodeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "VenteAlimentation_caisseSessionId_fkey" FOREIGN KEY ("caisseSessionId") REFERENCES "CaisseSession"(id) ON DELETE SET NULL,
  CONSTRAINT "VenteAlimentation_caissierNodeId_fkey" FOREIGN KEY ("caissierNodeId") REFERENCES "User"(id)
);

-- Table des lignes de vente
CREATE TABLE IF NOT EXISTS "LigneVente" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "venteId" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  quantite INT NOT NULL,
  "prixUnit" FLOAT NOT NULL,
  total FLOAT NOT NULL,
  CONSTRAINT "LigneVente_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "VenteAlimentation"(id) ON DELETE CASCADE,
  CONSTRAINT "LigneVente_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "ArticleAlimentation"(id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS "ArticleAlimentation_categorieId_idx" ON "ArticleAlimentation"("categorieId");
CREATE INDEX IF NOT EXISTS "ArticleAlimentation_isActive_idx" ON "ArticleAlimentation"("isActive");
CREATE INDEX IF NOT EXISTS "CaisseSession_caissierId_idx" ON "CaisseSession"("caissierId");
CREATE INDEX IF NOT EXISTS "CaisseSession_statut_idx" ON "CaisseSession"(statut);
CREATE INDEX IF NOT EXISTS "VenteAlimentation_caissierNodeId_idx" ON "VenteAlimentation"("caissierNodeId");
CREATE INDEX IF NOT EXISTS "VenteAlimentation_createdAt_idx" ON "VenteAlimentation"("createdAt");

-- ═══════════════════════════════════════════════════════════════════════════════
-- ASSIGNATION DE LIVREURS POUR LIVRAISONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ajouter une colonne pour le livreur assigné (si pas déjà fait)
ALTER TABLE "Livraison" ADD COLUMN IF NOT EXISTS "livreurAssigneId" TEXT;
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_livreurAssigneId_fkey" 
  FOREIGN KEY ("livreurAssigneId") REFERENCES "User"(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "Livraison_livreurAssigneId_idx" ON "Livraison"("livreurAssigneId");

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN
-- ═══════════════════════════════════════════════════════════════════════════════
