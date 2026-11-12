import { expect, test } from '@playwright/test';
import { modeDonnees, sansMotInterdit } from './outils';

test("la veille liste les événements, échéance la plus proche d'abord", async ({
  page,
  request,
}) => {
  const mode = await modeDonnees(request);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Événements détectés' }),
  ).toBeVisible();
  await expect(page.getByText('Veille préparée à la main')).toBeVisible();
  // Le mode affiché est celui que la sonde annonce
  await expect(
    page.getByText(mode === 'demo' ? 'Données de démo' : 'API data', {
      exact: true,
    }),
  ).toBeVisible();

  const cartes = page
    .getByRole('list', { name: 'Événements détectés' })
    .getByRole('listitem');
  await expect(cartes.first()).toBeVisible();
  for (const carte of await cartes.all()) {
    await expect(
      carte.getByText(/^(Fait réel|Événement fictif)$/),
    ).toBeVisible();
    await expect(carte).toContainText(/client(s)? à appeler/);
    await expect(carte).toContainText(/Source : /);
  }

  // Sans échéance (attribut vide) : à la fin
  const echeances = await page
    .locator('[data-echeance]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-echeance')));
  const cles = echeances.map((e) => e || '9999-12-31');
  expect(cles).toEqual([...cles].sort());
  await sansMotInterdit(page);
});

test('une carte ouvre son événement, cliquée hors de son titre', async ({
  page,
}) => {
  await page.goto('/');
  const carte = page
    .getByRole('list', { name: 'Événements détectés' })
    .getByRole('listitem')
    .first();
  const titre = (await carte.getByRole('link').textContent()) ?? '';
  // Le coin bas gauche de la carte, loin du titre : le lien la couvre toute
  const cadre = await carte.boundingBox();
  await carte.click({ position: { x: 12, y: (cadre?.height ?? 0) - 12 } });

  await expect(page).toHaveURL(/\/evenements\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
  await expect(page.getByText(/^Source :/)).toBeVisible();
  await sansMotInterdit(page);

  await page.getByRole('link', { name: '← Événements détectés' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('un événement inconnu répond 404 « Introuvable »', async ({ page }) => {
  const reponse = await page.goto('/evenements/EVT-999');
  expect(reponse?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'Introuvable' }),
  ).toBeVisible();
});
