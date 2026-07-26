FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/persistence/package.json packages/persistence/package.json
RUN npm ci --omit=dev
COPY apps/worker apps/worker
COPY packages packages
ENV NODE_ENV=production
CMD ["node", "apps/worker/src/worker.js"]
