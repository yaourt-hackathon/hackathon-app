import { createFileRoute } from '@tanstack/react-router';
import { SujetCreuse } from '@/features/tournee/components/SujetCreuse';
import { Volet } from '@/features/tournee/components/Volet';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';

export const Route = createFileRoute('/evenements/$evenementId/')({
  loader: async ({ context, params }) => {
    const [tournee] = await Promise.all([
      context.queryClient.ensureQueryData(tourneeQuery(params.evenementId)),
      context.queryClient.ensureQueryData(
        reformulationQuery(params.evenementId),
      ),
    ]);
    return { titre: tournee.evenement.titre };
  },
  // Sans données (404, erreur), le titre par défaut plutôt que « undefined »
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.titre} · Note de tête`
          : 'Note de tête',
      },
    ],
  }),
  component: PageSujet,
});

function PageSujet() {
  const { evenementId } = Route.useParams();
  return (
    <Volet>
      <SujetCreuse evenementId={evenementId} />
    </Volet>
  );
}
