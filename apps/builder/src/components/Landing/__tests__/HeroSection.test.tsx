/**
 * HeroSection Personalization Tests
 *
 * These tests verify the HeroSection component's personalization functionality.
 * To run these tests, a testing framework (Jest + React Testing Library) needs to be set up.
 *
 * Test Framework Setup Required:
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - @testing-library/user-event
 * - jest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import HeroSection from "../HeroSection";
import * as authService from "../../../services/authService";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock analytics service
vi.mock("../../../services/analyticsService", () => ({
  trackCTA: vi.fn(),
}));

// Mock authService
vi.mock("../../../services/authService", () => ({
  logout: vi.fn(),
}));

const renderHeroSection = (props = {}) => {
  return render(
    <BrowserRouter>
      <HeroSection onSectionView={vi.fn()} {...props} />
    </BrowserRouter>
  );
};

describe("HeroSection Personalization", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    // Only clean up timers if fake timers were used
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
    vi.clearAllMocks();
  });

  describe("Personalization Data Loading", () => {
    it("should read from localStorage on mount", () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "2025-12-15",
        venue: "Grand Hotel",
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("landing-personalization-data");
    });

    it("should use personalized data in showcase card when available", async () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "2025-12-15",
        venue: "Grand Hotel",
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      // Modal should not be visible when data exists
      expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();

      // Check showcase card shows personalized data
      await waitFor(() => {
        const sarahElements = screen.getAllByText("Sarah");
        expect(sarahElements.length).toBeGreaterThan(0);
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("GRAND HOTEL")).toBeInTheDocument();
      });
    });

    it("should fall back to default values when no data exists", () => {
      renderHeroSection();

      expect(screen.getByText("Priya")).toBeInTheDocument();
      expect(screen.getByText("Rahul")).toBeInTheDocument();
      expect(screen.getByText("December 15, 2025")).toBeInTheDocument();
      expect(screen.getByText("The Grand Palace, Mumbai")).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format date correctly in UPPERCASE format", async () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "2025-12-15",
        venue: "Grand Hotel",
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      // Modal should not be visible when data exists
      expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();

      await waitFor(() => {
        // Date should be formatted as "DECEMBER 15, 2025" - check that at least one exists
        const dateElements = screen.getAllByText(/DECEMBER 15, 2025/i);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it("should handle invalid dates gracefully", () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "invalid-date",
        venue: "Grand Hotel",
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      // Should fall back to default date
      expect(screen.getByText("December 15, 2025")).toBeInTheDocument();
    });

    it("should handle missing date field", () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        venue: "Grand Hotel",
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      // Should use default date
      expect(screen.getByText("December 15, 2025")).toBeInTheDocument();
    });
  });

  describe("Modal Integration", () => {
    it("should show modal on first visit (no localStorage data)", async () => {
      vi.useFakeTimers();
      renderHeroSection();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should not show modal if data exists", () => {
      const personalizationData = {
        brideName: "Sarah",
        groomName: "John",
        weddingDate: "2025-12-15",
        venue: "Grand Hotel",
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();
    });

    it("should update showcase card after modal save", async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderHeroSection();

      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });

      // Modal should be visible
      expect(screen.getByText("Personalize Your Preview")).toBeInTheDocument();

      // Switch to real timers for user interactions
      vi.useRealTimers();

      // Fill form and save
      await user.type(screen.getByLabelText("Bride's Name"), "Sarah");
      await user.type(screen.getByLabelText("Groom's Name"), "John");
      await user.type(screen.getByLabelText("Wedding Date"), "2025-12-15");
      await user.type(screen.getByLabelText("Venue / Place"), "Grand Hotel");

      await user.click(screen.getByText("Save & Preview"));

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText("Personalize Your Preview")).not.toBeInTheDocument();
      });

      // Showcase card should update
      await waitFor(() => {
        expect(screen.getByText("Sarah")).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
      });
    });
  });

  describe("Partial Data Handling", () => {
    it("should handle partial personalization data", () => {
      const personalizationData = {
        brideName: "Sarah",
        // Missing other fields
      };
      localStorageMock.setItem("landing-personalization-data", JSON.stringify(personalizationData));

      renderHeroSection();

      expect(screen.getByText("Sarah")).toBeInTheDocument();
      // Should use defaults for missing fields
      expect(screen.getByText("Rahul")).toBeInTheDocument();
      expect(screen.getByText("December 15, 2025")).toBeInTheDocument();
    });
  });
});

describe("HeroSection - Authenticated UI", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    localStorageMock.clear();
    mockNavigate.mockClear();
    vi.mocked(authService.logout).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Conditional Rendering", () => {
    it("should show authenticated UI when user is logged in", () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      expect(screen.getByText("Create New Invitation")).toBeInTheDocument();
      expect(screen.getByText("My Invitations")).toBeInTheDocument();
      expect(screen.getByText("TU")).toBeInTheDocument(); // User initials
    });

    it("should show unauthenticated UI when user is not logged in", () => {
      renderHeroSection({
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
      });

      expect(screen.getByText("Start Free")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.queryByText("Create New Invitation")).not.toBeInTheDocument();
      expect(screen.queryByText("My Invitations")).not.toBeInTheDocument();
    });

    it("should show correct user initials in avatar", () => {
      const mockUser = { id: "1", email: "test@example.com", name: "John Doe" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should show '?' when user has no name", () => {
      const mockUser = { id: "1", email: "test@example.com", name: undefined };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("should truncate initials for long names", () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Very Long Name That Should Be Truncated",
      };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      // Should show first 2 initials only
      expect(screen.getByText("VL")).toBeInTheDocument();
    });

    it("should show authenticated UI in mobile menu when logged in", () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      // Mobile menu items should be present
      const mobileButtons = screen.getAllByText("Create New Invitation");
      expect(mobileButtons.length).toBeGreaterThan(0);

      const mobileMyInvitations = screen.getAllByText("My Invitations");
      expect(mobileMyInvitations.length).toBeGreaterThan(0);
    });
  });

  describe("User Interactions", () => {
    it("should open dropdown when avatar is clicked", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      const avatar = screen.getByText("TU");
      await user.click(avatar);

      // Dropdown should be visible
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("should close dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      // Open dropdown
      const avatar = screen.getByText("TU");
      await user.click(avatar);

      // Verify dropdown is open
      expect(screen.getByText("Test User")).toBeInTheDocument();

      // Click outside (on the hero title)
      const heroTitle = screen.getByText(/Your Love Story Deserves/i);
      await user.click(heroTitle);

      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByText("Test User")).not.toBeInTheDocument();
      });
    });

    it("should navigate to profile when Profile link is clicked", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      // Open dropdown
      const avatar = screen.getByText("TU");
      await user.click(avatar);

      // Click Profile link
      const profileLink = screen.getByText("Profile");
      await user.click(profileLink);

      // Should navigate to profile
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    it("should call logout when Sign Out is clicked", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      // Open dropdown
      const avatar = screen.getByText("TU");
      await user.click(avatar);

      // Click Sign Out
      const signOutButton = screen.getByText("Sign Out");
      await user.click(signOutButton);

      // Should call logout
      await waitFor(() => {
        expect(vi.mocked(authService.logout)).toHaveBeenCalledTimes(1);
      });
    });

    it("should navigate to layouts when Create New Invitation is clicked", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      const createButton = screen.getAllByText("Create New Invitation")[0];
      await user.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith("/layouts");
    });

    it("should navigate to dashboard when My Invitations is clicked", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: true,
      });

      const myInvitationsButton = screen.getAllByText("My Invitations")[0];
      await user.click(myInvitationsButton);

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Edge Cases", () => {
    it("should handle auth state changes during component lifecycle", () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      const { rerender } = renderHeroSection({
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
      });

      // Initially unauthenticated
      expect(screen.getByText("Start Free")).toBeInTheDocument();

      // Change to authenticated
      rerender(
        <BrowserRouter>
          <HeroSection
            onSectionView={vi.fn()}
            user={mockUser}
            isAuthenticated={true}
            isAuthChecked={true}
          />
        </BrowserRouter>
      );

      // Should show authenticated UI
      expect(screen.getByText("Create New Invitation")).toBeInTheDocument();
      expect(screen.queryByText("Start Free")).not.toBeInTheDocument();
    });

    it("should not show authenticated UI when auth check is not complete", () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      renderHeroSection({
        user: mockUser,
        isAuthenticated: true,
        isAuthChecked: false, // Auth check not complete
      });

      // Should show unauthenticated UI until check is complete
      expect(screen.getByText("Start Free")).toBeInTheDocument();
      expect(screen.queryByText("Create New Invitation")).not.toBeInTheDocument();
    });
  });
});
