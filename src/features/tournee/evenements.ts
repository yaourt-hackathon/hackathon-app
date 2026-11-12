import type {
  Appel,
  Evenement,
  ListeAppels,
  ListeEvenements,
} from '@/lib/data-api/generated';

/** Un événement tel que l'app l'affiche : sans compte mêlant les prospects. */
export type EvenementAffiche = Omit<Evenement, 'nb_comptes_a_appeler'>;

/**
 * Un événement de la veille et ses chiffres, comptés sur les clients seulement
 * (prospects exclus) : clients à appeler, produits touchés (probables et
 * possibles), dont probables, et produits analysés chez ces clients.
 */
export type EvenementDetecte = EvenementAffiche & {
  nb_clients: number;
  nb_produits_touches: number;
  nb_produits_probables: number;
  nb_produits_analyses: number;
};

/**
 * Retire `nb_comptes_a_appeler` : il compte aussi les prospects, que l'app ne
 * montre pas et qui ne doivent pas atteindre le navigateur (docs/produit.md).
 */
export function sansComptes(e: Evenement): EvenementAffiche {
  return {
    evenement_id: e.evenement_id,
    type: e.type,
    titre: e.titre,
    resume: e.resume,
    source_nom: e.source_nom,
    source_url: e.source_url,
    date_publication: e.date_publication,
    date_echeance: e.date_echeance,
    statut_validation: e.statut_validation,
  };
}

export interface Veille {
  date_maj: string;
  crm_fictif: boolean;
  evenements: EvenementDetecte[];
}

/**
 * Compte les clients sur `clients` : `nb_comptes_a_appeler` de l'API inclut
 * les prospects, que l'app ne montre pas (docs/produit.md). `appels[i]` est la
 * liste d'appels de `liste.evenements[i]`, `null` si l'API ne la connaît pas.
 */
export function resumerVeille(
  liste: ListeEvenements,
  appels: readonly (ListeAppels | null)[],
): Veille {
  const evenements = liste.evenements.map((e, i) => ({
    ...sansComptes(e),
    ...chiffres(appels[i]?.clients ?? []),
  }));
  return {
    date_maj: liste.date_maj,
    crm_fictif: appels.some((a) => a?.crm_fictif === true),
    evenements: trierParEcheance(evenements),
  };
}

/**
 * Échéance la plus proche d'abord, sans échéance à la fin ; à échéance égale,
 * le plus récent d'abord. Les dates sont au format ISO (AAAA-MM-JJ).
 */
export function trierParEcheance<
  T extends Pick<Evenement, 'date_echeance' | 'date_publication'>,
>(evenements: readonly T[]): T[] {
  const cle = (e: T) => e.date_echeance || '9999-12-31';
  return [...evenements].sort(
    (a, b) =>
      cle(a).localeCompare(cle(b)) ||
      b.date_publication.localeCompare(a.date_publication),
  );
}

const somme = (appels: readonly Appel[], f: (a: Appel) => number) =>
  appels.reduce((total, a) => total + f(a), 0);

function chiffres(clients: readonly Appel[]) {
  return {
    nb_clients: clients.length,
    nb_produits_touches: somme(clients, (a) => a.nb_probable + a.nb_possible),
    nb_produits_probables: somme(clients, (a) => a.nb_probable),
    nb_produits_analyses: somme(clients, (a) => a.nb_produits_analyses),
  };
}
