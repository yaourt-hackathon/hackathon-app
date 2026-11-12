import { expect, test } from '@playwright/test';
import { modeDonnees, sansMotInterdit } from './outils';

test("les sujets du jour, l'échéance la plus proche d'abord", async ({
  page,
  request,
}) => {
  const mode = await modeDonnees(request);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /^[A-Z][a-zé]+ \d{1,2} [a-zéû]+$/,
  );
  await expect(
    page.getByText(/sujets? repérés? pour vos clients/),
  ).toBeVisible();
  await expect(page.getByText(/^Veille (préparée|de l'API)/)).toBeVisible();
  // Le mode affiché est celui que la sonde annonce
  await expect(
    page.getByText(mode === 'demo' ? 'Données de démo' : 'API data', {
      exact: true,
    }),
  ).toBeVisible();

  const principal = page.getByRole('article');
  await expect(principal).toContainText(/produits? touchés?/);
  await expect(principal).toContainText(/clients? à appeler/);
  await expect(
    principal.getByText(/^(Fait réel|Événement fictif)$/),
  ).toBeVisible();

  // Sans échéance (attribut vide) : à la fin
  const echeances = await page
    .locator('[data-echeance]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-echeance')));
  expect(echeances.length).toBeGreaterThan(1);
  const cles = echeances.map((e) => e || '9999-12-31');
  expect(cles).toEqual([...cles].sort());
  await sansMotInterdit(page);
});

test("le lien vers les marques n'apparaît qu'en mode api", async ({
  page,
  request,
}) => {
  const mode = await modeDonnees(request);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // En démo, /marques (API à jour) contredirait le scénario figé
  await expect(
    page.getByRole('link', { name: /Exposition des marques/ }),
  ).toHaveCount(mode === 'api' ? 1 : 0);
});

test('« Lire le sujet » ouvre le sujet principal', async ({ page }) => {
  await page.goto('/');
  const titre =
    (await page.getByRole('article').getByRole('heading').textContent()) ?? '';
  await page.getByRole('link', { name: 'Lire le sujet' }).click();

  await expect(page).toHaveURL(/\/evenements\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
  await sansMotInterdit(page);

  await page.getByRole('link', { name: 'Accueil' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("un autre sujet s'ouvre, cliqué hors de son titre", async ({ page }) => {
  await page.goto('/');
  const carte = page
    .getByRole('region', { name: /autres? sujets? du jour/ })
    .getByRole('listitem')
    .first();
  const titre = (await carte.getByRole('link').textContent()) ?? '';
  // Le coin bas gauche de la carte, loin du titre : le lien la couvre toute
  const cadre = await carte.boundingBox();
  await carte.click({ position: { x: 12, y: (cadre?.height ?? 0) - 12 } });

  await expect(page).toHaveURL(/\/evenements\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
});

test('un événement inconnu répond 404 « Introuvable »', async ({ page }) => {
  const reponse = await page.goto('/evenements/EVT-999');
  expect(reponse?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'Introuvable' }),
  ).toBeVisible();
});
