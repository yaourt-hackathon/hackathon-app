import { describe, expect, it } from 'vitest';
import {
  formaterDate,
  formaterEcheance,
  formaterNbClients,
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

describe('formaterEcheance', () => {
  it("dit « Sans échéance » quand l'API la laisse vide", () => {
    expect(formaterEcheance('')).toBe('Sans échéance');
    expect(formaterEcheance('2027-06-30')).toBe('Échéance le 30 juin 2027');
  });
});

describe('formaterNbClients', () => {
  it.each([
    [0, 'Aucun client à appeler'],
    [1, '1 client à appeler'],
    [3, '3 clients à appeler'],
  ])('%i → %s', (nb, texte) => {
    expect(formaterNbClients(nb)).toBe(texte);
  });
});
