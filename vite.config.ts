import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3000 },
  // Alias @/ défini une seule fois, dans tsconfig.json
  resolve: { tsconfigPaths: true },
  plugins: [
    // Retiré du build de production
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    // Sortie Node autonome dans .output/ (servie par `npm start`)
    nitro(),
  ],
});
