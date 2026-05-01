# 🌸 BLVCréa — Boutique Macramé Artisanal

Site e-commerce complet pour une boutique de macramé fait main.  
**Next.js 14 · Tailwind CSS · Sanity CMS · Stripe · Resend**

---

## 📁 Structure du projet

```
blvcrea/
├── sanity/
│   └── schemas/
│       ├── product.ts          ← Schéma produit Sanity
│       ├── customRequest.ts    ← Schéma demandes personnalisées
│       └── index.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Layout principal (Navbar + Footer)
│   │   ├── page.tsx            ← Page d'accueil avec hero + grille produits
│   │   ├── boutique/
│   │   │   └── page.tsx        ← Liste de tous les produits + filtres
│   │   ├── produit/[slug]/
│   │   │   └── page.tsx        ← Page détail produit
│   │   ├── personnalisation/
│   │   │   └── page.tsx        ← Formulaire commande sur-mesure
│   │   ├── commande-confirmee/
│   │   │   └── page.tsx        ← Page succès après paiement Stripe
│   │   ├── admin/
│   │   │   ├── layout.tsx      ← Layout admin (sans Navbar)
│   │   │   ├── page.tsx        ← Page de connexion admin
│   │   │   └── dashboard/
│   │   │       └── page.tsx    ← Tableau de bord admin
│   │   └── api/
│   │       ├── checkout/
│   │       │   └── route.ts    ← API Stripe Checkout
│   │       ├── custom-order/
│   │       │   └── route.ts    ← API formulaire + email Resend
│   │       └── admin/
│   │           ├── login/route.ts
│   │           └── logout/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── BuyButton.tsx       ← Bouton Stripe (client component)
│   │   ├── CustomOrderForm.tsx ← Formulaire personnalisation complet
│   │   └── AdminDashboardClient.tsx
│   ├── lib/
│   │   └── sanity.ts           ← Client Sanity + types + queries
│   ├── middleware.ts            ← Protection routes admin
│   └── styles/
│       └── globals.css
├── .env.example                ← Variables d'environnement à copier
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## 🚀 Installation et démarrage

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/votre-repo/blvcrea.git
cd blvcrea
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
# Ouvrez .env.local et remplissez chaque variable
```

### 3. Configurer Sanity

1. Créez un compte sur [sanity.io](https://sanity.io) (gratuit)
2. Créez un nouveau projet : `npm create sanity@latest`
3. Récupérez votre **Project ID** dans le dashboard Sanity
4. Générez un token API avec droits d'écriture (Settings → API Tokens)
5. Copiez les schémas depuis `sanity/schemas/` dans votre studio Sanity

### 4. Configurer Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API dans le dashboard (mode test puis live)
3. Configurez un webhook vers `/api/stripe-webhook` si besoin

### 5. Configurer Resend

1. Créez un compte sur [resend.com](https://resend.com) (gratuit jusqu'à 100 emails/jour)
2. Vérifiez votre domaine
3. Créez une clé API

### 6. Lancer le serveur de développement

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 Variables d'environnement (Vercel)

À configurer dans **Vercel → Settings → Environment Variables** :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID du projet Sanity | `abc123de` |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset Sanity | `production` |
| `SANITY_API_TOKEN` | Token Sanity (écriture) | `skXxx...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_live_...` |
| `RESEND_API_KEY` | Clé API Resend | `re_...` |
| `RESEND_FROM_EMAIL` | Email d'envoi | `noreply@blvcrea.fr` |
| `OWNER_EMAIL` | Email de la propriétaire | `proprietaire@blvcrea.fr` |
| `ADMIN_PASSWORD` | Mot de passe admin | `MotDePasse123!` |
| `NEXT_PUBLIC_SITE_URL` | URL du site | `https://www.blvcrea.fr` |

---

## 📦 Déploiement sur Vercel

```bash
# 1. Installez Vercel CLI
npm install -g vercel

# 2. Déployez
vercel

# 3. Configurez les variables d'environnement sur vercel.com
# Dashboard → Votre projet → Settings → Environment Variables
```

Ou importez directement depuis GitHub sur [vercel.com](https://vercel.com).

---

## 🎨 Gestion du contenu (Sanity)

La propriétaire gère ses produits via **Sanity Studio** :

1. Aller sur `https://votre-project.sanity.studio`
2. Cliquer sur "Produit" → "Créer"
3. Remplir : Nom, Prix, Photo, Description
4. Publier → le site se met à jour automatiquement

**Pour le tableau de bord admin** :
- URL : `votresite.fr/admin`
- Entrer le mot de passe configuré dans `ADMIN_PASSWORD`

---

## 📧 Emails automatiques (Resend)

Quand un client remplit le formulaire sur-mesure :
1. ✅ Un email est envoyé à la propriétaire avec tous les détails
2. ✅ Un email de confirmation est envoyé au client
3. ✅ La demande est sauvegardée dans Sanity

---

## 🔒 Sécurité

- Admin protégé par cookie de session httpOnly
- Variables d'environnement séparées (publiques / secrètes)
- Validation des formulaires côté serveur (Zod)
- Paiements gérés entièrement par Stripe (PCI compliant)

---

## 🎯 Fonctionnalités

- [x] Page d'accueil avec hero animé et grille de produits
- [x] Boutique avec filtres par catégorie
- [x] Page produit avec description et bouton Acheter
- [x] Paiement Stripe Checkout (EUR, livraison France/Belgique/Suisse)
- [x] Formulaire sur-mesure avec upload photo
- [x] Email automatique propriétaire + confirmation client
- [x] Tableau de bord admin simplifié (grands boutons)
- [x] Protection par mot de passe
- [x] Design Rose & Blanc avec typographie Cormorant Garamond
- [x] Entièrement en français
- [x] Responsive mobile
- [x] SEO optimisé

---

Fait avec ♡ pour BLVCréa
