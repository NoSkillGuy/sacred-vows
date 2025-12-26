/**
 * EditableDate Component Tests
 *
 * Tests for the EditableDate component that provides inline editable date input
 * with native HTML5 date picker functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableDate from "../EditableDate";

describe("EditableDate", () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render placeholder when no value is provided", () => {
      render(
        <EditableDate
          value=""
          onUpdate={mockOnUpdate}
          path="events.events.0.date"
          placeholder="Click to set date..."
        />
      );

      expect(screen.getByText("Click to set date...")).toBeInTheDocument();
    });

    it("should render formatted date when valid value is provided", () => {
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      // formatEventDate formats dates as "DECEMBER 25, 2025"
      expect(screen.getByText(/DECEMBER 25, 2025/i)).toBeInTheDocument();
    });

    it("should render placeholder for invalid date", () => {
      render(
        <EditableDate
          value="invalid-date"
          onUpdate={mockOnUpdate}
          path="events.events.0.date"
          placeholder="Click to set date..."
        />
      );

      expect(screen.getByText("Click to set date...")).toBeInTheDocument();
    });
  });

  describe("Click to Edit", () => {
    it("should switch to input mode when clicked", async () => {
      const user = userEvent.setup();
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      await waitFor(() => {
        const input = screen.getByDisplayValue("2025-12-25");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("type", "date");
      });
    });

    it("should focus input when entering edit mode", async () => {
      const user = userEvent.setup();
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      await waitFor(() => {
        const input = screen.getByDisplayValue("2025-12-25");
        expect(input).toHaveFocus();
      });
    });
  });

  describe("Date Picker Interaction", () => {
    it("should call showPicker if available when entering edit mode", async () => {
      const user = userEvent.setup();
      const mockShowPicker = vi.fn();

      // Mock showPicker on HTMLInputElement
      HTMLInputElement.prototype.showPicker = mockShowPicker;

      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      await waitFor(() => {
        expect(mockShowPicker).toHaveBeenCalled();
      });

      // Cleanup
      delete (HTMLInputElement.prototype as { showPicker?: () => void }).showPicker;
    });

    it("should handle browsers without showPicker gracefully", async () => {
      const user = userEvent.setup();

      // Ensure showPicker doesn't exist
      delete (HTMLInputElement.prototype as { showPicker?: () => void }).showPicker;

      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      // Should not throw error
      await waitFor(() => {
        const input = screen.getByDisplayValue("2025-12-25");
        expect(input).toBeInTheDocument();
      });
    });
  });

  describe("Date Validation", () => {
    it("should update value when valid date is entered", async () => {
      const user = userEvent.setup();
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      const input = await screen.findByDisplayValue("2025-12-25");
      await user.clear(input);
      await user.type(input, "2025-12-26");
      await user.tab(); // Blur to trigger update

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith("events.events.0.date", "2025-12-26");
      });
    });

    it("should not update if value hasn't changed", async () => {
      const user = userEvent.setup();
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      const input = await screen.findByDisplayValue("2025-12-25");
      await user.tab(); // Blur without changing

      // Should not call onUpdate if value hasn't changed
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should save and exit on Enter key", async () => {
      const user = userEvent.setup();
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      const input = await screen.findByDisplayValue("2025-12-25");
      await user.clear(input);
      await user.type(input, "2025-12-26");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith("events.events.0.date", "2025-12-26");
        // Should exit edit mode
        expect(screen.queryByDisplayValue("2025-12-26")).not.toBeInTheDocument();
      });
    });

    it("should cancel and exit on Escape key", async () => {
      const user = userEvent.setup();
      render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      const input = await screen.findByDisplayValue("2025-12-25");
      await user.clear(input);
      await user.type(input, "2025-12-26");
      await user.keyboard("{Escape}");

      await waitFor(() => {
        // Should not call onUpdate
        expect(mockOnUpdate).not.toHaveBeenCalled();
        // Should exit edit mode and show original value
        expect(screen.queryByDisplayValue("2025-12-26")).not.toBeInTheDocument();
        expect(screen.getByText(/DECEMBER 25, 2025/i)).toBeInTheDocument();
      });
    });
  });

  describe("External Value Updates", () => {
    it("should update display when external value changes while not editing", () => {
      const { rerender } = render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      expect(screen.getByText(/DECEMBER 25, 2025/i)).toBeInTheDocument();

      rerender(
        <EditableDate value="2025-12-26" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      expect(screen.getByText(/DECEMBER 26, 2025/i)).toBeInTheDocument();
    });

    it("should not update display when external value changes while editing", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <EditableDate value="2025-12-25" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      const dateDisplay = screen.getByText(/DECEMBER 25, 2025/i);
      await user.click(dateDisplay);

      const input = await screen.findByDisplayValue("2025-12-25");

      // Update external value while editing
      rerender(
        <EditableDate value="2025-12-26" onUpdate={mockOnUpdate} path="events.events.0.date" />
      );

      // Input should still show the value it had when editing started
      expect(input).toHaveValue("2025-12-25");
    });
  });
});
