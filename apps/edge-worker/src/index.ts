export interface Env {
  R2_BUCKET: R2Bucket;
  PUBLISHED_BASE_DOMAIN: string;
  API_ORIGIN: string;
  RESOLVE_CACHE_TTL_SECONDS?: string;
}

type ResolveResponse = {
  subdomain: string;
  published: boolean;
  currentVersion: number;
};

function stripPort(host: string): string {
  const i = host.indexOf(':');
  return i >= 0 ? host.slice(0, i) : host;
}

function getSubdomain(host: string, baseDomain: string): string | null {
  if (!baseDomain) return null;
  const cleanHost = stripPort(host).toLowerCase();
  const suffix = `.${baseDomain.toLowerCase()}`;
  if (!cleanHost.endsWith(suffix)) return null;
  const sub = cleanHost.slice(0, cleanHost.length - suffix.length);
  return sub || null;
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/index.html';
  if (pathname.endsWith('/')) return `${pathname}index.html`;
  return pathname;
}

async function resolveSubdomain(env: Env, subdomain: string): Promise<ResolveResponse | null> {
  const url = new URL('/api/published/resolve', env.API_ORIGIN);
  url.searchParams.set('subdomain', subdomain);
  const resp = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    cf: { cacheEverything: true, cacheTtl: Number(env.RESOLVE_CACHE_TTL_SECONDS || '30') },
  });
  if (!resp.ok) return null;
  return (await resp.json()) as ResolveResponse;
}

function securityHeaders() {
  // Keep conservative; adjust once you know which external resources layouts rely on.
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    // CSP is intentionally permissive for now due to Google Fonts usage in templates.
    'Content-Security-Policy':
      "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; frame-src https:;",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const host = request.headers.get('Host') || '';
    const subdomain = getSubdomain(host, env.PUBLISHED_BASE_DOMAIN);
    if (!subdomain) {
      return new Response('Not found', { status: 404 });
    }

    const resolved = await resolveSubdomain(env, subdomain);
    if (!resolved || !resolved.published || !resolved.currentVersion) {
      return new Response('Not found', { status: 404 });
    }

    const path = normalizePath(new URL(request.url).pathname);
    const key = `sites/${subdomain}/v${resolved.currentVersion}${path}`;

    const obj = await env.R2_BUCKET.get(key);
    if (!obj) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('ETag', obj.httpEtag);
    // If missing, infer basic content type for HTML/CSS.
    if (!headers.get('Content-Type')) {
      if (key.endsWith('.html')) headers.set('Content-Type', 'text/html; charset=utf-8');
      else if (key.endsWith('.css')) headers.set('Content-Type', 'text/css; charset=utf-8');
      else if (key.endsWith('.js')) headers.set('Content-Type', 'application/javascript; charset=utf-8');
    }

    // Cache strategy:
    // - versioned assets: immutable long cache
    // - HTML: short cache
    if (key.endsWith('/index.html') || key.endsWith('.html')) {
      headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    const sec = securityHeaders();
    for (const [k, v] of Object.entries(sec)) headers.set(k, v);

    return new Response(obj.body, { headers });
  },
};


