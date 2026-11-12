# 0006. Bâtir l'interface sur les composants HeroUI v3

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Maxime

## Contexte

L'interface (ADR [0002](0002-tanstack-start.md)) recopiait des classes Tailwind dans chaque composant : pastilles, tableau, alertes, boutons. Pour m2, il faut ajouter des écrans vite, à plusieurs, sans casser l'accessibilité : un tableau de produits doit se parcourir au clavier. Le rendu se fait côté serveur, avec Tailwind CSS v4 et React 19.

## Options

1. HeroUI v3 : composants sur React Aria (clavier, focus, ARIA), faits pour Tailwind v4 et React 19, sans Provider. Une dépendance de plus, et un bundle plus lourd.
2. shadcn/ui : composants copiés dans le dépôt, légers et modifiables. Ce code devient le nôtre, à maintenir et à mettre à jour à la main.
3. Tailwind seul (statu quo) : aucune dépendance. Accessibilité et cohérence à refaire écran par écran.

## Décision

Nous choisissons HeroUI v3 (`@heroui/react`, `@heroui/styles`, versions exactes). `src/styles.css` importe `@heroui/styles` juste après Tailwind. Les couleurs viennent du thème (`bg-surface`, `text-muted`), plus de `stone-*` codé en dur. Un lien interne reste le `Link` du router, habillé par `buttonVariants` ou `linkVariants`, pour garder le préchargement et les routes typées. La doc v3 est lue via le MCP `heroui-react` déclaré dans `.mcp.json`.

## Conséquences

- Positives : `Chip`, `Alert`, `Table` et `Button` remplacent nos classes maison, et le tableau des produits devient navigable au clavier sans code de notre part.
- Négatives, à accepter : le bundle client (total des chunks, mesuré au build) passe de 124 à 205 Ko de JS gzip (`@heroui/react` et React Aria, sur lequel il repose) et de 3 à 43 Ko de CSS (`@heroui/styles` embarque les styles de ses 85 composants). Acceptable pour un outil interne. Le tableau devient une grille ARIA : un seul arrêt de tabulation, puis les flèches, au lieu des raccourcis de tableau des lecteurs d'écran.
- À revoir si : le poids de page devient un critère. On gardera alors un `<table>` natif là où rien n'est interactif, et on n'importera que le CSS des composants utilisés (`@heroui/styles/components/*.css`).
