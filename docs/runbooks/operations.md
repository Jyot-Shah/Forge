# Operations runbook

## Reprocess a document

Use the document reprocess endpoint after a transient provider outage or parser fix. It resets the latest version to `pending` and queues a new ingestion attempt.

## Failed ingestion

1. Read the document `error` field and worker logs using its document ID.
2. Confirm the file still exists in configured source storage.
3. Verify Redis, MongoDB, Qdrant, and Gemini availability.
4. Reprocess only after correcting the failure cause.

## Vector index reconciliation

MongoDB is authoritative. If Qdrant is unavailable during deletion or indexing, records can diverge. The current implementation has no reconciler. Until one exists, document operations that encounter Qdrant failures must be manually reviewed and reprocessed after provider recovery.

## Security response

If a JWT secret or provider key is exposed, rotate it immediately, redeploy API and worker, invalidate affected sessions, and assess provider audit logs. Never include secrets in Git history or issue trackers.
