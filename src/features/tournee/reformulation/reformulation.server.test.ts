import { describe, expect, it } from 'vitest';
import { scenario } from '@/features/tournee/donnees/scenario.server';
import { reformuler } from '@/features/tournee/reformulation/reformulation.server';
import { estUneQuestion, motsInterdits } from '@/features/tournee/vocabulaire';

// Les événements du scénario, plus EVT-002 que seule l'API data connaît
const evenements = [
  ...scenario.evenements.map((e) => e.evenement_id),
  'EVT-002',
];

describe('reformuler', () => {
  it.each(evenements)(
    '%s : un texte préparé, ses ingrédients et ses relances',
    async (id) => {
      const reformulation = await reformuler({ evenement_id: id });

      expect(reformulation?.origine).toBe('preparee');
      expect(reformulation?.texte).toMatch(/^Compris : /);
      expect(reformulation?.ingredients.length).toBeGreaterThan(0);
      expect(reformulation?.motifs.length).toBeGreaterThan(0);
      // Les motifs repèrent en minuscules les ingrédients cherchés
      for (const m of reformulation?.motifs ?? []) {
        expect(m).toBe(m.toLowerCase());
      }
      expect(reformulation?.pourRelancer.every(estUneQuestion)).toBe(true);
      expect(reformulation?.arguments.every((a) => a.repere !== '')).toBe(true);
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
