# Architecture overview

Forge is a project-scoped AI developer workspace. MongoDB is the source of truth for application state. Qdrant is a derived vector index and may be rebuilt from persisted document chunks.

```text
React/Vite (Vercel)
        │ HTTPS
        ▼
Express API (Render) ───── MongoDB Atlas
        │                        │
        ├──── Redis / BullMQ ─── Worker (Render)
        │                        │
        ▼                        ▼
     Gemini API              Qdrant Cloud
```

## Runtime responsibilities

| Component | Responsibility                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Web       | Login, protected workspace routes, projects, uploads, and chat UI.                                           |
| API       | Authentication, project authorization, synchronous CRUD, upload orchestration, retrieval, and chat requests. |
| Worker    | Asynchronous text normalization, chunk persistence, embeddings, and Qdrant upserts.                          |
| MongoDB   | Users, memberships, documents, versions, chunks, chats, and memories.                                        |
| Redis     | BullMQ job coordination and retry state.                                                                     |
| Qdrant    | Project-filtered semantic retrieval over document chunks.                                                    |

## Security boundaries

Every project-owned API route checks `projectId` membership before accessing data. Qdrant points include `projectId`; retrieval queries filter on it. Access JWTs are short-lived. Refresh tokens are random opaque values, stored only as hashes in MongoDB and issued to browsers in HttpOnly cookies.

## Document ingestion

1. An editor uploads TXT, Markdown, or JSON.
2. API validates the request, stores the source under `uploads/`, creates source/version records, and enqueues `document.ingest`.
3. The worker reads and normalizes the file, chunks it deterministically, persists chunks, creates Gemini embeddings, and upserts Qdrant vectors.
4. The document moves from `pending` to `processing`, then `ready` or `failed`.

Local disk storage is a development implementation. Production must use durable object storage before accepting real uploads.

## Retrieval and chat

The search endpoint combines MongoDB text search and Qdrant semantic retrieval through reciprocal-rank fusion. Chat embeds the question, retrieves project-filtered Qdrant chunks, loads active memories, then asks the configured Gemini model to respond using supplied evidence. Citations are returned only for retrieved chunk IDs.

## Known implementation constraints

- Conversation history is not yet loaded into the chat prompt; each browser session keeps its current conversation ID only.
- Memory records are user-created or API-created; automatic memory extraction is not implemented.
- No streaming chat responses, reranking, or retrieval evaluation suite exists yet.
- Vector deletion is best-effort after MongoDB state is marked deleted; reconciliation tooling is still needed.
