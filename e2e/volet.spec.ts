import { expect, test } from '@playwright/test';

// La maquette v6 tient dans la hauteur de l'écran : la page ne défile jamais,
// seul le contenu du volet défile (#52)
for (const [largeur, hauteur] of [
  [1280, 720],
  [390, 844],
] as const) {
  test(`aucun écran ne fait défiler la page en ${largeur}×${hauteur}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto('/evenements/EVT-001/appels');
    const fiche =
      (await page
        .getByRole('list', { name: 'Clients à appeler' })
        .getByRole('link')
        .first()
        .getAttribute('href')) ?? '';
    for (const url of [
      '/',
      '/evenements/EVT-001',
      '/evenements/EVT-001/clients',
      '/evenements/EVT-001/appels',
      fiche,
    ]) {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const { page: hauteurPage, ecran } = await page.evaluate(() => ({
        page: document.documentElement.scrollHeight,
        ecran: window.innerHeight,
      }));
      expect(hauteurPage, url).toBeLessThanOrEqual(ecran);
    }
  });
}
