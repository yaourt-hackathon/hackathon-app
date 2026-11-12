# 0007. Tester le parcours de bout en bout avec Playwright, contre la stack docker compose

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Maxime

## Contexte

Les tests Vitest couvrent la logique (`src/**/*.test.ts`). Ils ne voient ni le rendu serveur, ni les server functions, ni le vrai statut 404, ni ce que fait l'app quand l'API data tombe. Or le jalon m2 juge une tranche lancée par `docker compose up`, et l'API data vient d'un autre dépôt qui change chaque jour.

## Options

1. Playwright : navigateur réel piloté depuis Node en `async/await`, comme notre code. `page.goto` rend la réponse HTTP, donc le statut 404 se vérifie directement. Un navigateur à télécharger.
2. Cypress : très bon débogage visuel, et `cy.exec` peut piloter `docker compose`. Mais `cy.visit` échoue sur un 404 sauf option, et ses chaînes de commandes ne sont pas des promesses : un second style de code à apprendre en quatre jours.
3. Vérification HTTP seule (`curl` sur `/`, `/marques/x`) : quelques secondes, aucune dépendance. Ne clique pas : ni navigation client, ni bouton « Réessayer ».
4. Tests de composants seuls (Vitest, Testing Library, jsdom) : rapides, mais sans SSR, sans réseau ni Docker. Ils ne prouvent pas que la tranche démarre.

## Décision

Nous choisissons Playwright (`@playwright/test`, version exacte), sur Chromium seul, parce qu'il teste les clics et le statut HTTP avec le même `async/await` que le reste du code. Les tests vivent dans `e2e/` et se lancent avec `npm run test:e2e` contre la stack de `compose.yaml`. Un test arrête puis relance le service `data-api`. En CI, le job `e2e` construit les deux images, attend leurs healthchecks, joue les tests et garde le rapport en cas d'échec.

## Conséquences

- Positives : le job prouve à chaque PR que `docker compose up` démarre et que le parcours liste → fiche marche. Un lien cassé fait échouer le test de la fiche (vérifié en cassant le lien exprès).
- Négatives, à accepter : quelques minutes de CI (images, navigateur). Pas dans `npm run check`, donc pas au pre-commit. Un seul worker, car un test coupe l'API pour tous.
- À revoir si : la suite dépasse cinq minutes (isoler le test de panne pour paralléliser), ou si un client exige Firefox ou Safari.
