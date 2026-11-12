import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listerMarques } from '@/features/exposition/exposition.server';
import { marquesMarquesGet } from '@/lib/data-api/generated';

vi.mock('@/lib/data-api/generated', () => ({
  marquesMarquesGet: vi.fn(),
  expositionExpositionGet: vi.fn(),
}));

const marque = (id: string, urgence: string, nb_probable: number) => ({
  id,
  marque: id,
  nb_produits: 10,
  nb_probable,
  urgence,
});

describe('listerMarques', () => {
  beforeEach(() => {
    vi.stubEnv('DATA_API_URL', 'http://data-api:8000');
  });

  // L'API trie par nb_probable : sans notre tri, une marque « haute » avec
  // peu de produits passerait après une « moyenne »
  it("trie les marques par urgence, quel que soit l'ordre de l'API", async () => {
    vi.mocked(marquesMarquesGet).mockResolvedValue({
      data: {
        factice: false,
        date_maj: '2026-11-12',
        marques: [
          marque('moyenne', 'moyenne', 9),
          marque('faible', 'faible', 0),
          marque('haute', 'haute', 1),
        ],
      },
      request: new Request('http://data-api:8000/marques'),
      response: new Response(),
    } as Awaited<ReturnType<typeof marquesMarquesGet>>);

    const { marques } = await listerMarques();

    expect(marques.map((m) => m.id)).toEqual(['haute', 'moyenne', 'faible']);
  });
});
