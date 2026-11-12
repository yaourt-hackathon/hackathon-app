import { expect, test, type Page } from '@playwright/test';
import { modeDonnees, sansMotInterdit } from './outils';

// Copier lit et écrit le presse-papiers du navigateur
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const texte = (page: Page, quoi: 'fait' | 'question') =>
  page.locator(`[data-texte="${quoi}"]:visible`);

/** Les appels d'EVT-001 (des prospects dans les deux modes), premier ouvert. */
async function ouvrirAppels(page: Page) {
  // networkidle : les boutons ne répondent qu'une fois la page hydratée
  await page.goto('/evenements/EVT-001/appels', { waitUntil: 'networkidle' });
  await expect(texte(page, 'question')).toBeVisible();
}

test("l'appel ouvert : la phrase, sa source, la question, les arguments", async ({
  page,
}) => {
  await ouvrirAppels(page);
  await expect(texte(page, 'fait')).toContainText('Source :');
  await expect(texte(page, 'question')).toHaveText(/\?$/);
  const args = page.getByRole('region', {
    name: 'Arguments à avoir sous la main',
  });
  await expect(args.getByText('Étiquette du produit')).toBeVisible();
  await expect(args).toContainText(/Règlement \(UE\) 2023\/1545/);
  await expect(page.getByText('Pour relancer')).toBeVisible();
  await sansMotInterdit(page);
});

test('Copier la phrase met le fait et la question dans le presse-papiers', async ({
  page,
}) => {
  await ouvrirAppels(page);
  const question = (await texte(page, 'question').textContent()) ?? '';

  await page.getByRole('button', { name: 'Copier la phrase' }).click();
  await expect(page.getByText('Phrase copiée')).toBeVisible();
  const copie = await page.evaluate(() => navigator.clipboard.readText());
  expect(copie).toContain('Source :');
  expect(copie.endsWith(`\n\n${question}`)).toBe(true);
});

test('Modifier ne vaut que pour cet appel : recharger restaure le texte', async ({
  page,
}) => {
  await ouvrirAppels(page);
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
  await page.getByRole('button', { name: 'Copier la phrase' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
    /\n\nPouvons-nous en parler jeudi \?$/,
  );

  // Rétablir rend le texte d'origine et garde le focus dans l'appel
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

test("« Marquer comme appelé » compte l'appel et ouvre le suivant", async ({
  page,
}) => {
  await ouvrirAppels(page);
  const fait = (await texte(page, 'fait').textContent()) ?? '';
  await expect(page.getByText(/^0 appel passé sur \d+$/)).toBeVisible();

  await page.getByRole('button', { name: 'Marquer comme appelé' }).click();
  await expect(page.getByText(/^1 appel passé sur \d+$/)).toBeVisible();
  await expect(page.getByText('Appelé', { exact: true })).toBeVisible();
  // Le suivant est ouvert, avec ses propres textes, et a le focus
  await expect(page).toHaveURL(/\?client=/);
  await expect(texte(page, 'fait')).not.toHaveText(fait);
  await expect(
    page.getByRole('button', { expanded: true }).first(),
  ).toBeFocused();
});

test('ouvrir un autre client, et trier par nom', async ({ page }) => {
  await ouvrirAppels(page);
  const fait = (await texte(page, 'fait').textContent()) ?? '';
  const declencheurs = page
    .getByRole('region', { name: 'Clients à appeler' })
    .getByRole('button', { expanded: false });
  await declencheurs.first().click();
  await expect(page).toHaveURL(/\?client=/);
  await expect(texte(page, 'fait')).not.toHaveText(fait);

  await page.getByRole('button', { name: /^Trier : / }).click();
  await page.getByRole('menuitemradio', { name: 'Nom du client' }).click();
  await expect(page).toHaveURL(/tri=nom/);
  await expect(page.getByText('Classés par nom')).toBeVisible();
  const noms = await page.locator('[data-nom]').allTextContents();
  expect(noms).toEqual([...noms].sort((a, b) => a.localeCompare(b, 'fr')));
});

test("l'ancienne adresse d'un appel ouvre ce client", async ({ page }) => {
  await page.goto('/evenements/EVT-001/appels/cpt-003');
  await expect(page).toHaveURL(/\/appels\?client=CPT-003$/);
  await expect(texte(page, 'question')).toBeVisible();
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
