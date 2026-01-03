import { useState, useEffect } from "react";
import EditableText from "../shared/EditableText";
import EditableImage from "../shared/EditableImage";
import { getDefaultAssetUrl } from "@shared/utils/assetService";

/**
 * EditableHeroSection - WYSIWYG editable version of Hero section
 * Allows direct editing of hero content in the preview
 */
function EditableHeroSection({ onRSVPClick, translations, _currentLang, config = {}, onUpdate }) {
  const [countdown, setCountdown] = useState("Loading...");

  const wedding = config.wedding || {};
  const countdownTarget = wedding.countdownTarget || "2026-01-23T21:00:00";
  const heroImage = config.hero?.mainImage || getDefaultAssetUrl("couple1", "couple", "11.jpeg");
  const couple = config.couple || {};
  const brideName = couple.bride?.name || "Capt (Dr) Priya Singh";
  const groomName = couple.groom?.name || "Dr Saurabh Singh";

  // Get custom translations from config - handle nested paths like 'hero.eyebrow'
  // This traverses the nested object structure: customTranslations.hero.eyebrow
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
    const target = new Date(countdownTarget);
    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown(
          translations["countdown.today"] || "Today we humbly celebrate this blessed union."
        );
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

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div>
          <EditableText
            value={getTranslation("hero.eyebrow") || "The Wedding Of"}
            onUpdate={onUpdate}
            path="customTranslations.hero.eyebrow"
            className="hero-eyebrow"
            tag="div"
          />

          <EditableText
            value={getTranslation("hero.script") || "With the blessings of our families"}
            onUpdate={onUpdate}
            path="customTranslations.hero.script"
            className="hero-script"
            tag="div"
          />

          <div className="hero-names">
            <EditableText
              value={brideName}
              onUpdate={onUpdate}
              path="couple.bride.name"
              className="hero-name"
              tag="span"
            />{" "}
            <span className="hero-amp">&amp;</span>{" "}
            <EditableText
              value={groomName}
              onUpdate={onUpdate}
              path="couple.groom.name"
              className="hero-name"
              tag="span"
            />
          </div>

          <EditableText
            value={getTranslation("hero.sub") || "Two hearts, one destiny"}
            onUpdate={onUpdate}
            path="customTranslations.hero.sub"
            className="hero-sub"
            tag="div"
          />

          <EditableText
            value={
              getTranslation("hero.date") || wedding.dates?.join(" & ") || "22 & 23 January 2026"
            }
            onUpdate={onUpdate}
            path="customTranslations.hero.date"
            className="hero-date"
            tag="div"
          />

          <EditableText
            value={
              getTranslation("hero.location") ||
              wedding.venue?.fullAddress ||
              "Royal Lotus View Resotel · Bengaluru, Karnataka"
            }
            onUpdate={onUpdate}
            path="customTranslations.hero.location"
            className="hero-location"
            tag="div"
          />

          <div className="hero-divider"></div>

          <div className="hero-countdown">
            <div className="hero-count-label">
              {translations["hero.countdown"] || "Countdown to Wedding"}
            </div>
            <div className="hero-countdown-values" id="countdown">
              {countdown}
            </div>
          </div>

          <div className="hero-actions">
            <a href="#events" className="btn btn-primary">
              {translations["hero.actions.program"] || "View Program Details"}
              <span className="btn-icon">↧</span>
            </a>
            <a href="#venue" className="btn btn-ghost">
              {translations["hero.actions.venue"] || "View Venue & Directions"}
            </a>
            <button className="btn btn-primary" id="rsvpButtonHeader" onClick={onRSVPClick}>
              {translations["hero.actions.rsvp"] || "RSVP Now"}
              <span className="btn-icon">✓</span>
            </button>
          </div>
        </div>

        <aside className="hero-photo-card">
          <div className="hero-photo-frame">
            <div className="hero-photo-inner">
              <EditableImage
                src={heroImage}
                alt={`${brideName} & ${groomName}`}
                onUpdate={onUpdate}
                path="hero.mainImage"
                className="hero-main-image"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
          <div className="hero-photo-caption">
            <EditableText
              value={
                getTranslation("hero.caption") ||
                `A glimpse of ${brideName} & ${groomName} as they begin their forever.`
              }
              onUpdate={onUpdate}
              path="customTranslations.hero.caption"
              className="hero-caption-text"
              tag="div"
              multiline={true}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default EditableHeroSection;
