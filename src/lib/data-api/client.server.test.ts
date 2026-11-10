import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { dataApiClient, donneesOuNull } from '@/lib/data-api/client.server';

const reponse = (status: number) => new Response(null, { status });

describe('donneesOuNull', () => {
  // Les erreurs sont journalisées côté serveur ; inutile de polluer la sortie des tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('renvoie les données', async () => {
    await expect(
      donneesOuNull(Promise.resolve({ data: { id: 'florame' } })),
    ).resolves.toEqual({ id: 'florame' });
  });

  it("renvoie null quand l'API répond 404 avec { detail }", async () => {
    const resultat = {
      error: { detail: 'Marque inconnue : xyz' },
      response: reponse(404),
    };
    await expect(donneesOuNull(Promise.resolve(resultat))).resolves.toBeNull();
  });

  it('lève une erreur quand ngrok hors ligne répond 404 en HTML', async () => {
    const resultat = { error: '<!DOCTYPE html>…', response: reponse(404) };
    await expect(donneesOuNull(Promise.resolve(resultat))).rejects.toThrow(
      'API data en erreur (404) : réponse non JSON, API hors ligne ?',
    );
  });

  it('lève une erreur sur le 404 par défaut de FastAPI (route absente)', async () => {
    const resultat = { error: { detail: 'Not Found' }, response: reponse(404) };
    await expect(donneesOuNull(Promise.resolve(resultat))).rejects.toThrow(
      'API data en erreur (404) : Not Found',
    );
  });

  it('lève une erreur quand une réponse 200 sort du contrat Zod', async () => {
    const resultat = {
      error: new z.ZodError([]),
      response: reponse(200),
    };
    await expect(donneesOuNull(Promise.resolve(resultat))).rejects.toThrow(
      'API data en erreur (200) : réponse hors contrat',
    );
  });

  it('lève une erreur lisible sur un 422 de FastAPI (paramètre refusé)', async () => {
    const resultat = {
      error: { detail: [{ loc: ['query', 'marque'], msg: 'Field required' }] },
      response: reponse(422),
    };
    await expect(donneesOuNull(Promise.resolve(resultat))).rejects.toThrow(
      "API data en erreur (422) : réponse d'erreur inattendue",
    );
  });

  it("lève une erreur réseau quand l'API est injoignable", async () => {
    const resultat = { error: new TypeError('fetch failed') };
    await expect(donneesOuNull(Promise.resolve(resultat))).rejects.toThrow(
      'API data en erreur (réseau) : fetch failed',
    );
  });

  it("relaie le detail d'une erreur 503 de l'API", async () => {
    const resultat = {
      error: { detail: 'Données absentes' },
      response: reponse(503),
    };
    await expect(donneesOuNull(Promise.resolve(resultat))).rejects.toThrow(
      'API data en erreur (503) : Données absentes',
    );
  });
});

describe('dataApiClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuse une DATA_API_URL absente', () => {
    vi.stubEnv('DATA_API_URL', '');
    expect(() => dataApiClient()).toThrow('DATA_API_URL absente ou invalide');
  });

  it('prend son adresse dans DATA_API_URL', () => {
    vi.stubEnv('DATA_API_URL', 'http://data-api:8000');
    expect(dataApiClient().getConfig().baseUrl).toBe('http://data-api:8000');
  });
});
