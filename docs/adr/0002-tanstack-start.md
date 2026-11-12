# 0002. Construire l'application avec TanStack Start (React + TypeScript)

- Statut : acceptée
- Date : 2026-11-10
- Décideurs : Maxime

## Contexte

L'app affiche les données de l'API de l'équipe data (FastAPI, exposée temporairement par ngrok). Le jalon m2 exige que `docker compose up` lance toute la tranche verticale. L'équipe connaît React et TypeScript. Il reste quatre jours.

## Options

1. TanStack Start : full stack sur Vite, routes typées, server functions. Stable en 1.0 depuis octobre 2026, donc écosystème plus jeune.
2. Vite SPA + backend séparé (Hono) : briques simples. Deux services à typer, à builder et à déployer.
3. Next.js : très répandu. Toolchain et conventions propres, et un écart avec le Vite de la consigne.

## Décision

Nous choisissons TanStack Start, avec TanStack Query pour les données et Tailwind CSS v4 pour le style. Un seul service sert l'interface et appelle l'API data côté serveur, sans CORS et avec l'URL lue dans `DATA_API_URL`.

## Conséquences

- Positives : une seule image Docker, typage de bout en bout (routes, paramètres, réponses).
- Négatives, à accepter : moins de ressources et d'exemples que pour Next.js.
- À revoir si : on pivote vers un connecteur MCP sans interface (le cœur métier devra alors sortir des routes).
