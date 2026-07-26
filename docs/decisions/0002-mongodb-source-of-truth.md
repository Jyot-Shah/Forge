# ADR 0002: MongoDB is authoritative; Qdrant is derived

## Status

Accepted.

## Decision

MongoDB owns document, chunk, and lifecycle records. Qdrant stores derived vectors and payload metadata only.

## Consequences

Vector data can be rebuilt, but index reconciliation is mandatory as the system matures. Cross-database operations are eventually consistent.
