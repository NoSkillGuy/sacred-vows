/**
 * API Client Service
 * Centralized fetch wrapper with automatic token refresh on 401 errors
 */

import { getAccessToken, clearAccessToken } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh access token using refresh token from HttpOnly cookie
 * @returns {Promise<string>} New access token
 */
async function refreshAccessToken() {
  // If already refreshing, wait for existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies (refresh token)
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Refresh failed' }));
        throw new Error(error.error || 'Failed to refresh token');
      }

      const data = await response.json();
      
      if (!data.accessToken) {
        throw new Error('No access token in refresh response');
      }

      // Import dynamically to avoid circular dependency
      const { setAccessToken } = await import('./tokenStorage');
      setAccessToken(data.accessToken);

      return data.accessToken;
    } catch (error) {
      // Clear token on refresh failure
      clearAccessToken();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Make an API request with automatic token refresh on 401 errors
 * @param {string} url - API endpoint URL (can be relative or absolute)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function apiRequest(url, options = {}) {
  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

  // Get current access token
  const token = getAccessToken();

  // Prepare headers
  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Make initial request
  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for refresh token
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Check if this is a token expiry error
    let errorData;
    try {
      errorData = await response.clone().json();
    } catch {
      errorData = {};
    }

    // Try to refresh token (unless this is already a refresh request)
    if (!fullUrl.includes('/auth/refresh') && !fullUrl.includes('/auth/logout')) {
      try {
        await refreshAccessToken();
        
        // Get new token and retry original request
        const newToken = getAccessToken();
        if (newToken) {
          response = await fetch(fullUrl, {
            ...options,
            headers: {
              ...headers,
              'Authorization': `Bearer ${newToken}`,
            },
            credentials: 'include',
          });
        } else {
          // No token after refresh, redirect to login
          clearAccessToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please login again.');
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        clearAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
    }
  }

  return response;
}

