<div align="center">

# ⚡ FORGE

**An AI-Powered Developer Workspace & Persistent Project Knowledge Engine**

[![Node.js Version](https://img.shields.io/badge/node.js-v20%2B-026e00?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-v18-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4.0-06b6d4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-v7.0-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/redis-v7.0-dc382d?style=for-the-badge&logo=redis)](https://redis.io/)
[![Qdrant](https://img.shields.io/badge/qdrant-vector%20db-d13854?style=for-the-badge&logo=database)](https://qdrant.tech/)

</div>

---

## 💡 What is Forge?

**Forge** is an enterprise-grade AI developer workspace designed for software engineering teams, researchers, and technical founders. Unlike generic chatbots or basic PDF-RAG wrappers, Forge continuously builds structured, persistent knowledge about software projects across documents, conversations, architectural decisions, and extracted entity memories.

Every piece of context in Forge is strictly scoped to a **Project Workspace**. Over time, Forge develops a durable understanding of your codebase, technical specifications, and system design—allowing developers to query, inspect, and interact with an intelligent long-term engineering companion.

---

## 🎨 Modern-Industrial Minimalism Design System

Forge features a **Modern-Industrial Minimalist UI** designed in **Stitch**:

- **Obsidian Theme**: Strictly restrained dark mode (`#09090B` canvas, `#121214` panels, `#27272A` hairline borders).
- **Typography**: **Geist** for technical headlines and body text; **JetBrains Mono** for code snippets, telemetry labels, and keyboard shortcuts.
- **Tonal Layering**: Micro-details and hairline borders replace heavy blur gradients or floating drop shadows.
- **High-Density Workspaces**: Compact layout grids optimized for professional software tools.

---

## 🚀 Key Features

### 📁 1. Project-Scoped Knowledge Ingestion
- Upload technical documents (`.md`, `.txt`, `.json`, `.py`, `.js`, `.ts`).
- Automatic background parsing, deterministic text chunking, and metadata tagging.
- Real-time status tracking (`pending` ➔ `processing` ➔ `ready` / `failed`).

### 🧠 2. Persistent Context & Memory Engine
- Autonomous factual extraction from document ingestion and developer conversations.
- Entity confidence scoring, classification tags, and timeline tracking.
- Interactive Memory Graph to inspect or prune outdated project knowledge.

### 🔍 3. Reciprocal Rank Fusion (RRF) Hybrid Search
- Combines **MongoDB Lexical Search** and **Qdrant Vector Cosine Retrieval**.
- Calculates unified rank fusion scores ($k=60$) for optimal context precision.

### 💬 4. Evidence-Grounded AI Chat Core
- Context-aware RAG pipeline powered by **Google Gemini AI**.
- Streaming markdown rendering, syntax-highlighted code blocks, and cited source excerpts.
- Session persistence and conversation management.

### ⚙️ 5. Telemetry & Worker Queue
- Asynchronous ingestion pipeline powered by **BullMQ** on **Redis**.
- Robust retry logic, exponential backoff, and processing telemetry diagnostic feeds.

---

## 🏗️ Architecture & Monorepo Structure

```text
Forge Workspace Monorepo
├── apps/
│   ├── api/          # Express REST API (Auth, Projects, Docs, RAG & Search endpoints)
│   ├── web/          # React 18 + Vite + Tailwind CSS v4 Industrial Workspace UI
│   └── worker/       # BullMQ Background Job Processor (Text Normalization & Embeddings)
├── packages/
│   └── shared/       # Shared TypeScript/JS contracts, schemas, and constants
├── docs/             # Technical reference documentation
└── docker-compose.yml# Local infrastructure (MongoDB, Redis, Qdrant)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS v4, TanStack Query, React Router v6 |
| **Backend API** | Node.js, Express, Mongoose, JWT (HttpOnly Cookies) |
| **Worker Queue** | BullMQ, Redis 7 |
| **Databases** | MongoDB 7 (Metadata/History), Qdrant Cloud (Vector Index) |
| **AI / RAG** | Google Gemini API (`text-embedding-004`, `gemini-1.5-flash`) |

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v20.11` or newer
- **Docker Desktop**: For running local database containers

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:
```ini
MONGODB_URI=mongodb://localhost:27017/forge
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
GEMINI_API_KEY=your_google_gemini_api_key
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
```

### 3. Launch Local Infrastructure
Start MongoDB, Redis, and Qdrant via Docker Compose:

```bash
docker compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Launch Development Monorepo
Run services in separate terminals:

```bash
# Terminal 1: REST API Server (Port 4000)
npm run dev:api

# Terminal 2: Ingestion Queue Worker
npm run dev:worker

# Terminal 3: React Web Workspace UI (Port 5173)
npm run dev:web
```

Open `http://localhost:5173` in your browser.

---

## 📡 Essential API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register account & initialize session |
| `POST` | `/api/v1/auth/login` | Sign in & issue JWT credentials |
| `GET` | `/api/v1/projects` | List active user workspace projects |
| `POST` | `/api/v1/projects` | Initialize a new project container |
| `POST` | `/api/v1/projects/:id/documents` | Upload source file for async indexing |
| `POST` | `/api/v1/projects/:id/search` | Execute RRF hybrid search |
| `POST` | `/api/v1/projects/:id/chat` | Send prompt to evidence-grounded AI model |
| `GET` | `/api/v1/projects/:id/memories` | Retrieve active project memory graph |

---

## 📚 Technical Documentation

Explore detailed engineering reference guides in the [`docs/`](./docs) directory:

- 📐 **[Architecture Guide](./docs/architecture.md)**: Deep dive into runtime components, data flows, and security boundaries.
- 🔌 **[API Reference](./docs/api-reference.md)**: Complete HTTP endpoint contracts and payload schemas.
- 🚀 **[Deployment Guide](./docs/deployment.md)**: Local Docker Compose setup and production deployment on Vercel & Render.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
