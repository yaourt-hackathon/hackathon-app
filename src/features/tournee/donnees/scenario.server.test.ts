import { describe, expect, it } from 'vitest';
import {
  zCompte,
  zListeAppels,
  zListeEvenements,
} from '@/lib/data-api/generated/zod.gen';
import type { Appel, Compte, ListeAppels } from '@/lib/data-api/generated';
import { scenario } from '@/features/tournee/donnees/scenario.server';
import { sourceDemo } from '@/features/tournee/donnees/source-demo.server';
import {
  estUnFait,
  estUneQuestion,
  motsInterdits,
} from '@/features/tournee/vocabulaire';

// Le scénario se lit comme l'API : chaque réponse passe ses schémas Zod, et
// ses nombres suivent les règles de l'API data (docs/produit.md).

const { evenements } = zListeEvenements.parse(await sourceDemo.evenements());

const listes = new Map<string, ListeAppels>();
for (const e of evenements) {
  listes.set(
    e.evenement_id,
    zListeAppels.parse(await sourceDemo.appels(e.evenement_id)),
  );
}
// [« EVT-001 / CPT-001 », appel] : un nom de test par appel
const tousLesAppels = [...listes.values()].flatMap((l) =>
  [...l.clients, ...l.prospects].map(
    (a) => [`${l.evenement.evenement_id} / ${a.compte_id}`, a] as const,
  ),
);

const comptes = new Map<string, Compte>();
for (const id of new Set(tousLesAppels.map(([, a]) => a.compte_id))) {
  comptes.set(id, zCompte.parse(await sourceDemo.compte(id)));
}

const liste = (id: string) => listes.get(id)!;
const compte = (id: string) => comptes.get(id)!;

// round() de Python, comme l'API : x,5 va à l'entier pair
const arrondiPython = (x: number) => {
  const r = Math.round(x);
  return r - x === 0.5 && r % 2 !== 0 ? r - 1 : r;
};

// Score de l'API data : 5 × probable (10 au plus) + 2 × possible (10 au plus)
// + 30 × part de probable
const scoreApi = (a: Appel) =>
  arrondiPython(
    5 * Math.min(a.nb_probable, 10) +
      2 * Math.min(a.nb_possible, 10) +
      (30 * a.nb_probable) / a.nb_produits_analyses,
  );

// Confiance de l'API : faible sous 10 produits analysés, bonne à partir de 20
const confianceApi = (n: number) =>
  n < 10 ? 'faible' : n < 20 ? 'moyenne' : 'bonne';

