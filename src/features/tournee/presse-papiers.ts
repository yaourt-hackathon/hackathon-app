/**
 * Copie le texte. `false` si le navigateur n'offre pas de presse-papiers (page
 * servie en http hors localhost) ou refuse l'écriture : à l'appelant de dire
 * au commercial de copier à la main.
 */
export async function copier(
  texte: string,
  presse: Pick<Clipboard, 'writeText'> | undefined = globalThis.navigator
    ?.clipboard,
): Promise<boolean> {
  if (presse === undefined) return false;
  try {
    await presse.writeText(texte);
    return true;
  } catch {
    return false;
  }
}
