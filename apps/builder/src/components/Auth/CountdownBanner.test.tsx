import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import CountdownBanner from "./CountdownBanner";

describe("CountdownBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Countdown Behavior", () => {
    it("should display countdown and call onComplete when reaching 0", async () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={3} onComplete={onComplete} />);

      // Initial countdown should be 3 - text is split across elements, use getByRole
      expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 3/i);

      // Fast-forward 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 2/i);
      });

      // Fast-forward another second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 1/i);
      });

      // Fast-forward final second
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    it("should decrement countdown correctly every second", async () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={5} onComplete={onComplete} />);

      // Check initial state
      expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 5/i);

      // Advance by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 4/i);
      });

      // Advance by another second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 3/i);
      });

      // onComplete should not be called yet
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("should use default countdown of 5 when not specified", () => {
      const onComplete = vi.fn();
      render(<CountdownBanner onComplete={onComplete} />);

      expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 5/i);
    });

    it("should use custom countdown duration", () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={10} onComplete={onComplete} />);

      expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 10/i);
    });
  });

  describe("User Experience", () => {
    it("should display correct message", () => {
      const onComplete = vi.fn();
      render(<CountdownBanner message="Custom message" onComplete={onComplete} />);

      expect(screen.getByText(/custom message, redirecting to dashboard/i)).toBeInTheDocument();
    });

    it("should use default message when not specified", () => {
      const onComplete = vi.fn();
      render(<CountdownBanner onComplete={onComplete} />);

      expect(
        screen.getByText(/you are already logged in, redirecting to dashboard/i)
      ).toBeInTheDocument();
    });

    it("should display ellipsis for countdown > 1", () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={3} onComplete={onComplete} />);

      expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 3/i);
      expect(screen.getByRole("alert")).toHaveTextContent("...");
    });

    it("should not display ellipsis for countdown = 1", async () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={2} onComplete={onComplete} />);

      // Advance to 1
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent(/redirecting to dashboard in 1/i);
        expect(alert.textContent).not.toContain("...");
      });
    });

    it("should have proper accessibility attributes", () => {
      const onComplete = vi.fn();
      const { container } = render(<CountdownBanner onComplete={onComplete} />);

      const banner = container.querySelector(".countdown-banner");
      expect(banner).toHaveAttribute("role", "alert");
      expect(banner).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Edge Cases", () => {
    it("should handle custom message", () => {
      const onComplete = vi.fn();
      render(<CountdownBanner message="Please wait" countdown={3} onComplete={onComplete} />);

      expect(screen.getByText(/please wait, redirecting to dashboard/i)).toBeInTheDocument();
    });

    it("should handle countdown of 1", async () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={1} onComplete={onComplete} />);

      expect(screen.getByRole("alert")).toHaveTextContent(/redirecting to dashboard in 1/i);

      // Advance by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle countdown of 0 by calling onComplete immediately", async () => {
      const onComplete = vi.fn();
      render(<CountdownBanner countdown={0} onComplete={onComplete} />);

      await act(async () => {
        // Process any pending state updates
        await Promise.resolve();
      });
      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );
    });

    it("should cleanup timer on unmount", () => {
      const onComplete = vi.fn();
      const { unmount } = render(<CountdownBanner countdown={5} onComplete={onComplete} />);

      // Advance by 2 seconds
      vi.advanceTimersByTime(2000);

      // Unmount component
      unmount();

      // Advance timers further
      vi.advanceTimersByTime(5000);

      // onComplete should not be called after unmount
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("should update onComplete callback when it changes", async () => {
      const onComplete1 = vi.fn();
      const onComplete2 = vi.fn();
      const { rerender } = render(<CountdownBanner countdown={1} onComplete={onComplete1} />);

      // Change the onComplete callback
      rerender(<CountdownBanner countdown={1} onComplete={onComplete2} />);

      // Advance to trigger completion
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should call the new callback, not the old one
        expect(onComplete2).toHaveBeenCalledTimes(1);
        expect(onComplete1).not.toHaveBeenCalled();
      });
    });
  });
});
