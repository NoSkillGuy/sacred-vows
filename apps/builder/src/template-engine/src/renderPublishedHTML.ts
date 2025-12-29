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

import type { InvitationData, LayoutConfig, ThemeConfig } from "@shared/types/wedding-data";

// Export module interface that matches actual export functions
interface ExportModule {
  generateHTML: (
    invitation: InvitationData,
    translations?: Record<string, unknown>
  ) => Promise<string>;
  generateCSS?: (invitation: InvitationData) => Promise<string>;
}

async function getExportModule(layoutId: string): Promise<ExportModule> {
  switch (layoutId) {
    case "classic-scroll":
      return (await import("../../layouts/classic-scroll/export/index")) as ExportModule;
    case "editorial-elegance":
      return (await import("../../layouts/editorial-elegance/export/index")) as ExportModule;
    default:
      // Fallback to classic-scroll if unknown
      return (await import("../../layouts/classic-scroll/export/index")) as ExportModule;
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

/**
 * Get default theme for a layout
 */
function getDefaultThemeForLayout(layoutId: string): ThemeConfig {
  // Default theme values that work for both layouts
  return {
    preset: "default",
    colors: {
      primary: layoutId === "editorial-elegance" ? "#C6A15B" : "#d4af37",
      secondary: layoutId === "editorial-elegance" ? "#6B6B6B" : "#8b6914",
      background: layoutId === "editorial-elegance" ? "#FAF9F7" : "#fff8f0",
      text: layoutId === "editorial-elegance" ? "#1C1C1C" : "#2f2933",
      accent: layoutId === "editorial-elegance" ? "#C6A15B" : "#c27d88",
    },
    fonts: {
      heading: "Playfair Display",
      body: layoutId === "editorial-elegance" ? "Inter" : "Poppins",
      script: "Great Vibes",
    },
  };
}

/**
 * Extract or construct layoutConfig from invitation data
 */
function extractOrConstructLayoutConfig(
  invitation: Partial<InvitationData>,
  data: Record<string, unknown>
): LayoutConfig {
  // First, try to get layoutConfig from invitation object
  let layoutConfig = invitation.layoutConfig as LayoutConfig | undefined;

  // If not in invitation, check if it's nested in data
  if (!layoutConfig && data.layoutConfig) {
    layoutConfig = data.layoutConfig as LayoutConfig;
  }

  // If still missing, construct minimal layoutConfig from data.theme or defaults
  if (!layoutConfig) {
    const theme = data.theme as ThemeConfig | undefined;
    const layoutId = invitation.layoutId || "classic-scroll";

    layoutConfig = {
      sections: [],
      theme: theme || getDefaultThemeForLayout(layoutId),
    };
  }

  return layoutConfig;
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

  // Extract data - should be in invitation.data, but handle cases where it might be missing
  const data = (invitation.data || {}) as Record<string, unknown>;

  // Extract or construct layoutConfig
  const layoutConfig = extractOrConstructLayoutConfig(invitation, data);

  // Construct complete InvitationData structure
  const completeInvitation: InvitationData = {
    id: invitation.id || null,
    layoutId: layoutId,
    data: data as InvitationData["data"],
    layoutConfig: layoutConfig,
    translations: invitation.translations || translations || null,
  };

  const layoutExport = await getExportModule(layoutId);
  if (!layoutExport?.generateHTML)
    throw new Error(`Layout "${layoutId}" does not provide generateHTML`);

  let html = await layoutExport.generateHTML(completeInvitation, translations);

  if (mode === "bundle") {
    const css = layoutExport.generateCSS ? await layoutExport.generateCSS(completeInvitation) : "";
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

interface BundleAssetsResult {
  rewrittenHTML: string;
  assets: unknown[];
}

async function bundleLocalAssets(html: string): Promise<BundleAssetsResult> {
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
  const rewrittenHTML = html;

  // Note: We no longer read from filesystem. All default assets should be:
  // 1. Already converted to CDN URLs by getLayoutAssetUrl() in defaults.js
  // 2. Served directly from R2/MinIO in published sites
  // 3. Only user-uploaded assets (not default assets) should be bundled

  for (const u of Array.from(refs)) {
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

  return { rewrittenHTML, assets } as BundleAssetsResult;
}

main().catch((err: unknown) => {
  // Print error to stderr so callers can capture it
  const errorMessage = err instanceof Error ? err.stack || err.message : String(err);
  process.stderr.write(errorMessage + "\n");
  process.exit(1);
});
