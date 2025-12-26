import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarSection from "./SidebarSection";

describe("SidebarSection", () => {
  const mockIcon = <span data-testid="test-icon">Icon</span>;
  const mockTitle = "Test Section";
  const mockContent = <div data-testid="test-content">Section Content</div>;
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Content Rendering", () => {
    it("should render content when section is open and not collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });

    it("should NOT render content when section is closed (even if not collapsed)", () => {
      // This is the critical bug fix: content should only render when isOpen is true
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("should NOT render content when section is collapsed (even if open)", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={true}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });

    it("should NOT render content when section is both closed and collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={true}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });
  });

  describe("Toggle Functionality", () => {
    it("should call onToggle when header button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("should show content after toggling from closed to open", () => {
      const { rerender } = render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();

      // Toggle to open
      rerender(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });

    it("should hide content after toggling from open to closed", () => {
      const { rerender } = render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.getByTestId("test-content")).toBeInTheDocument();

      // Toggle to closed
      rerender(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct aria-expanded attribute when open", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("should have correct aria-expanded attribute when closed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-controls attribute linking to content", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const button = screen.getByRole("button");
      const contentId = button.getAttribute("aria-controls");
      expect(contentId).toBeTruthy();

      // The id is on the wrapper div with class "sidebar-section-content", not the children
      const contentWrapper = document.getElementById(contentId!);
      expect(contentWrapper).toBeInTheDocument();
      expect(contentWrapper).toHaveClass("sidebar-section-content");

      // Verify the content is inside the wrapper
      const content = screen.getByTestId("test-content");
      expect(contentWrapper).toContainElement(content);
    });

    it("should have title attribute when collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={true}
        >
          {mockContent}
        </SidebarSection>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", mockTitle);
    });

    it("should not have title attribute when not collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("title");
    });
  });

  describe("Visual Elements", () => {
    it("should render icon", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render title when not collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });

    it("should not render title when collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={true}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByText(mockTitle)).not.toBeInTheDocument();
    });

    it("should render chevron when not collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      // Chevron is rendered as text "▾" in a span with aria-hidden
      const chevron = screen.getByText("▾");
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveAttribute("aria-hidden", "true");
    });

    it("should not render chevron when collapsed", () => {
      render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={true}
        >
          {mockContent}
        </SidebarSection>
      );

      expect(screen.queryByText("▾")).not.toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("should apply 'open' class when isOpen is true", () => {
      const { container } = render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={true}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const section = container.querySelector(".sidebar-section");
      expect(section).toHaveClass("open");
    });

    it("should not apply 'open' class when isOpen is false", () => {
      const { container } = render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const section = container.querySelector(".sidebar-section");
      expect(section).not.toHaveClass("open");
    });

    it("should apply 'collapsed' class when collapsed is true", () => {
      const { container } = render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={true}
        >
          {mockContent}
        </SidebarSection>
      );

      const section = container.querySelector(".sidebar-section");
      expect(section).toHaveClass("collapsed");
    });

    it("should not apply 'collapsed' class when collapsed is false", () => {
      const { container } = render(
        <SidebarSection
          title={mockTitle}
          icon={mockIcon}
          isOpen={false}
          onToggle={mockOnToggle}
          collapsed={false}
        >
          {mockContent}
        </SidebarSection>
      );

      const section = container.querySelector(".sidebar-section");
      expect(section).not.toHaveClass("collapsed");
    });
  });
});
