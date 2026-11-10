import type { MarqueResume } from '@/lib/data-api/generated';

export type Urgence = MarqueResume['urgence'];

const rang: Record<Urgence, number> = { haute: 0, moyenne: 1, faible: 2 };

/** Urgence décroissante, puis nombre de produits en exposition probable. */
export function trierParUrgence<
  T extends Pick<MarqueResume, 'urgence' | 'nb_probable'>,
>(marques: readonly T[]): T[] {
  return [...marques].sort(
    (a, b) =>
      rang[a.urgence] - rang[b.urgence] || b.nb_probable - a.nb_probable,
  );
}
