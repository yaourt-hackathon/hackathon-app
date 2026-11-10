import { createFileRoute } from '@tanstack/react-router';

// Sonde de vie pour le healthcheck Docker (#11)
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () => Response.json({ status: 'ok' }),
    },
  },
});
