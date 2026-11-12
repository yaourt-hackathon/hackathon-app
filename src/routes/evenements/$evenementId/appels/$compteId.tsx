import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { trouverAppel } from '@/features/tournee/appel';
import { FilAriane } from '@/features/tournee/components/FilAriane';
import { NavigationAppels } from '@/features/tournee/components/NavigationAppels';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { ProduitsTouches } from '@/features/tournee/components/ProduitsTouches';
import { RaisonAppeler } from '@/features/tournee/components/RaisonAppeler';
import { tourneeQuery } from '@/features/tournee/queries';

// Story 6 ★ : la raison d'appeler un client. Même requête que la liste : la
// tournée est déjà en cache, et précédent / suivant ne coûtent rien.
export const Route = createFileRoute(
  '/evenements/$evenementId/appels/$compteId',
)({
  loader: async ({ context, params }) => {
    const tournee = await context.queryClient.ensureQueryData(
      tourneeQuery(params.evenementId),
    );
    // Client inconnu ou prospect (absent de la tournée) : 404
    const dansTournee = trouverAppel(tournee.appels, params.compteId);
    if (dansTournee === null) throw notFound();
    return { titre: dansTournee.appel.nom_compte };
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
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const dansTournee = trouverAppel(tournee.appels, compteId);
  if (dansTournee === null) throw notFound();
  const { appel } = dansTournee;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
      <FilAriane
        evenementId={evenementId}
        titreEvenement={tournee.evenement.titre}
        nomCompte={appel.nom_compte}
      />
      <header>
        <TitreClient compteId={appel.compte_id} nom={appel.nom_compte} />
        <p className="mt-2 text-muted">
          Suivi par {appel.commercial ?? 'un commercial inconnu'}. Client{' '}
          {dansTournee.position} sur {dansTournee.total} :{' '}
          {appel.raison_classement}
        </p>
      </header>
      {/* key : changer de client repart de ses textes d'origine */}
      <RaisonAppeler
        key={appel.compte_id}
        appel={appel}
        evenement={tournee.evenement}
      />
      <ProduitsTouches nomCompte={appel.nom_compte} produits={appel.produits} />
      <NavigationAppels evenementId={evenementId} dansTournee={dansTournee} />
      <PiedDonnees
        mode={tournee.mode}
        dateMaj={tournee.date_maj}
        crmFictif={tournee.crm_fictif}
      />
    </main>
  );
}

/**
 * Le nom du client. Après « Client suivant » ou « précédent », le focus y va :
 * le lien cliqué a pu disparaître, et le lecteur d'écran annonce le client.
 */
function TitreClient({ compteId, nom }: { compteId: string; nom: string }) {
  const titre = useRef<HTMLHeadingElement>(null);
  const affiche = useRef(compteId);
  useEffect(() => {
    if (affiche.current === compteId) return;
    affiche.current = compteId;
    titre.current?.focus();
  }, [compteId]);

  return (
    <h1
      ref={titre}
      tabIndex={-1}
      className="text-3xl font-semibold tracking-tight outline-none"
    >
      {nom}
    </h1>
  );
}
