/**
 * Default Asset Service
 * Handles loading default assets (images, layouts, music) from R2/CDN
 * with caching support for offline access
 */

const CACHE_NAME = "default-assets-v1";
// CACHE_VERSION removed - unused

// Get CDN base URL from environment variable
const CDN_BASE_URL = import.meta.env.VITE_PUBLIC_ASSETS_CDN_URL || "";
const ENABLE_CACHING = import.meta.env.VITE_ENABLE_ASSET_CACHING !== "false";

// Validate CDN configuration at module load
if (!CDN_BASE_URL) {
  console.error(
    "❌ VITE_PUBLIC_ASSETS_CDN_URL is not configured. " +
      "Assets must be served from R2/MinIO. Please set VITE_PUBLIC_ASSETS_CDN_URL in your .env file."
  );
}

interface CacheStats {
  enabled: boolean;
  count?: number;
  urls?: string[];
  error?: string;
}

/**
 * Normalize a URL by removing trailing slashes from base and ensuring proper path joining
 * @param base - Base URL (may have trailing slash)
 * @param path - Path to append (should start with /)
 * @returns Normalized URL
 */
function normalizeUrl(base: string, path: string): string {
  if (!base) return path;
  // Remove trailing slash from base
  const normalizedBase = base.replace(/\/+$/, "");
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Get the full URL for a default asset
 * @param category - Category (e.g., 'couple1', 'couple2', 'layouts', 'music')
 * @param subcategory - Subcategory (e.g., 'couple', 'bride', 'groom', 'family')
 * @param filename - Filename (e.g., '1.jpeg')
 * @returns Full URL to the asset
 */
export function getDefaultAssetUrl(
  category: string,
  subcategory: string | null,
  filename: string
): string {
  // CDN_BASE_URL is required - assets must be served from R2/MinIO
  if (!CDN_BASE_URL) {
    console.error(
      `getDefaultAssetUrl called but VITE_PUBLIC_ASSETS_CDN_URL is not configured. ` +
        `Category: ${category}, Subcategory: ${subcategory}, Filename: ${filename}`
    );
    // Return empty string to fail gracefully rather than breaking the UI
    return "";
  }

  if (subcategory) {
    return normalizeUrl(CDN_BASE_URL, `/defaults/${category}/${subcategory}/${filename}`);
  }
  return normalizeUrl(CDN_BASE_URL, `/defaults/${category}/${filename}`);
}

/**
 * Get URL for layout preview image
 * @param layoutId - Layout ID (e.g., 'classic-scroll', 'editorial-elegance')
 * @param filename - Preview image filename (default: 'preview.jpg')
 * @returns Full URL to the preview image
 */
export function getLayoutPreviewUrl(layoutId: string, filename: string = "preview.jpg"): string {
  // CDN_BASE_URL is required - assets must be served from R2/MinIO
  if (!CDN_BASE_URL) {
    console.error(
      `getLayoutPreviewUrl called but VITE_PUBLIC_ASSETS_CDN_URL is not configured. ` +
        `LayoutId: ${layoutId}, Filename: ${filename}`
    );
    // Return empty string to fail gracefully rather than breaking the UI
    return "";
  }

  return normalizeUrl(CDN_BASE_URL, `/defaults/layouts/${layoutId}/${filename}`);
}

/**
 * Check if an asset is cached in the browser Cache API
 * @param url - Asset URL
 * @returns True if cached
 */
export async function isAssetCached(url: string): Promise<boolean> {
  if (!ENABLE_CACHING || !("caches" in window)) {
    return false;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    return !!cached;
  } catch (error) {
    console.warn("Cache check failed:", error);
    return false;
  }
}

/**
 * Fetch asset with cache-first strategy
 * @param url - Asset URL
 * @param options - Fetch options
 * @returns Response object
 */
export async function fetchWithCache(url: string, options: RequestInit = {}): Promise<Response> {
  // If caching is disabled, fetch directly
  if (!ENABLE_CACHING || !("caches" in window)) {
    return fetch(url, options);
  }

  try {
    const cache = await caches.open(CACHE_NAME);

    // Try cache first
    const cached = await cache.match(url);
    if (cached) {
      // Return cached response, but also update cache in background
      fetch(url, options)
        .then((response) => {
          if (response.ok) {
            cache.put(url, response.clone());
          }
        })
        .catch(() => {
          // Ignore background update errors
        });
      return cached;
    }

    // Cache miss - fetch from network
    const response = await fetch(url, options);

    // Cache successful responses
    if (response.ok) {
      cache.put(url, response.clone());
    }

    return response;
  } catch (error) {
    console.warn("Cache fetch failed, falling back to network:", error);
    // Fallback to direct fetch
    return fetch(url, options);
  }
}

/**
 * Preload default assets for a layout
 * @param layoutId - Layout ID
 * @param assetPaths - Array of asset paths to preload
 */
export async function preloadDefaultAssets(
  layoutId: string,
  assetPaths: string[] = []
): Promise<void> {
  if (!assetPaths || assetPaths.length === 0) {
    return;
  }

  const preloadPromises = assetPaths.map((path) => {
    // Convert asset path to proper URL using getLayoutAssetUrl
    const url = getLayoutAssetUrl(layoutId, path);

    // Only preload if we have a valid URL (not a relative path that couldn't be converted)
    if (
      !url ||
      (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/"))
    ) {
      return Promise.resolve();
    }

    return fetchWithCache(url).catch((err) => {
      console.warn(`Failed to preload asset: ${url}`, err);
    });
  });

  await Promise.all(preloadPromises);
}

/**
 * Get asset URL for a layout default
 * Handles both old format (/assets/photos/...) and new format (category/subcategory/filename)
 * @param layoutId - Layout ID
 * @param assetPath - Asset path (can be old format or new format)
 * @returns Full URL to the asset
 */
export function getLayoutAssetUrl(layoutId: string, assetPath: string): string {
  // If it's already a full URL, return as-is
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  // If it's a local path starting with /assets/photos/, convert to CDN format
  if (assetPath.startsWith("/assets/photos/")) {
    // Extract category and subcategory from path
    // e.g., /assets/photos/couple2/couple/1.jpeg -> couple2/couple/1.jpeg
    const pathWithoutPrefix = assetPath.replace("/assets/photos/", "");
    const pathParts = pathWithoutPrefix.split("/").filter((p) => p.length > 0);
    if (pathParts.length >= 2) {
      const [category, subcategory, ...filenameParts] = pathParts;
      const filename = filenameParts.join("/");
      return getDefaultAssetUrl(category, subcategory, filename);
    } else if (pathParts.length === 1) {
      // Handle case where there's only category, no subcategory
      // e.g., /assets/photos/couple2/1.jpeg
      const [category] = pathParts;
      // Try to extract filename from the last part
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.includes(".")) {
        // Has extension, treat as filename with no subcategory
        return getDefaultAssetUrl(category, null, lastPart);
      }
    }
    // If parsing fails but we have CDN, still try to normalize
    // This handles malformed paths
    if (CDN_BASE_URL) {
      return normalizeUrl(CDN_BASE_URL, assetPath);
    }
  }

  // If it's a local path starting with /layouts/, convert to CDN format
  if (assetPath.startsWith("/layouts/")) {
    const pathParts = assetPath.replace("/layouts/", "").split("/");
    if (pathParts.length >= 2) {
      const [layoutIdFromPath, filename] = pathParts;
      return getLayoutPreviewUrl(layoutIdFromPath, filename);
    }
  }

  // If it's a local path starting with /assets/music/, convert to CDN format
  if (assetPath.startsWith("/assets/music/")) {
    const filename = assetPath.replace("/assets/music/", "");
    return getDefaultAssetUrl("music", null, filename);
  }

  // If CDN is configured and path starts with /, normalize it
  // This handles any remaining absolute paths that should be on CDN
  if (CDN_BASE_URL && assetPath.startsWith("/")) {
    return normalizeUrl(CDN_BASE_URL, assetPath);
  }

  // If CDN is not configured and we have a local path, this is an error
  // User-uploaded assets might be relative paths or full URLs, so we allow those
  if (assetPath.startsWith("/") && !assetPath.startsWith("http")) {
    console.warn(
      `getLayoutAssetUrl: Local path "${assetPath}" found but VITE_PUBLIC_ASSETS_CDN_URL is not configured. ` +
        `Assets must be served from R2/MinIO.`
    );
  }

  return assetPath;
}

/**
 * Clear the asset cache (useful for debugging or forced refresh)
 */
export async function clearAssetCache(): Promise<void> {
  if (!("caches" in window)) {
    return;
  }

  try {
    const deleted = await caches.delete(CACHE_NAME);
    if (deleted) {
      console.log("Asset cache cleared");
    }
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}

/**
 * Get cache statistics
 * @returns Cache stats
 */
export async function getCacheStats(): Promise<CacheStats> {
  if (!("caches" in window)) {
    return { enabled: false };
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return {
      enabled: true,
      count: keys.length,
      urls: keys.map((req) => req.url),
    };
  } catch (error) {
    return { enabled: false, error: (error as Error).message };
  }
}
