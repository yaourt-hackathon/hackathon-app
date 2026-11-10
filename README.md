# hackathon-app

Application de l'équipe Yaourt pour le Givaudan AI Innovation Challenge (défi 01 Sales). Elle montre l'exposition des marques cosmétiques aux nouveaux allergènes du règlement UE 2023/1545, à partir de l'API de l'équipe data.

Sujet : [`docs/sujet.md`](docs/sujet.md). Décisions : [`docs/adr/`](docs/adr/). Tickets : [projet « La crèmerie »](https://github.com/orgs/yaourt-hackathon/projects/2).

## Démarrer

Node 24 ou plus.

```sh
npm ci
npm run dev   # http://localhost:3000
```

| Commande         | Rôle                                        |
| ---------------- | ------------------------------------------- |
| `npm run check`  | lint, types, tests et format, comme la CI   |
| `npm run build`  | build de production dans `.output/`         |
| `npm start`      | sert le build (`/api/health` pour la sonde) |
| `npm run format` | corrige la forme                            |
