/**
 * LandingPage Integration Tests
 *
 * These tests verify the complete user flow for personalization.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "../LandingPage";

// Mock analytics service
vi.mock("../../../services/analyticsService", () => ({
  trackPageView: vi.fn(),
  trackExperiment: vi.fn(),
  trackSectionViewed: vi.fn(),
  trackCTA: vi.fn(),
}));

const renderLandingPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("LandingPage Personalization Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Only clean up timers if fake timers were used
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  describe("User Flow", () => {
    it("should show modal when user visits page for first time", async () => {
      vi.useFakeTimers();
      renderLandingPage();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should save data to localStorage when user fills form and saves", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderLandingPage();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      // Modal should be visible
      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();

      // Switch to real timers for user interactions
      vi.useRealTimers();

      // Fill form
      await user.type(screen.getByLabelText("Bride's Name"), "Sarah");
      await user.type(screen.getByLabelText("Groom's Name"), "John");
      await user.type(screen.getByLabelText("Wedding Date"), "2025-12-15");
      await user.type(screen.getByLabelText("Venue / Place"), "Grand Hotel");

      // Save
      await user.click(screen.getByText("Save & Preview"));

      // Verify localStorage was updated
      await waitFor(() => {
        const stored = localStorage.getItem("landing-personalization-data");
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.brideName).toBe("Sarah");
        expect(parsed.groomName).toBe("John");
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();
      });
    });

    it("should not show modal when user visits again after saving", () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "2025-12-15",
        venue: "Grand Hotel",
      };
      localStorage.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderLandingPage();

      expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();
    });

    it("should show personalized data in showcase card", async () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "2025-12-15",
        venue: "Grand Hotel",
      };
      localStorage.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderLandingPage();

      await waitFor(() => {
        expect(screen.getByText("Sarah")).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("GRAND HOTEL")).toBeInTheDocument();
      });
    });
  });

  describe("Partial Completion", () => {
    it("should save correctly when user fills only bride name", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderLandingPage();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      // Modal should be visible
      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();

      // Switch to real timers for user interactions
      vi.useRealTimers();

      await user.type(screen.getByLabelText("Bride's Name"), "Sarah");
      await user.click(screen.getByText("Save & Preview"));

      await waitFor(() => {
        const stored = localStorage.getItem("landing-personalization-data");
        expect(stored).toBeTruthy();
        const savedData = JSON.parse(stored!);
        expect(savedData.brideName).toBe("Sarah");
        expect(savedData.groomName).toBe("");
      });
    });

    it("should save correctly when user fills only date", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderLandingPage();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      // Modal should be visible
      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();

      // Switch to real timers for user interactions
      vi.useRealTimers();

      await user.type(screen.getByLabelText("Wedding Date"), "2025-12-15");
      await user.click(screen.getByText("Save & Preview"));

      await waitFor(() => {
        const stored = localStorage.getItem("landing-personalization-data");
        expect(stored).toBeTruthy();
        const savedData = JSON.parse(stored!);
        expect(savedData.weddingDate).toBe("2025-12-15");
      });
    });

    it("should close modal and show defaults when user skips all fields", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderLandingPage();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      // Modal should be visible
      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();

      // Switch to real timers for user interactions
      vi.useRealTimers();

      await user.click(screen.getByText("Skip"));

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();
      });

      // Defaults should be shown
      expect(screen.getByText("Priya")).toBeInTheDocument();
      expect(screen.getByText("Rahul")).toBeInTheDocument();
    });
  });
});
