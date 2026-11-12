import { expect, test, type Page } from '@playwright/test';
import { sansMotInterdit } from './outils';

const clients = (page: Page) =>
  page.getByRole('region', { name: 'Clients à appeler' });

// EVT-001 a des prospects dans les deux modes : s'ils fuitaient dans la
// liste, les rangs ne seraient plus 1…n (deux rangs 1)
test('le sujet creusé, puis « Valider » montre les appels classés 1…n', async ({
  page,
}) => {
  await page.goto('/evenements/EVT-001');
  for (const section of [
    'Ce qui change',
    "Ce que l'IA a lu",
    "Ce que l'IA a cherché",
    'Chez vos clients',
  ]) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible();
  }
  await expect(page.getByText(/^Compris : /)).toBeVisible();
  await expect(page.getByText(/à relire avant de valider/)).toBeVisible();

  await page
    .getByRole('link', { name: /^Valider et voir les \d+ appels?$/ })
    .click();
  await expect(page).toHaveURL(/\/evenements\/EVT-001\/appels$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /^\d+ clients? à appeler$/,
  );

  const rangs = await clients(page)
    .locator('[data-rang]')
    .evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-rang'))));
  expect(rangs.length).toBeGreaterThan(0);
  expect(rangs).toEqual(rangs.map((_, i) => i + 1));
  await expect(clients(page)).toContainText(/Suivi par KAM-\d{2}/);

  // Clients seulement, jamais de prospect (docs/produit.md)
  await expect(page.locator('body')).not.toContainText(/prospect/i);
  await sansMotInterdit(page);
});

test('recharger garde les appels, Retour ramène au sujet', async ({ page }) => {
  await page.goto('/evenements/EVT-001');
  await page.getByRole('link', { name: /^Valider et voir/ }).click();
  await expect(page.locator('[data-texte="question"]:visible')).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-texte="question"]:visible')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/evenements\/EVT-001$/);
  await expect(
    page.getByRole('link', { name: /^Valider et voir/ }),
  ).toBeVisible();
});
