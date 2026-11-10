import { defineConfig } from '@hey-api/openapi-ts';

// Client de l'API data, généré depuis la spec copiée (ADR 0004)
export default defineConfig({
  input: './openapi/data-api.json',
  output: './src/lib/data-api/generated',
  plugins: [
    '@hey-api/client-fetch',
    'zod',
    // Chaque réponse est validée par son schéma Zod avant d'être renvoyée
    { name: '@hey-api/sdk', validator: { request: false, response: true } },
  ],
});
