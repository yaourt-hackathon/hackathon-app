import type { Libelle } from '@/components/Pastille';
import type { Produit } from '@/lib/data-api/generated';
import type { Urgence } from '@/features/exposition/urgence';

type Niveau = Produit['niveau'];

// Vocabulaire de l'API : « exposition probable », jamais « non-conformité »
export const libelleUrgence: Record<Urgence, Libelle> = {
  haute: { texte: 'Urgence haute', couleur: 'danger' },
  moyenne: { texte: 'Urgence moyenne', couleur: 'warning' },
  faible: { texte: 'Urgence faible', couleur: 'default' },
};

export const libelleNiveau: Record<Niveau, Libelle> = {
  probable: { texte: 'Exposition probable', couleur: 'danger' },
  possible: { texte: 'Exposition possible', couleur: 'warning' },
  indetermine: { texte: 'Indéterminé', couleur: 'default' },
  non_detecte: { texte: 'Non détecté', couleur: 'success' },
};
