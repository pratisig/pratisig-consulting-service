#  Système de Facturation - Guide Complet

## Vue d'Ensemble

Système de génération de factures PDF professionnelles avec :
- En-tête personnalisable par le Super Admin
- Numérotation automatique
- Calcul automatique des totaux
- Gestion des réductions (codes promo)
- Téléchargement PDF instantané

---

## Architecture

### Base de Données

#### Table `FactureConfig`
Stocke la configuration de l'en-tête de facture :
- `nomEntreprise` - Nom de l'entreprise
- `adresse`, `ville`, `pays` - Adresse complète
- `telephone`, `email`, `siteWeb` - Contact
- `logo` - URL du logo (affiché en haut)
- `numeroRegistre`, `ninea`, `rccm` - Informations légales
- `conditions` - Conditions de paiement
- `piedPage` - Texte de pied de page

#### Colonnes ajoutées à `Commande`
- `numeroFacture` - Numéro unique (FAC-2026-001000)
- `factureGeneree` - Booléen (facture générée ou non)
- `dateFacture` - Date de génération
- `reduction` - Montant de la réduction
- `totalFinal` - Total après réduction

#### Séquence `facture_numero_seq`
Génère les numéros de facture automatiquement (commence à 1000)

---

## API Endpoints

### `GET /api/admin/facture/config`
Récupère la configuration de facture
- **Auth** : Super Admin uniquement
- **Retour** : Objet de configuration

### `PUT /api/admin/facture/config`
Met à jour la configuration
- **Auth** : Super Admin uniquement
- **Body** : Tous les champs de configuration

### `GET /api/factures/[id]`
Génère/récupère une facture pour une commande
- **Auth** : Client propriétaire ou Admin
- **Retour** : Données de la facture (JSON)
- **Auto-génère** le numéro si pas encore fait

---

## Composants React

### `GenerateFacture.tsx`
Composant client pour générer le PDF

**Fonctionnalités** :
- Utilise `jsPDF` + `jspdf-autotable`
- Mise en page professionnelle
- Logo en haut (si configuré)
- Tableau des articles
- Totaux avec réduction
- Conditions et pied de page

**Utilisation** :
```tsx
<GenerateFacture commandeId="xxx" />
```

---

## Configuration

### 1. Exécuter la Migration SQL

Allez dans **Supabase SQL Editor** et exécutez :

```sql
-- Table FactureConfig
CREATE TABLE IF NOT EXISTS "FactureConfig" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- Séquence numérotation
CREATE SEQUENCE IF NOT EXISTS facture_numero_seq START 1000;

-- Index
CREATE INDEX IF NOT EXISTS "Commande_numeroFacture_idx" ON "Commande"("numeroFacture");
```

### 2. Installer les Dépendances

```bash
npm install jspdf jspdf-autotable
```

### 3. Configurer le Logo

1. Uploadez votre logo sur Cloudinary
2. Copiez l'URL
3. Allez dans `/admin/facture/config`
4. Collez l'URL dans le champ "Logo"

---

## Utilisation

### Pour le Super Admin

1. **Configurer l'en-tête** :
   - Allez sur `/admin/facture/config`
   - Remplissez les informations de l'entreprise
   - Ajoutez le logo, NINEA, RCCM
   - Définissez les conditions de paiement
   - Sauvegardez

2. **Générer une facture** :
   - Allez sur `/dashboard/ecommerce`
   - Trouvez une commande livrée
   - Cliquez "Télécharger Facture"
   - Le PDF se télécharge automatiquement

### Pour le Client

1. **Voir sa facture** :
   - Se connecter
   - Aller dans "Mes commandes"
   - Cliquer sur une commande livrée
   - Télécharger la facture

---

## Structure du PDF

