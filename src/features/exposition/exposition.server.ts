import { donneesOuNull, dataApiClient } from '@/lib/data-api/client.server';
import {
  expositionExpositionGet,
  marquesMarquesGet,
} from '@/lib/data-api/generated';
import { trierParUrgence } from '@/features/exposition/urgence';

export async function listerMarques() {
  const liste = await donneesOuNull(
    marquesMarquesGet({ client: dataApiClient() }),
  );
  if (liste === null) throw new Error('API data : /marques introuvable');
  return { ...liste, marques: trierParUrgence(liste.marques) };
}

export function lireExposition(marque: string) {
  return donneesOuNull(
    expositionExpositionGet({ client: dataApiClient(), query: { marque } }),
  );
}
