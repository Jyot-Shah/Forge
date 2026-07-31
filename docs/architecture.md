# Forge Architecture & System Design

Forge is an enterprise AI-powered developer workspace built to continuously
ingest, index, and retrieve project-scoped technical knowledge, architectural
decisions, and contextual memories.

---

## 1. System Topology & Data Flow

```text
               ┌─────────────────────────────────────────┐
               │           React / Vite Web UI           │
               │               (apps/web)                │
               └────────────────────┬────────────────────┘
                                    │ HTTPS (JWT)
                                    ▼
               ┌─────────────────────────────────────────┐
               │            Express REST API             │
               │               (apps/api)                │
               └─────────┬──────────┬───────────┬────────┘
                         │          │           │
       MongoDB Atlas ◄───┘          │           └───► Redis / BullMQ
   (Metadata, History &             |                (Ingestion Jobs)
    Raw File Content)
                                    │                       │
                                    ▼                       ▼
                           Google Gemini API      ┌──────────────────┐
                           (RAG & Embeddings)     │ Background Worker│
                                    │             │  (apps/worker)   │
                                    │             └─────────┬────────┘
                                    ▼                       │
                           Qdrant Vector DB ◄───────────────┘
                           (Semantic Indexing)
```

---

## 2. Core Components & Service Responsibilities

### `apps/web` (Frontend Application)

- **Framework**: React 18 + Vite + Tailwind CSS v4.
- **Design System**: Modern-Industrial Minimalism theme (`#09090B` obsidian
  canvas, hairline borders, Geist & JetBrains Mono typography).
- **State Management**: React Query (TanStack Query) for caching and background
  revalidation.
- **Routing**: React Router v6 with protected routes and workspace switcher.

### `apps/api` (Backend API Service)

- **Framework**: Node.js + Express.
- **Authentication**: Dual-token JWT architecture (short-lived Access Tokens,
  HTTP-only Refresh Cookies with hashed session storage).
- **Data Access**: Mongoose schemas for Users, Projects, Documents, Chunks,
  Conversations, and Memories.
- **Orchestration**: Enqueues background ingestion jobs into BullMQ, manages
  project-scoped RAG pipelines, and handles reciprocal rank fusion search.

### `apps/worker` (Asynchronous Job Processor)

- **Engine**: BullMQ queue processor running on Redis.
- **Runtime**: Requires Node.js 22 LTS (pinned in `package.json`) due to
  `@qdrant/js-client-rest` incompatibility with Node.js 26's bundled `undici`.
- **Ingestion Pipeline**:
  1. Reads raw file content directly from MongoDB (`DocumentVersion.rawContent`)
     — **zero filesystem operations**.
  2. Normalizes text and executes deterministic chunking (token/character
     boundaries).
  3. Generates 1536-dimensional vector embeddings using Google Gemini API
     (`gemini-embedding-2`).
  4. Upserts vectors to Qdrant Cloud vector collections with strict `projectId`
     payload filters.
  5. Updates document status in MongoDB from `pending` → `processing` → `ready`
     / `failed`.

> **Note**: The upload pipeline uses `multer.memoryStorage()` to receive files
> entirely in RAM. The raw text content is persisted in MongoDB Atlas via
> `DocumentVersion.rawContent`, making the system fully cloud-native with no
> dependency on local or ephemeral disk storage.

### `packages/shared` (Shared Contracts & Utilities)

- Provides shared TypeScript/JS constants, API payload contracts, validation
  schemas, and error definitions across API, Worker, and Web.

---

## 3. Knowledge & RAG Architecture

### Reciprocal Rank Fusion (RRF) Hybrid Search

Forge implements a hybrid retrieval engine combining:

1. **Lexical Keyword Search**: MongoDB text indexing over document contents and
   titles.
2. **Dense Vector Search**: Cosine similarity vector retrieval via Qdrant Cloud.

Scores are combined using Reciprocal Rank Fusion:
$$\text{RRF Score}(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$ where $k = 60$ and
$r_m(d)$ is the rank of document $d$ in retrieval method $m$.

### Context & Memory Engine

Before invoking the LLM for chat responses:

1. User prompt is vectorized via Gemini Embeddings.
2. Relevant document chunks are retrieved from Qdrant with `projectId` scoping.
3. Active project memories (facts, decisions, coding styles) are loaded from
   MongoDB.
4. Combined context is formatted into a system prompt for Google Gemini,
   enforcing strict citation references for all claims.

---

## 4. Security & Multi-Tenancy

- **Project Scoping**: All API endpoints enforce explicit project membership
  (`owner`, `editor`, `viewer`).
- **Vector Isolation**: Qdrant points include `{ projectId: "<id>" }` in payload
  metadata. All search operations execute hard filter conditions matching the
  caller's project context.
- **Token Security**: Passwords hashed using bcrypt. JWT refresh tokens stored
  as SHA-256 hashes in MongoDB.
