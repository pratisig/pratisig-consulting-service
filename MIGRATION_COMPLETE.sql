-- ═══════════════════════════════════════════════════════════════════════════════
-- PRATISIG CONSULTING SERVICE - MIGRATION COMPLÈTE
-- Exécutez ce script dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Table FactureConfig (pour la personnalisation des factures)
CREATE TABLE IF NOT EXISTS "FactureConfig" (
  id TEXT PRIMARY KEY DEFAULT 'default',
  "nomEntreprise" TEXT NOT NULL DEFAULT 'Pratisig Consulting Service',
  "adresse" TEXT,
  "ville" TEXT DEFAULT 'Dakar',
  "pays" TEXT DEFAULT 'Sénégal',
  "telephone" TEXT,
  "email" TEXT,
  "siteWeb" TEXT,
  "logo" TEXT,
  "numeroRegistre" TEXT,
  "ninea" TEXT,
  "rccm" TEXT,
  "conditions" TEXT,
  "piedPage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insérer la config par défaut
INSERT INTO "FactureConfig" (id, "nomEntreprise", "adresse", "ville", "pays", "telephone", "email")
VALUES ('default', 'Pratisig Consulting Service', 'Dakar', 'Dakar', 'Sénégal', '+221 33 000 00 00', 'contact@pratisig.sn')
ON CONFLICT (id) DO NOTHING;

-- 2. Colonnes pour les codes promo et avis (si pas déjà créées)
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "numeroFacture" TEXT UNIQUE;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "factureGeneree" BOOLEAN DEFAULT false;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "dateFacture" TIMESTAMP;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "codePromoId" TEXT;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "reduction" FLOAT DEFAULT 0;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "totalFinal" FLOAT;

ALTER TABLE "Produit" ADD COLUMN IF NOT EXISTS "noteMoyenne" FLOAT DEFAULT 0;
ALTER TABLE "Produit" ADD COLUMN IF NOT EXISTS "nbAvis" INT DEFAULT 0;

-- 3. Table CodePromo
CREATE TABLE IF NOT EXISTS "CodePromo" (
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

-- 4. Table Avis
CREATE TABLE IF NOT EXISTS "Avis" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "produitId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  note INT NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "isApprouve" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "Avis_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE CASCADE,
  CONSTRAINT "Avis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Avis_produitId_idx" ON "Avis"("produitId");
CREATE INDEX IF NOT EXISTS "Avis_clientId_idx" ON "Avis"("clientId");

-- 5. Table Notification
CREATE TABLE IF NOT EXISTS "Notification" (
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

-- 6. Index pour FactureConfig
CREATE INDEX IF NOT EXISTS "FactureConfig_id_idx" ON "FactureConfig"("id");
CREATE INDEX IF NOT EXISTS "Commande_numeroFacture_idx" ON "Commande"("numeroFacture");

-- 7. Séquence pour numérotation des factures
CREATE SEQUENCE IF NOT EXISTS facture_numero_seq START 1000;

-- 8. Ajout colonne whatsapp au User (si pas déjà fait)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
