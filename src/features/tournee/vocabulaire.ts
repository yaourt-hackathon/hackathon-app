// Règles de docs/produit.md : « exposition probable », jamais de verdict
// juridique ; un fait, puis une question.

const MOTS_INTERDITS: { mot: string; motif: RegExp }[] = [
  { mot: 'non conforme', motif: /non[\s\u2011-]?conform/i },
  { mot: 'illégal', motif: /ill[ée]gal/i },
  { mot: 'interdit', motif: /interdit/i },
];

/** Mots à ne jamais écrire, trouvés dans le texte (variantes comprises). */
export function motsInterdits(texte: string): string[] {
  return MOTS_INTERDITS.filter(({ motif }) => motif.test(texte)).map(
    ({ mot }) => mot,
  );
}

/** Un fait cite sa source et ne pose pas de question. */
export function estUnFait(texte: string): boolean {
  return /Source\s?:\s\S/.test(texte) && !texte.includes('?');
}

/** Une question finit par « ? ». */
export function estUneQuestion(texte: string): boolean {
  return texte.trimEnd().endsWith('?');
}
