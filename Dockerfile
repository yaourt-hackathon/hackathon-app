# Image de l'app (ADR 0002). Lancée par compose.yaml avec l'API data.

# Build : même image que le job qualite de la CI
FROM node:24-trixie AS build
WORKDIR /app
# Dépendances d'abord : la couche reste en cache tant que le lockfile ne bouge pas.
# --ignore-scripts : pas de hook git (husky) dans l'image ; le client API est
# généré par le prebuild de `npm run build`.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Exécution : .output/ est autonome (Nitro), sans node_modules
FROM node:24-trixie-slim
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
# Fichiers à root : l'utilisateur node peut les lire, pas les modifier
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", ".output/server/index.mjs"]
