import type { Produit } from '@/lib/data-api/generated';
import type { Urgence } from '@/features/exposition/urgence';

type Niveau = Produit['niveau'];

interface Libelle {
  texte: string;
  classes: string;
}

// Vocabulaire de l'API : « exposition probable », jamais « non-conformité »
export const libelleUrgence: Record<Urgence, Libelle> = {
  haute: { texte: 'Urgence haute', classes: 'bg-red-100 text-red-800' },
  moyenne: { texte: 'Urgence moyenne', classes: 'bg-amber-100 text-amber-800' },
  faible: { texte: 'Urgence faible', classes: 'bg-stone-200 text-stone-700' },
};

export const libelleNiveau: Record<Niveau, Libelle> = {
  probable: {
    texte: 'Exposition probable',
    classes: 'bg-red-100 text-red-800',
  },
  possible: {
    texte: 'Exposition possible',
    classes: 'bg-amber-100 text-amber-800',
  },
  indetermine: {
    texte: 'Indéterminé',
    classes: 'bg-stone-200 text-stone-700',
  },
  non_detecte: {
    texte: 'Non détecté',
    classes: 'bg-emerald-100 text-emerald-800',
  },
};
