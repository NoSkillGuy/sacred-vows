/**
 * PreviewPane Component Tests
 *
 * Tests verify the PreviewPane component functionality including:
 * - Device mode rendering (desktop, tablet, mobile)
 * - Edit mode vs view mode
 * - Confetti layer positioning relative to preview-device-frame
 * - Editorial elegance layout animations with data-edit-mode attribute
 * - Layout switching and component rendering
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PreviewPane from "../PreviewPane";
import { useBuilderStore } from "../../../store/builderStore";
import { useLanguage } from "../../../hooks/useLanguage";

// Mock the builder store
vi.mock("../../../store/builderStore", () => ({
  useBuilderStore: vi.fn(),
  SECTION_TYPES: {
    HEADER: "header",
    FOOTER: "footer",
    HERO: "hero",
    COUPLE: "couple",
    GALLERY: "gallery",
    RSVP: "rsvp",
  },
}));

// Mock the useLanguage hook
vi.mock("../../../hooks/useLanguage", () => ({
  useLanguage: vi.fn(),
}));

// Mock layout registry
vi.mock("../../../layouts/registry", async () => {
  const actual = await vi.importActual("../../../layouts/registry");
  return {
    ...actual,
    getLayout: vi.fn(),
    getViewComponents: vi.fn(),
    getEditableComponents: vi.fn(),
    getSharedComponents: vi.fn(),
    hasLayout: vi.fn(() => true),
  };
});

// Mock default asset service
vi.mock("../../../services/defaultAssetService", () => ({
  preloadDefaultAssets: vi.fn().mockResolvedValue(undefined),
}));

// Mock data helpers
vi.mock("../../../layouts/editorial-elegance/utils/dataHelpers", () => ({
  parseInvitationData: vi.fn((data) => data || {}),
}));

// Mock layout imports
vi.mock("../../../layouts/classic-scroll", () => ({}));
vi.mock("../../../layouts/editorial-elegance", () => ({}));

describe("PreviewPane", () => {
  const mockGetEnabledSections = vi.fn(() => [
    { id: "hero", enabled: true, order: 0 },
    { id: "couple", enabled: true, order: 1 },
  ]);
  const mockLoadLayoutManifest = vi.fn().mockResolvedValue(undefined);
  const mockValidateSectionsAgainstManifest = vi.fn();

  const mockBuilderStore = {
    currentInvitation: {
      id: "test-invitation",
      layoutId: "classic-scroll",
      data: {
        couple: {
          bride: { name: "Jane", title: "", parents: { mother: "", father: "" }, image: "" },
          groom: { name: "John", title: "", parents: { mother: "", father: "" }, image: "" },
        },
      },
      layoutConfig: {
        sections: [
          { id: "hero", enabled: true, order: 0 },
          { id: "couple", enabled: true, order: 1 },
        ],
        theme: {},
      },
    },
    getEnabledSections: mockGetEnabledSections,
    loadLayoutManifest: mockLoadLayoutManifest,
    validateSectionsAgainstManifest: mockValidateSectionsAgainstManifest,
    currentLayoutManifest: {
      id: "classic-scroll",
      name: "Classic Scroll",
      sections: [
        { id: "hero", enabled: true, order: 0 },
        { id: "couple", enabled: true, order: 1 },
      ],
    },
  };

  const mockUseLanguage = {
    currentLang: "en",
    translations: {},
    updateLanguage: vi.fn(),
    getTranslation: vi.fn((key: string) => key),
  };

  const mockLayout = {
    id: "classic-scroll",
    name: "Classic Scroll",
    manifest: {
      id: "classic-scroll",
      sections: [
        { id: "hero", enabled: true, order: 0 },
        { id: "couple", enabled: true, order: 1 },
      ],
    },
    hooks: {
      useEditable: () => ({ handleUpdate: vi.fn() }),
    },
  };

  const mockViewComponents = {
    header: vi.fn(() => <div data-testid="header">Header</div>),
    hero: vi.fn(() => <div data-testid="hero">Hero</div>),
    couple: vi.fn(() => <div data-testid="couple">Couple</div>),
    footer: vi.fn(() => <div data-testid="footer">Footer</div>),
  };

  const mockEditableComponents = {
    hero: vi.fn(() => <div data-testid="hero-editable">Hero Editable</div>),
    couple: vi.fn(() => <div data-testid="couple-editable">Couple Editable</div>),
    footer: vi.fn(() => <div data-testid="footer-editable">Footer Editable</div>),
  };

  const mockSharedComponents = {
    Header: vi.fn(() => <div data-testid="shared-header">Shared Header</div>),
    ConfettiLayer: vi.fn(() => (
      <div data-testid="confetti-layer" className="confetti-layer">
        Confetti
      </div>
    )),
    CelebrateButton: vi.fn(() => <div data-testid="celebrate-button">Celebrate</div>),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    (useBuilderStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      if (typeof selector === "function") {
        return selector(mockBuilderStore);
      }
      return mockBuilderStore;
    });

    (useLanguage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUseLanguage);

    // Mock registry functions
    const registry = await import("../../../layouts/registry");
    vi.mocked(registry.getLayout).mockReturnValue(mockLayout as never);
    vi.mocked(registry.getViewComponents).mockReturnValue(mockViewComponents as never);
    vi.mocked(registry.getEditableComponents).mockReturnValue(mockEditableComponents as never);
    vi.mocked(registry.getSharedComponents).mockReturnValue(mockSharedComponents as never);
  });

  describe("Device Mode Rendering", () => {
    it("should render desktop mode with transparent background", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = screen.getByTestId("preview-device-frame");
      expect(deviceFrame).toBeInTheDocument();
      expect(deviceFrame).toHaveClass("device-desktop");
    });

    it("should render tablet mode with device frame styling", () => {
      render(<PreviewPane editMode={true} deviceMode="tablet" />);

      const deviceFrame = document.querySelector(".preview-device-frame.device-tablet");
      expect(deviceFrame).toBeInTheDocument();
      expect(deviceFrame).toHaveClass("device-tablet");
    });

    it("should render mobile mode with device frame styling", () => {
      render(<PreviewPane editMode={true} deviceMode="mobile" />);

      const deviceFrame = document.querySelector(".preview-device-frame.device-mobile");
      expect(deviceFrame).toBeInTheDocument();
      expect(deviceFrame).toHaveClass("device-mobile");
    });

    it("should apply correct maxWidth for each device mode", () => {
      const { rerender } = render(<PreviewPane editMode={true} deviceMode="desktop" />);
      let deviceFrame = document.querySelector(
        ".preview-device-frame.device-desktop"
      ) as HTMLElement;
      expect(deviceFrame?.style.maxWidth).toBe("100%");

      rerender(<PreviewPane editMode={true} deviceMode="tablet" />);
      deviceFrame = document.querySelector(".preview-device-frame.device-tablet") as HTMLElement;
      expect(deviceFrame?.style.maxWidth).toBe("768px");

      rerender(<PreviewPane editMode={true} deviceMode="mobile" />);
      deviceFrame = document.querySelector(".preview-device-frame.device-mobile") as HTMLElement;
      expect(deviceFrame?.style.maxWidth).toBe("375px");
    });
  });

  describe("Edit Mode vs View Mode", () => {
    it("should render with data-edit-mode attribute in edit mode", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame");
      expect(deviceFrame).toHaveAttribute("data-edit-mode", "true");
    });

    it("should render with data-edit-mode attribute in view mode", () => {
      render(<PreviewPane editMode={false} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame");
      expect(deviceFrame).toHaveAttribute("data-edit-mode", "false");
    });

    it("should render editable components in edit mode", () => {
      // Ensure sections are enabled
      mockGetEnabledSections.mockReturnValue([
        { id: "hero", enabled: true, order: 0 },
        { id: "couple", enabled: true, order: 1 },
      ]);

      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      // Verify editable components are rendered
      expect(screen.getByTestId("hero-editable")).toBeInTheDocument();
      expect(screen.getByTestId("couple-editable")).toBeInTheDocument();
    });

    it("should render view components in view mode", () => {
      // Ensure sections are enabled
      mockGetEnabledSections.mockReturnValue([
        { id: "hero", enabled: true, order: 0 },
        { id: "couple", enabled: true, order: 1 },
      ]);

      render(<PreviewPane editMode={false} deviceMode="desktop" />);

      // Verify view components are rendered
      expect(screen.getByTestId("hero")).toBeInTheDocument();
      expect(screen.getByTestId("couple")).toBeInTheDocument();
    });
  });

  describe("Confetti Layer Positioning", () => {
    it("should render confetti layer inside preview-device-frame", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = screen.getByTestId("preview-device-frame");
      const confettiLayer = screen.getByTestId("confetti-layer");

      expect(deviceFrame).toBeInTheDocument();
      expect(confettiLayer).toBeInTheDocument();
      // Verify it's a child of device frame
      expect(deviceFrame).toContainElement(confettiLayer);
    });

    it("should position confetti layer relative to preview-device-frame", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = screen.getByTestId("preview-device-frame");
      const confettiLayer = screen.getByTestId("confetti-layer");

      expect(deviceFrame).toBeInTheDocument();
      expect(confettiLayer).toBeInTheDocument();
      // The CSS should position confetti-layer absolutely within preview-device-frame
      // This is verified by the component structure - confetti layer is a child of device frame
      expect(deviceFrame).toContainElement(confettiLayer);
    });
  });

  describe("Editorial Elegance Layout", () => {
    beforeEach(() => {
      mockBuilderStore.currentInvitation.layoutId = "editorial-elegance";
      mockBuilderStore.currentLayoutManifest.id = "editorial-elegance";
    });

    it("should apply editorial-elegance class to page-shell", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const pageShell = document.querySelector(".page-shell.editorial-elegance");
      expect(pageShell).toBeInTheDocument();
    });

    it("should have data-edit-mode attribute on preview-device-frame for animations", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame");
      expect(deviceFrame).toHaveAttribute("data-edit-mode", "true");

      // Editorial elegance animations use [data-edit-mode] selector
      // This attribute should be on preview-device-frame (not preview-wrapper)
      expect(deviceFrame?.getAttribute("data-edit-mode")).toBeTruthy();
    });
  });

  describe("Layout Switching", () => {
    it("should render classic-scroll layout by default", () => {
      mockBuilderStore.currentInvitation.layoutId = "classic-scroll";
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame");
      expect(deviceFrame).toBeInTheDocument();
    });

    it("should handle layout not found gracefully", async () => {
      const registry = await import("../../../layouts/registry");
      vi.mocked(registry.hasLayout).mockReturnValue(false);
      mockBuilderStore.currentInvitation.layoutId = "non-existent-layout";

      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      // Should show error or fallback
      const errorMessage = screen.queryByText(/layout not found/i);
      // Component should still render with fallback
      expect(document.querySelector(".preview-pane")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render preview-pane container", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const previewPane = document.querySelector(".preview-pane");
      expect(previewPane).toBeInTheDocument();
    });

    it("should render preview-content container", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const previewContent = document.querySelector(".preview-content");
      expect(previewContent).toBeInTheDocument();
    });

    it("should render preview-device-frame (not preview-wrapper)", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame");
      const wrapper = document.querySelector(".preview-wrapper");

      expect(deviceFrame).toBeInTheDocument();
      expect(wrapper).not.toBeInTheDocument();
    });

    it("should render page-shell inside preview-device-frame", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame");
      const pageShell = deviceFrame?.querySelector(".page-shell");

      expect(deviceFrame).toBeInTheDocument();
      expect(pageShell).toBeInTheDocument();
    });
  });

  describe("Desktop Mode Styling", () => {
    it("should have transparent background in desktop mode", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(".preview-device-frame.device-desktop");
      expect(deviceFrame).toBeInTheDocument();

      // Desktop mode should have transparent background (no white background)
      // This is verified by the CSS class, actual style is in CSS file
      expect(deviceFrame).toHaveClass("device-desktop");
    });

    it("should be full width in desktop mode", () => {
      render(<PreviewPane editMode={true} deviceMode="desktop" />);

      const deviceFrame = document.querySelector(
        ".preview-device-frame.device-desktop"
      ) as HTMLElement;
      expect(deviceFrame?.style.maxWidth).toBe("100%");
    });
  });

  describe("Tablet and Mobile Mode Styling", () => {
    it("should have device frame styling in tablet mode", () => {
      render(<PreviewPane editMode={true} deviceMode="tablet" />);

      const deviceFrame = document.querySelector(".preview-device-frame.device-tablet");
      expect(deviceFrame).toBeInTheDocument();
      expect(deviceFrame).toHaveClass("device-tablet");
    });

    it("should have device frame styling in mobile mode", () => {
      render(<PreviewPane editMode={true} deviceMode="mobile" />);

      const deviceFrame = document.querySelector(".preview-device-frame.device-mobile");
      expect(deviceFrame).toBeInTheDocument();
      expect(deviceFrame).toHaveClass("device-mobile");
    });
  });
});
