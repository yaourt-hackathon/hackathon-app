import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';

const rangUrgence = ['Urgence haute', 'Urgence moyenne', 'Urgence faible'];

test('la liste montre les marques triées par urgence', async ({ page }) => {
  await page.goto('/');

  const marques = page.getByRole('link', { name: /produits en exposition/ });
  await expect(marques.first()).toBeVisible();

  const urgences = await marques.evaluateAll((liens) =>
    liens.map((lien) => lien.textContent ?? ''),
  );
  const rangs = urgences.map((texte) =>
    rangUrgence.findIndex((u) => texte.includes(u)),
  );
  expect(rangs).not.toContain(-1);
  expect(rangs).toEqual([...rangs].sort((a, b) => a - b));
});

test('une marque ouvre sa fiche avec niveau et substances', async ({
  page,
}) => {
  await page.goto('/');
  const premiere = page
    .getByRole('link', { name: /produits en exposition/ })
    .first();
  const nom = (await premiere.locator('span').first().textContent()) ?? '';
  await premiere.click();

  await expect(page).toHaveURL(/\/marques\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom);

  const produits = page.getByRole('grid', { name: /Produits de/ });
  await expect(
    produits.getByRole('gridcell', { name: 'Exposition probable' }).first(),
  ).toBeVisible();
  // Un produit en exposition probable cite au moins une substance
  const ligne = produits
    .getByRole('row')
    .filter({ hasText: 'Exposition probable' })
    .first();
  await expect(ligne.getByRole('gridcell').nth(1)).not.toHaveText('—');
});

test('une marque inconnue répond 404 « Introuvable »', async ({ page }) => {
  const reponse = await page.goto('/marques/inconnue');
  expect(reponse?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'Introuvable' }),
  ).toBeVisible();
});

test('API data arrêtée : erreur, puis « Réessayer » recharge', async ({
  page,
}) => {
  // Arrêt puis relance de l'API, healthcheck compris : temps triplé
  test.slow();
  const compose = (...args: string[]) =>
    execFileSync('docker', ['compose', ...args], { stdio: 'inherit' });

  compose('stop', 'data-api');
  try {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Données indisponibles' }),
    ).toBeVisible();
  } finally {
    // Relance le même conteneur (mêmes ports) et attend son healthcheck,
    // même si le test échoue
    compose('up', '--detach', '--wait', '--no-recreate', 'data-api');
  }

  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(
    page.getByRole('link', { name: /produits en exposition/ }).first(),
  ).toBeVisible();
});
