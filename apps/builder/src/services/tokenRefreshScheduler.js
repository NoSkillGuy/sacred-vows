/**
 * Token Refresh Scheduler
 * Proactively refreshes access tokens before they expire
 */

import { getTimeUntilExpiration } from '../utils/jwtDecoder';

// Refresh token 1 minute before expiration (safety margin)
const REFRESH_BUFFER_MS = 60 * 1000; // 1 minute

let refreshTimer = null;
let isRefreshing = false;

/**
 * Schedule token refresh before expiration
 * @param {string} token - Current access token
 */
export function scheduleTokenRefresh(token) {
  // Clear any existing timer
  stopTokenRefresh();

  if (!token) {
    return;
  }

  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (!timeUntilExpiration) {
    // Token is invalid or already expired
    console.warn('Cannot schedule refresh: token is invalid or expired');
    return;
  }

  // Calculate when to refresh (1 minute before expiration)
  const refreshDelay = Math.max(0, timeUntilExpiration - REFRESH_BUFFER_MS);

  // If token expires very soon (less than buffer time), refresh immediately
  if (refreshDelay < 1000) {
    // Refresh immediately if less than 1 second until buffer time
    performTokenRefresh();
    return;
  }

  console.log(`Token refresh scheduled in ${Math.round(refreshDelay / 1000)} seconds`);

  refreshTimer = setTimeout(() => {
    performTokenRefresh();
  }, refreshDelay);
}

/**
 * Perform the actual token refresh
 */
async function performTokenRefresh() {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing) {
    console.log('Token refresh already in progress, skipping');
    return;
  }

  isRefreshing = true;

  try {
    console.log('Proactively refreshing access token...');
    // Import dynamically to avoid circular dependency
    const { refreshAccessToken } = await import('./authService');
    await refreshAccessToken();
    console.log('Token refreshed successfully');
    
    // Get the new token and schedule next refresh
    // Import dynamically to avoid circular dependency
    const { getAccessToken } = await import('./tokenStorage');
    const newToken = getAccessToken();
    
    if (newToken) {
      // Schedule next refresh for the new token
      scheduleTokenRefresh(newToken);
    }
  } catch (error) {
    console.error('Proactive token refresh failed:', error);
    // Don't clear token here - let the existing 401 handler deal with it
    // The scheduler will stop, and reactive refresh will handle the next API call
  } finally {
    isRefreshing = false;
    refreshTimer = null;
  }
}

/**
 * Stop the token refresh scheduler
 */
export function stopTokenRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  // Note: We don't reset isRefreshing here because
  // an in-progress refresh should complete
}

/**
 * Handle page visibility changes
 * When page becomes visible, check if we need to refresh immediately
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // Page became visible, check if we need to refresh
    // Import dynamically to avoid circular dependency
    import('./tokenStorage').then(({ getAccessToken }) => {
      const token = getAccessToken();
      if (token) {
        const timeUntilExpiration = getTimeUntilExpiration(token);
        // If token expires soon (within buffer time), refresh immediately
        if (timeUntilExpiration && timeUntilExpiration <= REFRESH_BUFFER_MS) {
          console.log('Page visible and token expiring soon, refreshing immediately');
          performTokenRefresh();
        } else if (timeUntilExpiration) {
          // Reschedule refresh for the remaining time
          scheduleTokenRefresh(token);
        }
      }
    });
  }
}

// Set up page visibility listener
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

