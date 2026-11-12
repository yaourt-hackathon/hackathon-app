# 0009. Mettre main en production sur Railway, par la CI

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Maxime

## Contexte

La démo doit être en ligne : l'app et l'API data, deux images Docker. `develop` bouge plusieurs fois par jour, et chaque nuit côté data : il ne doit pas changer la prod. Seul Maxime décide de ce qui part en prod.

## Options

1. Vercel : gratuit pour l'app. L'API data (Python, Docker) n'y tourne pas telle quelle.
2. Railway branché sur GitHub : déploie chaque push de la branche suivie. Il faut l'app GitHub Railway sur l'organisation, et il ne regarde pas qui a poussé.
3. Railway, déployé par GitHub Actions avec un jeton de projet : les deux Dockerfile tels quels, l'API en réseau privé, le déploiement visible dans la CI.

## Décision

Nous choisissons l'option 3. `main` est la prod. Dans chaque dépôt, `production.yml` lance `railway up` à chaque push sur `main` : service `app` ici, `data-api` dans le dépôt data. Trois gardes :

- la protection de `main` : seul Oomaxime peut y merger, admins compris ; côté app, la CI doit être verte ;
- le jeton `RAILWAY_TOKEN` vit dans l'environnement GitHub `production`, ouvert à `main` seulement ;
- le job ne part que si Oomaxime a poussé, ou relancé le déploiement.

L'app tourne en `DATA_SOURCE=demo` (ADR 0008) et joint l'API par le réseau privé de Railway (`DATA_API_URL`).

## Conséquences

- Positives : `develop` ne touche plus la prod. Un merge `develop` → `main` suffit à déployer. Railway garde les versions précédentes pour revenir en arrière.
- Négatives, à accepter : l'app et l'API se déploient chacune de leur côté, et l'app n'est testée que contre le commit data épinglé dans `compose.yaml`. Pour une version data : épingler dans `compose.yaml` le dernier commit de `develop` côté data (PR app, CI verte), merger data `develop` → `main` tant qu'il est ce commit, puis l'app. Un workflow ajouté sur `develop` atteint `main` au merge suivant : Oomaxime relit `.github/` dans chaque diff `develop` → `main`. Un autre admin des dépôts peut changer ces réglages. Railway est payant (plan Hobby).
- À revoir si : une autre personne doit pouvoir déployer.
