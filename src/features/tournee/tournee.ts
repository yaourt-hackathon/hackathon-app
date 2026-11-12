import type { ModeDonnees } from '@/features/tournee/donnees/source';
import {
  sansComptes,
  type EvenementAffiche,
} from '@/features/tournee/evenements';
import type {
  Appel,
  Compte,
  ListeAppels,
  ProduitTouche,
} from '@/lib/data-api/generated';

/** gabarit et llm_valide viennent de l'API ; preparee : texte du scénario. */
export type OrigineTexte = Appel['origine_textes'] | 'preparee';

/** Un appel de la tournée : un client, jamais un prospect. */
export interface AppelClient {
  rang: number;
  compte_id: string;
  nom_compte: string;
  /** Code du commercial (KAM-01), `null` si le compte manque. */
  commercial: string | null;
  raison_classement: string;
  fait: string;
  question: string;
  origine_textes: OrigineTexte;
  nb_produits_analyses: number;
  nb_probable: number;
  nb_possible: number;
  /** Produits touchés par cet événement, `null` si le compte manque. */
  produits: ProduitTouche[] | null;
  /** Liste d'ingrédients du premier produit, si la source la connaît. */
  etiquette: string | null;
}

export interface Tournee {
  mode: ModeDonnees;
  date_maj: string;
  crm_fictif: boolean;
  evenement: EvenementAffiche;
  appels: AppelClient[];
}

const ordreNiveau: Record<ProduitTouche['niveau'], number> = {
  probable: 0,
  possible: 1,
};

/**
 * Assemble la tournée d'un événement : ses clients par rang, chacun avec son
 * commercial et les produits touchés par **cet** événement. `comptes[i]` est
 * la fiche de `liste.clients[i]`, `null` si l'API ne la connaît pas. Les
 * prospects sont écartés : l'app ne montre que les clients (docs/produit.md).
 */
export function construireTournee(
  mode: ModeDonnees,
  liste: ListeAppels,
  comptes: readonly (Compte | null)[],
): Tournee {
  const { evenement_id } = liste.evenement;
  const appels = liste.clients
    .map((appel, i): AppelClient => {
      const compte = comptes[i] ?? null;
      const produits =
        compte?.evenements.find((e) => e.evenement_id === evenement_id)
          ?.produits ?? null;
      return {
        rang: appel.rang,
        compte_id: appel.compte_id,
        nom_compte: appel.nom_compte,
        commercial: compte?.commercial ?? null,
        raison_classement: appel.raison_classement,
        fait: appel.fait,
        question: appel.question,
        // En démo, tout texte vient du scénario écrit par l'équipe
        origine_textes: mode === 'demo' ? 'preparee' : appel.origine_textes,
        nb_produits_analyses: appel.nb_produits_analyses,
        nb_probable: appel.nb_probable,
        nb_possible: appel.nb_possible,
        produits:
          produits &&
          [...produits].sort(
            (a, b) => ordreNiveau[a.niveau] - ordreNiveau[b.niveau],
          ),
        etiquette: null,
      };
    })
    .sort((a, b) => a.rang - b.rang);

  return {
    mode,
    date_maj: liste.date_maj,
    crm_fictif: liste.crm_fictif,
    evenement: sansComptes(liste.evenement),
    appels,
  };
}

/** Le premier produit de chaque appel : celui dont on montre l'étiquette. */
export function produitsEnTete(tournee: Tournee): string[] {
  return tournee.appels.flatMap((a) => a.produits?.[0]?.code_barre ?? []);
}

/** Ajoute à chaque appel l'étiquette de son premier produit, si connue. */
export function avecEtiquettes(
  tournee: Tournee,
  etiquettes: Readonly<Record<string, string>>,
): Tournee {
  return {
    ...tournee,
    appels: tournee.appels.map((a) => {
      const code = a.produits?.[0]?.code_barre;
      return { ...a, etiquette: (code && etiquettes[code]) || null };
    }),
  };
}

/** Les chiffres d'un sujet pour « Chez vos clients » : le plus touché d'abord. */
export function chiffresTournee(appels: readonly AppelClient[]) {
  const touches = (a: AppelClient) => a.nb_probable + a.nb_possible;
  const plusTouche = [...appels].sort((a, b) => touches(b) - touches(a))[0];
  return {
    nb_clients: appels.length,
    nb_produits_touches: appels.reduce((n, a) => n + touches(a), 0),
    nb_produits_analyses: appels.reduce(
      (n, a) => n + a.nb_produits_analyses,
      0,
    ),
    plus_touche: plusTouche
      ? { nom: plusTouche.nom_compte, nb_produits: touches(plusTouche) }
      : null,
  };
}
