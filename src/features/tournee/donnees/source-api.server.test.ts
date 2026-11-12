import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sourceApi } from '@/features/tournee/donnees/source-api.server';
import {
  appelsEvenementEvenementsEvenementIdAppelsGet,
  compteComptesCompteIdGet,
  evenementsEvenementsGet,
} from '@/lib/data-api/generated';

vi.mock('@/lib/data-api/generated', () => ({
  evenementsEvenementsGet: vi.fn(),
  appelsEvenementEvenementsEvenementIdAppelsGet: vi.fn(),
  compteComptesCompteIdGet: vi.fn(),
}));

// Réponse 404 d'un handler de l'API (ressource inconnue), au format du SDK
const inconnu = (detail: string) =>
  ({
    error: { detail },
    request: new Request('http://data-api:8000'),
    response: new Response(null, { status: 404 }),
  }) as never;

describe('sourceApi', () => {
  beforeEach(() => {
    vi.stubEnv('DATA_API_URL', 'http://data-api:8000');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it("demande les appels de l'événement voulu", async () => {
    const liste = { evenement: { evenement_id: 'EVT-001' } };
    vi.mocked(appelsEvenementEvenementsEvenementIdAppelsGet).mockResolvedValue({
      data: liste,
    } as never);

    await expect(sourceApi.appels('EVT-001')).resolves.toBe(liste);
    expect(
      vi.mocked(appelsEvenementEvenementsEvenementIdAppelsGet).mock
        .calls[0]?.[0]?.path,
    ).toEqual({ evenement_id: 'EVT-001' });
  });

  it('renvoie null pour un événement inconnu (404)', async () => {
    vi.mocked(appelsEvenementEvenementsEvenementIdAppelsGet).mockResolvedValue(
      inconnu('Événement inconnu : XYZ'),
    );
    await expect(sourceApi.appels('XYZ')).resolves.toBeNull();
  });

  it('renvoie null pour un compte inconnu (404)', async () => {
    vi.mocked(compteComptesCompteIdGet).mockResolvedValue(
      inconnu('Compte inconnu : XYZ'),
    );
    await expect(sourceApi.compte('XYZ')).resolves.toBeNull();
    expect(
      vi.mocked(compteComptesCompteIdGet).mock.calls[0]?.[0]?.path,
    ).toEqual({ compte_id: 'XYZ' });
  });

  // La liste des événements n'a pas de « ressource inconnue » : un 404 y est
  // une panne (route absente, mauvaise DATA_API_URL)
  it('lève une erreur si /evenements répond 404', async () => {
    vi.mocked(evenementsEvenementsGet).mockResolvedValue(
      inconnu('Données absentes'),
    );
    await expect(sourceApi.evenements()).rejects.toThrow(
      '/evenements introuvable',
    );
  });
});
