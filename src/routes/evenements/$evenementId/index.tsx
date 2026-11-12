import { linkVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  stripSearchParams,
} from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { CarteReformulation } from '@/features/tournee/components/CarteReformulation';
import { EnTeteEvenement } from '@/features/tournee/components/EnTeteEvenement';
import { ListeAppels } from '@/features/tournee/components/ListeAppels';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';

// ?valide=true : la reformulation est validée, la tournée s'affiche. Une
// valeur illisible (?valide=oui) vaut false, pas une erreur.
const recherche = z.object({ valide: z.boolean().default(false).catch(false) });

export const Route = createFileRoute('/evenements/$evenementId/')({
  validateSearch: recherche,
  search: { middlewares: [stripSearchParams({ valide: false })] },
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
  component: PageEvenement,
});

function PageEvenement() {
  const { evenementId } = Route.useParams();
  const { valide } = Route.useSearch();
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const { data: reformulation } = useSuspenseQuery(
    reformulationQuery(evenementId),
  );
  // Focus sur la liste seulement quand on vient de valider, pas au chargement
  const [valideAuChargement] = useState(valide);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className={linkVariants().base({ className: 'text-sm' })}>
        ← Événements détectés
      </Link>
      <div className="mt-6">
        <EnTeteEvenement evenement={tournee.evenement} />
      </div>
      <div className="mt-8">
        <CarteReformulation
          evenementId={evenementId}
          reformulation={reformulation}
          valide={valide}
        />
      </div>
      {valide && (
        <ListeAppels appels={tournee.appels} focus={!valideAuChargement} />
      )}
      <PiedDonnees
        mode={tournee.mode}
        dateMaj={tournee.date_maj}
        crmFictif={tournee.crm_fictif}
      />
    </main>
  );
}
