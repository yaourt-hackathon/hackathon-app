import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  lireMode,
  sourceDonnees,
} from '@/features/tournee/donnees/source.server';

describe('lireMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    [undefined, 'demo'],
    ['', 'demo'],
    ['demo', 'demo'],
    ['api', 'api'],
  ])('DATA_SOURCE=%s → %s', (valeur, mode) => {
    vi.stubEnv('DATA_SOURCE', valeur);
    expect(lireMode()).toBe(mode);
    expect(sourceDonnees().mode).toBe(mode);
  });

  // Pas de repli silencieux : une faute de frappe ne doit pas montrer le
  // scénario fictif à la place de l'API
  it.each(['API', 'prod', 'demo '])('refuse DATA_SOURCE=%s', (valeur) => {
    vi.stubEnv('DATA_SOURCE', valeur);
    expect(() => lireMode()).toThrow('DATA_SOURCE invalide');
  });

  it('relit la variable à chaque appel', () => {
    vi.stubEnv('DATA_SOURCE', 'api');
    expect(lireMode()).toBe('api');
    vi.stubEnv('DATA_SOURCE', 'demo');
    expect(lireMode()).toBe('demo');
  });
});
