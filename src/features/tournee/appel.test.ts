import { describe, expect, it } from 'vitest';
import {
  argumentsAppel,
  decouperIngredients,
  ingredientsEnCause,
  raisonCourte,
  separerSource,
  surligner,
  texteACopier,
  trierAppels,
  trouverAppel,
} from '@/features/tournee/appel';
import type { ProduitTouche } from '@/lib/data-api/generated';
import {
  construireTournee,
  type AppelClient,
} from '@/features/tournee/tournee';
import { sourceDemo } from '@/features/tournee/donnees/source-demo.server';

const appel = (compte_id: string, rang: number) =>
  ({ compte_id, rang, nom_compte: compte_id }) as AppelClient;

const tournee = [appel('CPT-001', 1), appel('CPT-002', 2), appel('CPT-003', 3)];

describe('trouverAppel', () => {
  it("retrouve le client sans tenir compte de la casse, comme l'API", () => {
    expect(trouverAppel(tournee, 'cpt-002')?.compte_id).toBe('CPT-002');
  });

  it('renvoie null pour un compte absent', () => {
    expect(trouverAppel(tournee, 'CPT-999')).toBeNull();
  });

  // So'Bio étic (CPT-004) est prospect pour EVT-001 dans le scénario
  it('renvoie null pour un prospect : il ne fait pas partie de la tournée', async () => {
    const liste = await sourceDemo.appels('EVT-001');
    expect(liste?.prospects.map((p) => p.compte_id)).toContain('CPT-004');
    const { appels } = construireTournee('demo', liste!, []);
    expect(trouverAppel(appels, 'CPT-004')).toBeNull();
  });
});

describe('texteACopier', () => {
  it('met le fait, une ligne vide, puis la question', () => {
    expect(
      texteACopier(
        ' 2 produits listent de la lavande. Source : X. ',
        'Et vous ?',
      ),
    ).toBe('2 produits listent de la lavande. Source : X.\n\nEt vous ?');
  });
});

const produit = (
  nom: string,
  elements_directs: string[],
  elements_indices: string[] = [],
): ProduitTouche => ({
  code_barre: nom,
  marque: 'm',
  nom,
  niveau: elements_directs.length > 0 ? 'probable' : 'possible',
  elements_directs,
  elements_indices,
  type_rincage: 'rince',
  date_fiche: '2026-01-01',
  reference_parfum: '',
});

const complet = (
  rang: number,
  produits: ProduitTouche[] | null,
  etiquette: string | null = null,
) =>
  ({
    rang,
    compte_id: `C${rang}`,
    nom_compte: `Client ${rang}`,
    nb_probable: produits?.filter((p) => p.niveau === 'probable').length ?? 0,
    nb_possible: produits?.filter((p) => p.niveau === 'possible').length ?? 0,
    produits,
    etiquette,
  }) as AppelClient;

describe('raisonCourte', () => {
  const p = (nom: string) => produit(nom, ['lavande']);
  // Le rang suit le score, pas le nombre de produits : ici le 2e en a plus
  const premier = complet(1, [p('a'), p('b')]);
  const second = complet(2, [p('c'), p('d'), p('e')]);
  const seul = complet(3, [p('f')]);
  const tournee = [premier, second, seul];

  it('dit « le plus » du client le plus touché, quel que soit son rang', () => {
    expect(raisonCourte(second, tournee)).toBe('Le plus de produits touchés');
    expect(raisonCourte(premier, tournee)).toBe('2 produits touchés');
  });

  it('dit « un seul produit », et pas de superlatif sans comparaison', () => {
    expect(raisonCourte(seul, tournee)).toBe('Un seul produit touché');
    expect(raisonCourte(second, [second])).toBe('3 produits touchés');
  });
});

describe('ingredientsEnCause', () => {
  it('donne les deux premiers ingrédients visés, sans doublon', () => {
    expect(
      ingredientsEnCause([
        produit('a', ['lavande']),
        produit('b', ['lavande', 'lavandin']),
        produit('c', ['citron']),
      ]),
    ).toBe('Lavande et lavandin');
  });

  it("prend les ingrédients proches s'il n'y a rien de visé", () => {
    expect(ingredientsEnCause([produit('a', [], ['geraniol'])])).toBe(
      'Geraniol',
    );
  });
});

