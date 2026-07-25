# 🚨 GUIDE DE DÉPLOIEMENT - CORRIGER TOUS LES PROBLÈMES

## ⚠️ Problème Identifié

Les corrections ne sont pas effectives car **les tables nécessaires n'existent pas dans votre base de données Supabase**. Le code est correct, mais il manque les migrations SQL.

---

## ✅ Solution : Exécuter le Script SQL

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet `pratisig-consulting-service`
3. Dans le menu de gauche, cliquez sur **SQL Editor** (icône `</>`)
4. Cliquez sur **"New query"**

### Étape 2 : Copier le Script SQL

Le script complet se trouve dans le fichier :
**`MIGRATION_COMPLETE.sql`** (à la racine du projet GitHub)

Ou copiez ce script directement :

```sql
-- Table FactureConfig
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

-- Config par défaut
INSERT INTO "FactureConfig" (id, "nomEntreprise", "adresse", "ville", "pays", "telephone", "email")
VALUES ('default', 'Pratisig Consulting Service', 'Dakar', 'Dakar', 'Sénégal', '+221 33 000 00 00', 'contact@pratisig.sn')
ON CONFLICT (id) DO NOTHING;

-- Colonnes Commande
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "numeroFacture" TEXT UNIQUE;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "factureGeneree" BOOLEAN DEFAULT false;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "dateFacture" TIMESTAMP;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "codePromoId" TEXT;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "reduction" FLOAT DEFAULT 0;
ALTER TABLE "Commande" ADD COLUMN IF NOT EXISTS "totalFinal" FLOAT;

-- Colonnes Produit
ALTER TABLE "Produit" ADD COLUMN IF NOT EXISTS "noteMoyenne" FLOAT DEFAULT 0;
ALTER TABLE "Produit" ADD COLUMN IF NOT EXISTS "nbAvis" INT DEFAULT 0;

-- Table CodePromo
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

-- Table Avis
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

-- Table Notification
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

-- Index
CREATE INDEX IF NOT EXISTS "Avis_produitId_idx" ON "Avis"("produitId");
CREATE INDEX IF NOT EXISTS "Avis_clientId_idx" ON "Avis"("clientId");
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_lu_idx" ON "Notification"("lu");
CREATE INDEX IF NOT EXISTS "FactureConfig_id_idx" ON "FactureConfig"("id");
CREATE INDEX IF NOT EXISTS "Commande_numeroFacture_idx" ON "Commande"("numeroFacture");

-- Séquence factures
CREATE SEQUENCE IF NOT EXISTS facture_numero_seq START 1000;

-- Colonne whatsapp User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
```

### Étape 3 : Exécuter le Script

1. Collez le script dans l'éditeur SQL
2. Cliquez sur **"Run"** (ou Ctrl+Enter)
3. Vous devriez voir "Success. No rows returned" pour chaque instruction

### Étape 4 : Vérifier

Dans le menu de gauche, cliquez sur **Table Editor** et vérifiez que ces tables existent :
- ✅ `FactureConfig`
- ✅ `CodePromo`
- ✅ `Avis`
- ✅ `Notification`

---

##  Ce Qui Va Fonctionner Après

Une fois le script SQL exécuté :

### ✅ Configuration des Factures
- URL : `/admin/facture/config`
- Fonctionne pour le Super Admin
- Personnalisation complète de l'en-tête

### ✅ Détails des Biens Immobiliers
- URL publique : `/immobilier/[id]`
- Carte interactive
- Formulaire de contact
- Boutons WhatsApp, Email, Téléphone

### ✅ E-commerce
- Page client : `/dashboard/ecommerce/mes-commandes`
- Page admin : `/dashboard/ecommerce` (redirige selon le rôle)
- Codes promo fonctionnels
- Avis clients

### ✅ Livraison
- Création avec géolocalisation en cascading
- Suivi pour clients, livreurs et managers
- Modification du statut
- Notifications automatiques

---

## 🔍 Vérification du Déploiement Vercel

Après avoir exécuté le SQL :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `pratisig-consulting-service`
3. Cliquez sur **"Deployments"**
4. Vérifiez que le dernier déploiement est **"Ready"** (vert)
5. Si c'est "Error", cliquez pour voir les logs

---

## 📋 Checklist Finale

- [ ] Script SQL exécuté dans Supabase
- [ ] Tables créées (FactureConfig, CodePromo, Avis, Notification)
- [ ] Déploiement Vercel "Ready"
- [ ] Test configuration factures (`/admin/facture/config`)
- [ ] Test détail bien immobilier (`/immobilier/[id]`)
- [ ] Test e-commerce client (`/dashboard/ecommerce/mes-commandes`)
- [ ] Test livraison (`/dashboard/livraison/suivi`)

---

##  Si Ça Ne Marche Toujours Pas

### Problème 1 : Erreur SQL
- Vérifiez que vous êtes connecté au bon projet Supabase
- Exécutez les instructions une par une pour identifier l'erreur

### Problème 2 : Vercel ne redéploie pas
- Allez sur GitHub → Dépôt → Actions
- Vérifiez que le dernier workflow a réussi
- Si non, relancez le déploiement manuellement

### Problème 3 : Pages blanches ou 404
- Videz le cache de votre navigateur (Ctrl+Shift+R)
- Vérifiez la console du navigateur (F12) pour les erreurs

---

##  Support

Si vous avez toujours des problèmes après avoir exécuté le SQL :

1. **Capture d'écran** de l'erreur dans Supabase SQL Editor
2. **Logs Vercel** (Dashboard → Deployments → cliquer sur le déploiement → Logs)
3. **Console navigateur** (F12 → Console)

Avec ces informations, je pourrai diagnostiquer précisément le problème.

---

**Date** : 25 Juillet 2026  
**Version** : 9.0 - Migration Complète  
**Statut** : En attente d'exécution SQL 
