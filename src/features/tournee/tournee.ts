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
  confiance: Appel['confiance'];
  /** Produits touchés par cet événement, `null` si le compte manque. */
  produits: ProduitTouche[] | null;
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
        confiance: appel.confiance,
        produits:
          produits &&
          [...produits].sort(
            (a, b) => ordreNiveau[a.niveau] - ordreNiveau[b.niveau],
          ),
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

export interface ResumeProduits {
  produits: { nom: string; ingredients: string[] }[];
  autres: number;
}

/**
 * Les premiers produits touchés, avec leurs ingrédients en cause (visés, ou à
 * défaut proches), et le nombre de produits non cités.
 */
export function resumerProduits(
  produits: readonly ProduitTouche[],
  max = 3,
): ResumeProduits {
  return {
    produits: produits.slice(0, max).map((p) => ({
      nom: p.nom,
      ingredients:
        p.elements_directs.length > 0 ? p.elements_directs : p.elements_indices,
    })),
    autres: Math.max(0, produits.length - max),
  };
}