describe('surligner', () => {
  it('met en avant chaque terme, sans tenir compte de la casse', () => {
    expect(
      surligner("De l'huile de Lavande et du lavandin.", [
        'lavande',
        'lavandin',
      ]),
    ).toEqual([
      { texte: "De l'huile de ", enAvant: false },
      { texte: 'Lavande', enAvant: true },
      { texte: ' et du ', enAvant: false },
      { texte: 'lavandin', enAvant: true },
      { texte: '.', enAvant: false },
    ]);
  });

  it("ne surligne que des mots entiers, le plus long terme d'abord", () => {
    expect(
      surligner('Vos roses, votre rose et votre eau de rose.', [
        'rose',
        'eau de rose',
      ]).filter((m) => m.enAvant),
    ).toEqual([
      { texte: 'rose', enAvant: true },
      { texte: 'eau de rose', enAvant: true },
    ]);
  });

  it('rend le texte entier sans terme', () => {
    expect(surligner('Rien.', [])).toEqual([
      { texte: 'Rien.', enAvant: false },
    ]);
  });
});

describe('decouperIngredients', () => {
  it('exige tous les fragments du motif : un agrume, mais son huile', () => {
    expect(
      decouperIngredients(
        'Citrus Aurantium Amara Flower Water, Citrus Limon Peel Oil*',
        ['citrus oil'],
      ).map((m) => m.enAvant),
    ).toEqual([false, true]);
  });

  it("découpe la liste et repère les ingrédients de l'événement", () => {
    expect(
      decouperIngredients('Aqua, Lavandula Angustifolia Oil , Linalool', [
        'lavandula',
      ]),
    ).toEqual([
      { texte: 'Aqua', enAvant: false },
      { texte: 'Lavandula Angustifolia Oil', enAvant: true },
      { texte: 'Linalool', enAvant: false },
    ]);
  });
});

describe('separerSource', () => {
  it('sépare la phrase de sa source', () => {
    expect(
      separerSource('Votre savon liste de la lavande. Source : Veille.'),
    ).toEqual({
      phrase: 'Votre savon liste de la lavande.',
      source: 'Veille',
    });
    expect(separerSource('Sans source.')).toEqual({
      phrase: 'Sans source.',
      source: null,
    });
  });
});

describe('argumentsAppel', () => {
  const reformulation = {
    motifs: ['lavandula'],
    arguments: [{ texte: 'La récolte baisse.', repere: 'Veille' }],
  };

  it("cite le premier produit et son étiquette, la gamme, puis l'événement", () => {
    const appel = complet(
      1,
      [
        produit('Savon', ['lavande']),
        produit('Crème', ['lavande']),
        produit('Brume', ['lavande']),
      ],
      'Aqua, Lavandula Oil',
    );
    const args = argumentsAppel(appel, reformulation);
    expect(args.map((a) => [a.texte, a.repere])).toEqual([
      ['« Savon » liste lavande.', 'Étiquette du produit'],
      [
        '2 autres produits de sa gamme sont touchés : « Crème » et « Brume ».',
        'Étiquettes de la gamme',
      ],
      ['La récolte baisse.', 'Veille'],
    ]);
    expect(args[0]?.ingredients?.map((i) => i.enAvant)).toEqual([false, true]);
  });

  it("n'a que les arguments de l'événement sans produits connus", () => {
    expect(argumentsAppel(complet(1, null), reformulation)).toEqual(
      reformulation.arguments,
    );
  });

  it("n'affiche pas de liste d'ingrédients sans étiquette", () => {
    const [premier] = argumentsAppel(
      complet(1, [produit('Savon', ['rose'])]),
      null,
    );
    expect(premier?.ingredients).toBeUndefined();
  });
});

describe('trierAppels', () => {
  it('trie par rang ou par nom de client', () => {
    const appels = [
      { ...complet(2, []), nom_compte: 'Alpha' },
      { ...complet(1, []), nom_compte: 'Églantine' },
    ];
    expect(trierAppels(appels, 'priorite').map((a) => a.rang)).toEqual([1, 2]);
    expect(trierAppels(appels, 'nom').map((a) => a.nom_compte)).toEqual([
      'Alpha',
      'Églantine',
    ]);
  });
});
