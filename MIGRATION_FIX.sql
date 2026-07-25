-- ═══════════════════════════════════════════════════════════════════════════════
-- CORRIGER LA TABLE FACTURECONFIG
-- ═══════════════════════════════════════════════════════════════════════════════

-- Supprimer l'ancienne table si elle existe avec le mauvais schéma
DROP TABLE IF EXISTS "FactureConfig" CASCADE;

-- Recréer la table correctement
CREATE TABLE "FactureConfig" (
  id TEXT PRIMARY KEY DEFAULT 'default',
  "nomEntreprise" TEXT NOT NULL DEFAULT 'Pratisig Consulting Service',
  adresse TEXT,
  ville TEXT DEFAULT 'Dakar',
  pays TEXT DEFAULT 'Sénégal',
  telephone TEXT,
  email TEXT,
  "siteWeb" TEXT,
  logo TEXT,
  "numeroRegistre" TEXT,
  ninea TEXT,
  rccm TEXT,
  conditions TEXT,
  "piedPage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insérer la config par défaut
INSERT INTO "FactureConfig" (id, "nomEntreprise", adresse, ville, pays, telephone, email)
VALUES ('default', 'Pratisig Consulting Service', 'Dakar', 'Dakar', 'Sénégal', '+221 33 000 00 00', 'contact@pratisig.sn');

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTRES TABLES (si pas déjà créées)
-- ═══════════════════════════════════════════════════════════════════════════════

-- CodePromo
DROP TABLE IF EXISTS "CodePromo" CASCADE;
CREATE TABLE "CodePromo" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'PERCENTAGE',
  valeur FLOAT NOT NULL,
  "minCommande" FLOAT DEFAULT 0,
  "maxUsage" INT DEFAULT 0,
  "usageCount" INT DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "dateDebut" TIMESTAMP DEFAULT NOW(),
  "dateFin" TIMESTAMP,
  "creePar" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Avis
DROP TABLE IF EXISTS "Avis" CASCADE;
CREATE TABLE "Avis" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "produitId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  note INT NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "isApprouve" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Avis_produitId_idx" ON "Avis"("produitId");
CREATE INDEX IF NOT EXISTS "Avis_clientId_idx" ON "Avis"("clientId");

-- Notification
DROP TABLE IF EXISTS "Notification" CASCADE;
CREATE TABLE "Notification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO',
  lu BOOLEAN DEFAULT false,
  lien TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_lu_idx" ON "Notification"("lu");

-- ═══════════════════════════════════════════════════════════════════════════════
-- COLONNES MANQUANTES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "numeroFacture" TEXT UNIQUE;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "factureGeneree" BOOLEAN DEFAULT false;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "dateFacture" TIMESTAMP;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "codePromoId" TEXT;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS reduction FLOAT DEFAULT 0;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "totalFinal" FLOAT;

ALTER TABLE "Produit" ADD COLUMN IF NOT EXISTS "noteMoyenne" FLOAT DEFAULT 0;
ALTER TABLE "Produit" ADD COLUMN IF NOT EXISTS "nbAvis" INT DEFAULT 0;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Séquence pour factures
CREATE SEQUENCE IF NOT EXISTS facture_numero_seq START 1000;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN
-- ═══════════════════════════════════════════════════════════════════════════════
