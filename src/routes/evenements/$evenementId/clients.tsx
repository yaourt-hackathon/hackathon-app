import { createFileRoute } from '@tanstack/react-router';
import { ChoixClients } from '@/features/tournee/components/ChoixClients';
import { tourneeQuery } from '@/features/tournee/queries';
import { rechercheSelection } from '@/features/tournee/selection';

export const Route = createFileRoute('/evenements/$evenementId/clients')({
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
          ? `Clients · ${loaderData.titre} · Note de tête`
          : 'Note de tête',
      },
    ],
  }),
  component: PageClients,
});

function PageClients() {
  const { evenementId } = Route.useParams();
  const { clients } = Route.useSearch();
  // key : revenir avec un autre choix (« Modifier la sélection ») repart de
  // ce choix, pas de l'état précédent
  return (
    <ChoixClients
      key={clients ?? ''}
      evenementId={evenementId}
      clients={clients}
    />
  );
}
