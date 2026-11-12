import type {
  Evenement,
  ListeAppels,
  ListeEvenements,
} from '@/lib/data-api/generated';

/** Un événement de la veille, avec les clients à appeler (prospects exclus). */
export type EvenementDetecte = Omit<Evenement, 'nb_comptes_a_appeler'> & {
  nb_clients: number;
};

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
    evenement_id: e.evenement_id,
    type: e.type,
    titre: e.titre,
    resume: e.resume,
    source_nom: e.source_nom,
    source_url: e.source_url,
    date_publication: e.date_publication,
    date_echeance: e.date_echeance,
    statut_validation: e.statut_validation,
    nb_clients: appels[i]?.clients.length ?? 0,
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
