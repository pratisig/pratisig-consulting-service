# 🏢 Pratisig Consulting Service

Plateforme multiservice web & mobile — Sénégal

## Services

| Module | Description | Accès |
|---|---|---|
| 🏠 Immobilier | Vente, location, gérance avec carte interactive | Public + Admin |
| 💸 Transfert d'argent | Wave, Orange Money, Yash, Kapey | Agent, Superviseur |
| 🛒 Alimentation | Gestion de caisse et de stock | Caissier, Gérant |
| 🛍️ E-commerce | Boutique en ligne, paiement Wave/OM | Public + Admin |
| 🚀 Livraison | Courses avec suivi GPS temps réel | Client, Livreur |

## Stack Technique

- **Framework** : Next.js 15 (App Router, TypeScript)
- **Auth** : Auth.js v5 (RBAC, JWT)
- **BDD** : PostgreSQL + Prisma
- **UI** : Tailwind CSS 4 + Radix UI
- **Cartes** : Leaflet / React Leaflet
- **Sécurité** : CSP, CSRF, Rate Limiting, Audit Log, Zod validation
- **Paiement** : Wave, Orange Money (API locales)
- **Hébergement** : GitHub → Vercel (dev/test) → Firebase (prod)

## Installation

```bash
git clone https://github.com/pratisig/pratisig-consulting-service.git
cd pratisig-consulting-service
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
npx prisma generate
npx prisma db push
npm run dev
```

## Rôles & Permissions

| Rôle | Modules accessibles |
|---|---|
| `SUPER_ADMIN` | Tout |
| `ADMIN` | Tout sauf actions super-admin |
| `SUPERVISEUR` | Transfert (contrôle), Alimentation, Livraison (gestion) |
| `AGENT` | Transfert (opérations) |
| `GERANT` | Immobilier (gestion), Alimentation |
| `CAISSIER` | Alimentation (caisse) |
| `PROPRIETAIRE` | Immobilier (ses biens) |
| `LIVREUR` | Livraison (ses courses) |
| `CLIENT` | E-commerce, Livraison (demandes) |

## Sécurité

- ✅ Headers HTTP sécurisés (CSP, HSTS, X-Frame-Options)
- ✅ Cookies HttpOnly + Secure + SameSite=strict
- ✅ Validation Zod sur chaque endpoint
- ✅ Rate limiting sur les routes sensibles
- ✅ Audit Log sur les actions critiques
- ✅ Middleware RBAC centralisé
- ✅ Pas de secrets exposés côté client

## Déploiement Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pratisig/pratisig-consulting-service)

```bash
npm run build
```

---

**Pratisig Consulting Service** — Dakar, Sénégal 🇸🇳
