import { createFileRoute, notFound } from '@tanstack/react-router';
import { trouverAppel } from '@/features/tournee/appel';
import { FicheAppel } from '@/features/tournee/components/FicheAppel';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';
import { rechercheSelection } from '@/features/tournee/selection';

// Client inconnu ou prospect (absent de la tournée) : 404
export const Route = createFileRoute(
  '/evenements/$evenementId/appels/$compteId',
)({
  validateSearch: rechercheSelection,
  loader: async ({ context, params }) => {
    const [tournee] = await Promise.all([
      context.queryClient.ensureQueryData(tourneeQuery(params.evenementId)),
      context.queryClient.ensureQueryData(
        reformulationQuery(params.evenementId),
      ),
    ]);
    const appel = trouverAppel(tournee.appels, params.compteId);
    if (appel === null) throw notFound();
    return { titre: `${appel.nom_compte} · ${tournee.evenement.titre}` };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.titre} · Note de tête`
          : 'Note de tête',
      },
    ],
  }),
  component: PageAppel,
});

function PageAppel() {
  const { evenementId, compteId } = Route.useParams();
  const { clients } = Route.useSearch();
  return (
    <FicheAppel
      evenementId={evenementId}
      compteId={compteId}
      clients={clients}
    />
  );
}
