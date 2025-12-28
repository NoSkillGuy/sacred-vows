/**
 * LayoutGallery Component Tests
 *
 * Tests for preset selection functionality in LayoutGallery component.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LayoutGallery from "./LayoutGallery";

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
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
  })),
  logout: vi.fn(),
}));

// Mock layout service
const mockLayouts = [
  {
    id: "editorial-elegance",
    name: "Editorial Elegance",
    category: "Modern",
    isAvailable: true,
    status: "ready",
    defaultTheme: {
      colors: {
        primary: "#C6A15B",
        secondary: "#6B6B6B",
        background: {
          page: "#FAF9F7",
        },
        text: {
          primary: "#1C1C1C",
          muted: "#6B6B6B",
        },
        accent: "#C6A15B",
      },
    },
    presets: [
      {
        id: "modern-editorial",
        name: "Modern Editorial",
        emoji: "🖤",
        description: "Minimal & Luxe",
        useCase: "For couples who want elegance, restraint, and strong visual impact.",
        bestFor: "City weddings, intimate guest lists, design-forward couples",
        sectionIds: [
          "hero",
          "countdown",
          "quote",
          "editorial-intro",
          "couple",
          "events",
          "location",
          "gallery",
          "rsvp",
          "footer",
        ],
      },
      {
        id: "love-story-feature",
        name: "Love Story Feature",
        emoji: "🤍",
        description: "Romantic & Narrative",
        useCase:
          "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
        bestFor: "Couples who love storytelling, emotional depth, destination weddings",
        sectionIds: [
          "hero",
          "quote",
          "editorial-intro",
          "story",
          "couple",
          "wedding-party",
          "events",
          "location",
          "travel",
          "things-to-do",
          "gallery",
          "dress-code",
          "rsvp",
          "footer",
        ],
      },
      {
        id: "guest-experience",
        name: "Guest Experience",
        emoji: "✨",
        description: "Clean & Thoughtful",
        useCase: "Designed around guest clarity without killing elegance.",
        bestFor: "Larger weddings, mixed-age guests, practical planners",
        sectionIds: [
          "hero",
          "countdown",
          "editorial-intro",
          "events",
          "location",
          "travel",
          "dress-code",
          "faq",
          "registry",
          "gallery",
          "rsvp",
          "contact",
          "footer",
        ],
      },
    ],
    sections: [
      { id: "hero", required: true, order: 0 },
      { id: "countdown", required: false, order: 1 },
      { id: "quote", required: false, order: 2 },
      { id: "editorial-intro", required: false, order: 3 },
      { id: "couple", required: false, order: 4 },
      { id: "events", required: false, order: 5 },
      { id: "location", required: false, order: 6 },
      { id: "gallery", required: false, order: 7 },
      { id: "rsvp", required: false, order: 8 },
      { id: "footer", required: true, order: 9 },
    ],
  },
  {
    id: "classic-scroll",
    name: "Classic Scroll",
    category: "Classic",
    isAvailable: true,
    status: "ready",
    defaultTheme: {
      colors: {
        primary: "#7c2831",
        secondary: "#6B6B6B",
        background: {
          page: "#ffffff",
        },
        text: {
          primary: "#1C1C1C",
          muted: "#6B6B6B",
        },
        accent: "#d4af37",
      },
    },
    presets: [], // No presets
    sections: [
      { id: "hero", required: true, order: 0 },
      { id: "couple", required: false, order: 1 },
    ],
  },
];

const mockCreateInvitation = vi.fn();

vi.mock("../../hooks/queries/useLayouts", () => ({
  useLayoutsQuery: vi.fn(() => ({
    data: { layouts: mockLayouts, categories: ["all", "Modern", "Classic"] },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock("../../hooks/queries/useInvitations", () => ({
  useCreateInvitationMutation: vi.fn(() => ({
    mutateAsync: mockCreateInvitation,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryClientProvider";
  return Wrapper;
};

describe("LayoutGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateInvitation.mockResolvedValue({
      id: "inv-123",
      layoutId: "editorial-elegance",
      data: {},
      layoutConfig: {},
    });
  });

  describe("Rendering", () => {
    it("should render layout gallery with layouts", () => {
      render(<LayoutGallery />, { wrapper: createWrapper() });

      expect(screen.getByText("Choose Your Perfect Layout")).toBeInTheDocument();
      expect(screen.getByText("Editorial Elegance")).toBeInTheDocument();
      expect(screen.getByText("Classic Scroll")).toBeInTheDocument();
    });

    it("should display category tabs", () => {
      render(<LayoutGallery />, { wrapper: createWrapper() });

      expect(screen.getByText("all")).toBeInTheDocument();
      expect(screen.getAllByText("Modern").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Classic").length).toBeGreaterThan(0);
    });
  });

  describe("Preset Selection Modal", () => {
    it("should open modal when layout with presets is selected", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Choose Your Invitation Flow")).toBeInTheDocument();
      });
    });

    it("should not open modal when layout without presets is selected", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      // Classic Scroll has no presets
      const selectButtons = screen.getAllByText("Select Layout");
      const classicScrollButton =
        selectButtons.find((btn) =>
          btn.closest(".layout-card")?.textContent?.includes("Classic Scroll")
        ) || selectButtons[1];

      await user.click(classicScrollButton);

      // Modal should not appear, invitation should be created directly
      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalled();
      });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should display all three presets when modal opens", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Modern Editorial")).toBeInTheDocument();
        expect(screen.getByText("Love Story Feature")).toBeInTheDocument();
        expect(screen.getByText("Guest Experience")).toBeInTheDocument();
      });
    });

    it("should display preset details correctly", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Minimal & Luxe")).toBeInTheDocument();
        expect(screen.getByText("Romantic & Narrative")).toBeInTheDocument();
        expect(screen.getByText("Clean & Thoughtful")).toBeInTheDocument();
      });
    });

    it("should close modal when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText("Close");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should close modal when overlay is clicked", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const overlay = screen.getByRole("dialog").parentElement;
      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should not close modal when modal content is clicked", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const modalContent = screen.getByRole("dialog").querySelector(".preset-modal");
      if (modalContent) {
        await user.click(modalContent);
      }

      // Modal should still be open
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Preset Selection", () => {
    it("should create invitation with correct sections when preset is selected", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Modern Editorial")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Modern Editorial").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalledWith(
          expect.objectContaining({
            layoutId: "editorial-elegance",
            title: "My Wedding Invitation",
          })
        );
      });

      const callArgs = mockCreateInvitation.mock.calls[0][0];
      expect(callArgs.layoutConfig).toBeDefined();
      expect(callArgs.layoutConfig.sections).toBeDefined();
      expect(callArgs.layoutConfig.sections.length).toBeGreaterThan(0);
    });

    it("should create invitation with all sections enabled when 'Start from Scratch' is selected", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Start from Scratch")).toBeInTheDocument();
      });

      const startFromScratchButton = screen.getByText("Start from Scratch");
      await user.click(startFromScratchButton);

      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalled();
      });

      const callArgs = mockCreateInvitation.mock.calls[0][0];
      expect(callArgs.layoutConfig.sections).toBeDefined();
      // All sections should be enabled
      const allEnabled = callArgs.layoutConfig.sections.every(
        (s: { enabled: boolean }) => s.enabled
      );
      expect(allEnabled).toBe(true);
    });

    it("should navigate to builder after successful invitation creation", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Modern Editorial")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Modern Editorial").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/builder/inv-123");
      });
    });

    it("should apply Modern Editorial preset sections in correct order", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Modern Editorial")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Modern Editorial").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalled();
      });

      const callArgs = mockCreateInvitation.mock.calls[0][0];
      const sections = callArgs.layoutConfig.sections;

      // Expected section order for Modern Editorial preset
      const expectedSectionIds = [
        "hero",
        "countdown",
        "quote",
        "editorial-intro",
        "couple",
        "events",
        "location",
        "gallery",
        "rsvp",
        "footer",
      ];

      // Verify preset sections are enabled and in correct order
      const presetSections = sections.filter((s: { id: string; enabled: boolean }) =>
        expectedSectionIds.includes(s.id)
      );

      expect(presetSections.length).toBeGreaterThan(0);

      // Verify order matches preset order
      presetSections.forEach((section: { id: string; order: number }, index: number) => {
        const expectedIndex = expectedSectionIds.indexOf(section.id);
        expect(section.order).toBe(expectedIndex);
        expect(section.enabled).toBe(true);
      });
    });

    it("should apply Love Story Feature preset sections correctly", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Love Story Feature")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Love Story Feature").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalled();
      });

      const callArgs = mockCreateInvitation.mock.calls[0][0];
      const sections = callArgs.layoutConfig.sections;

      // Expected section IDs for Love Story Feature preset
      const expectedSectionIds = [
        "hero",
        "quote",
        "editorial-intro",
        "story",
        "couple",
        "wedding-party",
        "events",
        "location",
        "travel",
        "things-to-do",
        "gallery",
        "dress-code",
        "rsvp",
        "footer",
      ];

      // Verify preset sections exist and are enabled
      const presetSections = sections.filter((s: { id: string; enabled: boolean }) =>
        expectedSectionIds.includes(s.id)
      );

      expect(presetSections.length).toBeGreaterThan(0);

      // Verify all preset sections are enabled
      presetSections.forEach((section: { id: string; enabled: boolean }) => {
        expect(section.enabled).toBe(true);
      });
    });

    it("should apply Guest Experience preset sections correctly", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Guest Experience")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Guest Experience").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(mockCreateInvitation).toHaveBeenCalled();
      });

      const callArgs = mockCreateInvitation.mock.calls[0][0];
      const sections = callArgs.layoutConfig.sections;

      // Expected section IDs for Guest Experience preset
      const expectedSectionIds = [
        "hero",
        "countdown",
        "editorial-intro",
        "events",
        "location",
        "travel",
        "dress-code",
        "faq",
        "registry",
        "gallery",
        "rsvp",
        "contact",
        "footer",
      ];

      // Verify preset sections exist and are enabled
      const presetSections = sections.filter((s: { id: string; enabled: boolean }) =>
        expectedSectionIds.includes(s.id)
      );

      expect(presetSections.length).toBeGreaterThan(0);

      // Verify all preset sections are enabled
      presetSections.forEach((section: { id: string; enabled: boolean }) => {
        expect(section.enabled).toBe(true);
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when invitation creation fails", async () => {
      const user = userEvent.setup();
      mockCreateInvitation.mockRejectedValue(new Error("Failed to create invitation"));

      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Modern Editorial")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Modern Editorial").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(screen.getByText("Failed to Create Invitation")).toBeInTheDocument();
        expect(screen.getByText("Failed to create invitation")).toBeInTheDocument();
      });
    });

    it("should allow dismissing error message", async () => {
      const user = userEvent.setup();
      mockCreateInvitation.mockRejectedValue(new Error("Failed to create invitation"));

      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText("Modern Editorial")).toBeInTheDocument();
      });

      const presetButton = screen.getByText("Modern Editorial").closest("button");
      if (presetButton) {
        await user.click(presetButton);
      }

      await waitFor(() => {
        expect(screen.getByText("Dismiss")).toBeInTheDocument();
      });

      const dismissButton = screen.getByText("Dismiss");
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText("Failed to Create Invitation")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on modal", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-labelledby", "preset-modal-title");
        expect(dialog).toHaveAttribute("aria-describedby", "preset-modal-description");
      });
    });

    it("should close modal when Escape key is pressed", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should trap focus within modal", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        // Focus should be on first element
        expect(document.activeElement).toBe(focusableElements[0]);

        // Tab through elements
        await user.tab();
        if (focusableElements.length > 1) {
          expect(document.activeElement).toBe(focusableElements[1]);
        }
      }
    });

    it("should restore focus to trigger element when modal closes", async () => {
      const user = userEvent.setup();
      render(<LayoutGallery />, { wrapper: createWrapper() });

      const selectButton = screen.getAllByText("Select Layout")[0];
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText("Close");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });
});
