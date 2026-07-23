# Pratisig Consulting Service — Guide de Configuration

## 🚀 Démarrage Rapide

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet (notez la région la plus proche : **West EU (Paris)**)
3. Attendez que le projet soit prêt (~2 min)

### 2. Récupérer les clés

Dans **Settings → API**, récupérez :
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Secret !
- **Connection string** (Database) → `DATABASE_URL`

### 3. Configurer les variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez les valeurs :

```bash
cp .env.example .env.local
# Éditez .env.local avec vos valeurs
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à Supabase
npx prisma db push

# Exécuter les politiques RLS
# Copiez le contenu de prisma/migrations/rls_policies.sql
# et collez-le dans l'éditeur SQL de Supabase (icône SQL dans le menu)
```

### 5. Créer le Super Admin

Après avoir poussé le schéma, créez votre premier compte Super Admin via l'interface :

1. Lancez `npm run dev`
2. Allez sur `/register` et créez un compte
3. Dans l'éditeur SQL de Supabase, exécutez :
```sql
UPDATE "User" SET role = 'SUPER_ADMIN', status = 'ACTIVE' WHERE email = 'votre@email.com';
```

### 6. Lancer le projet

```bash
npm run dev
```

## 🔐 Sécurité

### Row Level Security (RLS)

Les politiques RLS sont dans `prisma/migrations/rls_policies.sql`. Elles garantissent que :
- Les admins voient tout
- Les utilisateurs ne voient que leurs propres données
- Les managers ont un accès contrôlé à leur domaine
- Les logs d'audit ne sont visibles que par les admins

### Rôles & Permissions

| Rôle | Description |
|------|-------------|
| `SUPER_ADMIN` | Contrôle total, tout gérer |
| `ADMIN` | Dashboard complet, sauf suppression de comptes |
| `MANAGER_IMMOBILIER` | Gère les biens immobiliers |
| `MANAGER_ECOMMERCE` | Gère la boutique en ligne |
| `MANAGER_LIVRAISON` | Gère les livraisons |
| `MANAGER_TRANSFERT` | Gère les transferts d'argent |
| `MANAGER_ALIMENTATION` | Gère l'alimentation et la caisse |
| `AGENT` | Agent de transfert |
| `CAISSIER` | Gestion de caisse |
| `LIVREUR` | Livreurs |
| `PROPRIETAIRE` | Propriétaires de biens |
| `CLIENT` | Clients standards |

### Variables sensibles

Ne jamais committer :
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- Clés Cloudinary

## 📁 Structure du projet

```
app/
├── (auth)/              → Pages publiques (login, register)
├── (dashboard)/         → Pages protégées
│   ├── admin/           → Administration (SUPER_ADMIN, ADMIN)
│   │   ├── utilisateurs → Gestion des utilisateurs
│   │   └── audit        → Journal d'audit
│   └── dashboard/       → Vue d'ensemble
├── api/
│   ├── admin/           → API admin
│   └── auth/            → API authentification
lib/
├── auth/                → Système d'authentification + RBAC
├── supabase/            → Clients Supabase
├── security/            → Audit logs
└── utils/               → Utilitaires
```
