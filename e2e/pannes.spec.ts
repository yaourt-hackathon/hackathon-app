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
    await page.getByRole('link', { name: 'Lire le sujet' }).click();
    await expect(page).toHaveURL(/\/evenements\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('link', { name: 'Choisir les clients' }).click();
    await page.getByRole('link', { name: "Générer la liste d'appels" }).click();
    await page
      .getByRole('list', { name: 'Clients à appeler' })
      .getByRole('link')
      .first()
      .click();
    await expect(page.locator('[data-texte="question"]:visible')).toBeVisible();

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
  await expect(page.getByRole('link', { name: 'Lire le sujet' })).toBeVisible();
});
