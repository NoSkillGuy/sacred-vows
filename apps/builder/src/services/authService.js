/**
 * Authentication Service
 * Handles user authentication and token management
 */

import { setAccessToken, getAccessToken, clearAccessToken, hasAccessToken } from './tokenStorage';
import { apiRequest } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const USER_KEY = 'user';

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 8000)
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server may be unavailable');
    }
    throw error;
  }
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User and access token
 */
export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Store access token in memory (not localStorage)
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    
    // Store user in localStorage (for display purposes)
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and access token
 */
export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store access token in memory (not localStorage)
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    
    // Store user in localStorage (for display purposes)
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout user
 * Calls the logout endpoint to revoke refresh token, then clears local state
 */
export async function logout() {
  try {
    // Call logout endpoint to revoke refresh token
    // The refresh token is sent automatically via HttpOnly cookie
    const token = getAccessToken();
    if (token) {
      await apiRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    }
  } catch (error) {
    // Even if API call fails, clear local state
    console.error('Logout API error:', error);
  } finally {
    // Clear access token from memory
    clearAccessToken();
    // Clear user from localStorage
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Get current user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get auth token (access token from memory)
 * @returns {string|null} Access token or null
 */
export function getAuthToken() {
  return getAccessToken();
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  return hasAccessToken();
}

/**
 * Refresh access token using refresh token from HttpOnly cookie
 * @returns {Promise<string>} New access token
 */
export async function refreshAccessToken() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies (refresh token)
      headers: {
        'Content-Type': 'application/json',
      },
    }, 8000); // 8 second timeout

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Refresh failed' }));
      throw new Error(error.error || 'Failed to refresh token');
    }

    const data = await response.json();
    
    if (!data.accessToken) {
      throw new Error('No access token in refresh response');
    }

    // Store new access token in memory
    setAccessToken(data.accessToken);

    return data.accessToken;
  } catch (error) {
    // Clear token on refresh failure
    clearAccessToken();
    throw error;
  }
}

/**
 * Get current user from API
 * Uses apiClient which handles token refresh automatically
 * @returns {Promise<Object>} Current user
 */
export async function getCurrentUserFromAPI() {
  try {
    const response = await apiRequest(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    const data = await response.json();
    
    // Update stored user
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Success response
 */
export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send password reset email');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
}

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} password - New password
 * @returns {Promise<Object>} Success response
 */
export async function resetPassword(token, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

