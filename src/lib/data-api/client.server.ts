import { z } from 'zod';
import { createClient } from '@/lib/data-api/generated/client';
import { zErreur } from '@/lib/data-api/generated/zod.gen';

// Lu à chaque appel, pas au chargement du module : l'URL dépend de
// l'environnement d'exécution (ngrok en dev, service docker ensuite).
export function dataApiClient() {
  return createClient({
    baseUrl: lireUrl(),
    // Sans cet en-tête, ngrok répond par une page HTML d'avertissement
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
}

function lireUrl() {
  const url = z.url().safeParse(process.env.DATA_API_URL);
  if (!url.success) {
    throw new Error(
      'DATA_API_URL absente ou invalide : copie .env.example vers .env',
    );
  }
  return url.data;
}

// Forme des résultats renvoyés par le SDK généré
interface Resultat<T> {
  data?: T;
  error?: unknown;
  response?: Response;
}

/**
 * Données d'un appel au SDK généré, `null` si l'API répond 404 (ressource
 * inconnue). Toute autre erreur (réseau, statut HTTP, schéma Zod) est levée.
 */
export async function donneesOuNull<T>(
  appel: Promise<Resultat<T>>,
): Promise<T | null> {
  const { data, error, response } = await appel;
  if (data !== undefined) return data;
  if (response?.status === 404 && ressourceInconnue(error)) return null;

  const message = `API data en erreur (${response?.status ?? 'réseau'}) : ${decrire(error)}`;
  console.error(message);
  throw new Error(message);
}

// Un 404 ne veut dire « ressource inconnue » que s'il vient d'un handler de
// l'API. ngrok hors ligne répond 404 en HTML ; une route absente (mauvaise
// DATA_API_URL, endpoint renommé) répond le 404 par défaut de FastAPI.
function ressourceInconnue(error: unknown) {
  const erreur = zErreur.safeParse(error);
  return erreur.success && erreur.data.detail !== 'Not Found';
}

function decrire(error: unknown) {
  if (error instanceof z.ZodError) {
    return 'réponse hors contrat, la spec copiée est-elle à jour ? (npm run api:pull)';
  }
  if (error instanceof Error) return error.message;
  const erreur = zErreur.safeParse(error);
  if (erreur.success) return erreur.data.detail;
  // Page HTML (ngrok hors ligne, proxy…) au lieu du JSON de l'API
  if (typeof error === 'string') return 'réponse non JSON, API hors ligne ?';
  return `réponse d'erreur inattendue ${JSON.stringify(error)}`;
}
