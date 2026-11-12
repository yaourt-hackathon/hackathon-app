import { Button, Chip, toast, Tooltip } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/components/Pastille';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { TitreVolet } from '@/features/tournee/components/Volet';
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
import { copier } from '@/features/tournee/presse-papiers';
import { evenementsQuery } from '@/features/tournee/queries';

type Sujet = EvenementDetecte & {
  accroche: string | null;
  ingredients: string[];
};

// Stories 1 et 2, écran « Sujets du jour » de la maquette v1
export function SujetsDuJour() {
  const { data } = useSuspenseQuery(evenementsQuery());
  const [principal, ...autres] = data.evenements;

  return (
    <>
      <TitreVolet
        titre={formaterJour(data.date_maj)}
        sousTitre={`${compter(data.evenements.length, 'sujet')} repéré${
          data.evenements.length > 1 ? 's' : ''
        } pour vos clients`}
      />
      {/* Ce qui est simulé se dit à l'écran : la veille est préparée à la main */}
      <p className="flex items-center gap-2 text-[13px] leading-5 text-secondaire">
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
        {data.mode === 'demo'
          ? 'Veille préparée pour la démo'
          : "Veille de l'API data"}{' '}
        · données du {formaterDate(data.date_maj)}
      </p>
      {principal && <SujetPrincipal sujet={principal} />}
      {autres.length > 0 && (
        <AutresSujets sujets={autres} dateMaj={data.date_maj} />
      )}
      <PiedDonnees
        mode={data.mode}
        dateMaj={data.date_maj}
        crmFictif={data.crm_fictif}
      />
    </>
  );
}

function SujetPrincipal({ sujet }: { sujet: Sujet }) {
  return (
    <article
      aria-labelledby="sujet-principal"
      data-echeance={sujet.date_echeance}
      className="flex flex-col gap-5 rounded-2xl border-[1.5px] border-accent bg-surface p-7 shadow-[0_12px_32px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2">
          <h2
            id="sujet-principal"
            className="text-[22px] leading-[30px] font-medium"
          >
            {sujet.titre}
          </h2>
          <Pastille {...libelleStatut[sujet.statut_validation]} />
        </div>
        {sujet.source_url && <CopierLienSource url={sujet.source_url} />}
      </div>
      <p className="text-[17px] leading-[26px] text-secondaire">
        {sujet.accroche ?? sujet.resume}{' '}
        {sujet.nb_produits_probables > 0 &&
          `${compter(sujet.nb_produits_probables, 'produit')} de vos clients ${
            sujet.nb_produits_probables > 1 ? 'sont' : 'est'
          } probablement concerné${sujet.nb_produits_probables > 1 ? 's' : ''}.`}
      </p>
      {sujet.ingredients.length > 0 && (
        <div className="flex flex-col gap-2">
          <ul
            aria-label="Ingrédients cherchés"
            className="flex flex-wrap gap-2"
          >
            {sujet.ingredients.map((i) => (
              <li key={i}>
                <Chip color="warning" variant="soft" size="sm">
                  {i}
                </Chip>
              </li>
            ))}
          </ul>
          {/* Ce qui est simulé se dit, en démo comme sur l'API data */}
          <p className="text-xs leading-4 text-muted">
            Accroche et ingrédients préparés par l'équipe, en attendant l'IA
          </p>
        </div>
      )}
      <dl className="flex border-t border-border pt-4">
        <div className="flex flex-1 flex-col gap-0.5 pr-6">
          <dt className="text-[13px] leading-5 text-secondaire">
            {sujet.nb_produits_touches > 1
              ? 'produits touchés'
              : 'produit touché'}
            , sur les {sujet.nb_produits_analyses} de vos clients
          </dt>
          <dd className="order-first text-2xl leading-7 font-medium">
            {sujet.nb_produits_touches}
          </dd>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 border-l border-border px-6">
          <dt className="text-[13px] leading-5 text-secondaire">
            {sujet.nb_clients > 1 ? 'clients à appeler' : 'client à appeler'}
          </dt>
          <dd className="order-first text-2xl leading-7 font-medium text-accent">
            {sujet.nb_clients}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] leading-5 text-muted">
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

// Le « … » de la maquette : copier le lien de la source, pour la partager
function CopierLienSource({ url }: { url: string }) {
  async function copierLien() {
    if (await copier(url)) {
      toast.success('Lien de la source copié');
    } else {
      toast.danger('Copie impossible', { description: url });
    }
  }
  return (
    <Tooltip delay={300}>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Copier le lien de la source"
        onPress={() => void copierLien()}
      >
        <IconeCopier />
      </Button>
      {/* Le nom du bouton dit l'action ; l'infobulle ajoute le site, si
          l'adresse se lit (l'API ne garantit pas son format) */}
      <Tooltip.Content>
        Copier le lien de la source
        {URL.canParse(url) && ` · ${new URL(url).hostname}`}
      </Tooltip.Content>
    </Tooltip>
  );
}

// Deux feuilles superposées, à la taille des icônes de la maquette (16 px)
function IconeCopier() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.75" />
      <path d="M10.75 5.25V3.5A1.25 1.25 0 0 0 9.5 2.25H3.5A1.25 1.25 0 0 0 2.25 3.5v6a1.25 1.25 0 0 0 1.25 1.25h1.75" />
    </svg>
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
    <section
      aria-labelledby="autres-sujets"
      className="flex flex-col gap-4 rounded-2xl bg-background p-6"
    >
      <h2 id="autres-sujets" className="text-sm leading-5 text-secondaire">
        {titre}
      </h2>
      {/* role="list" : Safari retire la sémantique d'une liste sans puces */}
      <ul role="list" className="flex flex-col gap-4">
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
    // Le lien du titre couvre toute la carte (after:inset-0) : un seul arrêt
    // de tabulation, et la carte entière est cliquable
    <div
      data-echeance={sujet.date_echeance}
      className="relative flex flex-col gap-1.5 rounded-xl bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.05)] hover:bg-surface-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus"
    >
      <h3 className="text-[15px] leading-[22px] font-medium">
        <Link
          to="/evenements/$evenementId"
          params={{ evenementId: sujet.evenement_id }}
          className="outline-none after:absolute after:inset-0 after:rounded-[inherit]"
        >
          {sujet.titre}
        </Link>
      </h3>
      {sujet.accroche && (
        <p className="text-sm leading-5 text-secondaire">{sujet.accroche}</p>
      )}
      <p className="flex flex-wrap items-center gap-2 text-xs leading-4 text-muted">
        <span>
          {libelleType(sujet.type)} · {compter(sujet.nb_clients, 'client')} ·{' '}
          {/* « 06/11 » cette année, « 27/07/2023 » sinon */}
          {sujet.date_publication.slice(0, 4) === dateMaj.slice(0, 4)
            ? formaterJourMois(sujet.date_publication)
            : formaterDateCourte(sujet.date_publication)}
        </span>
        <Pastille {...libelleStatut[sujet.statut_validation]} />
      </p>
    </div>
  );
}
