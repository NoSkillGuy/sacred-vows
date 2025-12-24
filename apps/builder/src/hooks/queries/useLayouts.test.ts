import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useLayoutsQuery,
  useAllLayoutManifestsQuery,
  useLayoutQuery,
  useLayoutManifestQuery,
} from "./useLayouts";

// Mock layoutService
vi.mock("../../services/layoutService", () => ({
  getLayouts: vi.fn(),
  getLayout: vi.fn(),
  getLayoutManifest: vi.fn(),
  getAllLayoutManifests: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestQueryClientProvider";
  return Wrapper;
};

describe("useLayouts hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useLayoutsQuery", () => {
    it("should fetch layouts with options", async () => {
      const layoutService = await import("../../services/layoutService");
      const mockResponse = {
        layouts: [{ id: "classic-scroll", name: "Classic Scroll" }],
        categories: ["all", "classic"],
      };

      vi.mocked(layoutService.getLayouts).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLayoutsQuery({ category: "classic" }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(layoutService.getLayouts).toHaveBeenCalledWith({ category: "classic" });
    });
  });

  describe("useAllLayoutManifestsQuery", () => {
    it("should fetch all layout manifests", async () => {
      const layoutService = await import("../../services/layoutService");
      const mockManifests = [
        { id: "classic-scroll", name: "Classic Scroll", sections: [], themes: [] },
      ];

      vi.mocked(layoutService.getAllLayoutManifests).mockResolvedValue(mockManifests);

      const { result } = renderHook(() => useAllLayoutManifestsQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockManifests);
    });
  });

  describe("useLayoutQuery", () => {
    it("should fetch single layout by ID", async () => {
      const layoutService = await import("../../services/layoutService");
      const mockLayout = { id: "classic-scroll", name: "Classic Scroll" };

      vi.mocked(layoutService.getLayout).mockResolvedValue(mockLayout);

      const { result } = renderHook(() => useLayoutQuery("classic-scroll", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLayout);
    });
  });

  describe("useLayoutManifestQuery", () => {
    it("should fetch layout manifest by ID", async () => {
      const layoutService = await import("../../services/layoutService");
      const mockManifest = {
        id: "classic-scroll",
        name: "Classic Scroll",
        sections: [],
        themes: [],
      };

      vi.mocked(layoutService.getLayoutManifest).mockResolvedValue(mockManifest);

      const { result } = renderHook(() => useLayoutManifestQuery("classic-scroll", true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockManifest);
    });
  });
});
