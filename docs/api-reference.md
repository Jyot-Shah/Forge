# Forge REST API Reference

Base API Path: `/api/v1`

All authenticated endpoints require an `Authorization` header:
`Authorization: Bearer <access_token>`

---

## 1. Authentication Endpoints

### Register Account
`POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "displayName": "Jane Doe",
    "email": "jane@example.com",
    "password": "strong-password-123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "user": { "_id": "...", "displayName": "Jane Doe", "email": "jane@example.com" },
    "accessToken": "jwt-token-string"
  }
  ```

### Sign In
`POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "strong-password-123"
  }
  ```
- **Response** (`200 OK`): Returns `user` identity, `accessToken`, and sets HttpOnly refresh cookie.

### Refresh Access Token
`POST /api/v1/auth/refresh`
- **Cookies**: `refreshToken=<cookie>`
- **Response** (`200 OK`): Issues new `accessToken` and rotates `refreshToken`.

### Current User Profile
`GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`200 OK`): User object.

---

## 2. Project Management Endpoints

### List User Projects
`GET /api/v1/projects`
- **Response** (`200 OK`):
  ```json
  {
    "projects": [
      {
        "_id": "66a123...",
        "name": "Forge Engine",
        "role": "owner",
        "createdAt": "2026-07-26T10:00:00.000Z"
      }
    ]
  }
  ```

### Create Project
`POST /api/v1/projects`
- **Request Body**: `{ "name": "New Project Workspace" }`
- **Response** (`201 Created`): Project object.

### Delete Project
`DELETE /api/v1/projects/:projectId`
- **Response** (`200 OK`): `{ "message": "Project removed." }`

### Project Telemetry & Metrics
`GET /api/v1/projects/:projectId/stats`
- **Response** (`200 OK`): Document count, chunk count, conversation count, storage usage in bytes, and latest document status list.

---

## 3. Document Library Endpoints

### Upload Document
`POST /api/v1/projects/:projectId/documents`
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (`.txt`, `.md`, `.json`, `.py`, `.js`, `.ts`)
- **Response** (`202 Accepted`): Document record queued for async background ingestion.

### List Documents
`GET /api/v1/projects/:projectId/documents`
- **Response** (`200 OK`): Array of project document objects with processing status (`pending`, `processing`, `ready`, `failed`).

### Delete Document
`DELETE /api/v1/projects/:projectId/documents/:documentId`
- **Response** (`200 OK`): Removes document from MongoDB and triggers vector cleanup in Qdrant.

---

## 4. Search, Chat & Memory Endpoints

### Hybrid Knowledge Search
`POST /api/v1/projects/:projectId/search`
- **Request Body**: `{ "query": "How is authentication handled?" }`
- **Response** (`200 OK`):
  ```json
  {
    "results": [
      {
        "_id": "chunk-id",
        "content": "Chunk excerpt...",
        "score": 0.032,
        "documentName": "architecture.md"
      }
    ],
    "memories": [...]
  }
  ```

### Send Chat Prompt (RAG)
`POST /api/v1/projects/:projectId/chat`
- **Request Body**:
  ```json
  {
    "content": "Explain the BullMQ ingestion pipeline.",
    "conversationId": "optional-existing-conversation-id"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "conversation": { "_id": "...", "title": "BullMQ ingestion pipeline" },
    "message": {
      "role": "assistant",
      "content": "The worker reads files from disk...",
      "citations": [
        { "chunkId": "...", "documentName": "architecture.md", "excerpt": "..." }
      ]
    }
  }
  ```

### List Project Memories
`GET /api/v1/projects/:projectId/memories`
- **Response** (`200 OK`): List of memory facts with confidence scores and categories.

### Prune Memory
`DELETE /api/v1/projects/:projectId/memories/:memoryId`
- **Response** (`200 OK`): `{ "message": "Memory removed." }`
