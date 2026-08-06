# Fatourati — Frontend & UI/UX

Rebuild of the FawatirAI feature set (same 15 modules, same sidebar/IA) with a more
professional visual system. Built with Next.js (App Router) + Tailwind, per the
cahier des charges.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll see the Dashboard (Tableau de bord) fully built.

## What's in here

```
app/
  layout.tsx        → page shell: Sidebar + Topbar wrap every page
  globals.css        → design tokens as CSS utilities (.ledger-card, .figure, focus states)
  page.tsx            → Dashboard (Tableau de bord) — reference implementation
components/
  Sidebar.tsx         → same nav groups/order as the original: Documents / Gestion / Compte
  Topbar.tsx           → search, language, notifications, profile
  StatusChip.tsx       → status pill (payée / en attente / en retard / brouillon)
lib/
  mock-data.ts         → placeholder data shaped like what Zineb's state layer will return
tailwind.config.js     → design tokens: colors, fonts, shadows, radii
```

## Team Onboarding & Contribution Guide

1. Clone the repository and navigate to the project root.
2. Copy `.env.example` to `.env`.
3. Spin up Docker environment: `docker compose up --build`.

## Roadmap — 15 FawatirAI Screen Groups

1. ✅ `app/factures/page.tsx` + `app/factures/nouvelle/page.tsx` + `app/factures/[id]/page.tsx`
2. ✅ `app/devis/page.tsx` + `app/devis/nouveau/page.tsx` + `app/devis/[id]/page.tsx`
3. ✅ `app/clients/page.tsx` + `app/clients/[id]/page.tsx` + `components/AddClientModal.tsx`
4. ✅ `app/fournisseurs/page.tsx`
5. ✅ `app/bons-de-commande/page.tsx` + `app/bons-de-commande/[id]/page.tsx`
6. ✅ `app/avoirs/page.tsx`, `app/depenses/page.tsx`
7. ✅ `app/rapprochement/page.tsx`
8. ✅ `app/employes/page.tsx` + `app/employes/nouveau/page.tsx`
9. ✅ `app/bulletins-de-paie/page.tsx`
10. ✅ `app/stocks/page.tsx` + `app/stocks/[id]/page.tsx` + `components/ProductForm.tsx`
11. ✅ `app/pos/page.tsx`
12. ✅ `app/rapports/page.tsx`
13. ✅ `app/entreprise/page.tsx` + `app/modele-facture/page.tsx`
14. ✅ `app/equipe/page.tsx`, `app/abonnement/page.tsx`, `app/support/page.tsx`
15. ✅ `components/AssistantWidget.tsx`

