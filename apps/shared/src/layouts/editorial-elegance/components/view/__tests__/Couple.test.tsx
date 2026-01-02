/**
 * Couple Component Tests
 *
 * Tests for the Couple component that displays bride and groom information
 * with photos and parent details.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Couple from "../Couple";

// Mock the default asset service
vi.mock("../../../../utils/assetService", () => ({
  getDefaultAssetUrl: vi.fn(
    (category, type, filename) => `/default/${category}/${type}/${filename}`
  ),
}));

describe("Couple", () => {
  describe("Rendering", () => {
    it("should render couple section with bride and groom", () => {
      render(
        <Couple
          config={{
            couple: {
              bride: { name: "Emma", image: "/bride.jpg" },
              groom: { name: "James", image: "/groom.jpg" },
            },
          }}
        />
      );

      expect(screen.getByText("The Couple")).toBeInTheDocument();
      expect(screen.getByText("THE BRIDE")).toBeInTheDocument();
      expect(screen.getByText("THE GROOM")).toBeInTheDocument();
      expect(screen.getByText("Emma")).toBeInTheDocument();
      expect(screen.getByText("James")).toBeInTheDocument();
    });

    it("should render bride and groom images with alt text", () => {
      render(
        <Couple
          config={{
            couple: {
              bride: { name: "Emma", image: "/bride.jpg" },
              groom: { name: "James", image: "/groom.jpg" },
            },
          }}
        />
      );

      const brideImage = screen.getByAltText("Emma");
      expect(brideImage).toHaveAttribute("src", "/bride.jpg");

      const groomImage = screen.getByAltText("James");
      expect(groomImage).toHaveAttribute("src", "/groom.jpg");
    });

    it("should render parent information for bride", () => {
      render(
        <Couple
          config={{
            couple: {
              bride: {
                name: "Emma",
                parents: {
                  mother: "Mrs. Jane Smith",
                  father: "Mr. John Smith",
                },
              },
            },
          }}
        />
      );

      expect(screen.getByText("Daughter of")).toBeInTheDocument();
      expect(screen.getByText("Mrs. Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Mr. John Smith")).toBeInTheDocument();
    });

    it("should render parent information for groom", () => {
      render(
        <Couple
          config={{
            couple: {
              groom: {
                name: "James",
                parents: {
                  mother: "Mrs. Mary Johnson",
                  father: "Mr. Robert Johnson",
                },
              },
            },
          }}
        />
      );

      expect(screen.getByText("Son of")).toBeInTheDocument();
      expect(screen.getByText("Mrs. Mary Johnson")).toBeInTheDocument();
      expect(screen.getByText("Mr. Robert Johnson")).toBeInTheDocument();
    });
  });

  describe("Default Values", () => {
    it("should use default values when bride data is missing", () => {
      render(<Couple config={{ couple: {} }} />);

      expect(screen.getByText("Bride")).toBeInTheDocument();
      expect(screen.getByText("Mrs. Geeta Singh")).toBeInTheDocument();
      expect(screen.getByText("Mr. Sanjay Singh")).toBeInTheDocument();
    });

    it("should use default values when groom data is missing", () => {
      render(<Couple config={{ couple: {} }} />);

      expect(screen.getByText("Groom")).toBeInTheDocument();
      expect(screen.getByText("Mrs. Rayapudi Lakshmi")).toBeInTheDocument();
      expect(screen.getByText("Mr. Rayapudi Sathi Raju")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing parent information", () => {
      render(
        <Couple
          config={{
            couple: {
              bride: { name: "Emma" },
              groom: { name: "James" },
            },
          }}
        />
      );

      expect(screen.getByText("Emma")).toBeInTheDocument();
      expect(screen.getByText("James")).toBeInTheDocument();
      // Should still render parent labels
      expect(screen.getByText("Daughter of")).toBeInTheDocument();
      expect(screen.getByText("Son of")).toBeInTheDocument();
    });

    it("should handle partial parent information", () => {
      render(
        <Couple
          config={{
            couple: {
              bride: {
                name: "Emma",
                parents: {
                  mother: "Mrs. Jane Smith",
                  // Missing father
                },
              },
            },
          }}
        />
      );

      expect(screen.getByText("Mrs. Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("Mr. John Smith")).not.toBeInTheDocument();
    });
  });
});