describe('scénario de démo', () => {
  it("garde EVT-001 de l'API, ajoute des événements DEMO-xx fictifs", () => {
    const ids = evenements.map((e) => e.evenement_id);
    expect(ids).toContain('EVT-001');
    expect(ids.length).toBeGreaterThanOrEqual(3);
    for (const e of evenements.filter((e) => e.evenement_id !== 'EVT-001')) {
      expect(e.evenement_id).toMatch(/^DEMO-\d{2}$/);
      expect(e.statut_validation).toBe('test');
    }
  });

  it('compte les appels de chaque événement, prospects compris', () => {
    for (const e of evenements) {
      const { clients, prospects } = liste(e.evenement_id);
      expect(e.nb_comptes_a_appeler).toBe(clients.length + prospects.length);
    }
  });

  it.each(evenements.map((e) => e.evenement_id))(
    '%s : de 3 à 5 clients, rangés 1…n par score décroissant',
    (id) => {
      const { clients, prospects } = liste(id);
      expect(clients.length).toBeGreaterThanOrEqual(3);
      expect(clients.length).toBeLessThanOrEqual(5);
      // Dans l'ordre de la réponse, comme l'API les renvoie
      for (const groupe of [clients, prospects]) {
        expect(groupe.map((a) => a.rang)).toEqual(groupe.map((_, i) => i + 1));
        const scores = groupe.map((a) => a.score);
        expect(scores).toEqual([...scores].sort((a, b) => b - a));
      }
      expect(clients.every((a) => a.statut === 'client')).toBe(true);
      expect(prospects.every((a) => a.statut === 'prospect')).toBe(true);
    },
  );

  it.each(tousLesAppels)(
    "%s : nombres cohérents avec ses produits et les règles de l'API",
    (_, appel) => {
      expect(appel.score).toBe(scoreApi(appel));
      expect(appel.confiance).toBe(confianceApi(appel.nb_produits_analyses));
      expect(appel.part_probable).toBeCloseTo(
        appel.nb_probable / appel.nb_produits_analyses,
        2,
      );
    },
  );

  it('relie chaque appel à son compte, et chaque produit à une marque du compte', () => {
    for (const [evenementId, l] of listes) {
      for (const appel of [...l.clients, ...l.prospects]) {
        const fiche = compte(appel.compte_id);
        expect(fiche.nom_compte).toBe(appel.nom_compte);
        expect(fiche.statut).toBe(appel.statut);

        // Comme l'API : les événements de la fiche, par id
        const ids = fiche.evenements.map((e) => e.evenement_id);
        expect(ids).toEqual([...ids].sort());

        const touche = fiche.evenements.find(
          (e) => e.evenement_id === evenementId,
        );
        expect(touche, `${appel.compte_id} / ${evenementId}`).toBeDefined();
        expect(touche!.rang).toBe(appel.rang);
        expect(touche!.fait).toBe(appel.fait);

        const produits = touche!.produits;
        const nb = (niveau: string) =>
          produits.filter((p) => p.niveau === niveau).length;
        expect(nb('probable')).toBe(appel.nb_probable);
        expect(nb('possible')).toBe(appel.nb_possible);
        expect(produits.length).toBeLessThanOrEqual(fiche.nb_produits_analyses);
        for (const p of produits) {
          expect(fiche.marques).toContain(p.marque);
          // Probable : un ingrédient visé lu sur l'étiquette ; possible : un
          // ingrédient proche seulement
          if (p.niveau === 'probable') {
            expect(p.elements_directs.length).toBeGreaterThan(0);
          } else {
            expect(p.elements_directs).toEqual([]);
            expect(p.elements_indices.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("n'invente des produits que pour des entreprises inventées", () => {
    const inventees = new Set(
      scenario.comptes
        .filter((c) => c.compte_id.startsWith('DEMO-'))
        .flatMap((c) => c.marques),
    );
    for (const c of scenario.comptes.filter((c) =>
      c.compte_id.startsWith('DEMO-'),
    )) {
      expect(c.nom_compte).toMatch(/\((fictif|fictive)\)$/);
    }
    for (const p of scenario.produits) {
      // Codes 200… : réservés à l'usage interne, jamais attribués à un produit
      expect(p.code_barre.startsWith('200')).toBe(inventees.has(p.marque));
    }
    const codes = scenario.produits.map((p) => p.code_barre);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it.each(tousLesAppels)(
    '%s : un fait qui cite sa source, puis une question',
    (_, appel) => {
      expect(estUnFait(appel.fait), appel.fait).toBe(true);
      expect(estUneQuestion(appel.question), appel.question).toBe(true);
    },
  );

  it('cite la source de son événement dans chaque fait', () => {
    for (const l of listes.values()) {
      for (const appel of [...l.clients, ...l.prospects]) {
        expect(appel.fait).toContain(`Source : ${l.evenement.source_nom}`);
      }
    }
  });

  it("n'écrit aucun mot interdit", () => {
    expect(motsInterdits(JSON.stringify(scenario))).toEqual([]);
  });

  it("retrouve un id sans tenir compte de la casse, comme l'API", async () => {
    expect((await sourceDemo.appels('demo-01'))?.evenement.evenement_id).toBe(
      'DEMO-01',
    );
    expect((await sourceDemo.compte('cpt-001'))?.compte_id).toBe('CPT-001');
  });

  it('renvoie null pour un id inconnu', async () => {
    expect(await sourceDemo.appels('EVT-999')).toBeNull();
    expect(await sourceDemo.compte('CPT-999')).toBeNull();
  });

  it('renvoie des copies : modifier une réponse ne touche pas au scénario', async () => {
    const premiere = await sourceDemo.appels('EVT-001');
    premiere!.clients[0]!.fait = 'modifié';
    const seconde = await sourceDemo.appels('EVT-001');
    expect(seconde!.clients[0]!.fait).not.toBe('modifié');
  });
});
