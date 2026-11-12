# AGENTS.md

Présentation du projet : `README.md`. Ce que l'app doit faire, ses règles produit et ses questions ouvertes : `docs/produit.md` ; à lire avant de coder un écran. Stack : TanStack Start (React + TypeScript), TanStack Query, Tailwind CSS v4, HeroUI v3, Vitest (ADR 0002, 0006).

## Lancer

- `npm ci` : installe depuis `package-lock.json`, comme la CI.
- `npm run dev` : serveur de dev sur http://localhost:3000.
- Avant de dire « fini » : `npm run check` (lint, types, tests, format) puis `npm run build`. Ce sont les contrôles du job `qualite` (`.github/workflows/ci.yml`, conteneur `node:24-trixie`).
- `npm run format` corrige la forme.
- `docker compose up --build` lance l'app et l'API data (`compose.yaml`) ; `npm run test:e2e` joue Playwright contre cette stack (ADR 0007), comme le job `e2e`. Navigateur à installer une fois : `npm run test:e2e:install`. Port déjà pris : `APP_PORT` (et `DATA_API_PORT`) au `docker compose up`, puis le même `APP_PORT` pour `test:e2e`.
- Vitest ne lit que `src/**/*.test.{ts,tsx}` ; `e2e/` appartient à Playwright.

## Règles

- Une branche par tâche, depuis `develop` (`feature/…`, `conf/…`, `docs/…`). La PR vise `develop` et suit `.github/pull_request_template.md`.
- `main` est la prod : seul Oomaxime y merge `develop`, et ce merge déploie (ADR 0009). La PR d'une tâche vise `develop`, jamais `main`.
- Une commande se définit une seule fois, dans `scripts` de `package.json`. La CI et la doc l'appellent (`npm run lint`), elles ne la recopient pas.
- Un outil, une responsabilité : le code dans `eslint.config.mjs`, la forme dans `.prettierrc.json`. Aucune règle de forme dans ESLint (`eslint-config-prettier` les coupe).
- Le hook `.husky/pre-commit` lance lint-staged sur les fichiers indexés. Sa config est dans `package.json`.
- Où ranger le code : ADR 0005. Une route ne fait pas d'appel réseau ; tout appel externe vit dans un `*.server.ts` de `src/features/<domaine>/`.
- Toute logique (tri, calcul, gestion d'erreur) a son `*.test.ts` à côté du fichier (Vitest, `vitest.config.ts`). `npm run check` les joue en CI.
- UI : composants HeroUI v3 et couleurs du thème, pas de couleur Tailwind codée en dur (ADR 0006). Doc v3 via le MCP `heroui-react` (`.mcp.json`) ; celle de v2 ne s'applique pas.
- Imports internes via l'alias `@/` (défini dans `tsconfig.json`), pas de `../../`.
- L'API data ne s'appelle que via le client généré depuis `openapi/data-api.json` (ADR 0004), dans un `*.server.ts`. `src/lib/data-api/generated/` est gitignoré : ne l'édite pas. Si l'API change : `npm run api:pull`, puis commite la spec.
- `src/routeTree.gen.ts` est généré par `npm run dev` ou `npm run build` : ne l'édite pas, commite-le.
- Le plan d'une tâche vit dans son ticket (`gh issue view N`). Les brouillons vont dans `.scratch/`, ignoré par git.

## Décisions

- Lis `docs/adr/` avant d'ajouter une dépendance ou de changer d'outil.
- ESLint + Prettier, pas Biome ni Vite+ (ADR 0001, 0003).
- Ne contredis pas un ADR « acceptée ». S'il faut en changer, propose un nouvel ADR, puis arrête-toi.

## À ne pas faire

- `git commit --no-verify` ou `eslint-disable` pour faire passer un contrôle.
- Recopier ici le contenu du README, des ADR ou de la CI : renvoie vers le fichier.
- Créer un `TASKS.md` ou un journal commité.
