import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateSubdomain,
  publishInvitation,
  listVersions,
  rollbackToVersion,
} from "./publishService";

// Mock apiClient to avoid token refresh side effects
vi.mock("./apiClient", async () => {
  const actual = await vi.importActual("./apiClient");
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

describe("publishService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateSubdomain", () => {
    it("should validate subdomain successfully with correct response structure", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockResponse = {
        available: true,
        normalizedSubdomain: "test-subdomain",
        reason: "available",
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await validateSubdomain("invitation-123", "test-subdomain");

      expect(result).toEqual(mockResponse);
      expect(result.available).toBe(true);
      expect(result.normalizedSubdomain).toBe("test-subdomain");
    });

    it("should handle validation failure with error response", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockErrorResponse = { error: "Subdomain already taken" };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(validateSubdomain("invitation-123", "taken-subdomain")).rejects.toThrow(
        "Subdomain already taken"
      );
    });

    it("should throw error for invalid response structure (missing available)", async () => {
      const { apiRequest } = await import("./apiClient");
      const invalidResponse = {
        normalizedSubdomain: "test",
        // missing 'available' field
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => invalidResponse,
      } as Response);

      await expect(validateSubdomain("invitation-123", "test")).rejects.toThrow(
        "Invalid response from validation service"
      );
    });

    it("should throw error for invalid response structure (missing normalizedSubdomain)", async () => {
      const { apiRequest } = await import("./apiClient");
      const invalidResponse = {
        available: true,
        // missing 'normalizedSubdomain' field
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => invalidResponse,
      } as Response);

      await expect(validateSubdomain("invitation-123", "test")).rejects.toThrow(
        "Invalid response from validation service"
      );
    });

    it("should throw error for invalid response structure (available is not boolean)", async () => {
      const { apiRequest } = await import("./apiClient");
      const invalidResponse = {
        available: "yes", // should be boolean
        normalizedSubdomain: "test",
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => invalidResponse,
      } as Response);

      await expect(validateSubdomain("invitation-123", "test")).rejects.toThrow(
        "Invalid response from validation service"
      );
    });

    it("should handle network errors gracefully", async () => {
      const { apiRequest } = await import("./apiClient");
      const networkError = new Error("Network error");

      vi.mocked(apiRequest).mockRejectedValue(networkError);

      await expect(validateSubdomain("invitation-123", "test")).rejects.toThrow("Network error");
    });

    it("should handle JSON parse errors gracefully", async () => {
      const { apiRequest } = await import("./apiClient");

      vi.mocked(apiRequest).mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as Response);

      await expect(validateSubdomain("invitation-123", "test")).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should handle response with reason field", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockResponse = {
        available: false,
        normalizedSubdomain: "test-subdomain",
        reason: "already_taken",
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await validateSubdomain("invitation-123", "test-subdomain");

      expect(result).toEqual(mockResponse);
      expect(result.available).toBe(false);
      expect(result.reason).toBe("already_taken");
    });
  });

  describe("publishInvitation", () => {
    it("should publish invitation successfully", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockResponse = {
        subdomain: "test-subdomain",
        url: "http://test-subdomain.localhost:3000",
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await publishInvitation("invitation-123", "test-subdomain");

      expect(result).toEqual(mockResponse);
      expect(result.subdomain).toBe("test-subdomain");
    });

    it("should handle publish failure", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockErrorResponse = { error: "Publish failed" };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(publishInvitation("invitation-123", "test-subdomain")).rejects.toThrow(
        "Publish failed"
      );
    });
  });

  describe("listVersions", () => {
    it("should list versions successfully", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockResponse = {
        versions: [
          { version: "1", createdAt: "2024-01-01T00:00:00Z" },
          { version: "2", createdAt: "2024-01-02T00:00:00Z" },
        ],
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await listVersions("test-subdomain");

      expect(result).toEqual(mockResponse);
      expect(result.versions).toHaveLength(2);
    });

    it("should handle list versions failure", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockErrorResponse = { error: "Failed to list versions" };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(listVersions("test-subdomain")).rejects.toThrow("Failed to list versions");
    });
  });

  describe("rollbackToVersion", () => {
    it("should rollback to version successfully", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockResponse = {
        success: true,
        message: "Rolled back to version 1",
      };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await rollbackToVersion("test-subdomain", "1");

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });

    it("should handle rollback failure", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockErrorResponse = { error: "Rollback failed" };

      vi.mocked(apiRequest).mockResolvedValue({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(rollbackToVersion("test-subdomain", "1")).rejects.toThrow("Rollback failed");
    });
  });
});
