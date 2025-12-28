import { useState, useEffect, useMemo } from "react";

interface EditableCountdownProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    wedding?: {
      countdownTarget?: string;
    };
  };
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableCountdown - Uses existing countdownTarget from wedding data
 * Shows preview of countdown in edit mode
 */
function EditableCountdown({
  _translations,
  _currentLang,
  config = {},
  onUpdate: _onUpdate,
}: EditableCountdownProps) {
  const wedding = config.wedding || {};
  const countdownTarget = wedding.countdownTarget;

  // Compute initial countdown value to avoid setState in effect
  const initialCountdown = useMemo(() => {
    if (!countdownTarget) {
      return "";
    }
    const target = new Date(countdownTarget);
    if (Number.isNaN(target.getTime())) {
      return "";
    }
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      return "Today";
    }
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, [countdownTarget]);

  const [countdown, setCountdown] = useState(initialCountdown);

  // Sync state with memoized value when countdownTarget changes
  useEffect(() => {
    setCountdown(initialCountdown);
  }, [initialCountdown]);

  useEffect(() => {
    if (!countdownTarget) {
      return;
    }

    const target = new Date(countdownTarget);
    if (Number.isNaN(target.getTime())) {
      return;
    }

    const update = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("Today");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const newCountdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      setCountdown(newCountdown);
    };

    // Initial update
    update();
    // Update every second for continuous countdown
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [countdownTarget]);

  if (!countdownTarget) {
    return (
      <section className="ee-section ee-countdown-section">
        <div className="ee-countdown-container">
          <p className="ee-meta-text">THE BIG DAY</p>
          <p className="ee-countdown-placeholder">Set countdown target date in wedding details</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ee-section ee-countdown-section">
      <div className="ee-countdown-container">
        <p className="ee-meta-text">THE BIG DAY</p>
        <div className="ee-countdown-values">{countdown || "Calculating..."}</div>
      </div>
    </section>
  );
}

export default EditableCountdown;
