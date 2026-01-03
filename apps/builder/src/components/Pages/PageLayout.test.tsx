import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PageLayout from "./PageLayout";

// Mock isAuthenticated
const mockIsAuthenticated = vi.fn();
vi.mock("../../services/authService", () => ({
  isAuthenticated: () => mockIsAuthenticated(),
}));

describe("PageLayout Logo Navigation", () => {
  beforeEach(() => {
    mockIsAuthenticated.mockClear();
  });

  const renderPageLayout = () => {
    return render(
      <BrowserRouter>
        <PageLayout title="Test Page">Test Content</PageLayout>
      </BrowserRouter>
    );
  };

  it("should link to dashboard when authenticated", () => {
    mockIsAuthenticated.mockReturnValue(true);
    renderPageLayout();

    const logoLink = screen.getByRole("link", { name: /sacred vows/i });
    expect(logoLink).toHaveAttribute("href", "/dashboard");
  });

  it("should link to home when not authenticated", () => {
    mockIsAuthenticated.mockReturnValue(false);
    renderPageLayout();

    const logoLink = screen.getByRole("link", { name: /sacred vows/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("should update link when authentication state changes", () => {
    // First render as unauthenticated
    mockIsAuthenticated.mockReturnValue(false);
    const { rerender } = render(
      <BrowserRouter>
        <PageLayout title="Test Page">Test Content</PageLayout>
      </BrowserRouter>
    );

    let logoLink = screen.getByRole("link", { name: /sacred vows/i });
    expect(logoLink).toHaveAttribute("href", "/");

    // Re-render as authenticated
    mockIsAuthenticated.mockReturnValue(true);
    rerender(
      <BrowserRouter>
        <PageLayout title="Test Page">Test Content</PageLayout>
      </BrowserRouter>
    );

    logoLink = screen.getByRole("link", { name: /sacred vows/i });
    expect(logoLink).toHaveAttribute("href", "/dashboard");
  });
});
