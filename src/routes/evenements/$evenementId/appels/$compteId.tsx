import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { trouverAppel } from '@/features/tournee/appel';
import { tourneeQuery } from '@/features/tournee/queries';

// Ancienne adresse d'un appel : elle ouvre ce client dans la liste des appels.
// Client inconnu ou prospect (absent de la tournée) : 404.
export const Route = createFileRoute(
  '/evenements/$evenementId/appels/$compteId',
)({
  loader: async ({ context, params }) => {
    const tournee = await context.queryClient.ensureQueryData(
      tourneeQuery(params.evenementId),
    );
    const appel = trouverAppel(tournee.appels, params.compteId);
    if (appel === null) throw notFound();
    throw redirect({
      to: '/evenements/$evenementId/appels',
      params: { evenementId: params.evenementId },
      search: { client: appel.compte_id },
    });
  },
});
