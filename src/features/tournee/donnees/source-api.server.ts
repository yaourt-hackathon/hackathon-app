import { dataApiClient, donneesOuNull } from '@/lib/data-api/client.server';
import {
  appelsEvenementEvenementsEvenementIdAppelsGet,
  compteComptesCompteIdGet,
  evenementsEvenementsGet,
} from '@/lib/data-api/generated';
import type { SourceDonnees } from '@/features/tournee/donnees/source';

export const sourceApi: SourceDonnees = {
  mode: 'api',

  async evenements() {
    const liste = await donneesOuNull(
      evenementsEvenementsGet({ client: dataApiClient() }),
    );
    if (liste === null) throw new Error('API data : /evenements introuvable');
    return liste;
  },

  appels: (evenementId) =>
    donneesOuNull(
      appelsEvenementEvenementsEvenementIdAppelsGet({
        client: dataApiClient(),
        path: { evenement_id: evenementId },
      }),
    ),

  compte: (compteId) =>
    donneesOuNull(
      compteComptesCompteIdGet({
        client: dataApiClient(),
        path: { compte_id: compteId },
      }),
    ),
};
