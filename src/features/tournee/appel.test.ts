import { describe, expect, it } from 'vitest';
import { texteACopier, trouverAppel } from '@/features/tournee/appel';
import {
  construireTournee,
  type AppelClient,
} from '@/features/tournee/tournee';
import { sourceDemo } from '@/features/tournee/donnees/source-demo.server';

const appel = (compte_id: string, rang: number) =>
  ({ compte_id, rang, nom_compte: compte_id }) as AppelClient;

const tournee = [appel('CPT-001', 1), appel('CPT-002', 2), appel('CPT-003', 3)];

describe('trouverAppel', () => {
  it('donne la place du client et ses voisins', () => {
    const trouve = trouverAppel(tournee, 'CPT-002');
    expect(trouve?.position).toBe(2);
    expect(trouve?.total).toBe(3);
    expect(trouve?.precedent?.compte_id).toBe('CPT-001');
    expect(trouve?.suivant?.compte_id).toBe('CPT-003');
  });

  it("n'a pas de voisin avant le premier ni après le dernier", () => {
    expect(trouverAppel(tournee, 'CPT-001')?.precedent).toBeNull();
    expect(trouverAppel(tournee, 'CPT-003')?.suivant).toBeNull();
  });

  it("retrouve le client sans tenir compte de la casse, comme l'API", () => {
    expect(trouverAppel(tournee, 'cpt-002')?.appel.compte_id).toBe('CPT-002');
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
