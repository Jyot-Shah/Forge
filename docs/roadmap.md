# Engineering roadmap

## Before accepting production users

1. Replace local uploads with S3-compatible object storage and signed access patterns.
2. Add API rate limits for authentication, uploads, search, and chat.
3. Add automated tests: auth, authorization, ingestion, queue retry, retrieval, and browser critical paths.
4. Add structured logging, metrics, alerts, and request/job correlation search.
5. Add Qdrant reconciliation and reliable outbox-style indexing/deletion handling.
6. Add document size quotas, project quotas, and Gemini cost controls.
7. Complete upload malware scanning and stricter file-content verification.

## Knowledge quality

1. Implement reviewed automatic memory-candidate extraction with strict structured output validation.
2. Add conversation summaries and include recent/summarized context in chat prompts.
3. Add retrieval evaluations, citation correctness checks, and regressions in CI.
4. Add reranking only after a measured retrieval-quality baseline exists.

## Product

1. Add document detail/status/error views and reprocess/delete controls.
2. Add conversation history and memory-management UI.
3. Add project membership administration.
4. Add repository ingestion after document ingestion is reliable.
