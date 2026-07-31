# Forge Deployment & Operations Guide

This guide covers local development setup with Docker Compose.

---

## 1. Environment Configuration

Create `.env` in the root folder and configure the required credentials:

```ini
# Application Configuration
PORT=4000
NODE_ENV=production
WEB_ORIGIN=http://localhost:5173

# Database & Queue Connections
MONGODB_URI=mongodb://localhost:27017/forge
REDIS_URL=redis://localhost:6379

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333

# AI Provider Credentials
GEMINI_API_KEY=your-google-gemini-api-key

# Authentication Secrets
JWT_ACCESS_SECRET=your-secure-access-secret-32-chars

JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
MAX_UPLOAD_BYTES=10485760
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
