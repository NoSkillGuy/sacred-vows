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

import type { InvitationData } from "@shared/types/wedding-data";
import type { LayoutExport } from "../../layouts/registry";

async function getExportModule(layoutId: string): Promise<LayoutExport> {
  switch (layoutId) {
    case "classic-scroll":
      return await import("../../layouts/classic-scroll/export/index");
    case "editorial-elegance":
      return await import("../../layouts/editorial-elegance/export/index");
    default:
      // Fallback to classic-scroll if unknown
      return await import("../../layouts/classic-scroll/export/index");
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

interface Payload {
  invitation?: InvitationData;
  translations?: Record<string, unknown>;
}

interface BundleResult {
  html: string;
  css: string;
  manifest: {
    name: string;
    short_name: string;
    start_url: string;
    scope: string;
    display: string;
  };
  assets: unknown[];
}

async function main(): Promise<void> {
  const modeArg = process.argv.find((a) => a.startsWith("--mode="));
  const mode = modeArg ? modeArg.split("=")[1] : "html";

  const raw = await readStdin();
  if (!raw) {
    throw new Error("No input provided");
  }
  const payload: Payload = JSON.parse(raw);
  const invitation = payload.invitation || ({} as InvitationData);
  const translations = payload.translations || {};
  const layoutId = invitation.layoutId || "classic-scroll";

  const layoutExport = await getExportModule(layoutId);
  if (!layoutExport?.generateHTML)
    throw new Error(`Layout "${layoutId}" does not provide generateHTML`);

  let html = await layoutExport.generateHTML(invitation, translations);

  if (mode === "bundle") {
    const css = layoutExport.generateCSS ? await layoutExport.generateCSS(invitation) : "";
    const manifest = {
      name: "Sacred Vows Invitation",
      short_name: "Invitation",
      start_url: "/",
      scope: "/",
      display: "standalone",
    };
    const { rewrittenHTML, assets } = await bundleLocalAssets(html);
    html = rewrittenHTML;
    const bundleResult: BundleResult = { html, css, manifest, assets };
    process.stdout.write(JSON.stringify(bundleResult));
    return;
  }

  process.stdout.write(html);
}

function isCDNUrl(url: string): boolean {
  // Check if URL is a CDN URL (starts with http/https)
  return url.startsWith("http://") || url.startsWith("https://");
}

function isDefaultAssetPath(pathname: string): boolean {
  // Check if path is a default asset path
  return (
    pathname.startsWith("/assets/photos/") ||
    pathname.startsWith("/assets/music/") ||
    pathname.startsWith("/layouts/")
  );
}

interface BundleResult {
  rewrittenHTML: string;
  assets: unknown[];
}

async function bundleLocalAssets(html: string): Promise<BundleResult> {
  // Collect references to CDN URLs and local paths that should be on CDN
  // Note: Default assets are now served from R2/MinIO, not filesystem
  const refs = new Set<string>();
  const re = /\b(?:src|href)\s*=\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const u = m[1];
    // Collect CDN URLs and local paths (which should already be converted to CDN URLs)
    if (u && (isCDNUrl(u) || u.startsWith("/assets/") || u.startsWith("/layouts/"))) {
      refs.add(u);
    }
  }

  const assets: unknown[] = [];
  let rewrittenHTML = html;

  // Note: We no longer read from filesystem. All default assets should be:
  // 1. Already converted to CDN URLs by getLayoutAssetUrl() in defaults.js
  // 2. Served directly from R2/MinIO in published sites
  // 3. Only user-uploaded assets (not default assets) should be bundled

  for (const u of refs) {
    // CDN URLs are kept as-is in published HTML - they'll be served from CDN
    if (isCDNUrl(u)) {
      continue;
    }

    // Local paths starting with /assets/ or /layouts/ should have been converted to CDN URLs
    // If we still see them, it means they weren't converted properly
    if (isDefaultAssetPath(u)) {
      process.stderr.write(
        `Warning: Found local asset path "${u}" in HTML. ` +
          `This should have been converted to a CDN URL. ` +
          `Assets must be served from R2/MinIO, not filesystem.\n`
      );
      // Leave as-is - it will fail at runtime, making the issue visible
      continue;
    }
  }

  return { rewrittenHTML, assets };
}

main().catch((err: unknown) => {
  // Print error to stderr so callers can capture it
  const errorMessage = err instanceof Error ? err.stack || err.message : String(err);
  process.stderr.write(errorMessage + "\n");
  process.exit(1);
});
