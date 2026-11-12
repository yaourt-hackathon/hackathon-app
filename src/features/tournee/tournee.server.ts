import { sourceDonnees } from '@/features/tournee/donnees/source.server';
import { resumerVeille } from '@/features/tournee/evenements';

/** Les événements de la veille, chacun avec son nombre de clients à appeler. */
export async function listerEvenements() {
  const source = sourceDonnees();
  const liste = await source.evenements();
  // Une liste d'appels par événement, en parallèle : l'API ne compte pas les
  // clients à part des prospects
  const appels = await Promise.all(
    liste.evenements.map((e) => source.appels(e.evenement_id)),
  );
  return { mode: source.mode, ...resumerVeille(liste, appels) };
}

/** L'événement et sa tournée d'appels ; `null` si l'événement est inconnu. */
export async function lireTournee(evenementId: string) {
  const source = sourceDonnees();
  const liste = await source.appels(evenementId);
  if (liste === null) return null;
  return {
    mode: source.mode,
    date_maj: liste.date_maj,
    crm_fictif: liste.crm_fictif,
    evenement: liste.evenement,
  };
}
