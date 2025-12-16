/**
 * JWT Decoder Utility
 * Decodes JWT tokens to extract claims like expiration time
 */

/**
 * Decode JWT token and extract payload
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function decodeJWT(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url-encoded payload
    // Base64url uses - and _ instead of + and /, and no padding
    const payload = parts[1];
    // Replace base64url characters with base64 characters
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    // Decode and parse JSON
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get expiration time from JWT token
 * @param {string} token - JWT token string
 * @returns {number|null} Expiration timestamp in milliseconds, or null if invalid
 */
export function getTokenExpiration(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  // JWT exp claim is in seconds, convert to milliseconds
  return payload.exp * 1000;
}

/**
 * Get time until token expiration
 * @param {string} token - JWT token string
 * @returns {number|null} Milliseconds until expiration, or null if invalid/expired
 */
export function getTimeUntilExpiration(token) {
  const expirationTime = getTokenExpiration(token);
  if (!expirationTime) {
    return null;
  }

  const now = Date.now();
  const timeUntilExpiration = expirationTime - now;
  
  // Return null if already expired
  return timeUntilExpiration > 0 ? timeUntilExpiration : null;
}

/**
 * Check if token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} True if token is expired or invalid
 */
export function isTokenExpired(token) {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration === null;
}

