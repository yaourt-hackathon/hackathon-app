import type { Libelle } from '@/components/Pastille';
import type { ModeDonnees } from '@/features/tournee/donnees/source';
import type {
  Critere,
  Reformulation,
} from '@/features/tournee/reformulation/preparees';
import type { OrigineTexte } from '@/features/tournee/tournee';
import type { Appel, Evenement } from '@/lib/data-api/generated';

const types: Record<string, string> = {
  reglementation: 'Réglementation',
  matiere_premiere: 'Matière première',
  concurrence: 'Concurrence',
};

/** Type d'événement de l'API ; un type inconnu s'affiche lisiblement. */
export function libelleType(type: string): string {
  const texte = types[type] ?? type.replaceAll('_', ' ');
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

// Ce qui est simulé se dit à l'écran (docs/produit.md)
export const libelleStatut: Record<Evenement['statut_validation'], Libelle> = {
  valide: { texte: 'Fait réel', couleur: 'success' },
  test: { texte: 'Événement fictif', couleur: 'warning' },
};

export const libelleMode: Record<ModeDonnees, Libelle> = {
  demo: { texte: 'Données de démo', couleur: 'warning' },
  api: { texte: 'API data', couleur: 'accent' },
};

export const libelleCritere: Record<Critere['type'], Libelle> = {
  direct: { texte: 'Ingrédient visé', couleur: 'accent' },
  indice: { texte: 'Ingrédient proche', couleur: 'default' },
};

// faible : moins de 10 produits analysés ; bonne : 20 ou plus (API data)
export const libelleConfiance: Record<Appel['confiance'], Libelle> = {
  faible: { texte: 'Confiance faible', couleur: 'warning' },
  moyenne: { texte: 'Confiance moyenne', couleur: 'default' },
  bonne: { texte: 'Confiance bonne', couleur: 'success' },
};

/** Qui a écrit un texte montré au commercial : il valide chaque sortie. */
export const libelleOrigine: Record<OrigineTexte, string> = {
  gabarit: 'Texte écrit par le code à partir des chiffres',
  llm_valide: "Rédigé par l'IA et relu par une personne",
  preparee: "Texte préparé par l'équipe",
};

export const libelleOrigineReformulation: Record<
  Reformulation['origine'],
  string
> = {
  preparee: "Texte préparé par l'équipe, en attendant l'IA",
  api: "Critères de l'API data",
  llm: "Rédigé par l'IA : à vérifier avant de valider",
};
