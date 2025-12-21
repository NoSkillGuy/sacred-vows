/**
 * Default Asset Service
 * Handles loading default assets (images, layouts, music) from R2/CDN
 * with caching support for offline access
 */

const CACHE_NAME = 'default-assets-v1';
const CACHE_VERSION = '1.0.0';

// Get CDN base URL from environment variable
const CDN_BASE_URL = import.meta.env.VITE_PUBLIC_ASSETS_CDN_URL || '';
const ENABLE_CACHING = import.meta.env.VITE_ENABLE_ASSET_CACHING !== 'false';

/**
 * Normalize a URL by removing trailing slashes from base and ensuring proper path joining
 * @param {string} base - Base URL (may have trailing slash)
 * @param {string} path - Path to append (should start with /)
 * @returns {string} Normalized URL
 */
function normalizeUrl(base, path) {
  if (!base) return path;
  // Remove trailing slash from base
  const normalizedBase = base.replace(/\/+$/, '');
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Get the full URL for a default asset
 * @param {string} category - Category (e.g., 'couple1', 'couple2', 'layouts', 'music')
 * @param {string} subcategory - Subcategory (e.g., 'couple', 'bride', 'groom', 'family')
 * @param {string} filename - Filename (e.g., '1.jpeg')
 * @returns {string} Full URL to the asset
 */
export function getDefaultAssetUrl(category, subcategory, filename) {
  // If CDN URL is configured, use it
  if (CDN_BASE_URL) {
    if (subcategory) {
      return normalizeUrl(CDN_BASE_URL, `/defaults/${category}/${subcategory}/${filename}`);
    }
    return normalizeUrl(CDN_BASE_URL, `/defaults/${category}/${filename}`);
  }
  
  // Fallback to local path
  if (subcategory) {
    return `/assets/${category}/${subcategory}/${filename}`;
  }
  return `/assets/${category}/${filename}`;
}

/**
 * Get URL for layout preview image
 * @param {string} layoutId - Layout ID (e.g., 'classic-scroll', 'editorial-elegance')
 * @param {string} filename - Preview image filename (default: 'preview.jpg')
 * @returns {string} Full URL to the preview image
 */
export function getLayoutPreviewUrl(layoutId, filename = 'preview.jpg') {
  if (CDN_BASE_URL) {
    return normalizeUrl(CDN_BASE_URL, `/defaults/layouts/${layoutId}/${filename}`);
  }
  return `/layouts/${layoutId}/${filename}`;
}

/**
 * Check if an asset is cached in the browser Cache API
 * @param {string} url - Asset URL
 * @returns {Promise<boolean>} True if cached
 */
export async function isAssetCached(url) {
  if (!ENABLE_CACHING || !('caches' in window)) {
    return false;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    return !!cached;
  } catch (error) {
    console.warn('Cache check failed:', error);
    return false;
  }
}

/**
 * Fetch asset with cache-first strategy
 * @param {string} url - Asset URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Response object
 */
export async function fetchWithCache(url, options = {}) {
  // If caching is disabled, fetch directly
  if (!ENABLE_CACHING || !('caches' in window)) {
    return fetch(url, options);
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Try cache first
    const cached = await cache.match(url);
    if (cached) {
      // Return cached response, but also update cache in background
      fetch(url, options)
        .then(response => {
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
    console.warn('Cache fetch failed, falling back to network:', error);
    // Fallback to direct fetch
    return fetch(url, options);
  }
}

/**
 * Preload default assets for a layout
 * @param {string} layoutId - Layout ID
 * @param {Array<string>} assetPaths - Array of asset paths to preload
 * @returns {Promise<void>}
 */
export async function preloadDefaultAssets(layoutId, assetPaths = []) {
  if (!assetPaths || assetPaths.length === 0) {
    return;
  }

  const preloadPromises = assetPaths.map(path => {
    // Convert asset path to proper URL using getLayoutAssetUrl
    const url = getLayoutAssetUrl(layoutId, path);
    
    // Only preload if we have a valid URL (not a relative path that couldn't be converted)
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))) {
      return Promise.resolve();
    }
    
    return fetchWithCache(url).catch(err => {
      console.warn(`Failed to preload asset: ${url}`, err);
    });
  });

  await Promise.all(preloadPromises);
}

/**
 * Get asset URL for a layout default
 * Handles both old format (/assets/photos/...) and new format (category/subcategory/filename)
 * @param {string} layoutId - Layout ID
 * @param {string} assetPath - Asset path (can be old format or new format)
 * @returns {string} Full URL to the asset
 */
export function getLayoutAssetUrl(layoutId, assetPath) {
  // If it's already a full URL, return as-is
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }

  // If it's a local path starting with /assets/photos/, convert to CDN format
  if (assetPath.startsWith('/assets/photos/')) {
    // Extract category and subcategory from path
    // e.g., /assets/photos/couple2/couple/1.jpeg -> couple2/couple/1.jpeg
    const pathWithoutPrefix = assetPath.replace('/assets/photos/', '');
    const pathParts = pathWithoutPrefix.split('/').filter(p => p.length > 0);
    if (pathParts.length >= 2) {
      const [category, subcategory, ...filenameParts] = pathParts;
      const filename = filenameParts.join('/');
      return getDefaultAssetUrl(category, subcategory, filename);
    } else if (pathParts.length === 1) {
      // Handle case where there's only category, no subcategory
      // e.g., /assets/photos/couple2/1.jpeg
      const [category, ...filenameParts] = pathParts;
      const filename = filenameParts.join('/') || pathParts[0];
      // Try to extract filename from the last part
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.includes('.')) {
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
  if (assetPath.startsWith('/layouts/')) {
    const pathParts = assetPath.replace('/layouts/', '').split('/');
    if (pathParts.length >= 2) {
      const [layoutIdFromPath, filename] = pathParts;
      return getLayoutPreviewUrl(layoutIdFromPath, filename);
    }
  }

  // If it's a local path starting with /assets/music/, convert to CDN format
  if (assetPath.startsWith('/assets/music/')) {
    const filename = assetPath.replace('/assets/music/', '');
    return getDefaultAssetUrl('music', null, filename);
  }

  // Fallback: if CDN is configured and path starts with /, normalize it
  // Otherwise return as-is (might be user-uploaded asset or relative path)
  if (CDN_BASE_URL && assetPath.startsWith('/')) {
    return normalizeUrl(CDN_BASE_URL, assetPath);
  }
  
  return assetPath;
}

/**
 * Clear the asset cache (useful for debugging or forced refresh)
 * @returns {Promise<void>}
 */
export async function clearAssetCache() {
  if (!('caches' in window)) {
    return;
  }

  try {
    const deleted = await caches.delete(CACHE_NAME);
    if (deleted) {
      console.log('Asset cache cleared');
    }
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache stats
 */
export async function getCacheStats() {
  if (!('caches' in window)) {
    return { enabled: false };
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return {
      enabled: true,
      count: keys.length,
      urls: keys.map(req => req.url),
    };
  } catch (error) {
    return { enabled: false, error: error.message };
  }
}

