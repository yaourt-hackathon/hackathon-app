# 0005. Organiser le code par fonctionnalité, avec des routes minces

- Statut : acceptée
- Date : 2026-11-10
- Décideurs : Maxime

## Contexte

L'app (ADR [0002](0002-tanstack-start.md)) va grossir vite : marques, exposition, puis d'autres pistes du défi. Plusieurs personnes codent en parallèle. Sans règle, la logique d'appel à l'API se recopie dans chaque page, et le code serveur risque de fuiter vers le navigateur.

## Options

1. Par type technique (`components/`, `hooks/`, `services/`) : simple au début. Une fonctionnalité s'éparpille dans tous les dossiers.
2. Par fonctionnalité (`features/<domaine>/`) : tout ce qui concerne un domaine est au même endroit. Demande une règle pour le code partagé.
3. Feature-Sliced Design : très structuré. Six couches, trop pour quatre jours.

## Décision

Nous choisissons l'option 2, avec des dépendances à sens unique : `routes/` → `features/` → `components/`, `lib/`.

- `src/routes/` : URL, `loader` et assemblage de la page. Aucun appel réseau.
- `src/features/<domaine>/` : `queries.ts` (un `queryOptions` par ressource, partagé par le loader et les composants), `*.server.ts` (seul code qui appelle une API externe), `components/`.
- `src/components/` : UI utilisée par au moins deux fonctionnalités. `src/lib/` : technique sans métier (ex. `query-client.ts`).

## Conséquences

- Positives : une responsabilité par fichier. Une clé de cache et un appel par ressource (DRY). Les composants dépendent d'un `queryOptions`, pas du client HTTP. TanStack Start refuse d'importer un `*.server.ts` côté client.
- Négatives, à accepter : décider où ranger un composant partagé.
- À revoir si : une fonctionnalité doit importer l'intérieur d'une autre (signe qu'il manque un module commun).
