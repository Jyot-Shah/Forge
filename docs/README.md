# Forge engineering documentation

This directory is the durable reference for Forge. Update the relevant document in the same pull request as an architectural, API, operational, or deployment change.

## Contents

- [Architecture](architecture/overview.md): runtime components, data ownership, and key flows.
- [API reference](api/reference.md): implemented HTTP endpoints and contracts.
- [Local development](runbooks/local-development.md): prerequisites and startup procedures.
- [Deployment](runbooks/deployment.md): Vercel and Render deployment requirements.
- [Operations](runbooks/operations.md): recovery, reprocessing, and troubleshooting guidance.
- [Engineering backlog](roadmap.md): prioritized work required for production readiness.
- [Architecture decisions](decisions/): durable records of consequential decisions.

## Documentation rules

1. Describe deployed behavior, not desired behavior.
2. Record a new ADR before introducing a consequential platform dependency or irreversible data-model decision.
3. Never commit credentials, connection strings, access tokens, or raw user documents.
