import { describe, expect, it } from 'vitest';
import {
  avecEtiquettes,
  chiffresTournee,
  construireTournee,
  produitsEnTete,
} from '@/features/tournee/tournee';
import type {
  Appel,
  Compte,
  ListeAppels,
  ProduitTouche,
} from '@/lib/data-api/generated';

const produit = (
  nom: string,
  niveau: ProduitTouche['niveau'],
  elements_directs: string[] = [],
  elements_indices: string[] = [],
): ProduitTouche => ({
  code_barre: nom,
  marque: 'm',
  nom,
  niveau,
  elements_directs,
  elements_indices,
  type_rincage: 'rince',
  date_fiche: '2026-01-01',
  reference_parfum: '',
});

const appel = (
  compte_id: string,
  rang: number,
  statut: Appel['statut'] = 'client',
): Appel => ({
  rang,
  compte_id,
  nom_compte: compte_id,
  statut,
  score: 10,
  raison_classement: 'raison',
  fait: 'fait. Source : X.',
  question: 'question ?',
  origine_textes: 'gabarit',
  nb_produits_analyses: 10,
  nb_probable: 1,
  nb_possible: 0,
  part_probable: 0.1,
  confiance: 'moyenne',
});

const liste = (clients: Appel[], prospects: Appel[] = []): ListeAppels => ({
  date_maj: '2026-11-12',
  crm_fictif: true,
  evenement: {
    evenement_id: 'EVT-001',
    type: 'reglementation',
    titre: 't',
    resume: 'r',
    source_nom: 's',
    source_url: '',
    date_publication: '2026-01-01',
    date_echeance: '',
    statut_validation: 'valide',
    nb_comptes_a_appeler: clients.length + prospects.length,
  },
  clients,
  prospects,
});

const compte = (
  compte_id: string,
  evenements: Compte['evenements'] = [],
): Compte => ({
  date_maj: '2026-11-12',
  crm_fictif: true,
  compte_id,
  nom_compte: compte_id,
  statut: 'client',
  pays: 'France',
  segment: 's',
  commercial: `KAM-${compte_id}`,
  dernier_contact: '',
  marques: [],
  nb_produits_analyses: 10,
  classe_ca: 'A',
  nb_parfums: 1,
  quantite_kg_annee: 1,
  evenements,
});

const touche = (evenement_id: string, produits: ProduitTouche[]) => ({
  evenement_id,
  titre: 't',
  rang: 1,
  score: 1,
  fait: 'f',
  question: 'q',
  produits,
});

describe('construireTournee', () => {
  it("écarte les prospects, et jusqu'à leur nombre", () => {
    const tournee = construireTournee(
      'api',
      liste([appel('C1', 1)], [appel('P1', 1, 'prospect')]),
      [compte('C1')],
    );
    expect(tournee.appels.map((a) => a.compte_id)).toEqual(['C1']);
    expect(JSON.stringify(tournee)).not.toContain('P1');
    expect(tournee.evenement).not.toHaveProperty('nb_comptes_a_appeler');
  });

  it("range les clients par rang, quel que soit l'ordre reçu", () => {
    const tournee = construireTournee(
      'api',
      liste([appel('C3', 3), appel('C1', 1), appel('C2', 2)]),
      [compte('C3'), compte('C1'), compte('C2')],
    );
    expect(tournee.appels.map((a) => [a.rang, a.compte_id])).toEqual([
      [1, 'C1'],
      [2, 'C2'],
      [3, 'C3'],
    ]);
    // Chaque compte reste avec son appel après le tri
    expect(tournee.appels.map((a) => a.commercial)).toEqual([
      'KAM-C1',
      'KAM-C2',
      'KAM-C3',
    ]);
  });

  it("ne garde que les produits de l'événement, probables d'abord", () => {
    const tournee = construireTournee('api', liste([appel('C1', 1)]), [
      compte('C1', [
        touche('EVT-002', [produit('autre événement', 'probable')]),
        touche('EVT-001', [
          produit('possible', 'possible'),
          produit('probable', 'probable'),
        ]),
      ]),
    ]);
    expect(tournee.appels[0]?.produits?.map((p) => p.nom)).toEqual([
      'probable',
      'possible',
    ]);
  });

  it("garde l'appel quand le compte manque : produits et commercial inconnus", () => {
    const tournee = construireTournee(
      'api',
      liste([appel('C1', 1), appel('C2', 2)]),
      [null, compte('C2', [touche('EVT-001', [])])],
    );
    expect(tournee.appels[0]).toMatchObject({
      compte_id: 'C1',
      produits: null,
      commercial: null,
    });
    expect(tournee.appels[1]?.produits).toEqual([]);
  });

  it("dit l'origine des textes : celle de l'API, ou « préparé » en démo", () => {
    const l = liste([appel('C1', 1)]);
    expect(
      construireTournee('api', l, [compte('C1')]).appels[0]?.origine_textes,
    ).toBe('gabarit');
    expect(
      construireTournee('demo', l, [compte('C1')]).appels[0]?.origine_textes,
    ).toBe('preparee');
  });
});

describe('étiquettes et chiffres', () => {
  const tournee = construireTournee(
    'demo',
    liste([appel('C1', 1), appel('C2', 2)]),
    [
      compte('C1', [
        touche('EVT-001', [
          produit('possible', 'possible'),
          produit('tete', 'probable', ['lavande']),
        ]),
      ]),
      null,
    ],
  );

  it("cherche l'étiquette du premier produit de chaque appel", () => {
    // Probable d'abord : « tete » passe devant « possible »
    expect(produitsEnTete(tournee)).toEqual(['tete']);
    const avec = avecEtiquettes(tournee, { tete: 'Aqua, Lavandula Oil' });
    expect(avec.appels.map((a) => a.etiquette)).toEqual([
      'Aqua, Lavandula Oil',
      null,
    ]);
  });

  it('compte produits et clients, et nomme le plus touché', () => {
    // Le rang 2 est le plus touché : le rang suit le score, pas le nombre
    const appels = tournee.appels.map((a, i) => ({
      ...a,
      nb_probable: i === 0 ? 1 : 3,
      nb_possible: 1,
      nb_produits_analyses: 10,
    }));
    expect(chiffresTournee(appels)).toEqual({
      nb_clients: 2,
      nb_produits_touches: 6,
      nb_produits_analyses: 20,
      plus_touche: { nom: 'C2', nb_produits: 4 },
    });
    expect(chiffresTournee([]).plus_touche).toBeNull();
  });
});
