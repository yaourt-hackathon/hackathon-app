import { sourceDonnees } from '@/features/tournee/donnees/source.server';
import { resumerVeille } from '@/features/tournee/evenements';
import { reformuler } from '@/features/tournee/reformulation/reformulation.server';
import { construireTournee } from '@/features/tournee/tournee';

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
  // Une fiche par client, en parallèle, pour le commercial et les produits.
  // Les prospects n'en ont pas besoin : ils ne quittent pas le serveur.
  const comptes = await Promise.all(
    liste.clients.map((c) => source.compte(c.compte_id)),
  );
  return construireTournee(source.mode, liste, comptes);
}

/**
 * Ce que l'outil a compris de l'événement. `undefined` : événement inconnu ;
 * `null` : aucune reformulation prête.
 */
export async function lireReformulation(evenementId: string) {
  const liste = await sourceDonnees().appels(evenementId);
  if (liste === null) return undefined;
  return reformuler(liste.evenement);
}
