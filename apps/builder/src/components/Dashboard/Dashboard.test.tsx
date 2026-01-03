import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./Dashboard";
import { ToastProvider } from "../Toast/ToastProvider";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock authService
vi.mock("../../services/authService", () => ({
  getCurrentUser: vi.fn(() => ({
    id: "1",
    email: "test@example.com",
    name: "Test User",
  })),
  logout: vi.fn(),
}));

// Mock useInvitations hook
const mockInvitations = [
  {
    id: "inv-1",
    userId: "1",
    layoutId: "classic-scroll",
    data: {
      couple: {
        bride: { name: "Sarah", title: "", parents: { mother: "", father: "" }, image: "" },
        groom: { name: "John", title: "", parents: { mother: "", father: "" }, image: "" },
      },
    },
    layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
    status: "draft",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "inv-2",
    userId: "1",
    layoutId: "editorial-elegance",
    data: {
      couple: {
        bride: { name: "Emma", title: "", parents: { mother: "", father: "" }, image: "" },
        groom: { name: "David", title: "", parents: { mother: "", father: "" }, image: "" },
      },
    },
    layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
    status: "published",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "inv-3",
    userId: "1",
    layoutId: "classic-scroll",
    data: {
      couple: {
        bride: { name: "Lisa", title: "", parents: { mother: "", father: "" }, image: "" },
        groom: { name: "Mike", title: "", parents: { mother: "", father: "" }, image: "" },
      },
    },
    layoutConfig: { sections: [], theme: { preset: "default", colors: {}, fonts: {} } },
    status: null, // Should be treated as draft
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

vi.mock("../../hooks/queries/useInvitations", () => ({
  useInvitationsQuery: vi.fn(() => ({
    data: mockInvitations,
    isLoading: false,
    error: null,
  })),
  useDeleteInvitationMutation: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
  useUpdateInvitationMutation: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
}));

describe("Dashboard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockNavigate.mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <Dashboard />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe("Stats Calculation", () => {
    it("should display total invitations count", async () => {
      renderDashboard();

      await waitFor(() => {
        // Look for stats display - find the stat card with "Total Invitations"
        const totalInvitationsText = screen.getByText(/total invitations/i);
        expect(totalInvitationsText).toBeInTheDocument();
        // The count should be in the same stat card
        const statCard = totalInvitationsText.closest(".stat-card");
        expect(statCard).toHaveTextContent("3");
      });
    });

    it("should calculate published count correctly", async () => {
      renderDashboard();

      await waitFor(() => {
        // Should show 1 published invitation - find stat card by looking for the stat-content with "Published"
        const statCards = screen.getAllByText(/published/i);
        // Find the one that's in a stat-card (not invitation-status)
        const publishedStatCard = statCards.find((el) => {
          const statCard = el.closest(".stat-card");
          return statCard !== null && statCard.querySelector(".stat-content") !== null;
        });
        expect(publishedStatCard).toBeDefined();
        const statCard = publishedStatCard!.closest(".stat-card");
        expect(statCard).toHaveTextContent("1");
      });
    });

    it("should calculate draft count correctly (including null status)", async () => {
      renderDashboard();

      await waitFor(() => {
        // Should show 2 drafts (1 with 'draft' status, 1 with null status) - find in stat card
        const draftStatText = screen.getByText(/^Drafts$/i);
        expect(draftStatText).toBeInTheDocument();
        const statCard = draftStatText.closest(".stat-card");
        expect(statCard).toHaveTextContent("2");
      });
    });
  });

  describe("Invitation List", () => {
    it("should render list of invitations", async () => {
      renderDashboard();

      await waitFor(() => {
        // Should show invitation cards
        expect(screen.getByText(/sarah/i)).toBeInTheDocument();
        expect(screen.getByText(/john/i)).toBeInTheDocument();
      });
    });

    it("should show invitation status badges", async () => {
      renderDashboard();

      await waitFor(() => {
        // Find status badges in invitation cards (not stat cards)
        const publishedBadges = screen.getAllByText(/published/i);
        const draftBadges = screen.getAllByText(/draft/i);
        // Should have at least one published badge and one draft badge
        expect(publishedBadges.length).toBeGreaterThan(0);
        expect(draftBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to create new invitation", async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        // The "Choose layout" button should be present
        expect(screen.getByRole("button", { name: /choose layout/i })).toBeInTheDocument();
      });

      // Click the "Choose layout" button which should navigate
      const chooseLayoutButton = screen.getByRole("button", { name: /choose layout/i });
      await user.click(chooseLayoutButton);

      // Should navigate to layouts page - wait for navigation to be called
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/layouts");
      });
    }, 10000);

    it("should navigate to builder when clicking on invitation", async () => {
      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        // Find invitation card by Sarah's name
        expect(screen.getByText(/sarah/i)).toBeInTheDocument();
      });

      // Find the Edit button on Sarah's invitation card specifically
      const sarahText = screen.getByText(/sarah/i);
      const sarahCard = sarahText.closest(".invitation-card");
      expect(sarahCard).toBeInTheDocument();

      // Find the Edit button within this card
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      // Click the first Edit button (which should be for Sarah's invitation, the first one)
      await user.click(editButtons[0]);

      // Should navigate to builder
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/builder/inv-1");
      });
    });

    it("should have logo link that navigates to dashboard", async () => {
      renderDashboard();

      await waitFor(() => {
        // Find the logo link by the "Sacred Vows" text
        const logoLink = screen.getByRole("link", { name: /sacred vows/i });
        expect(logoLink).toBeInTheDocument();
        expect(logoLink).toHaveAttribute("href", "/dashboard");
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state while fetching invitations", async () => {
      // Mock loading state
      const useInvitationsModule = await import("../../hooks/queries/useInvitations");
      vi.mocked(useInvitationsModule.useInvitationsQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useInvitationsModule.useInvitationsQuery>);

      renderDashboard();

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no invitations exist", async () => {
      // Mock empty invitations
      const useInvitationsModule = await import("../../hooks/queries/useInvitations");
      vi.mocked(useInvitationsModule.useInvitationsQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useInvitationsModule.useInvitationsQuery>);

      renderDashboard();

      await waitFor(() => {
        // Should show empty state message or create link
        const createLink = screen.getByRole("link", { name: /create your first invitation/i });
        expect(createLink).toBeInTheDocument();
      });
    });
  });

  describe("User Display", () => {
    it("should display user name", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });
    });
  });
});
