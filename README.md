<div align="center">

# FORGE

**An AI-Powered Developer Workspace & Persistent Project Knowledge Engine**

[![Node.js Version](https://img.shields.io/badge/node.js-v20%2B-026e00?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-v18.3-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4.0-06b6d4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/express-v4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-v8.9-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/redis-v7.0-dc382d?style=for-the-badge&logo=redis)](https://redis.io/)
[![Qdrant](https://img.shields.io/badge/qdrant-vector%20db-d13854?style=for-the-badge&logo=database)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/google%20gemini-ai%20sdk-8e75ff?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## Overview

**Forge** is a developer workspace built to continuously ingest, index, and retrieve project-scoped technical documentation, codebase specifications, and contextual memories.

Unlike standard conversational interfaces, Forge builds an evolving technical understanding of each software repository. It combines dense vector retrieval, reciprocal rank fusion (RRF), and persistent memory graph extraction to provide evidence-grounded engineering assistance.

---

## Design System

Forge features a high-density industrial interface designed for software engineering workflows:

- **Obsidian Dark Mode**: High-contrast theme (`#09090B` canvas, `#121214` level-1 panels, `#27272A` hairline borders).
- **Typography**: **Geist** for technical headlines and body copy; **JetBrains Mono** for code snippets, metadata tags, and telemetry logs.
- **Tonal Layering**: Clean hairline borders and solid panels for structured visual separation without artificial glows.
- **Responsive Layouts**: Fluid 12-column desktop grid with collapsible navigation drawer on mobile.

---

## Core System Architecture

### 1. Document Ingestion Pipeline
- Supports `.md`, `.txt`, `.json`, `.py`, `.js`, `.ts` source files.
- Asynchronous BullMQ background worker queue running on Redis.
- Lifecycle state transitions (`pending` ➔ `processing` ➔ `ready` / `failed`).

### 2. Persistent Memory Graph Engine
- Factual extraction from document ingestion and developer chat interactions.
- Entity confidence scoring, classification tags, and timeline tracking.
- Memory management interface to inspect or prune outdated project knowledge blocks.

### 3. Reciprocal Rank Fusion (RRF) Hybrid Search
- Merges **MongoDB Lexical Search** and **Qdrant Vector Cosine Retrieval**.
- Calculates unified rank fusion scores ($k=60$) for technical context matching.

### 4. Grounded RAG Chat Engine
- RAG pipeline powered by **Google Gemini API** (`@google/genai`).
- Markdown rendering, code snippet highlighting, and cited source document excerpts.
- Thread management and conversation session tracking.

---

## Repository Structure

```text
Forge Monorepo
├── apps/
│   ├── api/          # Express REST API (Auth, Projects, Documents, RAG & Search)
│   ├── web/          # React 18 + Vite 6 + Tailwind CSS v4 Workspace UI
│   └── worker/       # BullMQ Background Job Processor (Text Parsing & Vector Indexing)
├── packages/
│   ├── persistence/  # Shared Mongoose schemas & database connection routines
│   └── shared/       # Shared contracts, Zod schemas, and system constants
├── docs/             # Technical reference documentation
└── docker-compose.yml# Development infrastructure (MongoDB 7, Redis 7, Qdrant)
```

---

## Technology Stack

### Frontend (`apps/web`)
- React 18.3, Vite 6.0, Tailwind CSS v4.0 (`@tailwindcss/vite`), `@tailwindcss/typography`
- TanStack React Query v5.62, Axios v1.7, React Router v7.1, React Markdown v10.1

### Backend API & Worker (`apps/api` & `apps/worker`)
- Node.js v20+, Express v4.21
- BullMQ v5.34, ioredis v5.4
- MongoDB v7.0 (Mongoose v8.9), Qdrant Vector DB (`@qdrant/js-client-rest` v1.13)
- Google Gemini API (`@google/genai` v1.0)
- JWT (`jsonwebtoken` v9.0), BcryptJS v2.4, Zod v3.24, Helmet v8.0, Multer v2.0

---

## Local Development Setup

### Prerequisites
- Node.js v20.11.0 or newer
- npm v10.0.0 or newer
- Docker Desktop

### 1. Environment Setup
Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configure local credentials in `.env`:
```ini
PORT=4000
NODE_ENV=development
WEB_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/forge
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333

GEMINI_API_KEY=your_google_gemini_api_key

JWT_ACCESS_SECRET=your_secure_access_secret_32_chars
JWT_REFRESH_SECRET=your_secure_refresh_secret_32_chars
```

### 2. Infrastructure Containers
Start MongoDB 7, Redis 7, and Qdrant Vector DB via Docker Compose:

```bash
docker compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Monorepo Services
Run development services in separate terminals:

```bash
# Terminal 1: Backend REST API (Port 4000)
npm run dev:api

# Terminal 2: Ingestion Worker Queue
npm run dev:worker

# Terminal 3: React Workspace Web UI (Port 5173)
npm run dev:web
```

Access the application at `http://localhost:5173`.

---

## REST API Overview

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register account and session |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user and issue tokens |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Rotate session and refresh access JWT |
| **Projects** | `GET` | `/api/v1/projects` | List workspace projects |
| **Projects** | `POST` | `/api/v1/projects` | Create project workspace |
| **Projects** | `GET` | `/api/v1/projects/:id/stats` | Fetch storage and indexing metrics |
| **Documents**| `POST` | `/api/v1/projects/:id/documents` | Upload file for background indexing |
| **Documents**| `GET` | `/api/v1/projects/:id/documents` | List indexed files and statuses |
| **Search** | `POST` | `/api/v1/projects/:id/search` | Run reciprocal rank fusion hybrid search |
| **Chat** | `POST` | `/api/v1/projects/:id/chat` | Query RAG pipeline and return cited response |
| **Memory** | `GET` | `/api/v1/projects/:id/memories` | List active project memory entries |

---

## Documentation

Detailed technical reference guides are available in the [`docs/`](./docs) directory:

- [Architecture Overview](./docs/architecture.md): Service topology, security boundaries, and queue routines.
- [API Reference](./docs/api-reference.md): Endpoint specifications, headers, and response formats.
- [Deployment Guide](./docs/deployment.md): Instructions for local setup, Render (`render.yaml`), and Vercel.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## Author

- [Jyot Shah](https://www.linkedin.com/in/jyotshah1/)

For questions or issues, please open an issue on GitHub or email **jyotshah1595@gmail.com**.
