/**
 * Contact Component Tests
 *
 * Tests for the Contact component that displays contact information
 * for wedding concierge and event coordinators.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Contact from "../Contact";

describe("Contact", () => {
  describe("Rendering", () => {
    it("should render contact section with title", () => {
      render(
        <Contact
          config={{
            contact: {
              title: "Reach out to our wedding concierge",
            },
          }}
        />
      );

      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Reach out to our wedding concierge")).toBeInTheDocument();
    });

    it("should render contact list with multiple contacts", () => {
      const contacts = [
        {
          name: "Sarah Johnson",
          role: "Wedding Coordinator",
          email: "sarah@example.com",
          phone: "+1-555-0100",
        },
        {
          name: "Michael Chen",
          role: "Event Manager",
          email: "michael@example.com",
          phone: "+1-555-0101",
        },
      ];

      render(<Contact config={{ contact: { contacts } }} />);

      expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
      expect(screen.getByText("Wedding Coordinator")).toBeInTheDocument();
      expect(screen.getByText("Michael Chen")).toBeInTheDocument();
      expect(screen.getByText("Event Manager")).toBeInTheDocument();
    });

    it("should render email and phone links correctly", () => {
      const contacts = [
        {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1-555-0100",
        },
      ];

      render(<Contact config={{ contact: { contacts } }} />);

      const emailLink = screen.getByText("sarah@example.com");
      expect(emailLink).toHaveAttribute("href", "mailto:sarah@example.com");

      const phoneLink = screen.getByText("+1-555-0100");
      expect(phoneLink).toHaveAttribute("href", "tel:+1-555-0100");
    });

    it("should render direct contact info when provided", () => {
      render(
        <Contact
          config={{
            contact: {
              email: "info@wedding.com",
              phone: "+1-555-9999",
            },
          }}
        />
      );

      const emailLink = screen.getByText("info@wedding.com");
      expect(emailLink).toHaveAttribute("href", "mailto:info@wedding.com");

      const phoneLink = screen.getByText("+1-555-9999");
      expect(phoneLink).toHaveAttribute("href", "tel:+1-555-9999");
    });
  });

  describe("Empty States", () => {
    it("should render section even with empty contact list", () => {
      render(<Contact config={{ contact: { contacts: [] } }} />);

      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    it("should handle missing contact fields gracefully", () => {
      const contacts = [
        {
          name: "Sarah Johnson",
          // Missing role, email, phone
        },
      ];

      render(<Contact config={{ contact: { contacts } }} />);

      expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
      expect(screen.queryByText("Wedding Coordinator")).not.toBeInTheDocument();
    });
  });

  describe("Default Values", () => {
    it("should use default title when not provided", () => {
      render(<Contact config={{ contact: {} }} />);

      expect(screen.getByText("Reach out to our wedding concierge")).toBeInTheDocument();
    });
  });
});
