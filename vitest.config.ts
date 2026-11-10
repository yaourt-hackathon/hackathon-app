import { defineConfig } from 'vitest/config';

// Config séparée de vite.config.ts : le plugin nitro() casse la résolution
// des dépendances sous Vitest, et les tests unitaires n'ont pas besoin du build.
export default defineConfig({
  resolve: { tsconfigPaths: true },
});
