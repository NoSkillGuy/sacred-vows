/**
 * FAQ Component Tests
 *
 * Tests for the FAQ component that displays an accordion-style
 * frequently asked questions section.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQ from "../FAQ";

describe("FAQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should return null when questions array is empty", () => {
      const { container } = render(<FAQ config={{ faq: { questions: [] } }} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render FAQ section with questions", () => {
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
        { question: "What should I wear?", answer: "Cocktail attire." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("What time is the ceremony?")).toBeInTheDocument();
      expect(screen.getByText("What should I wear?")).toBeInTheDocument();
    });

    it("should not render answers initially", () => {
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      expect(screen.queryByText("The ceremony starts at 4 PM.")).not.toBeInTheDocument();
    });
  });

  describe("Accordion Behavior", () => {
    it("should expand question when clicked", async () => {
      const user = userEvent.setup();
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByText("What time is the ceremony?");
      await user.click(questionButton);

      expect(screen.getByText("The ceremony starts at 4 PM.")).toBeInTheDocument();
    });

    it("should collapse question when clicked again", async () => {
      const user = userEvent.setup();
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByText("What time is the ceremony?");
      await user.click(questionButton);
      expect(screen.getByText("The ceremony starts at 4 PM.")).toBeInTheDocument();

      await user.click(questionButton);
      expect(screen.queryByText("The ceremony starts at 4 PM.")).not.toBeInTheDocument();
    });

    it("should only show one answer at a time", async () => {
      const user = userEvent.setup();
      const questions = [
        { question: "Question 1?", answer: "Answer 1" },
        { question: "Question 2?", answer: "Answer 2" },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      const question1Button = screen.getByText("Question 1?");
      const question2Button = screen.getByText("Question 2?");

      await user.click(question1Button);
      expect(screen.getByText("Answer 1")).toBeInTheDocument();
      expect(screen.queryByText("Answer 2")).not.toBeInTheDocument();

      await user.click(question2Button);
      expect(screen.queryByText("Answer 1")).not.toBeInTheDocument();
      expect(screen.getByText("Answer 2")).toBeInTheDocument();
    });

    it("should toggle icon between + and −", async () => {
      const user = userEvent.setup();
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByText("What time is the ceremony?");
      expect(screen.getByText("+")).toBeInTheDocument();

      await user.click(questionButton);
      expect(screen.getByText("−")).toBeInTheDocument();

      await user.click(questionButton);
      expect(screen.getByText("+")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByText("What time is the ceremony?");
      expect(questionButton).toHaveAttribute("type", "button");
      expect(questionButton).toHaveAttribute("aria-expanded", "false");
      expect(questionButton).toHaveAttribute("aria-controls", "faq-answer-0");
      expect(questionButton).toHaveAttribute("aria-label", "Expand: What time is the ceremony?");
    });

    it("should update ARIA attributes when expanded", async () => {
      const user = userEvent.setup();
      const questions = [
        { question: "What time is the ceremony?", answer: "The ceremony starts at 4 PM." },
      ];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByText("What time is the ceremony?");
      await user.click(questionButton);

      expect(questionButton).toHaveAttribute("aria-expanded", "true");
      expect(questionButton).toHaveAttribute("aria-label", "Collapse: What time is the ceremony?");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing question text", () => {
      const questions = [{ question: "", answer: "Answer" }];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByRole("button");
      expect(questionButton).toBeInTheDocument();
    });

    it("should handle missing answer text", async () => {
      const user = userEvent.setup();
      const questions = [{ question: "Question?", answer: "" }];

      render(<FAQ config={{ faq: { questions } }} />);

      const questionButton = screen.getByText("Question?");
      await user.click(questionButton);

      // Should not crash, but answer div should not be visible
      expect(screen.queryByText("Answer")).not.toBeInTheDocument();
    });
  });
});
