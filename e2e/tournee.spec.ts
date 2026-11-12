import { expect, test, type Page } from '@playwright/test';
import { sansMotInterdit } from './outils';

const liste = (page: Page) =>
  page.getByRole('list', { name: 'Clients à appeler' });

// EVT-001 a des prospects dans les deux modes : s'ils fuitaient dans la
// liste, les rangs ne seraient plus 1…n (deux rangs 1)
test('le sujet en onglets, le choix des clients, puis les appels classés 1…n', async ({
  page,
}) => {
  await page.goto('/evenements/EVT-001', { waitUntil: 'networkidle' });
  for (const section of ['Ce qui change', 'Chez vos clients']) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible();
  }
  await expect(page.getByText(/à relire avant de valider/)).toBeVisible();
  await page.getByRole('tab', { name: "Ce que l'IA a lu" }).click();
  for (const section of ["Ce que l'IA a lu", "Ce que l'IA a cherché"]) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible();
  }
  await expect(page.getByText(/^Compris : /)).toBeVisible();

  await page.getByRole('link', { name: 'Choisir les clients' }).click();
  await expect(page).toHaveURL(/\/evenements\/EVT-001\/clients$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /^\d+ clients? concernés?$/,
  );
  await expect(
    page.getByRole('checkbox', { name: 'Tout sélectionner' }),
  ).toBeChecked();

  await page.getByRole('link', { name: "Générer la liste d'appels" }).click();
  await expect(page).toHaveURL(/\/evenements\/EVT-001\/appels$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /^\d+ clients? à appeler$/,
  );
  const rangs = await liste(page)
    .locator('[data-rang]')
    .evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-rang'))));
  expect(rangs.length).toBeGreaterThan(0);
  expect(rangs).toEqual(rangs.map((_, i) => i + 1));

  // Clients seulement, jamais de prospect (docs/produit.md)
  await expect(page.locator('body')).not.toContainText(/prospect/i);
  await sansMotInterdit(page);
});

test('un client décoché quitte la liste, même rechargée, et reste décoché', async ({
  page,
}) => {
  await page.goto('/evenements/EVT-001/clients', { waitUntil: 'networkidle' });
  const groupe = page.getByRole('group', { name: 'Clients à appeler' });
  const total = await groupe.getByRole('checkbox').count();
  // La case est masquée derrière son libellé : on clique le nom, comme à la main
  const nom = (await groupe.locator('label').first().textContent()) ?? '';
  await groupe.locator('label').first().click();
  await expect(groupe.getByRole('checkbox', { name: nom })).not.toBeChecked();
  const restants = total - 1;
  await expect(
    page.getByText(
      `${restants} sélectionné${restants > 1 ? 's' : ''} sur ${total}`,
    ),
  ).toBeVisible();

  await page.getByRole('link', { name: "Générer la liste d'appels" }).click();
  await expect(page).toHaveURL(/\/appels\?clients=/);
  await expect(liste(page).getByRole('listitem')).toHaveCount(restants);
  await expect(liste(page)).not.toContainText(nom);
  await page.reload();
  await expect(liste(page).getByRole('listitem')).toHaveCount(restants);

  await page.getByRole('link', { name: 'Modifier la sélection' }).click();
  await expect(groupe.getByRole('checkbox', { name: nom })).not.toBeChecked();

  // Plus personne : rien à générer (un clic coche tout, le suivant décoche)
  const tous = page.getByRole('checkbox', { name: 'Tout sélectionner' });
  await page.getByText('Tout sélectionner').click();
  await expect(tous).toBeChecked();
  await page.getByText('Tout sélectionner').click();
  await expect(tous).not.toBeChecked();
  await expect(page.getByText('Choisissez au moins un client')).toBeVisible();
  await expect(
    page.getByRole('button', { name: "Générer la liste d'appels" }),
  ).toBeDisabled();
});
