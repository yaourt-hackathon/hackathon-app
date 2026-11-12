import { describe, expect, it } from 'vitest';
import { scenario } from '@/features/tournee/donnees/scenario.server';
import { reformuler } from '@/features/tournee/reformulation/reformulation.server';
import { motsInterdits } from '@/features/tournee/vocabulaire';

// Les événements du scénario, plus EVT-002 que seule l'API data connaît
const evenements = [
  ...scenario.evenements.map((e) => e.evenement_id),
  'EVT-002',
];

describe('reformuler', () => {
  it.each(evenements)(
    '%s : un texte préparé, avec ses critères',
    async (id) => {
      const reformulation = await reformuler({ evenement_id: id });

      expect(reformulation?.origine).toBe('preparee');
      expect(reformulation?.texte).toMatch(/^Compris : /);
      expect(reformulation?.criteres.some((c) => c.type === 'direct')).toBe(
        true,
      );
      expect(motsInterdits(JSON.stringify(reformulation))).toEqual([]);
    },
  );

  it("retrouve l'événement sans tenir compte de la casse", async () => {
    expect(await reformuler({ evenement_id: 'demo-01' })).not.toBeNull();
  });

  it("renvoie null quand aucun texte n'est prêt", async () => {
    expect(await reformuler({ evenement_id: 'EVT-999' })).toBeNull();
  });
});
