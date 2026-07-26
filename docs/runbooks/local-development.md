# Local development

## Prerequisites

- Node.js 20.11+
- Docker Desktop
- A Gemini API key for embedding and chat features

## Setup

1. Copy `.env.example` to `.env`.
2. Set a unique `JWT_ACCESS_SECRET` of at least 32 characters.
3. Set `GEMINI_API_KEY`.
4. Start infrastructure: `docker compose up -d`.
5. Install packages: `npm install`.
6. Start three terminals:

```text
npm run dev:api
npm run dev:worker
npm run dev:web
```

The web application runs on `http://localhost:5173` and API health is available at `http://localhost:4000/health`.

## Smoke test

1. Register a user at `/register`.
2. Create a project.
3. Upload a small `.txt`, `.md`, or `.json` file.
4. Wait for document status `ready`.
5. Ask a question in project chat that is answered by the document.

## Resetting local infrastructure

Use `docker compose down` to stop services. Use `docker compose down -v` only when intentionally discarding all local MongoDB and Qdrant data.

## Common failures

| Symptom                  | Likely cause                                                    | Resolution                                         |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| Worker exits immediately | Missing `REDIS_URL` or `MONGODB_URI`                            | Check `.env` and Docker services.                  |
| Document is `failed`     | Invalid JSON, no text, or Gemini/Qdrant credentials unavailable | Inspect worker logs and document error field.      |
| Chat returns 500         | Gemini/Qdrant unavailable or no credentials                     | Verify provider configuration and worker indexing. |
| Login refresh loops      | Incorrect `WEB_ORIGIN` or cookie restrictions                   | Use the exact frontend origin locally.             |
