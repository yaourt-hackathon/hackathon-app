import { Chip, IconChevronRight } from '@heroui/react';
import { buttonVariants, linkVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/components/Pastille';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { Contenu, EnTete, Volet } from '@/features/tournee/components/Volet';
import type { EvenementDetecte } from '@/features/tournee/evenements';
import {
  compter,
  formaterDate,
  formaterDateCourte,
  formaterEcheance,
  formaterJour,
  formaterJourMois,
} from '@/features/tournee/format';
import { libelleStatut, libelleType } from '@/features/tournee/libelles';
import { evenementsQuery } from '@/features/tournee/queries';

type Sujet = EvenementDetecte & {
  accroche: string | null;
  ingredients: string[];
};

// Stories 1 et 2, écran « Accueil — sujets du jour » de la maquette v6
export function SujetsDuJour() {
  const { data } = useSuspenseQuery(evenementsQuery());
  const [principal, ...autres] = data.evenements;

  return (
    <Volet>
      <EnTete
        titre={formaterJour(data.date_maj)}
        sousTitre={`${compter(data.evenements.length, 'sujet')} repéré${
          data.evenements.length > 1 ? 's' : ''
        } pour vos clients`}
      >
        {/* Ce qui est simulé se dit à l'écran : la veille est préparée à la main */}
        <p className="flex items-center gap-2 text-xs text-muted">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-success"
          />
          {data.mode === 'demo'
            ? 'Veille préparée pour la démo'
            : "Veille de l'API data"}{' '}
          · données du {formaterDate(data.date_maj)}
        </p>
      </EnTete>
      <Contenu>
        {principal && <SujetPrincipal sujet={principal} />}
        {autres.length > 0 && (
          <AutresSujets sujets={autres} dateMaj={data.date_maj} />
        )}
        {/* /marques lit toujours l'API, à jour, et le scénario de démo est figé
            sur une version plus ancienne : en démo, leurs chiffres se
            contrediraient, donc pas de lien (la page reste à son URL) */}
        {data.mode === 'api' && (
          <p className="text-xs">
            <Link
              to="/marques"
              className={linkVariants().base({ className: 'underline' })}
            >
              Exposition des marques aux allergènes (UE 2023/1545)
            </Link>
          </p>
        )}
        <PiedDonnees
          mode={data.mode}
          dateMaj={data.date_maj}
          crmFictif={data.crm_fictif}
        />
      </Contenu>
    </Volet>
  );
}

function SujetPrincipal({ sujet }: { sujet: Sujet }) {
  return (
    <article
      aria-labelledby="sujet-principal"
      data-echeance={sujet.date_echeance}
      className="flex shrink-0 flex-col gap-3.5 rounded-2xl border border-accent bg-surface p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="sujet-principal" className="text-lg leading-6 font-medium">
          {sujet.titre}
        </h2>
        <Pastille {...libelleStatut[sujet.statut_validation]} />
      </div>
      <p className="text-sm leading-[21px]">
        {sujet.accroche ?? sujet.resume}{' '}
        {sujet.nb_produits_probables > 0 &&
          `${compter(sujet.nb_produits_probables, 'produit')} de vos clients ${
            sujet.nb_produits_probables > 1 ? 'sont' : 'est'
          } probablement concerné${sujet.nb_produits_probables > 1 ? 's' : ''}.`}
      </p>
      {sujet.ingredients.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <ul
            aria-label="Ingrédients cherchés"
            className="flex flex-wrap gap-1.5"
          >
            {sujet.ingredients.map((i) => (
              <li key={i}>
                <Chip color="accent" variant="soft" size="sm">
                  {i}
                </Chip>
              </li>
            ))}
          </ul>
          {/* Ce qui est simulé se dit, en démo comme sur l'API data */}
          <p className="text-xs text-muted">
            Accroche et ingrédients préparés par l'équipe, en attendant l'IA
          </p>
        </div>
      )}
      <dl className="flex gap-6 border-t border-border pt-3.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <dt className="text-xs text-muted">
            {sujet.nb_produits_touches > 1
              ? 'produits touchés'
              : 'produit touché'}
            , sur les {sujet.nb_produits_analyses} de vos clients
          </dt>
          <dd className="order-first text-xl font-medium">
            {sujet.nb_produits_touches}
          </dd>
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <dt className="text-xs text-muted">
            {sujet.nb_clients > 1 ? 'clients concernés' : 'client concerné'}
          </dt>
          <dd className="order-first text-xl font-medium text-accent">
            {sujet.nb_clients}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {sujet.source_nom} · {formaterEcheance(sujet.date_echeance)}
        </p>
        <Link
          to="/evenements/$evenementId"
          params={{ evenementId: sujet.evenement_id }}
          className={buttonVariants({ variant: 'primary' })}
        >
          Lire le sujet
        </Link>
      </div>
    </article>
  );
}

function AutresSujets({
  sujets,
  dateMaj,
}: {
  sujets: Sujet[];
  dateMaj: string;
}) {
  const titre =
    sujets.length === 1
      ? "L'autre sujet du jour"
      : sujets.length === 2
        ? 'Les deux autres sujets du jour'
        : `Les ${sujets.length} autres sujets du jour`;
  return (
    <section aria-labelledby="autres-sujets" className="flex flex-col">
      <h2 id="autres-sujets" className="text-xs text-muted">
        {titre}
      </h2>
      {/* role="list" : Safari retire la sémantique d'une liste sans puces */}
      <ul role="list" className="flex flex-col divide-y divide-border">
        {sujets.map((s) => (
          <li key={s.evenement_id}>
            <AutreSujet sujet={s} dateMaj={dateMaj} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AutreSujet({ sujet, dateMaj }: { sujet: Sujet; dateMaj: string }) {
  return (
    // Le lien du titre couvre toute la ligne (after:inset-0) : un seul arrêt
    // de tabulation, et la ligne entière est cliquable
    <div
      data-echeance={sujet.date_echeance}
      className="relative flex items-center gap-3 py-3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="text-sm font-medium">
          <Link
            to="/evenements/$evenementId"
            params={{ evenementId: sujet.evenement_id }}
            className="outline-none after:absolute after:inset-0"
          >
            {sujet.titre}
          </Link>
        </h3>
        <p className="text-xs text-muted">
          {sujet.accroche ?? libelleType(sujet.type)} ·{' '}
          {compter(sujet.nb_clients, 'client')} ·{' '}
          {/* « 06/11 » cette année, « 27/07/2023 » sinon */}
          {sujet.date_publication.slice(0, 4) === dateMaj.slice(0, 4)
            ? formaterJourMois(sujet.date_publication)
            : formaterDateCourte(sujet.date_publication)}
        </p>
      </div>
      <Pastille {...libelleStatut[sujet.statut_validation]} />
      <IconChevronRight aria-hidden="true" className="size-4 shrink-0" />
    </div>
  );
}
