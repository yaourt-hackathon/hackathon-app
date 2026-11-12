import { sourceDonnees } from '@/features/tournee/donnees/source.server';
import { resumerVeille } from '@/features/tournee/evenements';
import { reformuler } from '@/features/tournee/reformulation/reformulation.server';
import {
  avecEtiquettes,
  construireTournee,
  produitsEnTete,
} from '@/features/tournee/tournee';

/**
 * Les sujets du jour : chaque événement avec ses chiffres, son accroche et les
 * ingrédients cherchés.
 */
export async function listerEvenements() {
  const source = sourceDonnees();
  const liste = await source.evenements();
  // Une liste d'appels par événement, en parallèle : l'API ne compte pas les
  // clients à part des prospects
  const appels = await Promise.all(
    liste.evenements.map((e) => source.appels(e.evenement_id)),
  );
  const veille = resumerVeille(liste, appels);
  const evenements = await Promise.all(
    veille.evenements.map(async (e) => {
      const reformulation = await reformuler(e);
      return {
        ...e,
        accroche: reformulation?.accroche ?? null,
        ingredients: reformulation?.ingredients ?? [],
      };
    }),
  );
  return { mode: source.mode, ...veille, evenements };
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
  const tournee = construireTournee(source.mode, liste, comptes);
  return avecEtiquettes(
    tournee,
    await source.etiquettes(produitsEnTete(tournee)),
  );
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
