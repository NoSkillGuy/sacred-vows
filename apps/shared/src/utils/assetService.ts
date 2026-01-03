/**
 * Asset Service Interface
 *
 * This provides a way for shared layouts to access asset URLs.
 * In the builder, this will be implemented by the builder's defaultAssetService.
 * In the renderer, this can be a simple implementation that returns CDN URLs.
 */

// Get CDN base URL - works in both browser and Node contexts
function getCdnBase(): string {
  // Check window context (browser)
  if (typeof window !== "undefined" && (window as any).import?.meta?.env) {
    return (window as any).import.meta.env.VITE_PUBLIC_ASSETS_CDN_URL || "";
  }
  // Check process.env (Node.js)
  if (typeof process !== "undefined" && process.env) {
    if (process.env.VITE_PUBLIC_ASSETS_CDN_URL) {
      return process.env.VITE_PUBLIC_ASSETS_CDN_URL;
    }
    // Fallback for renderer context - use minio for Docker, localhost for local dev
    // In Docker, use minio service name; otherwise use localhost
    const host =
      process.env.ASSETS_HOST ||
      (process.env.NODE_ENV === "development" ? "minio:9000" : "localhost:9000");
    return `http://${host}/sacred-vows-public-assets-local`;
  }
  // Try import.meta.env for Vite contexts
  try {
    // @ts-ignore - import.meta may not be available in all contexts
    const envUrl = import.meta.env?.VITE_PUBLIC_ASSETS_CDN_URL;
    if (envUrl) return envUrl;
  } catch {
    // Ignore
  }

  // Final fallback for renderer SSR context
  // Use minio in Docker, localhost for local dev
  if (typeof process !== "undefined") {
    const host = process.env.ASSETS_HOST || "localhost:9000";
    return `http://${host}/sacred-vows-public-assets-local`;
  }

  return "";
}

/**
 * Get the full URL for a default asset
 */
export function getDefaultAssetUrl(
  category: string,
  subcategory: string | null,
  filename: string
): string {
  const cdnBase = getCdnBase();
  if (!cdnBase) {
    return "";
  }

  const base = cdnBase.replace(/\/+$/, "");
  if (subcategory) {
    return `${base}/defaults/${category}/${subcategory}/${filename}`;
  }
  return `${base}/defaults/${category}/${filename}`;
}

/**
 * Get layout preview URL
 */
export function getLayoutPreviewUrl(layoutId: string, filename: string = "preview.jpg"): string {
  const cdnBase = getCdnBase();
  if (cdnBase) {
    return `${cdnBase.replace(/\/+$/, "")}/defaults/layouts/${layoutId}/${filename}`;
  }
  return `/defaults/layouts/${layoutId}/${filename}`;
}

/**
 * Get layout asset URL
 */
export function getLayoutAssetUrl(layoutId: string, assetPath: string): string {
  const cdnBase = getCdnBase();
  if (cdnBase) {
    return `${cdnBase.replace(/\/+$/, "")}/defaults/layouts/${layoutId}/${assetPath}`;
  }
  return `/defaults/layouts/${layoutId}/${assetPath}`;
}

/**
 * Convert asset path from builder format (/assets/photos/...) to CDN URL
 * Handles paths like:
 * - /assets/photos/couple1/bride/1.jpeg -> http://cdn/defaults/couple1/bride/1.jpeg
 * - /assets/photos/couple1/couple/11.jpeg -> http://cdn/defaults/couple1/couple/11.jpeg
 */
export function convertAssetPathToUrl(assetPath: string): string {
  if (!assetPath) return "";

  // If it's already a full URL, return as-is
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  // If it's a data URL, return as-is
  if (assetPath.startsWith("data:")) {
    return assetPath;
  }

  // Convert /assets/photos/couple1/bride/1.jpeg to defaults/couple1/bride/1.jpeg
  const assetsPhotosMatch = assetPath.match(/^\/assets\/photos\/(.+)$/);
  if (assetsPhotosMatch) {
    const relativePath = assetsPhotosMatch[1];
    const cdnBase = getCdnBase();
    if (cdnBase) {
      return `${cdnBase.replace(/\/+$/, "")}/defaults/${relativePath}`;
    }
    // Fallback if no CDN base
    return `/defaults/${relativePath}`;
  }

  // If it's already in defaults/ format, just prepend CDN base
  if (assetPath.startsWith("/defaults/") || assetPath.startsWith("defaults/")) {
    const cleanPath = assetPath.replace(/^\/+/, "");
    const cdnBase = getCdnBase();
    if (cdnBase) {
      return `${cdnBase.replace(/\/+$/, "")}/${cleanPath}`;
    }
    return `/${cleanPath}`;
  }

  // If it's a relative path starting with ./, return as-is (already bundled)
  if (assetPath.startsWith("./")) {
    return assetPath;
  }

  // Unknown format, return as-is (might be a custom URL)
  return assetPath;
}
