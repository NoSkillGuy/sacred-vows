/**
 * Authentication Service
 * Handles user authentication and token management
 */

import { setAccessToken, getAccessToken, clearAccessToken, hasAccessToken } from "./tokenStorage";
import { apiRequest } from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const USER_KEY = "user";

export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  message?: string;
  [key: string]: unknown;
}

/**
 * Fetch with timeout
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 8000)
 * @returns Fetch response
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<Response> {
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
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout - server may be unavailable");
    }
    throw error;
  }
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Register new user
 * @param userData - User registration data
 * @returns User and access token
 */
export async function register(userData: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include", // Include cookies for refresh token
    });

    if (!response.ok) {
      const error = (await response.json()) as ErrorResponse;
      throw new Error(error.error || "Registration failed");
    }

    const data = (await response.json()) as AuthResponse;

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
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns User and access token
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies for refresh token
    });

    if (!response.ok) {
      const error = (await response.json()) as ErrorResponse;
      throw new Error(error.error || "Login failed");
    }

    const data = (await response.json()) as AuthResponse;

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
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Logout user
 * Calls the logout endpoint to revoke refresh token, then clears local state
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint to revoke refresh token
    // The refresh token is sent automatically via HttpOnly cookie
    const token = getAccessToken();
    if (token) {
      await apiRequest(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
    }
  } catch (error) {
    // Even if API call fails, clear local state
    console.error("Logout API error:", error);
  } finally {
    // Clear access token from memory
    clearAccessToken();
    // Clear user from localStorage
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Get current user
 * @returns Current user or null
 */
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Get auth token (access token from memory)
 * @returns Access token or null
 */
export function getAuthToken(): string | null {
  return getAccessToken();
}

/**
 * Check if user is authenticated
 * @returns True if authenticated
 */
export function isAuthenticated(): boolean {
  return hasAccessToken();
}

/**
 * Refresh access token using refresh token from HttpOnly cookie
 * @returns New access token
 */
export async function refreshAccessToken(): Promise<string> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include", // Include cookies (refresh token)
        headers: {
          "Content-Type": "application/json",
        },
      },
      8000
    ); // 8 second timeout

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ error: "Refresh failed" }))) as ErrorResponse;
      throw new Error(error.error || "Failed to refresh token");
    }

    const data = (await response.json()) as { accessToken: string };

    if (!data.accessToken) {
      throw new Error("No access token in refresh response");
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
 * @returns Current user
 */
export async function getCurrentUserFromAPI(): Promise<User> {
  try {
    const response = await apiRequest(`${API_BASE_URL}/auth/me`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    const data = (await response.json()) as { user: User };

    // Update stored user
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data.user;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

/**
 * Request password reset
 * @param email - User email
 * @returns Success response
 */
export async function requestPasswordReset(email: string): Promise<SuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ErrorResponse;
      throw new Error(error.error || "Failed to send password reset email");
    }

    const data = (await response.json()) as SuccessResponse;
    return data;
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}

/**
 * Reset password with token
 * @param token - Reset token from email
 * @param password - New password
 * @returns Success response
 */
export async function resetPassword(token: string, password: string): Promise<SuccessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ErrorResponse;
      throw new Error(error.error || "Failed to reset password");
    }

    const data = (await response.json()) as SuccessResponse;
    return data;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Request password change OTP
 * @param email - User email
 * @returns Success response
 */
export async function requestPasswordChangeOTP(email: string): Promise<SuccessResponse> {
  try {
    const response = await apiRequest(`${API_BASE_URL}/auth/password/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ErrorResponse;
      throw new Error(error.error || "Failed to send OTP");
    }

    const data = (await response.json()) as SuccessResponse;
    return data;
  } catch (error) {
    console.error("Password change OTP request error:", error);
    throw error;
  }
}

/**
 * Verify password change OTP and update password
 * @param otp - 6-digit OTP code
 * @param newPassword - New password
 * @returns Success response
 */
export async function verifyPasswordChangeOTP(
  otp: string,
  newPassword: string
): Promise<SuccessResponse> {
  try {
    const response = await apiRequest(`${API_BASE_URL}/auth/password/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp, newPassword }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ErrorResponse;
      throw new Error(error.error || "Failed to verify OTP");
    }

    const data = (await response.json()) as SuccessResponse;
    return data;
  } catch (error) {
    console.error("Password change OTP verification error:", error);
    throw error;
  }
}
