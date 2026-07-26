# Deployment runbook

## Required managed services

- MongoDB Atlas
- Upstash Redis
- Qdrant Cloud
- Gemini API
- Durable object storage for uploaded sources (required before production use)

## Web deployment

Deploy `apps/web` to Vercel. Configure `VITE_API_URL` as the deployed API base URL with `/api/v1`, for example `https://forge-api.example.com/api/v1`.

## API and worker deployment

Deploy `apps/api/Dockerfile` as a Render web service and `apps/worker/Dockerfile` as a Render worker. `render.yaml` is a service definition only; secrets must be configured in Render rather than committed.

Both runtimes require:

```text
MONGODB_URI
REDIS_URL
GEMINI_API_KEY
QDRANT_URL
QDRANT_API_KEY
JWT_ACCESS_SECRET
WEB_ORIGIN
```

The API additionally requires `API_PORT`, or the platform’s provided port must be mapped into the configuration. Before deployment, ensure the application supports the hosting platform’s `PORT` contract if it differs from `API_PORT`.

## Production gate

Do not deploy real user data until object storage, rate limiting, tests, telemetry, and a durable upload deletion/reconciliation process are implemented.
