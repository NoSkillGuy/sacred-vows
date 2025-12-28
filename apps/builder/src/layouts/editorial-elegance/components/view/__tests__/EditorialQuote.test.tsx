/**
 * EditorialQuote Component Tests
 *
 * Tests for the EditorialQuote component that displays an oversized
 * typography pull quote with attribution.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EditorialQuote from "../EditorialQuote";

describe("EditorialQuote", () => {
  describe("Rendering", () => {
    it("should render quote text", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "Together is our favorite place to be",
            },
          }}
        />
      );

      expect(screen.getByText("Together is our favorite place to be")).toBeInTheDocument();
    });

    it("should render attribution when provided", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "Love is patient",
              attribution: "1 Corinthians 13:4",
            },
          }}
        />
      );

      expect(screen.getByText("— 1 Corinthians 13:4")).toBeInTheDocument();
    });

    it("should use groom's name as default attribution", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "Together is our favorite place to be",
            },
            couple: {
              groom: {
                name: "James",
              },
            },
          }}
        />
      );

      expect(screen.getByText("— James")).toBeInTheDocument();
    });

    it("should replace 'Rumi' with groom's name", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "The minute I heard my first love story",
              attribution: "Rumi",
            },
            couple: {
              groom: {
                name: "James",
              },
            },
          }}
        />
      );

      expect(screen.getByText("— James")).toBeInTheDocument();
      expect(screen.queryByText("— Rumi")).not.toBeInTheDocument();
    });

    it("should replace 'RUMI' (uppercase) with groom's name", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "The minute I heard my first love story",
              attribution: "RUMI",
            },
            couple: {
              groom: {
                name: "James",
              },
            },
          }}
        />
      );

      expect(screen.getByText("— James")).toBeInTheDocument();
      expect(screen.queryByText("— RUMI")).not.toBeInTheDocument();
    });

    it("should use default text when not provided", () => {
      render(<EditorialQuote config={{}} />);

      expect(screen.getByText("Together is our favorite place to be")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty attribution", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "Love is patient",
              attribution: "",
            },
            couple: {
              groom: {
                name: "James",
              },
            },
          }}
        />
      );

      expect(screen.getByText("— James")).toBeInTheDocument();
    });

    it("should preserve custom attribution that is not 'Rumi'", () => {
      render(
        <EditorialQuote
          config={{
            quote: {
              text: "Love is patient",
              attribution: "Bride's Name",
            },
            couple: {
              groom: {
                name: "James",
              },
            },
          }}
        />
      );

      expect(screen.getByText("— Bride's Name")).toBeInTheDocument();
      expect(screen.queryByText("— James")).not.toBeInTheDocument();
    });
  });
});
