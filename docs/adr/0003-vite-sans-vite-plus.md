# 0003. Rester sur Vite + ESLint/Prettier, sans Vite+

- Statut : acceptée
- Date : 2026-11-10
- Décideurs : Maxime

## Contexte

Vite+ (VoidZero, licence MIT, 1.0 en octobre 2026) réunit dev, build, tests (Vitest), lint (Oxlint) et formatage (Oxfmt) derrière une seule commande `vp`. TanStack Start fonctionne avec Vite seul. Notre lint et notre formatage sont déjà décidés dans l'[ADR 0001](0001-eslint-prettier-husky.md) et branchés sur le hook et la CI.

## Options

1. Vite + ESLint/Prettier : déjà en place, rien à migrer. Plusieurs outils à configurer.
2. Vite+ : un seul outil, plus rapide. Il remplace ESLint/Prettier, donc l'ADR 0001, le hook et la CI, la veille du jalon m1.

## Décision

Nous restons sur Vite avec ESLint et Prettier, parce que la migration n'apporte rien de visible pour la démo et coûte du temps maintenant.

## Conséquences

- Positives : aucune migration, l'ADR 0001 reste valable.
- Négatives, à accepter : lint et format plus lents que ceux d'Oxc.
- À revoir si : le hook devient trop lent, ou après le hackathon.
