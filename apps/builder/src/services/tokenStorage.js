/**
 * Token Storage Service
 * Manages access tokens in memory (not localStorage) for security
 * Access tokens are short-lived and should not persist across browser sessions
 */

let accessToken = null;

/**
 * Set access token in memory
 * @param {string} token - Access token to store
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Get access token from memory
 * @returns {string|null} Access token or null if not set
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Clear access token from memory
 */
export function clearAccessToken() {
  accessToken = null;
}

/**
 * Check if access token exists
 * @returns {boolean} True if access token exists
 */
export function hasAccessToken() {
  return accessToken !== null;
}

