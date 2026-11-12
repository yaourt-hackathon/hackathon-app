import { z } from 'zod';
import type { AppelClient } from '@/features/tournee/tournee';

/**
 * ?clients=CPT-001,CPT-003 : les clients choisis pour la liste d'appels.
 * Absent : tous. Une valeur illisible reprend le défaut, pas une erreur.
 */
export const rechercheSelection = z.object({
  clients: z.string().optional().catch(undefined),
});

/**
 * Les appels choisis, dans l'ordre de la tournée. Aucun id reconnu (ou pas de
 * paramètre) : tous, pour ne jamais montrer une liste vide. L'id se compare
 * sans la casse, comme le fait l'API data.
 */
export function appelsChoisis(
  appels: readonly AppelClient[],
  clients: string | undefined,
): AppelClient[] {
  const ids = new Set(
    (clients ?? '')
      .split(',')
      .map((id) => id.trim().toUpperCase())
      .filter((id) => id !== ''),
  );
  const choisis = appels.filter((a) => ids.has(a.compte_id.toUpperCase()));
  return choisis.length > 0 ? choisis : [...appels];
}

/** Le paramètre pour ces ids : absent s'ils couvrent toute la tournée. */
export function parametreClients(
  appels: readonly AppelClient[],
  choisis: readonly string[],
): string | undefined {
  const ids = appels
    .map((a) => a.compte_id)
    .filter((id) => choisis.includes(id));
  return ids.length === appels.length ? undefined : ids.join(',');
}

/** Ajoute l'id s'il manque, le retire s'il y est. */
export function basculer(
  ids: ReadonlySet<string>,
  id: string,
): ReadonlySet<string> {
  const suivants = new Set(ids);
  if (!suivants.delete(id)) suivants.add(id);
  return suivants;
}
