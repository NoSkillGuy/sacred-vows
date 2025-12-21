/**
 * Server-runnable snapshot renderer.
 *
 * Usage:
 * - Default: outputs HTML to stdout
 * - With `--mode=bundle`: outputs JSON to stdout: { html, css, manifest, assets: [] }
 *
 * Reads JSON from stdin:
 * {
 *   "invitation": { "layoutId": "classic-scroll", "data": { ... }, "layoutConfig": { ... } },
 *   "translations": { ... }
 * }
 */

async function getExportModule(layoutId) {
  switch (layoutId) {
    case 'classic-scroll':
      return await import('../../layouts/classic-scroll/export/index.js');
    case 'editorial-elegance':
      return await import('../../layouts/editorial-elegance/export/index.js');
    default:
      // Fallback to classic-scroll if unknown
      return await import('../../layouts/classic-scroll/export/index.js');
  }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const modeArg = process.argv.find((a) => a.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'html';

  const raw = await readStdin();
  if (!raw) {
    throw new Error('No input provided');
  }
  const payload = JSON.parse(raw);
  const invitation = payload.invitation || {};
  const translations = payload.translations || {};
  const layoutId = invitation.layoutId || 'classic-scroll';

  const layoutExport = await getExportModule(layoutId);
  if (!layoutExport?.generateHTML) throw new Error(`Layout "${layoutId}" does not provide generateHTML`);

  let html = await layoutExport.generateHTML(invitation, translations);

  if (mode === 'bundle') {
    const css = layoutExport.generateCSS ? await layoutExport.generateCSS(invitation) : '';
    const manifest = {
      name: 'Sacred Vows Invitation',
      short_name: 'Invitation',
      start_url: '/',
      scope: '/',
      display: 'standalone',
    };
    const { rewrittenHTML, assets } = await bundleLocalAssets(html);
    html = rewrittenHTML;
    process.stdout.write(JSON.stringify({ html, css, manifest, assets }));
    return;
  }

  process.stdout.write(html);
}

function isCDNUrl(url) {
  // Check if URL is a CDN URL (starts with http/https)
  return url.startsWith('http://') || url.startsWith('https://');
}

function isDefaultAssetPath(pathname) {
  // Check if path is a default asset path
  return pathname.startsWith('/assets/photos/') || 
         pathname.startsWith('/assets/music/') || 
         pathname.startsWith('/layouts/');
}

async function bundleLocalAssets(html) {
  // Collect references like /assets/..., /layouts/..., and CDN URLs
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const https = await import('node:https');
  const http = await import('node:http');

  const contentTypeByExt = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
  };

  const refs = new Set();
  const re = /\b(?:src|href)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const u = m[1];
    // Collect local paths and CDN URLs
    if (u && (u.startsWith('/assets/') || u.startsWith('/layouts/') || isCDNUrl(u))) {
      refs.add(u);
    }
  }

  // Resolve builder public directory relative to THIS file, not process.cwd().
  // This script is invoked from the API process (cwd varies), so we must be deterministic.
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const publicRoot = path.resolve(scriptDir, '../../../public');
  const assets = [];
  let rewrittenHTML = html;

  const rewriteMap = new Map(); // original -> rewritten (keeps query/hash)

  // Helper to fetch from URL
  async function fetchFromUrl(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    });
  }

  for (const u of refs) {
    // Preserve query/hash in HTML rewriting but strip for local filesystem reads.
    const qIndex = u.indexOf('?');
    const hIndex = u.indexOf('#');
    const cut = [qIndex, hIndex].filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? -1;
    const pathname = cut >= 0 ? u.slice(0, cut) : u;
    const suffix = cut >= 0 ? u.slice(cut) : '';

    // Handle CDN URLs: Keep them as-is in published HTML for CDN benefits
    if (isCDNUrl(u)) {
      // CDN URLs are kept as absolute URLs in published HTML
      // No rewriting needed - they'll be served from CDN
      continue;
    }

    // Handle local paths
    if (isDefaultAssetPath(pathname)) {
      const filePath = path.join(publicRoot, pathname); // pathname starts with /
      try {
        const body = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = contentTypeByExt[ext] || 'application/octet-stream';
        const keySuffix = pathname.replace(/^\//, ''); // assets/... or layouts/...
        assets.push({ keySuffix, contentType, bodyBase64: body.toString('base64') });
        rewriteMap.set(u, `./${keySuffix}${suffix}`);
      } catch {
        // File not found locally - this is expected for default assets that are now on CDN
        // Leave reference as-is (it will be a CDN URL from defaults.js)
        // Or if it's still a local path, it will fail gracefully in published site
        process.stderr.write(`Warning: Asset not found locally: ${pathname} (may be on CDN)\n`);
      }
    }
  }

  if (rewriteMap.size > 0) {
    // Rewrite only src/href attribute values (avoid accidental replacements in inline scripts/text).
    rewrittenHTML = rewrittenHTML.replace(/\b(src|href)\s*=\s*"([^"]+)"/g, (match, attr, val) => {
      const rewritten = rewriteMap.get(val);
      if (!rewritten) return match;
      return `${attr}="${rewritten}"`;
    });
  }

  return { rewrittenHTML, assets };
}

main().catch((err) => {
  // Print error to stderr so callers can capture it
  process.stderr.write(String(err?.stack || err?.message || err) + '\n');
  process.exit(1);
});


