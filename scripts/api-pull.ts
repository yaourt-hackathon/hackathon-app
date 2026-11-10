// Copie la spec OpenAPI de l'API data dans le dépôt (ADR 0004).
// Lancé par `npm run api:pull`, qui charge .env.
import { writeFile } from 'node:fs/promises';

const base = process.env.DATA_API_URL;
if (!base)
  throw new Error('DATA_API_URL absente : copie .env.example vers .env');

// Concaténation, comme le client généré : garde un éventuel préfixe de chemin
const reponse = await fetch(`${base.replace(/\/$/, '')}/openapi.json`, {
  headers: { 'ngrok-skip-browser-warning': 'true' },
});
if (!reponse.ok) throw new Error(`${base} a répondu ${reponse.status}`);

await writeFile('openapi/data-api.json', JSON.stringify(await reponse.json()));
