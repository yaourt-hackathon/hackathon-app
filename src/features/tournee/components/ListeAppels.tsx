import { Chip, IconChevronRight } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/components/Pastille';
import { ingredientsEnCause, raisonCourte } from '@/features/tournee/appel';
import { useAppelsPasses } from '@/features/tournee/components/AppelsPasses';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import {
  Contenu,
  EnTete,
  Retour,
  Volet,
} from '@/features/tournee/components/Volet';
import { compter } from '@/features/tournee/format';
import { tourneeQuery } from '@/features/tournee/queries';
import { appelsChoisis } from '@/features/tournee/selection';

// Stories 4 et 5, écran « Liste d'appels générée » de la maquette v6 : les
// clients choisis, classés ; chacun ouvre sa fiche d'appel
export function ListeAppels({
  evenementId,
  clients,
}: {
  evenementId: string;
  clients: string | undefined;
}) {
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const { passes } = useAppelsPasses();
  const appels = appelsChoisis(tournee.appels, clients);
  const nbPasses = appels.filter((a) => passes.has(a.compte_id)).length;
  // Le prochain à appeler ressort, comme une liste qu'on dépile
  const prochain = appels.find((a) => !passes.has(a.compte_id));

  return (
    <Volet>
      <EnTete
        retour={<Retour to="/">Accueil</Retour>}
        titre={`${compter(appels.length, 'client')} à appeler`}
        sousTitre="Classés par priorité"
      />
      <Contenu>
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-muted" aria-live="polite">
              {`${compter(nbPasses, 'appel')} passé${nbPasses > 1 ? 's' : ''} sur ${appels.length}`}
            </p>
            <Link
              to="/evenements/$evenementId/clients"
              params={{ evenementId }}
              search={{ clients }}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Modifier la sélection
            </Link>
          </div>
          {/* role="list" : Safari retire la sémantique d'une liste sans puces */}
          <ul
            role="list"
            aria-label="Clients à appeler"
            className="flex flex-col divide-y divide-border"
          >
            {appels.map((appel, i) => (
              <li key={appel.compte_id}>
                <Link
                  to="/evenements/$evenementId/appels/$compteId"
                  params={{ evenementId, compteId: appel.compte_id }}
                  search={{ clients }}
                  className="flex items-center gap-3 py-3 outline-none focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <span
                    data-rang={appel.rang}
                    className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      appel === prochain
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-default-soft text-default-soft-foreground'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span data-nom className="text-[15px] font-medium">
                      {appel.nom_compte}
                    </span>
                    <span className="text-[13px] text-muted">
                      {raisonCourte(appel, tournee.appels)}
                    </span>
                  </span>
                  {passes.has(appel.compte_id) && (
                    <Pastille texte="Appelé" couleur="success" />
                  )}
                  {appel.produits && appel.produits.length > 0 && (
                    <Chip
                      color="warning"
                      variant="soft"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      {ingredientsEnCause(appel.produits)}
                    </Chip>
                  )}
                  <IconChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <PiedDonnees
          mode={tournee.mode}
          dateMaj={tournee.date_maj}
          crmFictif={tournee.crm_fictif}
        />
      </Contenu>
    </Volet>
  );
}
