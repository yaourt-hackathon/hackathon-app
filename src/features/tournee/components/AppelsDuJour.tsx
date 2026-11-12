import {
  Accordion,
  Button,
  Chip,
  Dropdown,
  ExternalLinkIcon,
  IconChevronDown,
  type Key,
} from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { Pastille } from '@/components/Pastille';
import {
  argumentsAppel,
  ingredientsEnCause,
  raisonCourte,
  trierAppels,
  type Tri,
} from '@/features/tournee/appel';
import { PhraseAppel } from '@/features/tournee/components/PhraseAppel';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { RetourAccueil, TitreVolet } from '@/features/tournee/components/Volet';
import { compter } from '@/features/tournee/format';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';
import type { Reformulation } from '@/features/tournee/reformulation/preparees';
import type { AppelClient } from '@/features/tournee/tournee';
import type { Evenement } from '@/lib/data-api/generated';

const libelleTri: Record<Tri, string> = {
  priorite: 'priorité',
  nom: 'nom',
};

// Stories 4 à 6, écran « Appels du jour » de la maquette v1 : les clients en
// accordéon, un seul ouvert à la fois. Le client ouvert est dans l'URL
// (?client=…), pour recharger ou partager la page sur le même appel.
export function AppelsDuJour({
  evenementId,
  client,
  tri,
}: {
  evenementId: string;
  client: string | undefined;
  tri: Tri;
}) {
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const { data: reformulation } = useSuspenseQuery(
    reformulationQuery(evenementId),
  );
  const navigate = useNavigate({ from: '/evenements/$evenementId/appels/' });
  const appels = trierAppels(tournee.appels, tri);
  // « Marquer comme appelé » : local, perdu au rechargement (rien n'est écrit
  // dans Pegasus en démo)
  const [appeles, setAppeles] = useState<ReadonlySet<string>>(new Set());

  const ouvert =
    client === undefined ? appels[0]?.compte_id : client || undefined;
  const titre = useRef<HTMLHeadingElement>(null);
  const ouvrir = (compteId: string | undefined) =>
    navigate({
      search: (s) => ({ ...s, client: compteId ?? '' }),
      replace: true,
      resetScroll: false,
    });

  async function marquer(appel: AppelClient) {
    const suivants = new Set(appeles).add(appel.compte_id);
    setAppeles(suivants);
    // Le suivant pas encore appelé s'ouvre, comme une liste qu'on dépile
    const suivant = appels.find((a) => !suivants.has(a.compte_id));
    await ouvrir(suivant?.compte_id);
    // Le bouton cliqué a disparu avec son panneau : le focus va à l'en-tête
    // de l'appel ouvert, ou au titre s'il n'en reste plus
    const declencheur = suivant
      ? document.querySelector<HTMLElement>(
          `[data-declencheur="${suivant.compte_id}"]`,
        )
      : null;
    (declencheur ?? titre.current)?.focus();
  }

  return (
    <>
      <RetourAccueil />
      <TitreVolet
        titreRef={titre}
        titre={`${compter(appels.length, 'client')} à appeler`}
        sousTitre={tri === 'nom' ? 'Classés par nom' : 'Classés par priorité'}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] leading-5 text-muted" aria-live="polite">
          {appeles.size} appel{appeles.size > 1 ? 's' : ''} passé
          {appeles.size > 1 ? 's' : ''} sur {appels.length}
        </p>
        <Dropdown>
          <Button size="sm" variant="tertiary" className="gap-1">
            Trier : {libelleTri[tri]}
            <IconChevronDown aria-hidden="true" className="size-4" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              aria-label="Trier les appels"
              selectionMode="single"
              selectedKeys={[tri]}
              onAction={(cle: Key) =>
                void navigate({
                  search: (s) => ({ ...s, tri: cle as Tri }),
                  replace: true,
                  resetScroll: false,
                })
              }
            >
              <Dropdown.Item id="priorite" textValue="Priorité">
                Priorité
              </Dropdown.Item>
              <Dropdown.Item id="nom" textValue="Nom">
                Nom du client
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      {/* section nommée : un nom accessible ne se pose pas sur le div de
          l'accordéon */}
      <section aria-label="Clients à appeler">
        <Accordion
          className="flex flex-col gap-3"
          expandedKeys={ouvert ? [ouvert] : []}
          onExpandedChange={(cles) =>
            void ouvrir([...cles].map(String).find((c) => c !== ouvert))
          }
        >
          {appels.map((appel) => (
            <Accordion.Item
              key={appel.compte_id}
              id={appel.compte_id}
              className="rounded-2xl data-[expanded=true]:bg-surface data-[expanded=true]:shadow-[0_12px_16px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)]"
            >
              {/* h2 : sous le h1 du volet (Accordion.Heading rend un h3) */}
              <Accordion.Heading render={(props) => <h2 {...props} />}>
                <Accordion.Trigger
                  data-declencheur={appel.compte_id}
                  className="flex w-full items-start gap-3 px-6 py-3.5 text-left"
                >
                  <span
                    data-rang={appel.rang}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-default-soft text-xs font-medium"
                  >
                    {appel.rang}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span
                        data-nom
                        className="text-base leading-6 font-medium"
                      >
                        {appel.nom_compte}
                      </span>
                      {appel.produits && appel.produits.length > 0 && (
                        <Chip color="warning" variant="soft" size="sm">
                          {ingredientsEnCause(appel.produits)}
                        </Chip>
                      )}
                      {appeles.has(appel.compte_id) && (
                        <Pastille texte="Appelé" couleur="success" />
                      )}
                    </span>
                    <span className="text-[13px] leading-5 text-secondaire">
                      {raisonCourte(appel, appels)} · Suivi par{' '}
                      {appel.commercial ?? 'un commercial inconnu'}
                    </span>
                  </span>
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                {/* Seul l'appel ouvert a son détail dans la page : un seul
                    « Copier la phrase », un seul jeu d'arguments à lire */}
                {appel.compte_id === ouvert && (
                  <Accordion.Body className="flex flex-col gap-5 px-6 pb-6 text-foreground">
                    <PhraseAppel key={appel.compte_id} appel={appel} />
                    <Details
                      appel={appel}
                      evenement={tournee.evenement}
                      reformulation={reformulation}
                    />
                    <div>
                      <Button
                        size="sm"
                        variant="tertiary"
                        isDisabled={appeles.has(appel.compte_id)}
                        onPress={() => void marquer(appel)}
                      >
                        {appeles.has(appel.compte_id)
                          ? 'Appel passé'
                          : 'Marquer comme appelé'}
                      </Button>
                    </div>
                  </Accordion.Body>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <PiedDonnees
        mode={tournee.mode}
        dateMaj={tournee.date_maj}
        crmFictif={tournee.crm_fictif}
      />
    </>
  );
}

function Details({
  appel,
  evenement,
  reformulation,
}: {
  appel: AppelClient;
  evenement: Omit<Evenement, 'nb_comptes_a_appeler'>;
  reformulation: Reformulation | null;
}) {
  const argumentsSources = argumentsAppel(appel, reformulation);
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-sm leading-[22px] text-secondaire">
        {appel.rang === 1
          ? 'Pourquoi lui en premier'
          : `Pourquoi en ${appel.rang}e position`}{' '}
        : {appel.raison_classement}
      </p>
      {appel.produits === null && (
        <p className="text-sm text-muted">
          Produits indisponibles : la fiche de ce compte manque à la source de
          données.
        </p>
      )}
      <section aria-label="Arguments à avoir sous la main">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <h3 className="text-[15px] leading-6 font-medium">
            Arguments à avoir sous la main
          </h3>
          {evenement.source_url && (
            <a
              href={evenement.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: 'tertiary',
                size: 'sm',
                className: 'gap-1',
              })}
            >
              Ouvrir la source
              <ExternalLinkIcon aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>
        <ul>
          {argumentsSources.map((a) => (
            <li
              key={a.texte}
              className="flex flex-col items-start gap-1.5 border-t border-border py-3 text-sm leading-[22px]"
            >
              <p>{a.texte}</p>
              {a.ingredients && (
                <p className="flex w-full flex-wrap items-center gap-1.5 rounded-lg bg-background p-3 text-[11px] leading-[18px] text-secondaire uppercase">
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
              <Chip size="sm" variant="soft">
                {a.repere}
              </Chip>
            </li>
          ))}
        </ul>
        {reformulation && reformulation.pourRelancer.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t border-border pt-3.5 text-sm leading-[22px]">
            <h4 className="font-medium">Pour relancer</h4>
            <ul className="text-secondaire">
              {reformulation.pourRelancer.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
