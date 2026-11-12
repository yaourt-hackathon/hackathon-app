import type { AppelClient } from '@/features/tournee/tournee';

export interface AppelDansTournee {
  appel: AppelClient;
  precedent: AppelClient | null;
  suivant: AppelClient | null;
  /** Place dans la tournée, à partir de 1. */
  position: number;
  total: number;
}

/**
 * L'appel d'un client et ses voisins dans la tournée. `null` pour un compte
 * absent, et donc pour un prospect, qui n'y figure jamais. L'id se compare
 * sans la casse, comme le fait l'API data.
 */
export function trouverAppel(
  appels: readonly AppelClient[],
  compteId: string,
): AppelDansTournee | null {
  const cle = compteId.toUpperCase();
  const i = appels.findIndex((a) => a.compte_id.toUpperCase() === cle);
  const appel = appels[i];
  if (appel === undefined) return null;
  return {
    appel,
    precedent: appels[i - 1] ?? null,
    suivant: appels[i + 1] ?? null,
    position: i + 1,
    total: appels.length,
  };
}

/** Ce que « Copier » met dans le presse-papiers : le fait, puis la question. */
export function texteACopier(fait: string, question: string): string {
  return `${fait.trim()}\n\n${question.trim()}`;
}
