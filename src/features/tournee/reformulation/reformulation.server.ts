import {
  preparees,
  type Reformulation,
} from '@/features/tournee/reformulation/preparees';
import type { Evenement } from '@/lib/data-api/generated';

/**
 * Reformule l'événement en critères sur les produits ; `null` si aucun texte
 * n'est prêt. Asynchrone et côté serveur : demain, l'API data ou un LLM.
 */
export function reformuler(
  evenement: Pick<Evenement, 'evenement_id'>,
): Promise<Reformulation | null> {
  const preparee = preparees[evenement.evenement_id.toUpperCase()];
  return Promise.resolve(
    preparee ? { ...preparee, origine: 'preparee' } : null,
  );
}
