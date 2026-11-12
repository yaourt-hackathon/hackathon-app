import { createFileRoute } from '@tanstack/react-router';
import { lireMode } from '@/features/tournee/donnees/source.server';

// Sonde de vie pour le healthcheck Docker (#11). `source` dit d'où viennent
// les données (ADR 0008) ; une DATA_SOURCE invalide rend le conteneur malsain.
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () => {
        try {
          return Response.json({ status: 'ok', source: lireMode() });
        } catch (erreur) {
          const detail = erreur instanceof Error ? erreur.message : 'inconnue';
          console.error(detail);
          return Response.json({ status: 'erreur', detail }, { status: 500 });
        }
      },
    },
  },
});
