/**
 * JWT Decoder Utility
 * Decodes JWT tokens to extract claims like expiration time
 */

interface JWTPayload {
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token and extract payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url-encoded payload
    // Base64url uses - and _ instead of + and /, and no padding
    const payload = parts[1];
    // Replace base64url characters with base64 characters
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // Decode and parse JSON
    const decoded = JSON.parse(atob(padded)) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Get expiration time from JWT token
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  // JWT exp claim is in seconds, convert to milliseconds
  return payload.exp * 1000;
}

/**
 * Get time until token expiration
 * @param token - JWT token string
 * @returns Milliseconds until expiration, or null if invalid/expired
 */
export function getTimeUntilExpiration(token: string): number | null {
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
 * @param token - JWT token string
 * @returns True if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration === null;
}
