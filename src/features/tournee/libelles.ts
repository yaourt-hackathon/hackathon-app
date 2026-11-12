import type { Libelle } from '@/components/Pastille';
import type { ModeDonnees } from '@/features/tournee/donnees/source';
import type { Reformulation } from '@/features/tournee/reformulation/preparees';
import type { OrigineTexte } from '@/features/tournee/tournee';
import type { Evenement } from '@/lib/data-api/generated';

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
  api: { texte: 'API data', couleur: 'success' },
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
  preparee: "Préparé par l'équipe en attendant l'IA, à relire avant de valider",
  api: "Écrit à partir de l'API data, à relire avant de valider",
  llm: "Rédigé par l'IA, à relire avant de valider",
};
