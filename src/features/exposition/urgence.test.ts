import { describe, expect, it } from 'vitest';
import { trierParUrgence } from '@/features/exposition/urgence';

describe('trierParUrgence', () => {
  it('classe haute, moyenne puis faible, et départage par nb_probable', () => {
    const marques = [
      { id: 'a', urgence: 'faible', nb_probable: 9 },
      { id: 'b', urgence: 'haute', nb_probable: 2 },
      { id: 'c', urgence: 'moyenne', nb_probable: 1 },
      { id: 'd', urgence: 'haute', nb_probable: 5 },
    ] as const;

    expect(trierParUrgence(marques).map((m) => m.id)).toEqual([
      'd',
      'b',
      'c',
      'a',
    ]);
  });

  it('ne modifie pas le tableau reçu', () => {
    const marques = [
      { urgence: 'faible', nb_probable: 0 },
      { urgence: 'haute', nb_probable: 0 },
    ] as const;
    trierParUrgence(marques);
    expect(marques[0].urgence).toBe('faible');
  });
});
