import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { z } from 'zod';
import { AppelsDuJour } from '@/features/tournee/components/AppelsDuJour';
import { Volet } from '@/features/tournee/components/Volet';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';

// ?client=CPT-001 : l'appel ouvert (vide : tous fermés, absent : le premier).
// ?tri=nom : l'ordre. Une valeur illisible reprend le défaut, pas une erreur.
const recherche = z.object({
  client: z.string().optional().catch(undefined),
  tri: z.enum(['priorite', 'nom']).default('priorite').catch('priorite'),
});

export const Route = createFileRoute('/evenements/$evenementId/appels/')({
  validateSearch: recherche,
  search: { middlewares: [stripSearchParams({ tri: 'priorite' })] },
  loader: async ({ context, params }) => {
    const [tournee] = await Promise.all([
      context.queryClient.ensureQueryData(tourneeQuery(params.evenementId)),
      context.queryClient.ensureQueryData(
        reformulationQuery(params.evenementId),
      ),
    ]);
    return { titre: tournee.evenement.titre };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Appels · ${loaderData.titre} · Note de tête`
          : 'Note de tête',
      },
    ],
  }),
  component: PageAppels,
});

function PageAppels() {
  const { evenementId } = Route.useParams();
  const { client, tri } = Route.useSearch();
  return (
    <Volet>
      <AppelsDuJour evenementId={evenementId} client={client} tri={tri} />
    </Volet>
  );
}
