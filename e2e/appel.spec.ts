import { expect, test, type Page } from '@playwright/test';
import { modeDonnees, sansMotInterdit } from './outils';

// Copier lit et écrit le presse-papiers du navigateur
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

/** Accueil → premier événement → Valider → premier client de la tournée. */
async function ouvrirPremierAppel(page: Page) {
  await page.goto('/');
  await page
    .getByRole('list', { name: 'Événements détectés' })
    .getByRole('link')
    .first()
    .click();
  await page.getByRole('link', { name: 'Valider' }).click();
  const client = page
    .getByRole('region', { name: 'Clients à appeler' })
    .getByRole('link')
    .first();
  const nom = (await client.textContent()) ?? '';
  await client.click();
  await expect(page).toHaveURL(/\/evenements\/[^/]+\/appels\/[^/]+$/);
  return nom;
}

const texte = (page: Page, quoi: 'fait' | 'question') =>
  page.locator(`[data-texte="${quoi}"]`);

test("la raison d'appeler : le client, le fait, la question, ses produits", async ({
  page,
}) => {
  const nom = await ouvrirPremierAppel(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom);
  await expect(texte(page, 'fait')).toContainText('Source :');
  await expect(texte(page, 'question')).toHaveText(/\?$/);
  await expect(
    page
      .getByRole('grid', { name: /Produits de/ })
      .getByRole('gridcell', { name: /^Exposition (probable|possible)$/ })
      .first(),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/prospect/i);
  await sansMotInterdit(page);

  // Le fil d'Ariane ramène à la tournée validée
  await page
    .getByRole('navigation', { name: "Fil d'Ariane" })
    .getByRole('link')
    .nth(1)
    .click();
  await expect(page).toHaveURL(/\?valide=true$/);
});

test('Copier met le fait et la question dans le presse-papiers', async ({
  page,
}) => {
  await ouvrirPremierAppel(page);
  const fait = (await texte(page, 'fait').textContent()) ?? '';
  const question = (await texte(page, 'question').textContent()) ?? '';

  await page.getByRole('button', { name: 'Copier' }).click();
  await expect(page.getByText("Raison d'appeler copiée")).toBeVisible();
  const copie = await page.evaluate(() => navigator.clipboard.readText());
  expect(copie).toBe(`${fait}\n\n${question}`);
});

test('Modifier ne vaut que pour cet appel : recharger restaure le texte', async ({
  page,
}) => {
  await ouvrirPremierAppel(page);
  const question = (await texte(page, 'question').textContent()) ?? '';

  await page.getByRole('button', { name: 'Modifier' }).click();
  await expect(page.getByRole('textbox', { name: 'Le fait' })).toBeFocused();
  await page
    .getByRole('textbox', { name: 'La question' })
    .fill('Pouvons-nous en parler jeudi ?');
  await page.getByRole('button', { name: 'Terminer' }).click();
  await expect(texte(page, 'question')).toHaveText(
    'Pouvons-nous en parler jeudi ?',
  );
  await expect(
    page.getByText("Modifié pour cet appel, rien n'est enregistré."),
  ).toBeVisible();
  // Copier prend le texte modifié, pas celui d'origine
  await page.getByRole('button', { name: 'Copier' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
    /\n\nPouvons-nous en parler jeudi \?$/,
  );

  // Rétablir rend le texte d'origine et garde le focus dans la carte
  await page.getByRole('button', { name: 'Rétablir le texte' }).click();
  await expect(texte(page, 'question')).toHaveText(question);
  await expect(page.getByRole('button', { name: 'Modifier' })).toBeFocused();

  await page.getByRole('button', { name: 'Modifier' }).click();
  await page
    .getByRole('textbox', { name: 'La question' })
    .fill('Pouvons-nous en parler jeudi ?');
  await page.getByRole('button', { name: 'Terminer' }).click();

  await page.reload();
  await expect(texte(page, 'question')).toHaveText(question);
});

test('client suivant, puis précédent', async ({ page }) => {
  const premier = await ouvrirPremierAppel(page);
  const fait = (await texte(page, 'fait').textContent()) ?? '';

  await page.getByRole('link', { name: /^Client suivant/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(premier);
  // Le focus suit le client : le titre, pas le haut du document
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  // Les textes suivent le client, pas seulement le titre
  await expect(texte(page, 'fait')).not.toHaveText(fait);
  await expect(page.getByText(/^Client 2 sur \d+$/)).toBeVisible();

  await page.getByRole('link', { name: /^← Client précédent/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(premier);
});

test('un client inconnu ou un prospect répond 404 « Introuvable »', async ({
  page,
  request,
}) => {
  // Prospect d'EVT-001 : So'Bio étic en démo, Cattier dans l'API data
  const prospect =
    (await modeDonnees(request)) === 'demo' ? 'CPT-004' : 'CPT-002';
  for (const compte of ['CPT-999', prospect]) {
    const reponse = await page.goto(`/evenements/EVT-001/appels/${compte}`);
    expect(reponse?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Introuvable' }),
    ).toBeVisible();
  }
});
