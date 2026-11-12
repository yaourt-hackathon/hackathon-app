import { describe, expect, it } from 'vitest';
import {
  appelsChoisis,
  basculer,
  parametreClients,
} from '@/features/tournee/selection';
import type { AppelClient } from '@/features/tournee/tournee';

const appel = (compte_id: string) => ({ compte_id }) as AppelClient;
const tournee = [appel('CPT-001'), appel('CPT-002'), appel('CPT-003')];
const ids = (appels: AppelClient[]) => appels.map((a) => a.compte_id);

describe('appelsChoisis', () => {
  it("garde l'ordre de la tournée et ignore la casse, comme l'API", () => {
    expect(ids(appelsChoisis(tournee, 'cpt-003,CPT-001'))).toEqual([
      'CPT-001',
      'CPT-003',
    ]);
  });

  it('prend toute la tournée sans paramètre ou sans id reconnu', () => {
    expect(ids(appelsChoisis(tournee, undefined))).toEqual(ids(tournee));
    expect(ids(appelsChoisis(tournee, 'CPT-999,,'))).toEqual(ids(tournee));
  });
});

describe('parametreClients', () => {
  it("écrit les ids choisis dans l'ordre de la tournée", () => {
    expect(parametreClients(tournee, ['CPT-003', 'CPT-001'])).toBe(
      'CPT-001,CPT-003',
    );
  });

  it('se tait quand tous les clients sont choisis', () => {
    expect(
      parametreClients(tournee, ['CPT-002', 'CPT-001', 'CPT-003']),
    ).toBeUndefined();
  });
});

describe('basculer', () => {
  it("ajoute l'id absent, retire l'id présent, sans toucher l'original", () => {
    const vide = new Set<string>();
    const un = basculer(vide, 'CPT-001');
    expect([...un]).toEqual(['CPT-001']);
    expect([...basculer(un, 'CPT-001')]).toEqual([]);
    expect(vide.size).toBe(0);
  });
});
