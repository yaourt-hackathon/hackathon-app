# 0008. Choisir la source des données par une variable : scénario de démo ou API data

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Maxime

## Contexte

La démo suit le parcours du KAM sur trois événements au moins ([`docs/produit.md`](../produit.md)). L'API data v0.4.0 n'en a qu'un réel (`EVT-001`), avec deux clients, et un d'essai. Elle n'expose ni la reformulation, ni le commercial dans la liste d'appels. Elle vient d'un autre dépôt, qui change chaque jour. La démo doit tenir sans elle, puis passer sur elle quand elle livre. Règle produit : ce qui est simulé se dit à l'écran.

## Options

1. API seule : une seule source. La démo dépend de ce que l'équipe data aura livré.
2. Repli automatique sur des données locales quand l'API tombe : la démo ne casse jamais. Du fictif passerait alors pour de l'API, sans que personne le voie.
3. Scénario dans l'app, bascule explicite par une variable : la démo tient seule et le mode s'affiche. Deux adaptateurs à garder aux formes de l'API.
4. Faux `fetch` (MSW) devant le client généré : rien ne change dans le code de l'app. Un outil de test servi en production.
5. Serveur mock Prism, lancé sur `openapi/data-api.json` : aucune donnée à écrire. Ses réponses viennent des exemples de la spec, sans histoire à raconter.

## Décision

Nous choisissons l'option 3. `src/features/tournee/donnees/` définit le port `SourceDonnees`, aux types générés de l'API, et ses deux adaptateurs. `DATA_SOURCE` vaut `demo` (défaut, dans `compose.yaml` aussi) ou `api`. La variable est lue à chaque appel. Toute autre valeur fait échouer `/api/health`, qui renvoie `source`. Le scénario vit dans `scenario.server.ts`, donc jamais dans le code du navigateur. `scenario.server.test.ts` passe chaque réponse du scénario dans les schémas Zod générés.

## Conséquences

- Positives : la démo marche API arrêtée. Passer sur l'API ne demande qu'une variable. Tris, filtres et jointures s'écrivent une fois pour les deux modes.
- Négatives, à accepter : le scénario s'écrit et se relit à la main (Product). Une rupture de la spec casse le scénario au `tsc`, et c'est voulu.
- À revoir si : l'API couvre le scénario (compose passe alors en `api`).
