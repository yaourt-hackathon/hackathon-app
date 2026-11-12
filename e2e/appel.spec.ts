import { expect, test, type Page } from '@playwright/test';
import { modeDonnees, sansMotInterdit } from './outils';

// Copier lit et écrit le presse-papiers du navigateur
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const texte = (page: Page, quoi: 'fait' | 'question') =>
  page.locator(`[data-texte="${quoi}"]:visible`);

/** La fiche du premier appel d'EVT-001 (des prospects dans les deux modes). */
async function ouvrirFiche(page: Page) {
  // networkidle : les boutons ne répondent qu'une fois la page hydratée
  await page.goto('/evenements/EVT-001/appels', { waitUntil: 'networkidle' });
  await page
    .getByRole('list', { name: 'Clients à appeler' })
    .getByRole('link')
    .first()
    .click();
  await expect(page).toHaveURL(/\/appels\/[^/?]+$/);
  await expect(texte(page, 'question')).toBeVisible();
}

test('la fiche : la phrase, sa source, la question, puis les onglets', async ({
  page,
}) => {
  await ouvrirFiche(page);
  await expect(page.getByText(/^Appel 1 sur \d+$/)).toBeVisible();
  await expect(texte(page, 'fait')).toContainText('Source :');
  await expect(texte(page, 'question')).toHaveText(/\?$/);
  const args = page.getByRole('tabpanel', { name: /^Arguments · \d+$/ });
  await expect(args.getByText('Étiquette du produit')).toBeVisible();
  await expect(args).toContainText(/Règlement \(UE\) 2023\/1545/);
  // Les onglets inactifs ne sont pas dans la page : chacun est relu
  await sansMotInterdit(page);

  await page.getByRole('tab', { name: 'Pour relancer' }).click();
  await expect(
    page.getByRole('tabpanel', { name: 'Pour relancer' }).getByRole('listitem'),
  ).not.toHaveCount(0);
  await sansMotInterdit(page);
  await page.getByRole('tab', { name: 'Pourquoi ce client ?' }).click();
  await expect(
    page.getByRole('tabpanel', { name: 'Pourquoi ce client ?' }),
  ).toContainText(/Suivi par KAM-\d{2}/);
  await sansMotInterdit(page);
});

test('Copier la phrase met le fait et la question dans le presse-papiers', async ({
  page,
}) => {
  await ouvrirFiche(page);
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
  await ouvrirFiche(page);
  const question = (await texte(page, 'question').textContent()) ?? '';

  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
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
  await expect(
    page.getByRole('button', { name: 'Modifier', exact: true }),
  ).toBeFocused();

  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'La question' })
    .fill('Pouvons-nous en parler jeudi ?');
  await page.getByRole('button', { name: 'Terminer' }).click();
  await page.reload();
  await expect(texte(page, 'question')).toHaveText(question);
});

test("« Marquer comme appelé » compte l'appel dans la liste", async ({
  page,
}) => {
  await ouvrirFiche(page);
  const marquer = page.getByRole('button', { name: 'Marquer comme appelé' });
  await expect(marquer).toHaveAttribute('aria-pressed', 'false');
  await marquer.click();
  await expect(marquer).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('link', { name: 'Liste' }).click();
  await expect(page.getByText(/^1 appel passé sur \d+$/)).toBeVisible();
  await expect(page.getByText('Appelé', { exact: true })).toBeVisible();

  // Un clic de trop se rattrape : l'appel n'est plus compté
  await page
    .getByRole('list', { name: 'Clients à appeler' })
    .getByRole('link')
    .first()
    .click();
  await marquer.click();
  await expect(marquer).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('link', { name: 'Liste' }).click();
  await expect(page.getByText(/^0 appel passé sur \d+$/)).toBeVisible();
});

test('« Client suivant » suit la sélection, repart du haut et du premier onglet', async ({
  page,
}) => {
  // Écran bas : le contenu de la fiche défile, le retour en haut se voit
  await page.setViewportSize({ width: 1280, height: 560 });
  // Une sélection sans le premier client : la fiche suit la liste générée
  await page.goto('/evenements/EVT-001/clients', { waitUntil: 'networkidle' });
  await page
    .getByRole('group', { name: 'Clients à appeler' })
    .locator('label')
    .first()
    .click();
  await page.getByRole('link', { name: "Générer la liste d'appels" }).click();
  await expect(page).toHaveURL(/\/appels\?clients=/);
  const liens = page
    .getByRole('list', { name: 'Clients à appeler' })
    .getByRole('link');
  // L'URL change avant le rendu de la liste : on attend ses liens
  await expect(liens.first()).toBeVisible();
  const nb = await liens.count();
  await liens.first().click();
  await expect(page.getByText(`Appel 1 sur ${nb}`)).toBeVisible();

  const fait = (await texte(page, 'fait').textContent()) ?? '';
  await page.getByRole('tab', { name: 'Pourquoi ce client ?' }).click();
  const contenu = page.locator('main > div.overflow-y-auto');
  await contenu.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  expect(await contenu.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Client suivant' }).click();

  await expect(page.getByText(`Appel 2 sur ${nb}`)).toBeVisible();
  await expect(page).toHaveURL(/\?clients=/);
  await expect(texte(page, 'fait')).not.toHaveText(fait);
  await expect(page.getByRole('tab', { name: /^Arguments/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(await contenu.evaluate((el) => el.scrollTop)).toBe(0);

  // Le dernier client ramène à la liste
  for (let i = 2; i < nb; i++) {
    await page.getByRole('link', { name: 'Client suivant' }).click();
  }
  await expect(page.getByText(`Appel ${nb} sur ${nb}`)).toBeVisible();
  await page.getByRole('link', { name: 'Retour à la liste' }).click();
  await expect(page).toHaveURL(/\/appels\?clients=/);
});

test("l'adresse d'un appel ouvre sa fiche, sans tenir compte de la casse", async ({
  page,
}) => {
  const reponse = await page.goto('/evenements/EVT-001/appels/cpt-003');
  expect(reponse?.status()).toBe(200);
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
