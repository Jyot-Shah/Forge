# ADR 0001: Use a modular monolith with an asynchronous worker

## Status

Accepted.

## Decision

Forge uses one Express API codebase and one separate BullMQ worker process, with shared persistence contracts.

## Rationale

The project needs reliable asynchronous ingestion but does not yet justify independently versioned microservices. This boundary lets API traffic and background processing scale separately while retaining simple deployment and debugging.
