import { z } from 'zod';
import type {
  ModeDonnees,
  SourceDonnees,
} from '@/features/tournee/donnees/source';
import { sourceApi } from '@/features/tournee/donnees/source-api.server';
import { sourceDemo } from '@/features/tournee/donnees/source-demo.server';

const zMode = z.enum(['demo', 'api']) satisfies z.ZodType<ModeDonnees>;

/**
 * Lu à chaque appel, comme DATA_API_URL. Absente : `demo`. Toute autre valeur
 * que `demo` ou `api` lève une erreur, jamais de repli silencieux (ADR 0008).
 */
export function lireMode(): ModeDonnees {
  const brut = process.env.DATA_SOURCE;
  if (brut === undefined || brut === '') return 'demo';
  const mode = zMode.safeParse(brut);
  if (!mode.success) {
    throw new Error(`DATA_SOURCE invalide (« ${brut} ») : demo ou api`);
  }
  return mode.data;
}

export function sourceDonnees(): SourceDonnees {
  return lireMode() === 'api' ? sourceApi : sourceDemo;
}
