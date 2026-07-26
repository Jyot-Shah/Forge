# API reference

Base path: `/api/v1`. All project routes require `Authorization: Bearer <access-token>`.

## Authentication

| Method | Path             | Purpose                                            |
| ------ | ---------------- | -------------------------------------------------- |
| POST   | `/auth/register` | Create account and session.                        |
| POST   | `/auth/login`    | Sign in and issue session.                         |
| POST   | `/auth/refresh`  | Rotate refresh session and issue new access token. |
| POST   | `/auth/logout`   | Revoke current refresh session.                    |
| GET    | `/auth/me`       | Return authenticated identity.                     |

## Projects

| Method | Path                   | Required role      |
| ------ | ---------------------- | ------------------ |
| GET    | `/projects`            | Member             |
| POST   | `/projects`            | Authenticated user |
| GET    | `/projects/:projectId` | Member             |
| PATCH  | `/projects/:projectId` | Owner or editor    |

## Documents

| Method | Path                                                   | Required role   |
| ------ | ------------------------------------------------------ | --------------- |
| GET    | `/projects/:projectId/documents`                       | Member          |
| POST   | `/projects/:projectId/documents`                       | Owner or editor |
| POST   | `/projects/:projectId/documents/:documentId/reprocess` | Owner or editor |
| DELETE | `/projects/:projectId/documents/:documentId`           | Owner or editor |

Upload uses `multipart/form-data` with exactly one `file` field. Supported MIME types are `text/plain`, `text/markdown`, and `application/json`.

## Knowledge

| Method | Path                                      | Required role   |
| ------ | ----------------------------------------- | --------------- |
| POST   | `/projects/:projectId/search`             | Member          |
| GET    | `/projects/:projectId/memories`           | Member          |
| POST   | `/projects/:projectId/memories`           | Owner or editor |
| PATCH  | `/projects/:projectId/memories/:memoryId` | Owner or editor |
| POST   | `/projects/:projectId/chat`               | Member          |

Search request:

```json
{ "query": "Why did we choose Qdrant?" }
```

Chat request:

```json
{
  "content": "Summarize the deployment design.",
  "conversationId": "optional MongoDB ObjectId"
}
```

All error responses use `{ "error": { "code", "message", "requestId" } }`.
