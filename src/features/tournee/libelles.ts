import type { Libelle } from '@/components/Pastille';
import type { ModeDonnees } from '@/features/tournee/donnees/source';
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
  api: { texte: 'API data', couleur: 'accent' },
};
