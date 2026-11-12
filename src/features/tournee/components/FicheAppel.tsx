import {
  Chip,
  ExternalLinkIcon,
  IconChevronRight,
  ToggleButton,
} from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  argumentsAppel,
  ingredientsEnCause,
  trouverAppel,
} from '@/features/tournee/appel';
import { useAppelsPasses } from '@/features/tournee/components/AppelsPasses';
import { PhraseAppel } from '@/features/tournee/components/PhraseAppel';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import {
  Actions,
  Contenu,
  EnTete,
  Onglet,
  Onglets,
  Retour,
  Volet,
} from '@/features/tournee/components/Volet';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';
import { appelsChoisis } from '@/features/tournee/selection';
import { chiffresTournee, type AppelClient } from '@/features/tournee/tournee';

// Story 6 ★, écran « Fiche d'appel en onglets » de la maquette v6 : la phrase
// d'accroche, puis de quoi tenir l'échange
export function FicheAppel({
  evenementId,
  compteId,
  clients,
}: {
  evenementId: string;
  compteId: string;
  clients: string | undefined;
}) {
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const { data: reformulation } = useSuspenseQuery(
    reformulationQuery(evenementId),
  );
  const { passes, basculer } = useAppelsPasses();
  // Le loader de la route a déjà répondu 404 à un client absent
  const appel = trouverAppel(tournee.appels, compteId) as AppelClient;
  // La liste générée, ou toute la tournée si ce client n'y est pas
  const choisis = appelsChoisis(tournee.appels, clients);
  const liste = choisis.includes(appel) ? choisis : tournee.appels;
  const position = liste.indexOf(appel) + 1;
  const suivant = liste[position];
  const argumentsSources = argumentsAppel(appel, reformulation);
  const relances = reformulation?.pourRelancer ?? [];
  const totalTouches = chiffresTournee(tournee.appels).nb_produits_touches;
  const touches = appel.nb_probable + appel.nb_possible;
  const source = tournee.evenement.source_url;

  return (
    <Volet>
      <EnTete
        retour={
          <Retour
            to="/evenements/$evenementId/appels"
            params={{ evenementId }}
            search={{ clients }}
          >
            Liste
          </Retour>
        }
        aDroite={
          <p className="text-[13px] text-muted">
            {`Appel ${position} sur ${liste.length}`}
          </p>
        }
        titre={appel.nom_compte}
        sousTitre={
          position === 1 ? 'À appeler en premier' : `À appeler en ${position}e`
        }
      />
      <Contenu>
        <PhraseAppel key={appel.compte_id} appel={appel} />
        <Onglets
          label="Pour tenir l'échange"
          onglets={[
            {
              id: 'arguments',
              titre: `Arguments · ${argumentsSources.length}`,
            },
            { id: 'relancer', titre: 'Pour relancer' },
            { id: 'pourquoi', titre: 'Pourquoi ce client ?' },
          ]}
        >
          <Onglet id="arguments">
            <ul className="flex flex-col divide-y divide-border">
              {argumentsSources.map((a) => (
                <li
                  key={a.texte}
                  className="flex flex-col gap-1.5 py-2.5 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <p className="flex-1 text-[13px] leading-[19px]">
                      {a.texte}
                    </p>
                    <Chip color="accent" variant="soft" size="sm">
                      {a.repere}
                    </Chip>
                  </div>
                  {a.ingredients && (
                    <p className="flex flex-wrap items-center gap-1.5 rounded-lg bg-background p-2.5 text-[11px] leading-[18px] text-muted uppercase">
                      <span>Ingrédients :</span>
                      {a.ingredients.map((i, n, tous) => (
                        // Une virgule entre les ingrédients, surlignés compris,
                        // pour que la liste se lise (et s'entende) comme telle
                        <span key={n}>
                          {i.enAvant ? (
                            <mark className="rounded-xl bg-warning-soft px-1 font-medium text-warning-soft-foreground">
                              {i.texte}
                            </mark>
                          ) : (
                            i.texte
                          )}
                          {n < tous.length - 1 && ','}
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {source && (
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: 'secondary',
                  size: 'sm',
                  className: 'mt-2.5 gap-1',
                })}
              >
                Ouvrir la source
                <ExternalLinkIcon aria-hidden="true" className="size-4" />
              </a>
            )}
          </Onglet>
          <Onglet id="relancer">
            {relances.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border text-sm leading-[21px]">
                {relances.map((q) => (
                  <li key={q} className="py-2.5 first:pt-0">
                    {q}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                Aucune question préparée pour ce sujet.
              </p>
            )}
          </Onglet>
          <Onglet id="pourquoi">
            <ul className="flex flex-col divide-y divide-border text-sm leading-[21px]">
              <li className="py-2.5 first:pt-0">{appel.raison_classement}</li>
              {appel.produits === null ? (
                <li className="py-2.5 text-muted">
                  Produits indisponibles : la fiche de ce compte manque à la
                  source de données.
                </li>
              ) : (
                <li className="flex items-center gap-3 py-2.5">
                  <span className="flex-1">
                    {touches} des {totalTouches} produits repérés sont les
                    siens.
                  </span>
                  {appel.produits.length > 0 && (
                    <Chip color="warning" variant="soft" size="sm">
                      {ingredientsEnCause(appel.produits)}
                    </Chip>
                  )}
                </li>
              )}
              <li className="py-2.5">
                Suivi par {appel.commercial ?? 'un commercial inconnu'}.
              </li>
              <li className="py-2.5 text-muted">
                Ordre de la liste : le client le plus touché d'abord, en nombre
                de produits et en part de sa gamme.
              </li>
            </ul>
          </Onglet>
        </Onglets>
        <PiedDonnees
          mode={tournee.mode}
          dateMaj={tournee.date_maj}
          crmFictif={tournee.crm_fictif}
        />
      </Contenu>
      <Actions>
        {/* Local : rien n'est écrit dans Pegasus (voir AppelsPasses) */}
        <ToggleButton
          isSelected={passes.has(appel.compte_id)}
          onChange={() => basculer(appel.compte_id)}
          className="text-accent-soft-foreground"
        >
          {({ isSelected }) => (
            <>
              <IconeCase cochee={isSelected} />
              Marquer comme appelé
            </>
          )}
        </ToggleButton>
        {suivant ? (
          <Link
            to="/evenements/$evenementId/appels/$compteId"
            params={{ evenementId, compteId: suivant.compte_id }}
            search={{ clients }}
            className={buttonVariants({ variant: 'ghost', className: 'gap-1' })}
          >
            Client suivant
            <IconChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <Link
            to="/evenements/$evenementId/appels"
            params={{ evenementId }}
            search={{ clients }}
            className={buttonVariants({ variant: 'ghost' })}
          >
            Retour à la liste
          </Link>
        )}
      </Actions>
    </Volet>
  );
}

// La case de la maquette (icône « square »), cochée une fois l'appel passé
function IconeCase({ cochee }: { cochee: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 3H4.5C3.67157 3 3 3.67157 3 4.5V11.5C3 12.3284 3.67157 13 4.5 13H11.5C12.3284 13 13 12.3284 13 11.5V4.5C13 3.67157 12.3284 3 11.5 3ZM4.5 1.5C2.84315 1.5 1.5 2.84315 1.5 4.5V11.5C1.5 13.1569 2.84315 14.5 4.5 14.5H11.5C13.1569 14.5 14.5 13.1569 14.5 11.5V4.5C14.5 2.84315 13.1569 1.5 11.5 1.5H4.5Z"
      />
      {cochee && (
        <path
          d="M5.25 8.25 7.25 10.25 10.75 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
