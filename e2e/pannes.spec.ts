import { expect, test } from '@playwright/test';
import { modeDonnees, sansApiData } from './outils';

// Arrêt puis relance de l'API, healthcheck compris : temps triplé
test.slow();

test('démo, API data arrêtée : le parcours tient, /marques le dit', async ({
  page,
  request,
}) => {
  test.skip((await modeDonnees(request)) !== 'demo', 'mode demo seulement');

  await sansApiData(async () => {
    await page.goto('/');
    const lien = page
      .getByRole('list', { name: 'Événements détectés' })
      .getByRole('link')
      .first();
    const titre = (await lien.textContent()) ?? '';
    await lien.click();
    await expect(page).toHaveURL(/\/evenements\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);

    await page.goto('/marques');
    await expect(
      page.getByRole('heading', { name: 'Données indisponibles' }),
    ).toBeVisible();
  });

  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(
    page.getByRole('link', { name: /produits en exposition/ }).first(),
  ).toBeVisible();
});

test('API, API data arrêtée : erreur, puis « Réessayer » recharge', async ({
  page,
  request,
}) => {
  test.skip((await modeDonnees(request)) !== 'api', 'mode api seulement');

  await sansApiData(async () => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Données indisponibles' }),
    ).toBeVisible();
  });

  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(
    page
      .getByRole('list', { name: 'Événements détectés' })
      .getByRole('link')
      .first(),
  ).toBeVisible();
});
