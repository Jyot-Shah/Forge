# Forge Deployment & Operations Guide

This guide covers local development setup with Docker Compose as well as production deployment strategies.

---

## 1. Environment Configuration

Copy `.env.example` to `.env` in the root folder and configure the required credentials:

```ini
# Application Configuration
PORT=4000
NODE_ENV=production
WEB_ORIGIN=https://your-app.vercel.app

# Database & Queue Connections
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/forge?retryWrites=true&w=majority
REDIS_URL=redis://default:pass@redis-host:6379

# Qdrant Vector Database
QDRANT_URL=https://your-cluster.qdrant.tech:6333
QDRANT_API_KEY=your-qdrant-api-key

# AI Provider Credentials
GEMINI_API_KEY=your-google-gemini-api-key

# Authentication Secrets
JWT_ACCESS_SECRET=your-secure-access-secret-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-32-chars
```

---

## 2. Local Infrastructure (Docker Compose)

Launch local infrastructure services (MongoDB 7, Redis 7, Qdrant Vector DB):

```bash
docker compose up -d
```

### Starting Monorepo Services
Run services in development mode:

```bash
# Terminal 1: Backend REST API
npm run dev:api

# Terminal 2: Background Worker Queue
npm run dev:worker

# Terminal 3: Vite React Web UI
npm run dev:web
```

Access the application at `http://localhost:5173`.

---

## 3. Production Deployment Strategy

### Frontend (Vercel)
1. Import `apps/web` into Vercel.
2. Set Build Command: `npm run build`.
3. Set Output Directory: `dist`.
4. Configure environment variable `VITE_API_URL=https://your-api.onrender.com/api/v1`.

### Backend API & Worker (Render / Docker Containers)
The repository includes a root `render.yaml` manifest specifying dual container deployments:
1. **API Web Service**: Deploys `apps/api` container with `PORT=4000`.
2. **Worker Background Service**: Deploys `apps/worker` container running `node src/worker.js`.

To verify production build locally:
```bash
npm run build --workspace=@forge/web
```
