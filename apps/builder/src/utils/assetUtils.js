/**
 * Extract asset URLs from invitation data
 * Recursively searches through the data structure for asset URLs
 */

/**
 * Extract asset URLs from invitation data
 * @param {Object} data - Invitation data object
 * @returns {string[]} Array of asset URLs
 */
export function extractAssetURLs(data) {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const urls = new Set();
  extractURLsRecursive(data, urls);

  return Array.from(urls).filter(url => isAssetURL(url));
}

/**
 * Recursively extract URLs from any value
 */
function extractURLsRecursive(value, urls) {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === 'string') {
    if (isAssetURL(value)) {
      urls.add(value);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(item => extractURLsRecursive(item, urls));
    return;
  }

  if (typeof value === 'object') {
    Object.values(value).forEach(val => extractURLsRecursive(val, urls));
    return;
  }
}

/**
 * Check if a string is an asset URL
 * Matches patterns like:
 * - /uploads/...
 * - https://storage.googleapis.com/... (signed URLs)
 * - http://localhost:3000/api/assets/... (local dev)
 */
function isAssetURL(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check for /uploads/ pattern (most common)
  if (url.startsWith('/uploads/')) {
    return true;
  }

  // Check for signed URL patterns
  if (url.includes('storage.googleapis.com') && url.includes('X-Goog-Signature=')) {
    return true;
  }

  // Check for local dev asset URLs
  if (url.includes('/api/assets/') || url.includes('/assets/upload')) {
    return true;
  }

  return false;
}

