# 0004. Générer le client de l'API data depuis son OpenAPI

- Statut : acceptée
- Date : 2026-11-10
- Décideurs : Maxime

## Contexte

L'API data (FastAPI) publie une spec OpenAPI 3.1. Elle évolue chaque jour pendant le hackathon. Elle est servie par ngrok, donc pas toujours joignable. Des types écrits à la main se désynchroniseraient sans alerte.

## Options

1. `@hey-api/openapi-ts` : génère le client fetch, les schémas Zod et les hooks TanStack Query par plugins. Lourd à générer sur une grosse spec, ce qui n'est pas notre cas.
2. Orval : hooks TanStack Query clés en main. Sortie volumineuse, et Axios par défaut.
3. `openapi-typescript` : léger. Types seuls, client et validation à écrire.
4. `fetch` et types à la main : aucune dépendance. Duplique le contrat.

## Décision

Nous copions la spec dans [`openapi/data-api.json`](../../openapi/data-api.json) et générons le client avec `@hey-api/openapi-ts`. La spec versionnée est la seule source des types (DRY). Elle rend le build reproductible hors ligne, et son diff en PR montre chaque changement d'API.

## Conséquences

- Positives : une rupture de contrat casse `tsc` au lieu de casser la démo, et Zod valide les réponses au runtime.
- Négatives, à accepter : la copie doit être rafraîchie à la main. Les réponses sans `response_model` FastAPI sont typées `unknown` ; c'est à l'équipe data de les ajouter.
- À revoir si : nous exposons à notre tour une API publique (spec générée par notre code).
