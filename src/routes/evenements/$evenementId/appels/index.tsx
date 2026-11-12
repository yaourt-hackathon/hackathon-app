import { createFileRoute } from '@tanstack/react-router';
import { ListeAppels } from '@/features/tournee/components/ListeAppels';
import { tourneeQuery } from '@/features/tournee/queries';
import { rechercheSelection } from '@/features/tournee/selection';

export const Route = createFileRoute('/evenements/$evenementId/appels/')({
  validateSearch: rechercheSelection,
  loader: async ({ context, params }) => {
    const tournee = await context.queryClient.ensureQueryData(
      tourneeQuery(params.evenementId),
    );
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
  const { clients } = Route.useSearch();
  return <ListeAppels evenementId={evenementId} clients={clients} />;
}
