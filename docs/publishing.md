# Publishing (Subdomain Hosting)

## Overview

Sacred Vows supports publishing invitations to subdomains **without deploying a new app per invitation**.

- The API handles **publishing** (validation, ownership checks, snapshot generation, artifact upload)
- Public traffic is served by a **Cloudflare Worker** directly from **Cloudflare R2**
- Publishing generates versioned artifacts under `sites/<subdomain>/v<version>/...` and advances a `current_version` pointer

## Required DNS / TLS (production)

To make `https://<subdomain>.<PUBLISHED_BASE_DOMAIN>` work:

1. Configure **wildcard DNS**:
   - `*.<PUBLISHED_BASE_DOMAIN>` → points to your Cloudflare Worker (proxied)
2. Configure **TLS**:
   - Cloudflare will handle TLS for `*.<PUBLISHED_BASE_DOMAIN>` when proxied

## Backend environment variables

This repo does not commit `.env` files. For convenience, copy one of these files locally:

- `env.example` → `.env`
- `apps/api-go/env.example` → `apps/api-go/.env`
- `apps/builder/env.example` → `apps/builder/.env`

### Required for subdomain URL generation

- `PUBLISHED_BASE_DOMAIN`: base domain for published sites (example: `sacredvows.app`)

### Required to render snapshots

Publishing uses a Node renderer that reuses the builder’s layout export templates.

- `SNAPSHOT_RENDERER_SCRIPT`: absolute path to `apps/builder/src/template-engine/src/renderPublishedHTML.js`
- `SNAPSHOT_RENDERER_NODE` (optional): Node binary (default: `node`)

### Artifact storage

Select the artifact store:

- `PUBLISH_ARTIFACT_STORE`: `filesystem` (local dev) or `r2` (production)

#### Filesystem (local dev)

- `PUBLISHED_ARTIFACTS_DIR` (optional): directory to store artifacts (default: `./published`)
- `PUBLISHED_ARTIFACTS_PUBLIC_BASE` (optional): base URL used when returning artifact URLs (default: empty, returns relative `/published/...` URLs)

#### Cloudflare R2 (production)

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE` (optional): if you also expose a public origin hostname for direct object URLs; leave empty for Worker-only mode

## API endpoints

- `POST /api/publish/validate`
  - body: `{ "invitationId": "...", "subdomain": "john-wedding" }`
  - returns: `{ "available": true, "normalizedSubdomain": "john-wedding" }`

- `POST /api/publish`
  - auth required (Bearer access token)
  - body: `{ "invitationId": "...", "subdomain": "john-wedding" }`
  - returns: `{ "url": "https://john-wedding.<PUBLISHED_BASE_DOMAIN>", "subdomain": "john-wedding", "version": 1 }`

### Edge resolve endpoint (for the Worker)

- `GET /api/published/resolve?subdomain=<subdomain>`
  - returns: `{ "subdomain": "...", "published": true, "currentVersion": 3 }`
  - cacheable (short TTL)

## Local development notes

The repo supports a local filesystem artifact store, served from the API at `/published/...`.

To test end-to-end locally:

1. Run the API with:
   - `PUBLISHED_BASE_DOMAIN=localhost`
   - `PUBLISH_ARTIFACT_STORE=filesystem`
   - `SNAPSHOT_RENDERER_SCRIPT=<absolute path to apps/builder/src/template-engine/src/renderPublishedHTML.js>`
2. Publish from the builder UI.
3. The API Host-based resolver (NoRoute handler) can be exercised by sending a `Host` header like `john-wedding.localhost`.

For production, prefer the Worker approach (`apps/edge-worker/`) and do not serve `/published` from the API.

## Cloudflare Worker

The Worker lives in `apps/edge-worker/` and:
- extracts `subdomain` from the `Host` header
- calls `GET /api/published/resolve` to obtain `currentVersion`
- serves `sites/<subdomain>/v<version>/<path>` from R2

See `apps/edge-worker/README.md` for bindings and deploy steps.

## More detail

For a detailed, end-to-end walkthrough of what happens during publish and during guest traffic, see `docs/publishing-process.md`.


