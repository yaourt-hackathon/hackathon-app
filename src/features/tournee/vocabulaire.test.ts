import { describe, expect, it } from 'vitest';
import {
  estUnFait,
  estUneQuestion,
  motsInterdits,
} from '@/features/tournee/vocabulaire';

describe('motsInterdits', () => {
  it.each([
    ['Ce produit est non conforme.', 'non conforme'],
    ['Produit non-conforme', 'non conforme'],
    ['une non-conformité probable', 'non conforme'],
    ['Usage illégal', 'illégal'],
    ['Ingrédient interdit', 'interdit'],
    ['Substances interdites', 'interdit'],
  ])('repère « %s »', (texte, mot) => {
    expect(motsInterdits(texte)).toEqual([mot]);
  });

  // Le résumé d'EVT-001 dit « pas une interdiction » : c'est permis
  it('laisse passer « exposition probable » et « interdiction »', () => {
    expect(
      motsInterdits(
        "Exposition probable. C'est une obligation d'étiquetage, pas une interdiction.",
      ),
    ).toEqual([]);
  });
});

describe('estUnFait', () => {
  it('exige « Source : … »', () => {
    expect(estUnFait('2 produits listent de la lavande. Source : X.')).toBe(
      true,
    );
    expect(estUnFait('2 produits listent de la lavande.')).toBe(false);
  });

  it("refuse un point d'interrogation", () => {
    expect(estUnFait('Avez-vous vu ? Source : X.')).toBe(false);
  });
});

describe('estUneQuestion', () => {
  it('finit par « ? », espaces finales comprises', () => {
    expect(estUneQuestion('Souhaitez-vous en parler ? ')).toBe(true);
    expect(estUneQuestion('Parlons-en.')).toBe(false);
  });
});
