// En UTC : le serveur (conteneur) et le navigateur rendent la même date, donc
// pas d'écart à l'hydratation.
const options = { timeZone: 'UTC' } as const;
const date = new Intl.DateTimeFormat('fr-FR', {
  ...options,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const jour = new Intl.DateTimeFormat('fr-FR', {
  ...options,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const courte = new Intl.DateTimeFormat('fr-FR', {
  ...options,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const jourMois = new Intl.DateTimeFormat('fr-FR', {
  ...options,
  day: '2-digit',
  month: '2-digit',
});

function lire(iso: string): Date | null {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00Z`) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

// Une date illisible reste telle quelle
const avec = (format: Intl.DateTimeFormat) => (iso: string) => {
  const d = lire(iso);
  return d ? format.format(d) : iso;
};

/** « 2028-07-31 » → « 31 juillet 2028 ». */
export const formaterDate = avec(date);

/** « 2028-07-31 » → « 31/07/2028 ». */
export const formaterDateCourte = avec(courte);

/** « 2026-11-06 » → « 06/11 ». */
export const formaterJourMois = avec(jourMois);

/** « 2026-11-12 » → « Jeudi 12 novembre ». */
export function formaterJour(iso: string): string {
  const texte = avec(jour)(iso);
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** L'API laisse `date_echeance` vide quand il n'y a pas d'échéance. */
export function formaterEcheance(iso: string): string {
  return iso ? `échéance ${formaterDateCourte(iso)}` : 'sans échéance';
}

/** « 1 client », « 3 clients » : le nombre et le mot accordé. */
export function compter(nb: number, mot: string): string {
  return `${nb} ${mot}${nb > 1 ? 's' : ''}`;
}
