import { useState, useEffect } from "react";

function Hero({ onRSVPClick, translations, currentLang, config = {} }) {
  const [countdown, setCountdown] = useState("");

  // Read values directly from config without layout defaults
  const wedding = config?.wedding || {};
  const countdownTarget = wedding?.countdownTarget;
  const heroImage = config?.hero?.mainImage;
  const couple = config?.couple || {};
  const brideName = couple?.bride?.name || "";
  const groomName = couple?.groom?.name || "";

  // Get custom translations from config - read directly to ensure freshness
  // Handle nested paths like 'hero.eyebrow' -> customTranslations.hero.eyebrow
  const getTranslation = (key) => {
    // Check custom translations first - handle nested paths
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split(".");
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }

    // Fall back to default translations
    const defaultValue = translations[key] || "";
    return customValue || defaultValue;
  };

  useEffect(() => {
    if (!countdownTarget) {
      setCountdown("");
      return;
    }

    const target = new Date(countdownTarget);
    if (Number.isNaN(target.getTime())) {
      setCountdown("");
      return;
    }

    const update = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown(translations["countdown.today"] || "");
        return;
      }

      const seconds = Math.floor(diff / 1000);
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      setCountdown(`${days}d • ${hours}h • ${minutes}m`);
    };

    update();
    const interval = setInterval(update, 60 * 1000);

    return () => clearInterval(interval);
  }, [translations, countdownTarget]);

  const namesText =
    getTranslation("hero.names") || (brideName || groomName ? `${brideName} & ${groomName}` : "");
  const heroNames = namesText ? namesText.replace("&", '<span class="hero-amp">&amp;</span>') : "";

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">{getTranslation("hero.eyebrow")}</div>
          <div className="hero-script">{getTranslation("hero.script")}</div>

          <div className="hero-names" dangerouslySetInnerHTML={{ __html: heroNames }} />

          <div className="hero-sub">{getTranslation("hero.sub")}</div>

          <div className="hero-date">
            {getTranslation("hero.date") || wedding.dates?.join(" & ")}
          </div>
          <div className="hero-location">
            {getTranslation("hero.location") || wedding.venue?.fullAddress}
          </div>

          <div className="hero-divider"></div>

          <div className="hero-countdown">
            <div className="hero-count-label">{getTranslation("hero.countdown")}</div>
            <div className="hero-countdown-values" id="countdown">
              {countdown}
            </div>
          </div>

          <div className="hero-actions">
            <a href="#events" className="btn btn-primary">
              {getTranslation("hero.actions.program") || "View Program Details"}
              <span className="btn-icon">↧</span>
            </a>
            <a href="#venue" className="btn btn-ghost">
              {getTranslation("hero.actions.venue") || "View Venue & Directions"}
            </a>
            <button className="btn btn-primary" id="rsvpButtonHeader" onClick={onRSVPClick}>
              {getTranslation("hero.actions.rsvp") || "RSVP Now"}
              <span className="btn-icon">✓</span>
            </button>
          </div>
        </div>

        <aside className="hero-photo-card">
          <div className="hero-photo-frame">
            <div className="hero-photo-inner">
              {heroImage ? (
                <img src={heroImage} alt={`${brideName} & ${groomName}`} loading="lazy" />
              ) : null}
            </div>
          </div>
          <div
            className="hero-photo-caption"
            dangerouslySetInnerHTML={{ __html: getTranslation("hero.caption") || "" }}
          />
        </aside>
      </div>
    </section>
  );
}

export default Hero;
