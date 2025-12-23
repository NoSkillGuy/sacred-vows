import { describe, it, expect } from 'vitest';
import { decodeJWT, getTokenExpiration, getTimeUntilExpiration, isTokenExpired } from './jwtDecoder';

describe('jwtDecoder', () => {
  // Helper to create a JWT token
  function createJWT(payload: Record<string, unknown>): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const signature = 'signature';
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  describe('decodeJWT', () => {
    it('should decode valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = createJWT(payload);
      
      const decoded = decodeJWT(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe('123');
      expect(decoded?.email).toBe('test@example.com');
    });

    it('should return null for invalid token format', () => {
      expect(decodeJWT('invalid-token')).toBeNull();
      expect(decodeJWT('only.two.parts')).toBeNull();
      expect(decodeJWT('one')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(decodeJWT('')).toBeNull();
    });

    it('should return null for non-string input', () => {
      // TypeScript should prevent this, but test runtime behavior
      expect(decodeJWT(null as unknown as string)).toBeNull();
      expect(decodeJWT(undefined as unknown as string)).toBeNull();
    });

    it('should handle base64url encoding correctly', () => {
      const payload = { test: 'value-with-special-chars+/=' };
      const token = createJWT(payload);
      
      const decoded = decodeJWT(token);
      expect(decoded?.test).toBe('value-with-special-chars+/=');
    });

    it('should handle tokens with padding', () => {
      const payload = { short: 'x' };
      const token = createJWT(payload);
      
      const decoded = decodeJWT(token);
      expect(decoded?.short).toBe('x');
    });
  });

  describe('getTokenExpiration', () => {
    it('should extract expiration time from token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createJWT({ exp, userId: '123' });
      
      const expiration = getTokenExpiration(token);
      
      expect(expiration).toBe(exp * 1000); // Converted to milliseconds
    });

    it('should return null if token has no exp claim', () => {
      const token = createJWT({ userId: '123' });
      
      const expiration = getTokenExpiration(token);
      
      expect(expiration).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getTokenExpiration('invalid-token')).toBeNull();
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return time until expiration for valid future token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createJWT({ exp });
      
      const timeUntil = getTimeUntilExpiration(token);
      
      expect(timeUntil).toBeGreaterThan(0);
      expect(timeUntil).toBeLessThan(3601000); // Should be close to 1 hour in ms
    });

    it('should return null for expired token', () => {
      const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createJWT({ exp });
      
      const timeUntil = getTimeUntilExpiration(token);
      
      expect(timeUntil).toBeNull();
    });

    it('should return null for token without exp claim', () => {
      const token = createJWT({ userId: '123' });
      
      const timeUntil = getTimeUntilExpiration(token);
      
      expect(timeUntil).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getTimeUntilExpiration('invalid-token')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid future token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createJWT({ exp });
      
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createJWT({ exp });
      
      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const token = createJWT({ userId: '123' });
      
      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });
});

