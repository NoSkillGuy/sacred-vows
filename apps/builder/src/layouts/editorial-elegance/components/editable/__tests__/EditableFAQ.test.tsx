/**
 * EditableFAQ Component Tests
 *
 * Tests for the EditableFAQ component that provides WYSIWYG editing
 * for FAQ questions and answers.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableFAQ from "../EditableFAQ";

describe("EditableFAQ", () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render FAQ section", () => {
      render(<EditableFAQ config={{ faq: { questions: [] } }} onUpdate={mockOnUpdate} />);

      expect(screen.getByText("FAQ")).toBeInTheDocument();
    });

    it("should render existing questions", () => {
      const questions = [{ question: "What time is the ceremony?", answer: "4 PM" }];

      render(<EditableFAQ config={{ faq: { questions } }} onUpdate={mockOnUpdate} />);

      expect(screen.getByText("What time is the ceremony?")).toBeInTheDocument();
    });
  });

  describe("Adding Questions", () => {
    it("should add a new question when Add Question button is clicked", async () => {
      const user = userEvent.setup();
      render(<EditableFAQ config={{ faq: { questions: [] } }} onUpdate={mockOnUpdate} />);

      const addButton = screen.getByText("+ Add Question");
      await user.click(addButton);

      expect(mockOnUpdate).toHaveBeenCalledWith("faq.questions", [{ question: "", answer: "" }]);
    });
  });

  describe("Deleting Questions", () => {
    it("should delete a question when Delete button is clicked", async () => {
      const user = userEvent.setup();
      const questions = [
        { question: "Question 1?", answer: "Answer 1" },
        { question: "Question 2?", answer: "Answer 2" },
      ];

      const { container } = render(
        <EditableFAQ config={{ faq: { questions } }} onUpdate={mockOnUpdate} />
      );

      // Expand first question to show delete button
      // Find the button by its role and text, or by class
      const questionButtons = container.querySelectorAll("button.ee-faq-question");
      expect(questionButtons.length).toBeGreaterThan(0);
      const questionButton = questionButtons[0];
      fireEvent.click(questionButton);

      // Wait for the answer section to appear
      await waitFor(() => {
        const answerSection = container.querySelector(".ee-faq-answer");
        expect(answerSection).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      expect(mockOnUpdate).toHaveBeenCalledWith("faq.questions", [
        { question: "Question 2?", answer: "Answer 2" },
      ]);
    });
  });

  describe("Accordion Behavior", () => {
    it("should expand question when clicked", async () => {
      const user = userEvent.setup();
      const questions = [{ question: "What time is the ceremony?", answer: "4 PM" }];

      const { container } = render(
        <EditableFAQ config={{ faq: { questions } }} onUpdate={mockOnUpdate} />
      );

      // Initially, the toggle should show "+"
      const toggle = screen.getByText("+");
      expect(toggle).toBeInTheDocument();

      // Find the button element directly
      const questionButtons = container.querySelectorAll("button.ee-faq-question");
      expect(questionButtons.length).toBeGreaterThan(0);
      const questionButton = questionButtons[0];
      fireEvent.click(questionButton);

      // Wait for the toggle to change to "−" and answer section to appear
      await waitFor(
        () => {
          // Toggle should change to "−"
          expect(screen.getByText("−")).toBeInTheDocument();
          // Answer section should appear
          const answerSection = container.querySelector(".ee-faq-answer");
          expect(answerSection).toBeInTheDocument();
          // The answer text should be in the answer section
          expect(answerSection?.textContent).toContain("4 PM");
        },
        { timeout: 1000 }
      );
    });
  });
});
