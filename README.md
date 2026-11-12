# hackathon-app

Application de l'équipe Yaourt pour le Givaudan AI Innovation Challenge (défi 01 Sales) : un événement entre, une tournée d'appels sort. Première tranche : l'exposition des marques cosmétiques aux nouveaux allergènes du règlement UE 2023/1545, à partir de l'API de l'équipe data.

Sujet : [`docs/sujet.md`](docs/sujet.md). Produit : [`docs/produit.md`](docs/produit.md). Décisions : [`docs/adr/`](docs/adr/). Tickets : [projet « La crèmerie »](https://github.com/orgs/yaourt-hackathon/projects/2).

## Lancer toute la tranche

Docker seul suffit. L'API data est construite depuis le dépôt [`data`](https://github.com/yaourt-hackathon/data), à la version épinglée dans `compose.yaml`.

```sh
docker compose up --build   # l'app sur http://localhost:3000, l'API data sur :8000
```

Port déjà pris : `APP_PORT=3300 DATA_API_PORT=18000 docker compose up --build`, puis `APP_PORT=3300 npm run test:e2e` pour les tests.

Le parcours lit un scénario de démo embarqué dans l'app (`DATA_SOURCE=demo`, par défaut) ou l'API data (`DATA_SOURCE=api docker compose up --build`). Le choix est expliqué dans l'[ADR 0008](docs/adr/0008-source-de-donnees-commutable.md), et `/api/health` dit lequel tourne.

## Développer

Node 24 ou plus. L'API data doit tourner à part, par exemple avec `docker compose up data-api`.

```sh
npm ci
cp .env.example .env   # DATA_API_URL : adresse de l'API data
npm run dev            # http://localhost:3000
```

| Commande                   | Rôle                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| `npm run check`            | lint, types, tests et format, comme la CI                             |
| `npm run test:e2e`         | tests Playwright contre la stack `docker compose` lancée (ADR 0007)   |
| `npm run test:e2e:install` | télécharge le navigateur de Playwright, une fois                      |
| `npm run build`            | build de production dans `.output/`                                   |
| `npm start`                | sert le build (`/api/health` pour la sonde)                           |
| `npm run format`           | corrige la forme                                                      |
| `npm run api:pull`         | recopie la spec de l'API data dans `openapi/data-api.json`            |
| `npm run api:generate`     | régénère le client typé (lancé par `npm ci`, `dev`, `build`, `check`) |
