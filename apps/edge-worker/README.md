# Sacred Vows Edge Worker (Cloudflare)

This Worker serves published invitations directly from R2, routing by `Host` header.

## Bindings

- `R2_BUCKET`: R2 bucket binding
- `PUBLISHED_BASE_DOMAIN`: base domain used for subdomain extraction (e.g. `sacredvows.io`)
- `API_ORIGIN`: API base URL - should point to Cloud Run API (e.g. `https://api.sacredvows.io`)

Optional:
- `RESOLVE_CACHE_TTL_SECONDS` (default 30)

## Deploy

1. Install deps (in `apps/edge-worker/`):
   - `npm install`
2. Configure `wrangler.toml` and secrets
3. `npm run deploy`


