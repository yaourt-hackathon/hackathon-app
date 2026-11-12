import { expect, test, type Page } from '@playwright/test';
import { sansMotInterdit } from './outils';

/** Ouvre le premier événement de la veille, depuis l'accueil. */
async function ouvrirEvenement(page: Page) {
  await page.goto('/');
  await page
    .getByRole('list', { name: 'Événements détectés' })
    .getByRole('link')
    .first()
    .click();
  await expect(page).toHaveURL(/\/evenements\/[^/?]+$/);
}

const clients = (page: Page) =>
  page.getByRole('region', { name: 'Clients à appeler' });

// EVT-001 a des prospects dans les deux modes : s'ils fuitaient dans la
// liste, les rangs ne seraient plus 1…n (deux rangs 1)
test('valider la reformulation montre les clients, classés 1…n', async ({
  page,
}) => {
  await page.goto('/evenements/EVT-001');
  await expect(
    page.getByRole('heading', { name: /^Compris : / }),
  ).toBeVisible();
  await expect(clients(page)).toHaveCount(0);

  await page.getByRole('link', { name: 'Valider' }).click();
  await expect(page).toHaveURL(/\?valide=true$/);
  await expect(clients(page)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Clients à appeler' }),
  ).toBeFocused();
  await expect(page.getByText('Validé', { exact: true })).toBeVisible();

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

test('recharger garde la tournée, Retour la masque', async ({ page }) => {
  await ouvrirEvenement(page);
  await page.getByRole('link', { name: 'Valider' }).click();
  await expect(clients(page)).toBeVisible();

  await page.reload();
  await expect(clients(page)).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/evenements\/[^/?]+$/);
  await expect(clients(page)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Valider' })).toBeVisible();
});
