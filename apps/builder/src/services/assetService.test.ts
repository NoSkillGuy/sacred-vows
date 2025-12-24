import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  uploadImage,
  uploadImages,
  deleteImage,
  getAssets,
  getAssetCountByUrls,
} from "./assetService";

// Mock tokenStorage
vi.mock("./tokenStorage", () => ({
  getAccessToken: vi.fn(() => "mock-token"),
}));

// Mock apiClient
vi.mock("./apiClient", () => ({
  apiRequest: vi.fn(),
}));

describe("assetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("should validate file size before upload", async () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      await expect(uploadImage(largeFile)).rejects.toThrow(/10MB/);
    });

    it("should reject file larger than 10MB", async () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      await expect(uploadImage(largeFile)).rejects.toThrow(/10MB/);
    });

    it("should reject invalid file type", async () => {
      const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });

      await expect(uploadImage(invalidFile)).rejects.toThrow(/Invalid file type/);
    });
  });

  describe("uploadImages", () => {
    it("should validate files before attempting upload", async () => {
      const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });

      // uploadImages uses Promise.allSettled, so invalid files will result in errors
      const results = await uploadImages([invalidFile]);

      expect(results).toHaveLength(1);
      // Should have error due to invalid file type
      expect(results[0]).toHaveProperty("error");
    });
  });

  describe("deleteImage", () => {
    it("should delete an image", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;

      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await deleteImage("/uploads/test.jpg");

      expect(mockApiRequest).toHaveBeenCalledWith("/assets/delete", {
        method: "DELETE",
        body: JSON.stringify({ url: "/uploads/test.jpg" }),
      });
    });
  });

  describe("getAssets", () => {
    it("should fetch all assets", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      const mockAssets = [
        { id: "asset-1", url: "/uploads/test1.jpg" },
        { id: "asset-2", url: "/uploads/test2.jpg" },
      ];

      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ assets: mockAssets }),
      } as Response);

      const result = await getAssets();

      expect(result).toEqual(mockAssets);
      expect(mockApiRequest).toHaveBeenCalledWith("/assets", { method: "GET" });
    });
  });

  describe("getAssetCountByUrls", () => {
    it("should get asset count by URLs", async () => {
      const { apiRequest } = await import("./apiClient");
      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;

      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ count: 2 }),
      } as Response);

      const result = await getAssetCountByUrls(["/uploads/test1.jpg", "/uploads/test2.jpg"]);

      expect(result).toBe(2);
      expect(mockApiRequest).toHaveBeenCalledWith("/assets/count-by-urls", {
        method: "POST",
        body: JSON.stringify({ urls: ["/uploads/test1.jpg", "/uploads/test2.jpg"] }),
      });
    });
  });
});
