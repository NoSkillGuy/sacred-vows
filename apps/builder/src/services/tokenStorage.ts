/**
 * Token Storage Service
 * Manages access tokens in memory (not localStorage) for security
 * Access tokens are short-lived and should not persist across browser sessions
 */

import { scheduleTokenRefresh, stopTokenRefresh } from './tokenRefreshScheduler';

let accessToken: string | null = null;

/**
 * Set access token in memory and schedule proactive refresh
 * @param token - Access token to store
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
  
  // Schedule proactive token refresh before expiration
  if (token) {
    scheduleTokenRefresh(token);
  } else {
    // If token is cleared (null), stop the scheduler
    stopTokenRefresh();
  }
}

/**
 * Get access token from memory
 * @returns Access token or null if not set
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Clear access token from memory and stop refresh scheduler
 */
export function clearAccessToken(): void {
  accessToken = null;
  stopTokenRefresh();
}

/**
 * Check if access token exists
 * @returns True if access token exists
 */
export function hasAccessToken(): boolean {
  return accessToken !== null;
}

