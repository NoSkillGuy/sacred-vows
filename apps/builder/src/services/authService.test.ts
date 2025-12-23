import { describe, it, expect, beforeEach, vi } from 'vitest';
import { register, login, logout, getCurrentUser, getAuthToken, isAuthenticated, refreshAccessToken, requestPasswordReset, resetPassword } from './authService';
import { setAccessToken, getAccessToken, clearAccessToken, hasAccessToken } from './tokenStorage';
import { server } from '../tests/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock tokenStorage to avoid side effects
vi.mock('./tokenStorage', () => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => null),
  clearAccessToken: vi.fn(),
  hasAccessToken: vi.fn(() => false),
}));

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and store token and user data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        name: 'New User',
      };

      const result = await register(userData);

      expect(result.accessToken).toBeTruthy();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      
      // Verify user was stored in localStorage
      const storedUser = localStorage.getItem('user');
      expect(storedUser).toBeTruthy();
      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser.email).toBe(userData.email);
    });
  });

  describe('login', () => {
    it('should login user and store token and user data', async () => {
      const result = await login('test@example.com', 'password123');

      expect(result.accessToken).toBeTruthy();
      expect(result.user.email).toBe('test@example.com');
      
      // Verify user was stored in localStorage
      const storedUser = localStorage.getItem('user');
      expect(storedUser).toBeTruthy();
      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser.email).toBe('test@example.com');
    });
  });

  describe('logout', () => {
    it('should logout user and clear tokens and user data', async () => {
      // Set up initial state
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));
      vi.mocked(getAccessToken).mockReturnValue('mock-token');

      await logout();

      // Verify token was cleared
      expect(clearAccessToken).toHaveBeenCalled();
      
      // Verify user was removed from localStorage
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage when available', () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = getCurrentUser();

      expect(result).toEqual(user);
    });

    it('should return null when no user in localStorage', () => {
      localStorage.removeItem('user');

      const result = getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when localStorage contains invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json');

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      // Mock fetch to avoid AbortSignal issues with MSW
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ accessToken: 'refreshed-mock-token' }),
      } as Response);

      const newToken = await refreshAccessToken();

      expect(newToken).toBeTruthy();
      expect(newToken).toBe('refreshed-mock-token');
      expect(setAccessToken).toHaveBeenCalledWith(newToken);

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('getAuthToken', () => {
    it('should return access token from tokenStorage', () => {
      vi.mocked(getAccessToken).mockReturnValue('mock-token');

      const token = getAuthToken();

      expect(token).toBe('mock-token');
    });

    it('should return null when no token available', () => {
      vi.mocked(getAccessToken).mockReturnValue(null);

      const token = getAuthToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      vi.mocked(hasAccessToken).mockReturnValue(true);

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      vi.mocked(hasAccessToken).mockReturnValue(false);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const result = await requestPasswordReset('test@example.com');

      expect(result).toBeDefined();
      expect(result.message).toBeTruthy();
    });

    it('should throw error for non-existent email', async () => {
      await expect(requestPasswordReset('notfound@example.com')).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const result = await resetPassword('valid-token', 'NewPassword123!');

      expect(result).toBeDefined();
      expect(result.message).toBeTruthy();
    });

    it('should throw error for invalid token', async () => {
      await expect(resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow();
    });
  });
});

