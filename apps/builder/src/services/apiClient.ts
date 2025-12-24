/**
 * API Client Service
 * Centralized fetch wrapper with automatic token refresh on 401 errors
 */

import { getAccessToken, clearAccessToken } from "./tokenStorage";
import { generateRequestId } from "../lib/observability";
import { trace } from "@opentelemetry/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

interface RefreshResponse {
  accessToken: string;
}

/**
 * Refresh access token using refresh token from HttpOnly cookie
 * @returns New access token
 */
async function refreshAccessToken(): Promise<string> {
  // If already refreshing, wait for existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies (refresh token)
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({ error: "Refresh failed" }))) as {
          error?: string;
        };
        throw new Error(error.error || "Failed to refresh token");
      }

      const data = (await response.json()) as RefreshResponse;

      if (!data.accessToken) {
        throw new Error("No access token in refresh response");
      }

      // Import dynamically to avoid circular dependency
      const { setAccessToken } = await import("./tokenStorage");
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

interface RequestOptions extends RequestInit {
  body?: BodyInit | null;
  headers?: HeadersInit;
}

/**
 * Make an API request with automatic token refresh on 401 errors
 * @param url - API endpoint URL (can be relative or absolute)
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function apiRequest(url: string, options: RequestOptions = {}): Promise<Response> {
  // Ensure URL is absolute
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  // Generate request ID for correlation
  const requestId = generateRequestId();

  // Get current access token
  const token = getAccessToken();

  // Get current span to add request ID attribute
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.setAttribute("http.request_id", requestId);
  }

  // Prepare headers
  // Don't set Content-Type for FormData - browser will set it with boundary
  // Fetch instrumentation automatically adds traceparent header for trace propagation
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    "X-Request-ID": requestId, // Add request ID header for correlation
    ...options.headers,
  };

  // Make initial request
  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", // Include cookies for refresh token
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Check if this is a token expiry error
    // errorData removed - unused

    // Try to refresh token (unless this is already a refresh request)
    if (!fullUrl.includes("/auth/refresh") && !fullUrl.includes("/auth/logout")) {
      try {
        await refreshAccessToken();

        // Get new token and retry original request (use same request ID)
        const newToken = getAccessToken();
        if (newToken) {
          response = await fetch(fullUrl, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
              "X-Request-ID": requestId, // Preserve request ID on retry
            },
            credentials: "include",
          });
        } else {
          // No token after refresh, redirect to login
          clearAccessToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Session expired. Please login again.");
        }
      } catch (_refreshError) {
        // Refresh failed, clear auth and redirect to login
        clearAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
      }
    }
  }

  return response;
}
