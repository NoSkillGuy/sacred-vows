import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  trackPageView,
  trackCTA,
  trackLayoutView,
  trackEvent,
  getRecentEvents,
} from "./analyticsService";
import * as metrics from "../lib/metrics";

// Mock metrics module
vi.mock("../lib/metrics", () => ({
  trackPageView: vi.fn(),
  trackButtonClick: vi.fn(),
  trackLayoutView: vi.fn(),
  trackBuilderAction: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("analyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset window.location mock
    delete (window as any).location;
    (window as any).location = { pathname: "/test" };
  });

  describe("trackPageView", () => {
    it("calls metrics tracking function", () => {
      // Act
      trackPageView({ page: "dashboard" });

      // Assert
      expect(metrics.trackPageView).toHaveBeenCalledWith("dashboard");
    });

    it("extracts page from meta or window.location", () => {
      // Test with page in meta
      trackPageView({ page: "landing" });
      expect(metrics.trackPageView).toHaveBeenCalledWith("landing");

      vi.clearAllMocks();

      // Test without page in meta (should use window.location.pathname)
      trackPageView({});
      expect(metrics.trackPageView).toHaveBeenCalledWith("/test");
    });

    it("maintains backward compatibility with localStorage", () => {
      // Act
      const event = trackPageView({ page: "dashboard" });

      // Assert
      expect(event).toBeDefined();
      expect(event.name).toBe("page_view");
      expect(event.payload.page).toBe("dashboard");

      // Verify event is stored in localStorage
      const events = getRecentEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1].name).toBe("page_view");
    });
  });

  describe("trackCTA", () => {
    it("calls metrics tracking function", () => {
      // Act
      trackCTA("signup-button", { page: "landing" });

      // Assert
      expect(metrics.trackButtonClick).toHaveBeenCalledWith("signup-button", "landing");
    });

    it("extracts page from meta or window.location", () => {
      // Test with page in meta
      trackCTA("btn", { page: "dashboard" });
      expect(metrics.trackButtonClick).toHaveBeenCalledWith("btn", "dashboard");

      vi.clearAllMocks();

      // Test without page in meta
      trackCTA("btn", {});
      expect(metrics.trackButtonClick).toHaveBeenCalledWith("btn", "/test");
    });

    it("maintains backward compatibility", () => {
      const event = trackCTA("test-button", { page: "test" });
      expect(event.name).toBe("cta_click");
      expect(event.payload.label).toBe("test-button");
    });
  });

  describe("trackLayoutView", () => {
    it("calls metrics tracking function", () => {
      // Act
      trackLayoutView("classic-scroll", {});

      // Assert
      expect(metrics.trackLayoutView).toHaveBeenCalledWith("classic-scroll");
    });

    it("maintains backward compatibility", () => {
      const event = trackLayoutView("test-layout", {});
      expect(event.name).toBe("layout_view");
      expect(event.payload.layoutId).toBe("test-layout");
    });
  });

  describe("analyticsService maintains backward compatibility", () => {
    it("still persists events to localStorage", () => {
      // Act
      trackEvent("test_event", { key: "value" });

      // Assert
      const events = getRecentEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1].name).toBe("test_event");
      expect(events[events.length - 1].payload.key).toBe("value");
    });

    it("still sends invitation view events to API", () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      );

      // Act
      trackPageView({ invitationId: "inv-123" });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/analytics/view",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("invitationId"),
        })
      );
    });
  });
});
