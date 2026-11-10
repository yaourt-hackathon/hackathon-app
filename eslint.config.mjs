// @ts-check
import eslint from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // db/data : les fichiers de PostgreSQL, illisibles hors de son conteneur
  // .venv : les paquets Python de l'équipe Data/IA
  // routeTree.gen.ts : généré par TanStack Router
  globalIgnores([
    '**/dist/',
    '.output/',
    '.nitro/',
    '.tanstack/',
    'db/data/',
    '**/.venv/',
    'src/routeTree.gen.ts',
    'src/lib/data-api/generated/',
  ]),
  eslint.configs.recommended,
  // Règles qui lisent les types : promesses oubliées, any implicites…
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      // TanStack Router se pilote en levant notFound() et redirect()
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: ['NotFoundError', 'Redirect'],
            },
          ],
        },
      ],
    },
  },
  reactHooks.configs.flat['recommended-latest'],
  pluginQuery.configs['flat/recommended'],
  pluginRouter.configs['flat/recommended'],
  // Désactive les règles de forme : c'est le travail de Prettier
  prettier,
);
