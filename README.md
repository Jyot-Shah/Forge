# Forge

Forge is an AI-powered developer workspace that builds durable, project-scoped knowledge from documents, conversations, and reviewed memories.

## Architecture

- `apps/web`: React and Vite workspace UI.
- `apps/api`: Express API, authentication, project authorization, and ingestion orchestration.
- `apps/worker`: asynchronous BullMQ workers.
- `packages/shared`: API contracts and shared constants.

## Prerequisites

- Node.js 20.11 or newer
- MongoDB 7 or newer
- Redis 7 or newer
- Qdrant (required once document retrieval is enabled)

Copy `.env.example` to `.env`, set a strong `JWT_ACCESS_SECRET`, then install dependencies and start the API and web applications.

## Running locally

Start MongoDB, Redis, and Qdrant with `docker compose up -d`. Copy `.env.example` to `.env`, then run `npm install`, `npm run dev:api`, `npm run dev:worker`, and `npm run dev:web` in separate terminals.

Set `GEMINI_API_KEY` before indexing documents or using chat. The API intentionally fails those provider-backed operations when credentials are absent.

## Deployment

Deploy the Vite application from `apps/web` on Vercel. Deploy API and worker as separate Docker services on Render using `render.yaml`. Configure the same MongoDB Atlas, Upstash Redis, Qdrant Cloud, and Gemini credentials for API and worker. Set `WEB_ORIGIN` to the deployed Vercel origin.

## Current implementation scope

The initial vertical slice includes configuration validation, request tracing, JWT authentication with rotating refresh sessions, project membership authorization, project CRUD, and an authenticated React workspace shell. Document ingestion, vector indexing, and chat are scaffolded as explicit next modules rather than simulated.
