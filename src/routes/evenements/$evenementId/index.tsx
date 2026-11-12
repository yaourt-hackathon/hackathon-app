import { linkVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { EnTeteEvenement } from '@/features/tournee/components/EnTeteEvenement';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { tourneeQuery } from '@/features/tournee/queries';

export const Route = createFileRoute('/evenements/$evenementId/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(tourneeQuery(params.evenementId)),
  // Sans données (404, erreur), le titre par défaut plutôt que « undefined »
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.evenement.titre} · Note de tête`
          : 'Note de tête',
      },
    ],
  }),
  component: PageEvenement,
});

function PageEvenement() {
  const { evenementId } = Route.useParams();
  const { data } = useSuspenseQuery(tourneeQuery(evenementId));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className={linkVariants().base({ className: 'text-sm' })}>
        ← Événements détectés
      </Link>
      <div className="mt-6">
        <EnTeteEvenement evenement={data.evenement} />
      </div>
      <PiedDonnees
        mode={data.mode}
        dateMaj={data.date_maj}
        crmFictif={data.crm_fictif}
      />
    </main>
  );
}
