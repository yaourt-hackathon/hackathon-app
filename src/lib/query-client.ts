import { QueryClient } from '@tanstack/react-query';

// Seul endroit qui règle le cache : une instance par requête SSR, une par onglet.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Les données de l'API data changent au plus une fois par jour
        staleTime: 60_000,
      },
    },
  });
}
