# 📚 DOCUMENTATION COMPLÈTE - PRATISIG CONSULTING SERVICE

**Version** : 1.0  
**Date** : 25 Juillet 2026  
**Auteur** : Équipe de développement Pratisig  
**Dernière mise à jour** : 25/07/2026

---

## 🎯 TABLE DES MATIÈRES

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Fonctionnalités](#3-fonctionnalités)
4. [Installation et Configuration](#4-installation-et-configuration)
5. [Déploiement sur Vercel](#5-déploiement-sur-vercel)
6. [Déploiement sur Hostinger](#6-déploiement-sur-hostinger)
7. [Déploiement sur LWS](#7-déploiement-sur-lws)
8. [Gestion de la Base de Données](#8-gestion-de-la-base-de-données)
9. [Backups et Restauration](#9-backups-et-restauration)
10. [Migration vers un Nouveau Serveur](#10-migration-vers-un-nouveau-serveur)
11. [Personnalisation pour une Autre Entreprise](#11-personnalisation-pour-une-autre-entreprise)
12. [Maintenance et Mises à Jour](#12-maintenance-et-mises-à-jour)
13. [Dépannage](#13-dépannage)
14. [Contact et Support](#14-contact-et-support)

---

## 1. PRÉSENTATION DU PROJET

### 1.1 Qu'est-ce que Pratisig Consulting Service ?

Pratisig Consulting Service est une **plateforme multiservice** conçue pour gérer :
- 🏠 **Immobilier** : Vente et location de biens
-  **E-commerce** : Boutique en ligne
- 🚚 **Livraison** : Gestion des livraisons
- 💸 **Transfert d'argent** : Services financiers
- ️ **Alimentation** : Gestion de caisse et stock

### 1.2 Public Cible

- **Clients** : Acheteurs, locataires, consommateurs
- **Propriétaires** : Propriétaires de biens immobiliers
- **Livreurs** : Personnel de livraison
- **Administrateurs** : Gestionnaires de la plateforme

### 1.3 Technologies Utilisées

| Technologie | Usage | Licence |
|-------------|-------|---------|
| **Next.js 15** | Framework web | MIT (Gratuit) |
| **TypeScript** | Langage de programmation | Apache 2.0 (Gratuit) |
| **PostgreSQL** | Base de données | PostgreSQL License (Gratuit) |
| **Prisma** | ORM (gestion BDD) | Apache 2.0 (Gratuit) |
| **Tailwind CSS** | Styles CSS | MIT (Gratuit) |
| **Supabase** | Backend & Auth | MIT (Gratuit) |
| **Vercel** | Hébergement | Gratuit (plan hobby) |

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Structure des Dossiers

```
pratisig-consulting-service/
├── app/                          # Pages de l'application
│   ├── (auth)/                   # Pages d'authentification
│   │   ├── login/               # Page de connexion
│   │   └── register/            # Page d'inscription
│   ├── (dashboard)/             # Pages du tableau de bord
│   │   ├── admin/               # Administration
│   │   ├── dashboard/           # Dashboard utilisateur
│   │   ── ...
│   ├── immobilier/              # Pages publiques immobilier
│   ├── boutique/                # Pages publiques e-commerce
│   ── api/                     # APIs backend
── components/                   # Composants réutilisables
│   ├── shared/                  # Composants globaux
│   ├── immobilier/              # Composants immobilier
│   └── ...
├── lib/                         # Bibliothèques utilitaires
│   ├── auth/                    # Authentification
│   ├── db/                      # Base de données
│   ├── utils/                   # Utilitaires
│   └── ...
├── prisma/                      # Configuration base de données
│   ├── schema.prisma           # Schéma de la BDD
│   └── migrations/             # Migrations SQL
── public/                      # Fichiers statiques
│   └── logos/                   # Logos des services
├── .env.local                   # Variables d'environnement (non versionné)
├── next.config.ts              # Configuration Next.js
├── package.json                # Dépendances
└── tsconfig.json               # Configuration TypeScript
```

### 2.2 Flux de Données

```
─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│     API      │────▶│   Base de   │
│   (Next.js) │◀────│  (Routes)    │────│  Données    │
─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Navigateur │     │   Serveur    │     │  PostgreSQL │
│   Utilisateur│     │   Vercel     │     │  Supabase   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### 2.3 Services Externes

| Service | Usage | URL |
|---------|-------|-----|
| **Supabase** | Base de données + Auth | https://supabase.com |
| **Vercel** | Hébergement frontend | https://vercel.com |
| **Cloudinary** | Stockage images | https://cloudinary.com |
| **OpenStreetMap** | Cartes | https://openstreetmap.org |

---

## 3. FONCTIONNALITÉS

### 3.1 Module Immobilier

#### Pour les Clients
- ✅ Consulter les biens disponibles
- ✅ Rechercher par type, ville, quartier
- ✅ Demander une visite
- ✅ Contacter le propriétaire

#### Pour les Propriétaires
- ✅ Créer un compte propriétaire
- ✅ Ajouter des biens (en attente de validation)
- ✅ Gérer ses biens
- ✅ Voir les demandes de visite
- ✅ Recevoir des notifications

#### Pour les Administrateurs
- ✅ Valider les comptes propriétaires
- ✅ Publier/dépublier les biens
- ✅ Modifier les statuts (DISPONIBLE, LOUE, VENDU, etc.)
- ✅ Calcul automatique des commissions (5% vente, 10% location)
- ✅ Statistiques avancées
- ✅ Export CSV des rapports

### 3.2 Module E-commerce

#### Pour les Clients
- ✅ Parcourir la boutique
- ✅ Ajouter au panier
- ✅ Passer commande
- ✅ Suivre les commandes

#### Pour les Administrateurs
- ✅ Gérer les produits
- ✅ Gérer les catégories
- ✅ Traiter les commandes
- ✅ Codes promo

### 3.3 Module Livraison

#### Pour les Clients
- ✅ Créer une demande de livraison
- ✅ Suivre le statut
- ✅ Voir l'itinéraire

#### Pour les Livreurs
- ✅ Voir les livraisons assignées
- ✅ Modifier le statut
- ✅ Navigation GPS

#### Pour les Administrateurs
- ✅ Assigner des livreurs
- ✅ Suivre toutes les livraisons
- ✅ Statistiques

### 3.4 Module Transfert d'Argent

#### Services Supportés
- Wave
- Orange Money
- Yash Money
- Kapey
- Free Money
- E-Money

#### Fonctionnalités
- ✅ Dépôt
- ✅ Retrait
- ✅ Transfert
- ✅ Paiement de factures
- ✅ Recharge

### 3.5 Module Alimentation

#### Pour les Caissiers
- ✅ Gestion de caisse
- ✅ Encaissement
- ✅ Clôture de caisse

#### Pour les Administrateurs
- ✅ Gestion des articles
- ✅ Gestion des catégories
- ✅ Rapports de ventes

---

## 4. INSTALLATION ET CONFIGURATION

### 4.1 Prérequis

**Logiciels à installer :**
- Node.js 18+ : https://nodejs.org
- Git : https://git-scm.com
- PostgreSQL 14+ : https://postgresql.org (si hébergement local)

**Comptes à créer :**
- GitHub : https://github.com
- Supabase : https://supabase.com
- Vercel : https://vercel.com
- Cloudinary : https://cloudinary.com

### 4.2 Installation Locale

```bash
# 1. Cloner le repository
git clone https://github.com/votre-entreprise/votre-projet.git
cd votre-projet

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env.local
cp .env.example .env.local

# 4. Éditer .env.local avec vos valeurs
# (voir section 4.3)

# 5. Générer le client Prisma
npx prisma generate

# 6. Exécuter les migrations
npx prisma db push

# 7. Lancer le serveur de développement
npm run dev
```

### 4.3 Configuration des Variables d'Environnement

**Fichier : `.env.local`**

```env
# Base de données Supabase
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudinary (upload d'images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Où trouver ces valeurs :**

#### Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **API**
   - `PROJECT_REF` : Dans l'URL ou "Project ID"
   - `PASSWORD` : **Settings** → **Database** → "Reset database password"
   - `NEXT_PUBLIC_SUPABASE_URL` : "Project URL"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : "anon public key"
   - `SUPABASE_SERVICE_ROLE_KEY` : "service_role key"

#### Cloudinary
1. Allez sur https://cloudinary.com
2. **Dashboard** → vos credentials apparaissent
3. **Settings** → **Upload** → "Upload presets"

### 4.4 Création de la Base de Données

**Option 1 : Via Supabase (Recommandé)**
```bash
# Les tables sont créées automatiquement avec Supabase
# Exécutez simplement les migrations SQL dans Supabase SQL Editor
```

**Option 2 : Via PostgreSQL Local**
```bash
# 1. Créer la base de données
createdb pratisig_db

# 2. Exécuter les migrations
npx prisma migrate deploy

# 3. Vérifier
npx prisma studio
```

---

## 5. DÉPLOIEMENT SUR VERCEL

### 5.1 Création du Projet Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"New Project"**
3. Importez votre repository GitHub
4. Configurez les variables d'environnement (voir 5.2)
5. Cliquez sur **"Deploy"**

### 5.2 Configuration des Variables d'Environnement

Dans **Settings** → **Environment Variables**, ajoutez :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `DATABASE_URL` | Votre URL Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role | Production, Preview, Development |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | API key | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | API secret | Production, Preview, Development |
| `CLOUDINARY_UPLOAD_PRESET` | Upload preset | Production, Preview, Development |

### 5.3 Configuration du Domaine

1. **Settings** → **Domains**
2. Ajoutez votre domaine (ex: `www.votre-entreprise.com`)
3. Configurez les DNS chez votre registrar :
   - Type : `CNAME`
   - Nom : `www`
   - Valeur : `cname.vercel-dns.com`

### 5.4 Redéploiement Automatique

À chaque push sur la branche `main`, Vercel redéploie automatiquement.

---

## 6. DÉPLOIEMENT SUR HOSTINGER

### 6.1 Prérequis Hostinger

**Plan recommandé :**
- **Business Web Hosting** ou supérieur
- Node.js 18+ supporté
- PostgreSQL disponible
- Accès SSH activé

### 6.2 Configuration du Serveur

#### Étape 1 : Activer Node.js

1. Connectez-vous au **hPanel** Hostinger
2. **Avancé** → **Node.js**
3. Créez une application Node.js
4. Sélectionnez Node.js 18+
5. Notez le chemin de l'application

#### Étape 2 : Configuration PostgreSQL

1. **Bases de données** → **Bases de données MySQL/PostgreSQL**
2. Créez une base de données PostgreSQL
3. Notez :
   - Nom de la base
   - Utilisateur
   - Mot de passe
   - Hôte
   - Port

#### Étape 3 : Cloner le Repository

Via SSH :
```bash
cd ~/votre-app
git clone https://github.com/votre-entreprise/votre-projet.git .
```

#### Étape 4 : Installation

```bash
# Installer les dépendances
npm install --production

# Créer .env.local
nano .env.local
```

Contenu de `.env.local` :
```env
DATABASE_URL="postgresql://utilisateur:password@host:port/nom_base"
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre-anon-key"
SUPABASE_SERVICE_ROLE_KEY="votre-service-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="votre-cloud"
CLOUDINARY_API_KEY="votre-key"
CLOUDINARY_API_SECRET="votre-secret"
CLOUDINARY_UPLOAD_PRESET="votre-preset"
NEXT_PUBLIC_APP_URL="https://www.votre-domaine.com"
NODE_ENV="production"
```

#### Étape 5 : Build et Migration

```bash
# Générer Prisma
npx prisma generate

# Exécuter les migrations
npx prisma db push

# Build de production
npm run build
```

#### Étape 6 : Configuration PM2

Créez `ecosystem.config.js` :
```javascript
module.exports = {
  apps: [{
    name: 'pratisig-app',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
```

Démarrez l'application :
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Étape 7 : Configuration Nginx

Dans **hPanel** → **Avancé** → **Configuration Nginx** :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.3 SSL/TLS (HTTPS)

1. **hPanel** → **Sécurité** → **SSL**
2. Installez un certificat SSL gratuit (Let's Encrypt)
3. Activez le redirect HTTPS

---

## 7. DÉPLOIEMENT SUR LWS

### 7.1 Prérequis LWS

**Plan recommandé :**
- **Serveur VPS** (Ubuntu 22.04)
- Accès root
- Node.js 18+
- PostgreSQL 14+

### 7.2 Installation du Serveur

#### Étape 1 : Connexion SSH

```bash
ssh root@votre-ip-serveur
```

#### Étape 2 : Mise à Jour du Système

```bash
apt update && apt upgrade -y
```

#### Étape 3 : Installation de Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
node --version  # Doit afficher v18.x.x
```

#### Étape 4 : Installation de PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

#### Étape 5 : Création de la Base de Données

```bash
sudo -u postgres psql
CREATE DATABASE pratisig_db;
CREATE USER pratisig_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE pratisig_db TO pratisig_user;
\q
```

#### Étape 6 : Installation de Git et Cloning

```bash
apt install -y git
cd /var/www
git clone https://github.com/votre-entreprise/votre-projet.git
cd votre-projet
```

#### Étape 7 : Installation des Dépendances

```bash
npm install --production
```

#### Étape 8 : Configuration

```bash
cp .env.example .env.local
nano .env.local
```

#### Étape 9 : Build

```bash
npx prisma generate
npx prisma db push
npm run build
```

#### Étape 10 : PM2

```bash
npm install -g pm2
pm2 start npm --name "pratisig" -- start
pm2 save
pm2 startup
```

#### Étape 11 : Nginx

```bash
apt install -y nginx
nano /etc/nginx/sites-available/pratisig
```

Configuration :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activation :
```bash
ln -s /etc/nginx/sites-available/pratisig /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Étape 12 : SSL avec Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 8. GESTION DE LA BASE DE DONNÉES

### 8.1 Structure de la Base de Données

#### Tables Principales

| Table | Description | Enregistrements Types |
|-------|-------------|----------------------|
| `User` | Utilisateurs | Clients, Propriétaires, Admins |
| `BienImmobilier` | Biens immobiliers | Appartements, Villas, Terrains |
| `Produit` | Produits e-commerce | Articles en vente |
| `Commande` | Commandes | Commandes clients |
| `Livraison` | Livraisons | Demandes de livraison |
| `Transaction` | Transactions financières | Transferts d'argent |
| `ArticleAlimentation` | Articles alimentation | Produits de caisse |
| `Commission` | Commissions | Commissions immobilières |
| `Notification` | Notifications | Notifications utilisateurs |

### 8.2 Schéma Prisma

Le fichier `prisma/schema.prisma` contient la définition complète de toutes les tables.

**Exemple :**
```prisma
model User {
  id            String      @id @default(cuid())
  name          String?
  email         String      @unique
  role          Role        @default(CLIENT)
  status        UserStatus  @default(ACTIVE)
  // ... autres champs
}
```

### 8.3 Migrations

#### Créer une Migration

```bash
# 1. Modifier schema.prisma
nano prisma/schema.prisma

# 2. Créer la migration
npx prisma migrate dev --name nom_de_la_migration

# 3. Vérifier
npx prisma studio
```

#### Appliquer les Migrations en Production

```bash
npx prisma migrate deploy
```

### 8.4 Sauvegarde Manuelle

#### Via Supabase
1. **Supabase Dashboard** → **Database**
2. **Backups** → **Create backup**
3. Téléchargez le fichier SQL

#### Via PostgreSQL (Local/VPS)
```bash
pg_dump -U utilisateur -h hote -d nom_base > backup_$(date +%Y%m%d).sql
```

### 8.5 Restauration

#### Via Supabase
1. **Supabase Dashboard** → **SQL Editor**
2. Collez le contenu du fichier SQL
3. Exécutez

#### Via PostgreSQL (Local/VPS)
```bash
psql -U utilisateur -h hote -d nom_base < backup_20260725.sql
```

---

## 9. BACKUPS ET RESTAURATION

### 9.1 Stratégie de Backup

| Type | Fréquence | Rétention | Méthode |
|------|-----------|-----------|---------|
| **Base de données** | Quotidien | 30 jours | Supabase Auto-backup |
| **Code source** | À chaque commit | Illimité | GitHub |
| **Images** | Continu | Illimité | Cloudinary |
| **Fichiers .env** | Manuel | Illimité | Gestionnaire de mots de passe |

### 9.2 Backup Automatique Supabase

Supabase crée automatiquement des backups quotidiens :
- Rétention : 7 jours (plan gratuit), 30 jours (plan pro)
- Accès : **Dashboard** → **Database** → **Backups**

### 9.3 Backup Manuel du Code

```bash
# Cloner le repository
git clone https://github.com/votre-entreprise/votre-projet.git backup_$(date +%Y%m%d)

# Ou créer une archive
tar -czf backup_$(date +%Y%m%d).tar.gz votre-projet/
```

### 9.4 Restauration Complète

#### Étape 1 : Restaurer la Base de Données
```bash
psql -U utilisateur -d nom_base < backup.sql
```

#### Étape 2 : Restaurer le Code
```bash
git clone https://github.com/votre-entreprise/votre-projet.git
cd votre-projet
npm install
```

#### Étape 3 : Restaurer les Variables d'Environnement
```bash
cp .env.backup .env.local
# Éditez avec les nouvelles valeurs si nécessaire
```

#### Étape 4 : Redéployer
```bash
npm run build
pm2 restart pratisig  # Si VPS
# Ou push sur GitHub pour Vercel
```

---

## 10. MIGRATION VERS UN NOUVEAU SERVEUR

### 10.1 Préparation

#### Sur l'Ancien Serveur

1. **Backup de la base de données**
```bash
pg_dump -U utilisateur -h hote -d nom_base > full_backup.sql
```

2. **Export des variables d'environnement**
```bash
cp .env.local .env.backup
```

3. **Liste des services actifs**
```bash
pm2 list
```

### 10.2 Migration vers Vercel

1. **Push le code sur GitHub**
```bash
git add .
git commit -m "Migration vers Vercel"
git push origin main
```

2. **Créer le projet Vercel**
- Importez le repository
- Configurez les variables d'environnement
- Déployez

3. **Migrer la base de données vers Supabase**
- Créez un projet Supabase
- Importez `full_backup.sql` dans SQL Editor
- Mettez à jour `DATABASE_URL` dans Vercel

4. **Migration des images**
- Les images sont déjà sur Cloudinary (pas de migration nécessaire)

5. **Configuration du domaine**
- Mettez à jour les DNS pour pointer vers Vercel

### 10.3 Migration vers un VPS (Hostinger/LWS)

#### Sur le Nouveau Serveur

1. **Installation de l'environnement**
```bash
# Node.js, PostgreSQL, Nginx, PM2
# (voir sections 6 ou 7)
```

2. **Cloner le code**
```bash
cd /var/www
git clone https://github.com/votre-entreprise/votre-projet.git
```

3. **Restaurer la base de données**
```bash
createdb nom_base
psql -d nom_base < full_backup.sql
```

4. **Configuration**
```bash
cd votre-projet
cp .env.backup .env.local
# Ajustez DATABASE_URL avec le nouvel hôte
npm install
npx prisma generate
npm run build
```

5. **Démarrer l'application**
```bash
pm2 start npm --name "pratisig" -- start
pm2 save
```

6. **Configuration Nginx et SSL**
- (voir sections 6 ou 7)

### 10.4 Tests Post-Migration

- [ ] Accès au site via le domaine
- [ ] Connexion utilisateur
- [ ] Création d'un bien immobilier
- [ ] Passage d'une commande e-commerce
- [ ] Réception des emails (si configuré)
- [ ] Upload d'images

---

## 11. PERSONNALISATION POUR UNE AUTRE ENTREPRISE

### 11.1 Changement de Marque

#### Fichiers à Modifier

1. **`app/layout.tsx`**
```typescript
export const metadata = {
  title: 'Nom de Votre Entreprise',
  description: 'Description de votre entreprise',
}
```

2. **`app/page.tsx`**
- Modifiez les textes d'accueil
- Changez les couleurs si nécessaire

3. **`components/dashboard/sidebar.tsx`**
```typescript
// Changez le nom dans le logo
<h1 className="font-bold text-sm leading-none">Votre Entreprise</h1>
```

4. **`public/logos/`**
- Remplacez les logos par les vôtres

### 11.2 Configuration des Services

#### Désactiver des Modules

Dans `app/page.tsx`, commentez les services non désirés :

```typescript
const services = [
  {
    id: 'immobilier',
    titre: 'Gestion Immobilière',
    // ...
  },
  // {
  //   id: 'ecommerce',
  //   titre: 'Boutique En Ligne',
  //   // ...
  // },
]
```

#### Modifier les Taux de Commission

Dans `lib/utils/commissions.ts` :
```typescript
export const DEFAULT_TAUX = {
  VENTE: 5,      // Changez ce pourcentage
  LOCATION: 10,  // Changez ce pourcentage
};
```

### 11.3 Personnalisation des Couleurs

#### Fichier `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1a3a5c',    // Couleur principale
        secondary: '#e8a020',  // Couleur secondaire
        accent: '#27ae60',     // Couleur d'accent
      },
    },
  },
}
```

#### Fichiers à Modifier

Recherchez et remplacez :
- `#1a3a5c` → Votre couleur principale
- `#e8a020` → Votre couleur secondaire

### 11.4 Configuration des Emails

#### Installation de Resend

```bash
npm install resend
```

#### Configuration

```env
RESEND_API_KEY="votre_cle_resend"
EMAIL_FROM="contact@votre-entreprise.com"
```

#### Utilisation

Dans `lib/notifications/email.ts` :
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}
```

### 11.5 Ajout de Nouveaux Services

#### Étape 1 : Créer la Structure

```bash
mkdir -p app/(dashboard)/dashboard/nouveau-service
mkdir -p app/api/nouveau-service
mkdir -p components/nouveau-service
```

#### Étape 2 : Ajouter au Schéma Prisma

```prisma
model NouveauService {
  id        String   @id @default(cuid())
  nom       String
  // ... autres champs
}
```

#### Étape 3 : Créer les APIs

```typescript
// app/api/nouveau-service/route.ts
export async function GET() {
  // Logique de récupération
}

export async function POST(req: Request) {
  // Logique de création
}
```

#### Étape 4 : Créer les Pages

```typescript
// app/(dashboard)/dashboard/nouveau-service/page.tsx
export default function NouveauServicePage() {
  return <div>Contenu du service</div>;
}
```

#### Étape 5 : Ajouter à la Navigation

Dans `components/dashboard/sidebar.tsx` :
```typescript
{ href: '/dashboard/nouveau-service', label: 'Nouveau Service', icon: Icon, roles: [...] }
```

---

## 12. MAINTENANCE ET MISES À JOUR

### 12.1 Mises à Jour Régulières

#### Hebdomadaire
- [ ] Vérifier les logs d'erreurs
- [ ] Sauvegarder la base de données
- [ ] Vérifier l'espace disque

#### Mensuel
- [ ] Mettre à jour les dépendances
```bash
npm update
npm audit fix
```
- [ ] Tester les fonctionnalités principales
- [ ] Vérifier les certificats SSL

#### Trimestriel
- [ ] Review des performances
- [ ] Optimisation de la base de données
- [ ] Formation du personnel (si nécessaire)

### 12.2 Monitoring

#### Outils Recommandés

| Outil | Usage | Prix |
|-------|-------|------|
| **Vercel Analytics** | Trafic web | Gratuit |
| **Supabase Logs** | Logs BDD | Gratuit |
| **Sentry** | Erreurs application | Gratuit (5k erreurs/mois) |
| **Uptime Robot** | Monitoring uptime | Gratuit (50 monitors) |

#### Configuration Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 12.3 Gestion des Utilisateurs

#### Créer un Admin Manuellement

```sql
UPDATE "User" 
SET role = 'SUPER_ADMIN', status = 'ACTIVE' 
WHERE email = 'admin@votre-entreprise.com';
```

#### Réinitialiser un Mot de Passe

```sql
-- Supprimer la session
DELETE FROM "Session" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@email.com');

-- L'utilisateur devra utiliser "Mot de passe oublié"
```

---

## 13. DÉPANNAGE

### 13.1 Erreurs Courantes

#### "Database connection failed"

**Cause** : URL de connexion incorrecte ou base de données inaccessible

**Solution** :
1. Vérifiez `DATABASE_URL` dans `.env.local`
2. Testez la connexion :
```bash
psql $DATABASE_URL
```
3. Vérifiez que Supabase/PostgreSQL est actif

#### "Build failed"

**Cause** : Erreur TypeScript ou dépendance manquante

**Solution** :
```bash
npm install
npx prisma generate
npm run build
```

#### "Page not found" (404)

**Cause** : Route non définie ou problème de déploiement

**Solution** :
1. Vérifiez que le fichier existe dans `app/`
2. Redéployez sur Vercel
3. Vérifiez les logs Vercel

#### "Images ne s'affichent pas"

**Cause** : Problème Cloudinary ou CORS

**Solution** :
1. Vérifiez les variables Cloudinary
2. Vérifiez que le preset d'upload existe
3. Vérifiez les logs Cloudinary

### 13.2 Logs et Debugging

#### Vercel
- **Dashboard** → **Deployments** → cliquez sur le déploiement → **Logs**

#### Supabase
- **Dashboard** → **Logs** → **Postgres Logs**

#### Application (VPS)
```bash
pm2 logs pratisig
# ou
tail -f /var/log/nginx/error.log
```

### 13.3 Support

#### Communauté
- **Next.js** : https://github.com/vercel/next.js/discussions
- **Supabase** : https://github.com/supabase/supabase/discussions
- **Prisma** : https://github.com/prisma/prisma/discussions

#### Documentation Officielle
- **Next.js** : https://nextjs.org/docs
- **Supabase** : https://supabase.com/docs
- **Prisma** : https://www.prisma.io/docs

---

## 14. CONTACT ET SUPPORT

### 14.1 Équipe de Développement

**Email** : dev@votre-entreprise.com  
**Téléphone** : +XXX XXX XXX XXX  

### 14.2 Hébergeurs

| Service | Support | URL |
|---------|---------|-----|
| **Vercel** | https://vercel.com/support | 24/7 |
| **Supabase** | https://supabase.com/docs/guides/getting-support | 24/7 |
| **Hostinger** | https://www.hostinger.com/support | 24/7 |
| **LWS** | https://www.lws.fr/support | Lun-Ven 9h-18h |

### 14.3 Urgences

**Base de données corrompue** :
1. Restaurez le dernier backup
2. Contactez le support Supabase

**Site hors ligne** :
1. Vérifiez Vercel/PM2
2. Redémarrez l'application
3. Contactez l'hébergeur

**Faille de sécurité** :
1. Isolez le serveur
2. Changez tous les mots de passe
3. Auditez les logs
4. Contactez un expert en sécurité

---

## 📝 ANNEXES

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **ORM** | Object-Relational Mapping (Prisma) |
| **API** | Application Programming Interface |
| **SSR** | Server-Side Rendering |
| **SSG** | Static Site Generation |
| **JWT** | JSON Web Token (authentification) |
| **SSL** | Secure Sockets Layer (HTTPS) |
| **DNS** | Domain Name System |
| **VPS** | Virtual Private Server |

### B. Commandes Utiles

```bash
# Développement
npm run dev              # Lancer le serveur de dev
npm run build            # Build de production
npm start                # Lancer en production

# Base de données
npx prisma studio        # Interface graphique BDD
npx prisma migrate dev   # Créer une migration
npx prisma db push       # Appliquer le schéma
npx prisma generate      # Générer le client

# Git
git status               # Statut des fichiers
git add .                # Ajouter tous les fichiers
git commit -m "message"  # Valider les changements
git push origin main     # Pousser vers GitHub

# PM2 (VPS)
pm2 list                 # Liste des apps
pm2 logs                 # Voir les logs
pm2 restart app          # Redémarrer
pm2 stop app             # Arrêter
```

### C. Checklist de Déploiement

- [ ] Code testé en local
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] SSL activé
- [ ] Domaine configuré
- [ ] Backups automatiques activés
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

---

**Fin de la documentation**

**Version** : 1.0  
**Date** : 25 Juillet 2026  
**Prochaine révision** : 25 Octobre 2026

---

*Ce document est la propriété de [Nom de l'Entreprise]. Toute reproduction ou distribution non autorisée est interdite.*
