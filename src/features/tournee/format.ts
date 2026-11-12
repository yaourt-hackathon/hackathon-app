// En UTC : le serveur (conteneur) et le navigateur rendent la même date, donc
// pas d'écart à l'hydratation.
const date = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** « 2028-07-31 » → « 31 juillet 2028 ». Une date illisible reste telle quelle. */
export function formaterDate(iso: string): string {
  const jour = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(`${iso}T00:00Z`)
    : null;
  return jour && !Number.isNaN(jour.getTime()) ? date.format(jour) : iso;
}

/** L'API laisse `date_echeance` vide quand il n'y a pas d'échéance. */
export function formaterEcheance(iso: string): string {
  return iso ? `Échéance le ${formaterDate(iso)}` : 'Sans échéance';
}

/** « 1 client à appeler », « 3 clients à appeler ». */
export function formaterNbClients(nb: number): string {
  if (nb === 0) return 'Aucun client à appeler';
  return `${nb} client${nb > 1 ? 's' : ''} à appeler`;
}