```
┌─────────────────────────────────────────────┐
│  [LOGO]  Nom Entreprise                     │
│          Adresse                            │
│          Ville, Pays                        │
│          Tél: ... | Email: ...              │
├─────────────────────────────────────────────┤
│                                      FACTURE │
│                              N° FAC-2026-... │
│                                      Date: ..│
├─────────────────────────────────────────────┤
│ FACTURÉ À:                                  │
│ Nom Client                                  │
│ Adresse                                     │
│ Tél / Email                                 │
├─────────────────────────────────────────────┤
│ Désignation | Qté | P.U. | Total            │
│ ─────────────────────────────────────────── │
│ Produit 1   |  2  | 1000 | 2000             │
│ Produit 2   |  1  | 3000 | 3000             │
├─────────────────────────────────────────────┤
│                    Sous-total: 5000 FCFA     │
│                    Réduction: -500 FCFA      │
│                    TOTAL: 4500 FCFA          │
─────────────────────────────────────────────┤
│ Mode de paiement: ...                       │
│ Statut: LIVREE                              │
─────────────────────────────────────────────┤
│ Conditions: ...                             │
│                                             │
│ NINEA: ... | RCCM: ...                     │
│ © 2026 Entreprise - Tous droits réservés   │
└─────────────────────────────────────────────┘
```

---

## Numérotation Automatique

Format : `FAC-ANNÉE-NUMÉRO`

Exemples :
- `FAC-2026-001000`
- `FAC-2026-001001`
- `FAC-2026-001002`

La séquence commence à 1000 et s'incrémente automatiquement.

---

## Fonctionnalités Avancées

### Réductions
- Si un code promo a été utilisé, la réduction apparaît
- Le total final est calculé automatiquement
- Affichage en rouge pour la réduction

### Statut de Facture
- `factureGeneree: false` - Première génération
- `factureGeneree: true` - Déjà générée (réutilise le même numéro)

### Sécurité
- Seules les commandes `LIVREE` peuvent avoir une facture
- Le client ne voit que ses propres factures
- Les admins voient toutes les factures

---

## Personnalisation

### Modifier les Couleurs

Dans `GenerateFacture.tsx` :
- Ligne ~40 : Couleur de l'en-tête `doc.setTextColor(26, 58, 92)`
- Ligne ~55 : Couleur de la ligne `doc.setDrawColor(26, 58, 92)`
- Ligne ~85 : Couleur du tableau `fillColor: [26, 58, 92]`

### Modifier le Format

Dans `GenerateFacture.tsx` :
- `pageWidth` : Largeur de la page (A4 par défaut)
- `startY` : Position de départ du tableau
- Marges : 14px de chaque côté

---

## Dépannage

### Le PDF ne se génère pas
- Vérifiez que la commande est `LIVREE`
- Vérifiez les logs console du navigateur
- Vérifiez que `jspdf` est installé

### La configuration ne se sauvegarde pas
- Vérifiez que vous êtes Super Admin
- Vérifiez la migration SQL
- Vérifiez les logs API

### Le logo ne s'affiche pas
- Vérifiez que l'URL est accessible
- Le logo doit être au format PNG ou JPG
- Taille recommandée : 200x100px

---

## Fichiers Créés

```
app/
├── (dashboard)/
│   ├── admin/facture/config/page.tsx      # Page config
│   └── dashboard/ecommerce/
│       ├── commandes/[id]/page.tsx        # Détail + bouton
│       └── page.tsx                        # Liste avec bouton
── api/
    ├── admin/facture/config/route.ts      # API config
    └── factures/[id]/route.ts             # API facture

components/
└── facture/
    └── GenerateFacture.tsx                # Composant PDF

prisma/migrations/
└── 20260724_factures/migration.sql        # Migration SQL
```

---

## Statut

✅ **Complètement fonctionnel**

**Testé** :
- Génération PDF
- Numérotation auto
- Configuration admin
- Téléchargement client
- Affichage logo
- Calcul totaux

---

**Version** : 1.0  
**Date** : 24 Juillet 2026  
**Auteur** : Pratisig Development Team
