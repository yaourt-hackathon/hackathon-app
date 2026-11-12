import { describe, expect, it } from 'vitest';
import {
  compter,
  formaterDate,
  formaterDateCourte,
  formaterEcheance,
  formaterJour,
  formaterJourMois,
} from '@/features/tournee/format';

describe('formaterDate', () => {
  it('écrit la date en français', () => {
    expect(formaterDate('2028-07-31')).toBe('31 juillet 2028');
  });

  // Minuit UTC : en fuseau négatif, une date locale reculerait d'un jour
  it('ne décale pas le jour selon le fuseau', () => {
    expect(formaterDate('2026-01-01')).toBe('1 janvier 2026');
  });

  it('laisse une date illisible telle quelle', () => {
    expect(formaterDate('bientôt')).toBe('bientôt');
    expect(formaterDate('2026-13-45')).toBe('2026-13-45');
  });
});

describe('formats courts de la maquette', () => {
  it('écrit le jour de la veille, la date courte et le jour du mois', () => {
    expect(formaterJour('2026-11-12')).toBe('Jeudi 12 novembre');
    expect(formaterDateCourte('2028-07-31')).toBe('31/07/2028');
    expect(formaterJourMois('2026-11-06')).toBe('06/11');
  });
});

describe('formaterEcheance', () => {
  it("dit « sans échéance » quand l'API la laisse vide", () => {
    expect(formaterEcheance('')).toBe('sans échéance');
    expect(formaterEcheance('2028-07-31')).toBe('échéance 31/07/2028');
  });
});

describe('compter', () => {
  it.each([
    [0, '0 client'],
    [1, '1 client'],
    [3, '3 clients'],
  ])('%i → %s', (nb, texte) => {
    expect(compter(nb, 'client')).toBe(texte);
  });
});
