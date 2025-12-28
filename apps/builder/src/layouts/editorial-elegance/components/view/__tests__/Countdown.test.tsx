/**
 * Countdown Component Tests
 *
 * Tests for the Countdown component that displays a live countdown timer
 * with days, hours, minutes, and seconds until the wedding date.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import Countdown from "../Countdown";

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should return null when countdownTarget is not provided", () => {
      const { container } = render(<Countdown config={{}} />);
      expect(container.firstChild).toBeNull();
    });

    it("should return null when countdownTarget is invalid", () => {
      const { container } = render(
        <Countdown config={{ wedding: { countdownTarget: "invalid-date" } }} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render countdown with valid future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateString = futureDate.toISOString();

      render(<Countdown config={{ wedding: { countdownTarget: dateString } }} />);

      expect(screen.getByText("THE BIG DAY")).toBeInTheDocument();
      expect(screen.getByText(/5d/)).toBeInTheDocument();
    });

    it("should display 'Today' when date has passed", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const dateString = pastDate.toISOString();

      render(<Countdown config={{ wedding: { countdownTarget: dateString } }} />);

      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  describe("Countdown Calculation", () => {
    it("should calculate days correctly", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateString = futureDate.toISOString();

      render(<Countdown config={{ wedding: { countdownTarget: dateString } }} />);

      expect(screen.getByText(/3d/)).toBeInTheDocument();
    });

    it("should set up interval for live updates", () => {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 5);
      const dateString = futureDate.toISOString();

      const setIntervalSpy = vi.spyOn(global, "setInterval");

      render(<Countdown config={{ wedding: { countdownTarget: dateString } }} />);

      // Verify that setInterval was called to set up the countdown updates
      expect(setIntervalSpy).toHaveBeenCalled();
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

      setIntervalSpy.mockRestore();
    });

    it("should handle countdown with hours, minutes, and seconds", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      futureDate.setSeconds(futureDate.getSeconds() + 45);
      const dateString = futureDate.toISOString();

      render(<Countdown config={{ wedding: { countdownTarget: dateString } }} />);

      expect(screen.getByText(/2h/)).toBeInTheDocument();
      expect(screen.getByText(/30m/)).toBeInTheDocument();
      expect(screen.getByText(/45s/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing wedding config", () => {
      const { container } = render(<Countdown config={{}} />);
      expect(container.firstChild).toBeNull();
    });

    it("should handle empty countdownTarget string", () => {
      const { container } = render(<Countdown config={{ wedding: { countdownTarget: "" } }} />);
      expect(container.firstChild).toBeNull();
    });

    it("should cleanup interval on unmount", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateString = futureDate.toISOString();

      const { unmount } = render(
        <Countdown config={{ wedding: { countdownTarget: dateString } }} />
      );

      const clearIntervalSpy = vi.spyOn(global, "clearInterval");
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
