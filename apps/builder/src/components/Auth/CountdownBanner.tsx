import { useEffect, useState, useRef } from "react";
import "./CountdownBanner.css";

interface CountdownBannerProps {
  message?: string;
  countdown?: number;
  onComplete: () => void;
}

function CountdownBanner({
  message = "You are already logged in",
  countdown = 5,
  onComplete,
}: CountdownBannerProps): JSX.Element {
  const [remaining, setRemaining] = useState<number>(countdown);
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (remaining <= 0) {
      onCompleteRef.current();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining(remaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <div className="countdown-banner" role="alert" aria-live="polite">
      <div className="countdown-banner-content">
        <span className="countdown-banner-message">
          {message}, redirecting to dashboard in{" "}
          <span className="countdown-banner-number">{remaining}</span>
          {remaining > 1 ? "..." : ""}
        </span>
      </div>
    </div>
  );
}

export default CountdownBanner;
