<div align="center">

# ⚡ FORGE

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

## 💡 What is Forge?

**Forge** is an enterprise-grade AI developer workspace designed for software engineering teams, researchers, and technical founders. Unlike generic chatbots or basic PDF-RAG wrappers, Forge continuously builds structured, persistent knowledge about software projects across documents, conversations, architectural decisions, and extracted entity memories.

Every piece of context in Forge is strictly scoped to a **Project Workspace**. Over time, Forge develops a durable understanding of your codebase, technical specifications, and system design—allowing developers to query, inspect, and interact with an intelligent long-term engineering companion.

---

## 🎨 Modern-Industrial Minimalist Interface

Forge features a high-density **Modern-Industrial Minimalist UI** designed for developer ergonomics:

- **Obsidian Dark Mode**: High-contrast, low-eyestrain dark palette (`#09090B` canvas, `#121214` level-1 panels, `#27272A` hairline borders).
- **Precision Typography**: **Geist** font family for technical headlines and body copy; **JetBrains Mono** for code snippets, monospaced metadata pills, keyboard shortcuts, and telemetry logs.
- **Tonal Layering & Hairlines**: Hairline borders replace heavy blur gradients or floating shadows for crisp, professional visual separation.
- **High-Density Responsive Layouts**: Fluid 12-column grids on desktop with collapsible slide-over navigation drawers on mobile devices.

---

## 🚀 Key Features & Architectural Capabilities

### 📁 1. Project-Scoped Knowledge Ingestion
- Multi-format source file support (`.md`, `.txt`, `.json`, `.py`, `.js`, `.ts`).
- Asynchronous background ingestion pipeline managed by **BullMQ** & **Redis**.
- Real-time status lifecycle tracking (`pending` ➔ `processing` ➔ `ready` / `failed`).

### 🧠 2. Persistent Context & Memory Engine
- Factual extraction from document processing and developer chat interactions.
- Entity confidence scoring, category tags, and historical timeline tracking.
- Interactive Memory Graph interface to inspect or prune outdated project knowledge blocks.

### 🔍 3. Reciprocal Rank Fusion (RRF) Hybrid Search
- Combines **MongoDB Lexical Search** and **Qdrant Vector Cosine Retrieval**.
- Calculates unified rank fusion scores ($k=60$) for accurate technical context retrieval.

### 💬 4. Evidence-Grounded AI Chat Core
- Context-aware RAG pipeline powered by **Google Gemini API** (`@google/genai`).
- Real-time Markdown rendering via `react-markdown`, syntax-highlighted code snippets, and cited source document excerpts.
- Conversation session history and prompt thread management.

### ⚙️ 5. Asynchronous Worker Telemetry
- Redis-backed BullMQ queue processor with automatic job retries, exponential backoff, and memory management.
- Live workspace metrics detailing document counts, storage byte usage, chunk totals, and conversation counts.

---

## 🏗️ Architecture & Monorepo Structure

```text
Forge Monorepo
├── apps/
│   ├── api/          # Express REST API (Auth, Projects, Docs, RAG & Search endpoints)
│   ├── web/          # React 18 + Vite 6 + Tailwind CSS v4 Industrial Workspace UI
│   └── worker/       # BullMQ Background Job Processor (Text Normalization & Embeddings)
├── packages/
│   ├── persistence/  # Shared Mongoose models & database connection routines
│   └── shared/       # Shared contracts, Zod schemas, and system constants
├── docs/             # Comprehensive technical documentation
└── docker-compose.yml# Infrastructure setup (MongoDB 7, Redis 7, Qdrant)
```

---

## 🛠️ Complete Technology Stack & Libraries

### Frontend (`apps/web`)
- **Framework**: React 18.3, Vite 6.0
- **Styling**: Tailwind CSS v4.0 (`@tailwindcss/vite`), `@tailwindcss/typography`
- **Data Fetching & State**: TanStack React Query v5.62, Axios v1.7
- **Routing**: React Router v7.1
- **Rendering**: React Markdown v10.1

### Backend API (`apps/api`) & Worker (`apps/worker`)
- **Server Framework**: Node.js v20+, Express v4.21
- **Queue System**: BullMQ v5.34, ioredis v5.4
- **Database & Vectors**: MongoDB v7.0 (via Mongoose v8.9), Qdrant Vector DB (via `@qdrant/js-client-rest` v1.13)
- **AI Models & Embeddings**: Google Gemini API (via `@google/genai` v1.0)
- **Security & Validation**: JWT (`jsonwebtoken` v9.0), BcryptJS v2.4, Zod v3.24, Helmet v8.0, Multer v2.0, Cookie-Parser v1.4, CORS v2.8

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v20.11.0` or newer
- **npm**: `v10.0.0` or newer
- **Docker Desktop**: For running local infrastructure containers

### 2. Environment Configuration
Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configure environment credentials in `.env`:
```ini
PORT=4000
NODE_ENV=development
WEB_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/forge
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key_if_cloud

GEMINI_API_KEY=your_google_gemini_api_key

JWT_ACCESS_SECRET=your_super_secret_access_key_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_32_chars
```

### 3. Launch Local Infrastructure Containers
Start MongoDB 7, Redis 7, and Qdrant Vector DB via Docker Compose:

```bash
docker compose up -d
```

### 4. Install Dependencies
Install dependencies across all monorepo workspaces:

```bash
npm install
```

### 5. Launch Development Services
Run the monorepo services in separate terminal windows:

```bash
# Terminal 1: Backend REST API (Port 4000)
npm run dev:api

# Terminal 2: Ingestion Queue Worker
npm run dev:worker

# Terminal 3: React Web Workspace UI (Port 5173)
npm run dev:web
```

Access the web interface at `http://localhost:5173`.

---

## 📡 Essential REST API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register account & initialize session |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & set HTTP-only cookie |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Rotate session & issue fresh access JWT |
| **Projects** | `GET` | `/api/v1/projects` | List user workspace projects |
| **Projects** | `POST` | `/api/v1/projects` | Initialize a new project container |
| **Projects** | `GET` | `/api/v1/projects/:id/stats` | Retrieve workspace storage & document metrics |
| **Documents**| `POST` | `/api/v1/projects/:id/documents` | Upload source file for async indexing |
| **Documents**| `GET` | `/api/v1/projects/:id/documents` | List indexed documents & ingestion statuses |
| **Search** | `POST` | `/api/v1/projects/:id/search` | Execute RRF hybrid search query |
| **Chat** | `POST` | `/api/v1/projects/:id/chat` | Query RAG pipeline & return cited response |
| **Memory** | `GET` | `/api/v1/projects/:id/memories` | Retrieve active project memory graph |

---

## 📚 Technical Reference Guides

For comprehensive technical documentation, refer to the [`docs/`](./docs) directory:

- 📐 **[Architecture Overview](./docs/architecture.md)**: Deep dive into service topology, security scoping, RRF math, and worker queue routines.
- 🔌 **[API Reference](./docs/api-reference.md)**: Complete HTTP endpoint specification, headers, request bodies, and error structures.
- 🚀 **[Deployment Guide](./docs/deployment.md)**: Production deployment instructions for Vercel, Render (`render.yaml`), and Docker containers.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## 👤 Author

- [Jyot Shah](https://www.linkedin.com/in/jyotshah1/)

For questions or issues, please open an issue on GitHub or mail to **jyotshah1595@gmail.com**.

---

<p align="center">
  Made with ⚡ for developer productivity
</p>

