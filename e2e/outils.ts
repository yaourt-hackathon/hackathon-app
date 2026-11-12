import { execFileSync } from 'node:child_process';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Source des données de l'app testée, lue sur sa sonde (ADR 0008). En CI, elle
 * doit être celle que la matrice a demandée : sinon le job « api » pourrait
 * tourner en démo sans que rien échoue.
 */
export async function modeDonnees(
  request: APIRequestContext,
): Promise<'demo' | 'api'> {
  const reponse = await request.get('/api/health');
  expect(reponse.ok()).toBe(true);
  const { source } = (await reponse.json()) as { source: 'demo' | 'api' };
  if (process.env.DATA_SOURCE) expect(source).toBe(process.env.DATA_SOURCE);
  return source;
}

/** Vocabulaire de docs/produit.md : jamais de verdict juridique. */
export async function sansMotInterdit(page: Page) {
  await expect(page.locator('body')).not.toContainText(
    /non[\s-]?conform|ill[ée]gal|interdit/i,
  );
}

const compose = (...args: string[]) =>
  execFileSync('docker', ['compose', ...args], { stdio: 'inherit' });

/**
 * Arrête l'API data le temps de `pendant`, puis la relance (mêmes ports) et
 * attend son healthcheck, même si `pendant` échoue.
 */
export async function sansApiData(pendant: () => Promise<void>) {
  compose('stop', 'data-api');
  try {
    await pendant();
  } finally {
    compose('up', '--detach', '--wait', '--no-recreate', 'data-api');
  }
}
