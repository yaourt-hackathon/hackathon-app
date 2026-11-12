import { expect, test } from '@playwright/test';
import { sansMotInterdit } from './outils';

const rangUrgence = ['Urgence haute', 'Urgence moyenne', 'Urgence faible'];

test('la liste montre les marques triées par urgence', async ({ page }) => {
  await page.goto('/marques');

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
  await sansMotInterdit(page);
});

test('une marque ouvre sa fiche avec niveau et substances', async ({
  page,
}) => {
  await page.goto('/marques');
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
  await sansMotInterdit(page);

  await page.getByRole('link', { name: '← Toutes les marques' }).click();
  await expect(page).toHaveURL(/\/marques$/);
});

test('une marque inconnue répond 404 « Introuvable »', async ({ page }) => {
  const reponse = await page.goto('/marques/inconnue');
  expect(reponse?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'Introuvable' }),
  ).toBeVisible();
});
