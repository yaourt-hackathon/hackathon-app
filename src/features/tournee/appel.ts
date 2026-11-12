import type {
  Argument,
  Reformulation,
} from '@/features/tournee/reformulation/preparees';
import type { AppelClient } from '@/features/tournee/tournee';
import type { ProduitTouche } from '@/lib/data-api/generated';

/**
 * L'appel d'un client dans la tournée. `null` pour un compte absent, et donc
 * pour un prospect, qui n'y figure jamais. L'id se compare sans la casse,
 * comme le fait l'API data.
 */
export function trouverAppel(
  appels: readonly AppelClient[],
  compteId: string,
): AppelClient | null {
  const cle = compteId.toUpperCase();
  return appels.find((a) => a.compte_id.toUpperCase() === cle) ?? null;
}

/** Ce que « Copier » met dans le presse-papiers : le fait, puis la question. */
export function texteACopier(fait: string, question: string): string {
  return `${fait.trim()}\n\n${question.trim()}`;
}

const touches = (a: AppelClient) => a.nb_probable + a.nb_possible;

/**
 * Ce que l'en-tête d'un appel dit en une ligne. « Le plus » se compare aux
 * autres appels de la tournée : le rang suit le score de l'API, qui pèse
 * aussi la part de produits touchés, pas seulement leur nombre.
 */
export function raisonCourte(
  appel: AppelClient,
  appels: readonly AppelClient[],
): string {
  const n = touches(appel);
  if (n === 1) return 'Un seul produit touché';
  const max = Math.max(...appels.map(touches));
  if (n === max && appels.length > 1) return 'Le plus de produits touchés';
  return `${n} produits touchés`;
}

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Les ingrédients en cause chez un client, pour la puce de l'en-tête : les
 * deux premiers visés (ou, à défaut, proches), sans doublon.
 */
export function ingredientsEnCause(produits: readonly ProduitTouche[]): string {
  const vises = produits.flatMap((p) => p.elements_directs);
  const liste = [
    ...new Set(
      vises.length > 0 ? vises : produits.flatMap((p) => p.elements_indices),
    ),
  ];
  return majuscule(liste.slice(0, 2).join(' et '));
}

/** Un morceau de texte, mis en avant ou non. */
export interface Morceau {
  texte: string;
  enAvant: boolean;
}

const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Met en avant chaque terme (sans la casse), en mot entier : « rose » ne
 * s'allume pas dans « roses ». Le plus long d'abord, si deux se recouvrent.
 */
export function surligner(texte: string, termes: readonly string[]): Morceau[] {
  const utiles = termes
    .filter((t) => t.trim() !== '')
    .sort((a, b) => b.length - a.length);
  if (utiles.length === 0) return [{ texte, enAvant: false }];
  const motif = new RegExp(
    `(?<![\\p{L}\\p{N}])(${utiles.map(echapper).join('|')})(?![\\p{L}\\p{N}])`,
    'giu',
  );
  const minuscules = new Set(utiles.map((t) => t.toLowerCase()));
  // split avec un groupe capturant garde les termes trouvés dans le tableau
  return texte
    .split(motif)
    .filter((t) => t !== '')
    .map((t) => ({ texte: t, enAvant: minuscules.has(t.toLowerCase()) }));
}

/**
 * Découpe une liste d'ingrédients (INCI) et met en avant ceux qui répondent à
 * un des motifs de l'événement : un motif est une suite de fragments qui
 * doivent tous y figurer (« citrus oil » : un agrume, mais l'huile seulement).
 */
export function decouperIngredients(
  liste: string,
  motifs: readonly string[],
): Morceau[] {
  const repere = (ingredient: string) =>
    motifs.some((m) =>
      m.split(' ').every((f) => ingredient.toLowerCase().includes(f)),
    );
  return liste
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i !== '')
    .map((texte) => ({ texte, enAvant: repere(texte) }));
}

/** Le fait sans sa dernière phrase « Source : … », et cette source. */
export function separerSource(fait: string): {
  phrase: string;
  source: string | null;
} {
  const i = fait.lastIndexOf('Source :');
  if (i === -1) return { phrase: fait, source: null };
  return {
    phrase: fait.slice(0, i).trim(),
    source: fait
      .slice(i + 'Source :'.length)
      .trim()
      .replace(/\.$/, ''),
  };
}

export interface ArgumentAppel extends Argument {
  /** Liste d'ingrédients de l'étiquette, découpée, quand on l'a. */
  ingredients?: Morceau[];
}

const enListe = (mots: readonly string[]) =>
  mots.length < 2
    ? (mots[0] ?? '')
    : `${mots.slice(0, -1).join(', ')} et ${mots.at(-1)}`;

/**
 * Les arguments à avoir sous la main pour un appel : le premier produit et son
 * étiquette, les autres produits de la gamme, puis ceux de l'événement.
 */
export function argumentsAppel(
  appel: AppelClient,
  reformulation: Pick<Reformulation, 'arguments' | 'motifs'> | null,
): ArgumentAppel[] {
  const liste: ArgumentAppel[] = [];
  const [premier, ...autres] = appel.produits ?? [];
  if (premier) {
    const vises =
      premier.elements_directs.length > 0
        ? premier.elements_directs
        : premier.elements_indices;
    liste.push({
      texte: `« ${premier.nom} » liste ${enListe(vises)}.`,
      repere: 'Étiquette du produit',
      ...(appel.etiquette && {
        ingredients: decouperIngredients(
          appel.etiquette,
          reformulation?.motifs ?? [],
        ),
      }),
    });
  }
  if (autres.length > 0) {
    const noms = autres.slice(0, 3).map((p) => `« ${p.nom} »`);
    const reste = autres.length - noms.length;
    liste.push({
      texte:
        autres.length === 1
          ? `Un autre produit de sa gamme est touché : ${noms[0]}.`
          : `${autres.length} autres produits de sa gamme sont touchés : ${enListe(
              reste > 0
                ? [...noms, `${reste} autre${reste > 1 ? 's' : ''}`]
                : noms,
            )}.`,
      repere: 'Étiquettes de la gamme',
    });
  }
  return [...liste, ...(reformulation?.arguments ?? [])];
}

export type Tri = 'priorite' | 'nom';

/** Les appels par rang (priorité) ou par nom de client. */
export function trierAppels(
  appels: readonly AppelClient[],
  tri: Tri,
): AppelClient[] {
  return [...appels].sort((a, b) =>
    tri === 'nom'
      ? a.nom_compte.localeCompare(b.nom_compte, 'fr')
      : a.rang - b.rang,
  );
}
