import { describe, expect, it } from 'vitest';
import { resumerVeille, trierParEcheance } from '@/features/tournee/evenements';
import type { Appel, Evenement, ListeAppels } from '@/lib/data-api/generated';

const evenement = (
  evenement_id: string,
  date_echeance: string,
  date_publication = '2026-11-01',
): Evenement => ({
  evenement_id,
  type: 'reglementation',
  titre: evenement_id,
  resume: '',
  source_nom: '',
  source_url: '',
  date_publication,
  date_echeance,
  statut_validation: 'valide',
  nb_comptes_a_appeler: 99,
});

const appel = (compte_id: string, statut: Appel['statut']) =>
  ({
    compte_id,
    statut,
    nb_probable: 2,
    nb_possible: 1,
    nb_produits_analyses: 10,
  }) as Appel;

const appels = (clients: number, prospects: number): ListeAppels =>
  ({
    date_maj: '2026-11-12',
    crm_fictif: true,
    clients: Array.from({ length: clients }, (_, i) =>
      appel(`C${i}`, 'client'),
    ),
    prospects: Array.from({ length: prospects }, (_, i) =>
      appel(`P${i}`, 'prospect'),
    ),
  }) as ListeAppels;

describe('resumerVeille', () => {
  it('compte les clients, pas les prospects ni nb_comptes_a_appeler', () => {
    const veille = resumerVeille(
      { date_maj: '2026-11-12', evenements: [evenement('A', '2027-01-01')] },
      [appels(2, 3)],
    );
    expect(veille.evenements[0]?.nb_clients).toBe(2);
    expect(veille.evenements[0]).not.toHaveProperty('nb_comptes_a_appeler');
  });

  it('compte produits touchés, probables et analysés sur les clients seuls', () => {
    const veille = resumerVeille(
      { date_maj: '2026-11-12', evenements: [evenement('A', '2027-01-01')] },
      [appels(2, 5)],
    );
    expect(veille.evenements[0]).toMatchObject({
      nb_clients: 2,
      nb_produits_touches: 6,
      nb_produits_probables: 4,
      nb_produits_analyses: 20,
    });
  });

  it("compte zéro client quand la liste d'appels manque", () => {
    const veille = resumerVeille(
      { date_maj: '2026-11-12', evenements: [evenement('A', '')] },
      [null],
    );
    expect(veille.evenements[0]?.nb_clients).toBe(0);
    expect(veille.crm_fictif).toBe(false);
  });

  it("garde chaque liste d'appels avec son événement après le tri", () => {
    const veille = resumerVeille(
      {
        date_maj: '2026-11-12',
        evenements: [
          evenement('tard', '2028-01-01'),
          evenement('tot', '2027-01-01'),
        ],
      },
      [appels(4, 0), appels(1, 0)],
    );
    expect(
      veille.evenements.map((e) => [e.evenement_id, e.nb_clients]),
    ).toEqual([
      ['tot', 1],
      ['tard', 4],
    ]);
    expect(veille.crm_fictif).toBe(true);
  });
});

describe('trierParEcheance', () => {
  it("met l'échéance la plus proche d'abord, sans échéance à la fin", () => {
    const tries = trierParEcheance([
      evenement('sans', ''),
      evenement('2028', '2028-07-31'),
      evenement('2027', '2027-06-30'),
    ]);
    expect(tries.map((e) => e.evenement_id)).toEqual(['2027', '2028', 'sans']);
  });

  it("départage par date de publication, la plus récente d'abord", () => {
    const tries = trierParEcheance([
      evenement('ancien', '', '2026-01-01'),
      evenement('recent', '', '2026-11-11'),
    ]);
    expect(tries.map((e) => e.evenement_id)).toEqual(['recent', 'ancien']);
  });

  it('ne modifie pas le tableau reçu', () => {
    const liste = [evenement('b', '2028-01-01'), evenement('a', '2027-01-01')];
    trierParEcheance(liste);
    expect(liste[0]?.evenement_id).toBe('b');
  });
});
