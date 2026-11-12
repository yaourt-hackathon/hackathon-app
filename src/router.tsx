import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { ErreurPage } from '@/components/ErreurPage';
import { PageIntrouvable } from '@/components/PageIntrouvable';
import { createQueryClient } from '@/lib/query-client';
import { routeTree } from '@/routeTree.gen';

export function getRouter() {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    // Le cache de TanStack Query fait foi, pas celui du router
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErreurPage,
    defaultNotFoundComponent: PageIntrouvable,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
