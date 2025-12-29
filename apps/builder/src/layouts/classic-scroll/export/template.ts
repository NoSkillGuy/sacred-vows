/**
 * Classic Scroll Layout Export Template
 *
 * Generates HTML for exporting the classic-scroll layout invitation.
 * This ensures the exported invitation matches exactly what was built in the builder.
 */

import type { InvitationData } from "@shared/types/wedding-data";

/**
 * Generate complete HTML for the invitation export
 * @param invitation - Invitation data with layoutConfig and data
 * @param translations - Translation data
 * @returns Promise with complete HTML document
 */
export async function generateHTML(
  invitation: InvitationData,
  translations?: Record<string, unknown>
): Promise<string> {
  const { data, layoutConfig } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Generate inline styles based on theme
  const themeStyles = `
    :root {
      --bg-page: ${colors.background?.page || colors.background || "#fff8f0"};
      --bg-card: ${colors.background?.card || colors.background?.section || "#fff7ee"};
      --border-gold: ${colors.primary || "#d4af37"};
      --accent-gold: ${colors.primary || "#d4af37"};
      --accent-rose: ${colors.accent || "#c27d88"};
      --text-main: ${colors.text?.primary || colors.text || "#2f2933"};
      --text-muted: ${colors.text?.muted || colors.text || "#6c5b5b"};
      --button-primary: ${colors.primary || "#7c2831"};
      --font-heading: ${fonts.heading || "Playfair Display"};
      --font-body: ${fonts.body || "Poppins"};
      --font-script: ${fonts.script || "Great Vibes"};
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding invitation" />

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="${colors.primary || "#d4af37"}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Wedding Invitation" />
  <meta name="mobile-web-app-capable" content="yes" />

  <!-- Manifest -->
  <link rel="manifest" href="./manifest.json" />

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap" rel="stylesheet" />

  <title>Wedding Invitation</title>
  <link rel="stylesheet" href="styles.css" />
  <style>${themeStyles}</style>
</head>
<body>
  <div class="page-shell">
    ${generateBodyHTML(invitation, translations || {})}
  </div>
  <script src="app.js"></script>
</body>
</html>`;
}

/**
 * Get translation helper - matches React component pattern
 */
function getTranslation(
  key: string,
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  let customValue: unknown = null;
  if (config?.customTranslations) {
    const keys = key.split(".");
    let current: unknown = config.customTranslations;
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        current = null;
        break;
      }
    }
    customValue = current;
  }
  return (customValue as string) || (translations[key] as string) || "";
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Format date helper
 */
function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr || dateStr === "Date TBD" || dateStr === "") {
    return "";
  }
  try {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Generate body HTML for the invitation
 */
function generateBodyHTML(
  invitation: InvitationData,
  translations: Record<string, unknown>
): string {
  const { data, layoutConfig } = invitation;
  const config = { ...data, ...layoutConfig } as Record<string, unknown>;
  let html = "";

  // Header section
  html += generateHeaderSection(config, translations);

  // Hero section
  html += generateHeroSection(config, translations);

  // Couple section
  if (hasCoupleData(config)) {
    html += generateCoupleSection(config, translations);
  }

  // Fathers Letter section
  if (hasFathersLetterData(config)) {
    html += generateFathersLetterSection(config, translations);
  }

  // Gallery section
  if (hasGalleryData(config)) {
    html += generateGallerySection(config, translations);
  }

  // Events section
  if (hasEventsData(config)) {
    html += generateEventsSection(config, translations);
  }

  // Venue section
  if (hasVenueData(config)) {
    html += generateVenueSection(config, translations);
  }

  // RSVP section
  if (hasRSVPData(config)) {
    html += generateRSVPSection(config, translations);
  }

  // Footer section
  html += generateFooterSection(config, translations);

  return html;
}

/**
 * Generate Header section
 */
function generateHeaderSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const branding = (config.branding as Record<string, unknown>) || {};
  const music = (config.music as Record<string, unknown>) || {};
  const monogram = (branding.monogram as string) || "";
  const logo = branding.logo as string | undefined;
  const title = (branding.title as string) || "";
  const subtitle = (branding.subtitle as string) || "";
  const musicFile = music.file as string | undefined;

  return `
    <header class="site-header">
      <div class="nav-inner">
        <div class="brand">
          <div class="brand-monogram">
            ${logo ? `<img src="${logo}" alt="${monogram || "Monogram"}" />` : monogram}
          </div>
          <div class="brand-text">
            <div class="brand-title">${title}</div>
            <div class="brand-sub">${subtitle}</div>
          </div>
        </div>

        <nav class="nav-links">
          <a href="#top">${getTranslation("nav.home", config, translations) || "Home"}</a>
          <a href="#couple">${getTranslation("nav.couple", config, translations) || "Couple"}</a>
          <a href="#gallery">${getTranslation("nav.photos", config, translations) || "Photos"}</a>
          <a href="#events">${getTranslation("nav.program", config, translations) || "Program"}</a>
          <a href="#venue">${getTranslation("nav.venue", config, translations) || "Venue"}</a>
          <a href="#rsvp">${getTranslation("nav.rsvp", config, translations) || "RSVP"}</a>
        </nav>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="language-switcher" id="languageSwitcher" title="Change Language" aria-label="Change Language">
            🌐
          </button>
          ${
            musicFile
              ? `
          <div class="music-toggle" id="musicToggle">
            <div class="music-dot" id="musicDot"></div>
            <span>${getTranslation("music.play", config, translations) || "Play Music"}</span>
          </div>
          `
              : ""
          }
        </div>
      </div>
      ${
        musicFile
          ? `
      <audio id="bg-music" loop>
        <source src="${musicFile}" type="audio/mpeg" />
      </audio>
      `
          : ""
      }
    </header>
  `;
}

/**
 * Generate Hero section
 */
function generateHeroSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const wedding = (config.wedding as Record<string, unknown>) || {};
  const hero = (config.hero as Record<string, unknown>) || {};
  const couple = (config.couple as Record<string, unknown>) || {};
  const bride = (couple.bride as Record<string, unknown>) || {};
  const groom = (couple.groom as Record<string, unknown>) || {};

  const brideName = (bride.name as string) || "";
  const groomName = (groom.name as string) || "";
  const heroImage = hero.mainImage as string | undefined;
  const countdownTarget = wedding.countdownTarget as string | undefined;
  const dates = (wedding.dates as string[]) || [];
  const venue = (wedding.venue as Record<string, unknown>) || {};
  const fullAddress = venue.fullAddress as string | undefined;

  const namesText =
    getTranslation("hero.names", config, translations) ||
    (brideName || groomName ? `${brideName} & ${groomName}` : "");
  const heroNames = namesText
    ? escapeHtml(namesText).replace(/&amp;/g, '<span class="hero-amp">&amp;</span>')
    : "";

  // Countdown calculation (static for export)
  let countdown = "";
  if (countdownTarget) {
    try {
      const target = new Date(countdownTarget);
      if (!isNaN(target.getTime())) {
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        if (diff > 0) {
          const seconds = Math.floor(diff / 1000);
          const days = Math.floor(seconds / (3600 * 24));
          const hours = Math.floor((seconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          countdown = `${days}d • ${hours}h • ${minutes}m`;
        } else {
          countdown = getTranslation("countdown.today", config, translations) || "";
        }
      }
    } catch {
      // Invalid date, leave countdown empty
    }
  }

  return `
    <section class="hero" id="top">
      <div class="hero-inner">
        <div>
          <div class="hero-eyebrow">${getTranslation("hero.eyebrow", config, translations)}</div>
          <div class="hero-script">${getTranslation("hero.script", config, translations)}</div>

          <div class="hero-names">${heroNames}</div>

          <div class="hero-sub">${getTranslation("hero.sub", config, translations)}</div>

          <div class="hero-date">
            ${getTranslation("hero.date", config, translations) || dates.join(" & ")}
          </div>
          <div class="hero-location">
            ${getTranslation("hero.location", config, translations) || fullAddress || ""}
          </div>

          <div class="hero-divider"></div>

          ${
            countdown
              ? `
          <div class="hero-countdown">
            <div class="hero-count-label">${getTranslation("hero.countdown", config, translations)}</div>
            <div class="hero-countdown-values" id="countdown">
              ${countdown}
            </div>
          </div>
          `
              : ""
          }

          <div class="hero-actions">
            <a href="#events" class="btn btn-primary">
              ${getTranslation("hero.actions.program", config, translations) || "View Program Details"}
              <span class="btn-icon">↧</span>
            </a>
            <a href="#venue" class="btn btn-ghost">
              ${getTranslation("hero.actions.venue", config, translations) || "View Venue & Directions"}
            </a>
            <button class="btn btn-primary" id="rsvpButtonHeader">
              ${getTranslation("hero.actions.rsvp", config, translations) || "RSVP Now"}
              <span class="btn-icon">✓</span>
            </button>
          </div>
        </div>

        ${
          heroImage
            ? `
        <aside class="hero-photo-card">
          <div class="hero-photo-frame">
            <div class="hero-photo-inner">
              <img src="${heroImage}" alt="${brideName} & ${groomName}" loading="lazy" />
            </div>
          </div>
          <div class="hero-photo-caption">
            ${getTranslation("hero.caption", config, translations) || ""}
          </div>
        </aside>
        `
            : ""
        }
      </div>
    </section>
  `;
}

/**
 * Generate Couple section
 */
function generateCoupleSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const couple = (config.couple as Record<string, unknown>) || {};
  const bride = (couple.bride as Record<string, unknown>) || {};
  const groom = (couple.groom as Record<string, unknown>) || {};

  const brideName = (bride.name as string) || "Bride";
  const brideMother = ((bride.parents as Record<string, unknown>)?.mother as string) || "";
  const brideFather = ((bride.parents as Record<string, unknown>)?.father as string) || "";
  const brideImage = (bride.image as string) || "";

  const groomName = (groom.name as string) || "Groom";
  const groomMother = ((groom.parents as Record<string, unknown>)?.mother as string) || "";
  const groomFather = ((groom.parents as Record<string, unknown>)?.father as string) || "";
  const groomImage = (groom.image as string) || "";

  const togetherText =
    getTranslation("couple.together", config, translations) ||
    `Together, ${brideName} and ${groomName} look forward to beginning this beautiful journey with your blessings and presence.`;

  return `
    <section id="couple">
      <div class="section-header">
        <div class="section-eyebrow">
          ${getTranslation("couple.eyebrow", config, translations) || "Couple & Families"}
        </div>
        <div class="section-title">${getTranslation("couple.title", config, translations) || "In Honoured Union"}</div>
        <div class="section-subtitle">
          ${
            getTranslation("couple.subtitle", config, translations) ||
            "With immense joy, the families invite you to join them in celebrating the union of their children."
          }
        </div>
      </div>

      <div class="card">
        <div class="card-inner">
          <p class="muted" style="margin-bottom: 20px; text-align: center;">
            ${togetherText}
          </p>
          <div class="couple-grid">
            <div>
              <h3 class="headline">${getTranslation("couple.bride", config, translations) || "The Bride"}</h3>
              <p class="muted">
                <strong>${brideName}</strong>
                <br />
                <span class="relation-label">
                  ${getTranslation("couple.daughter", config, translations) || "Daughter of"}
                </span> <strong>${brideMother}</strong> & <strong>${brideFather}</strong>.
              </p>

              ${
                brideMother
                  ? `
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.mother", config, translations) || "Mother"}</div>
                <div class="person-name">${brideMother}</div>
              </div>
              `
                  : ""
              }
              ${
                brideFather
                  ? `
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.father", config, translations) || "Father"}</div>
                <div class="person-name">${brideFather}</div>
              </div>
              `
                  : ""
              }

              ${
                brideImage
                  ? `
              <div class="portrait-frame">
                <div class="portrait-inner">
                  <img src="${brideImage}" alt="Bride - ${brideName}" />
                </div>
              </div>
              `
                  : ""
              }
            </div>

            <div>
              <h3 class="headline">${getTranslation("couple.groom", config, translations) || "The Groom"}</h3>
              <p class="muted">
                <strong>${groomName}</strong>
                <br />
                <span class="relation-label">
                  ${getTranslation("couple.son", config, translations) || "Son of"}
                </span> <strong>${groomMother}</strong> & <strong>${groomFather}</strong>.
              </p>

              ${
                groomMother
                  ? `
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.mother", config, translations) || "Mother"}</div>
                <div class="person-name">${groomMother}</div>
              </div>
              `
                  : ""
              }
              ${
                groomFather
                  ? `
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.father", config, translations) || "Father"}</div>
                <div class="person-name">${groomFather}</div>
              </div>
              `
                  : ""
              }

              ${
                groomImage
                  ? `
              <div class="portrait-frame">
                <div class="portrait-inner">
                  <img src="${groomImage}" alt="Groom - ${groomName}" />
                </div>
              </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate Fathers Letter section
 */
function generateFathersLetterSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const bodyText = getTranslation("father.body", config, translations) || "";
  // Note: In export, we can't access localStorage, so we use a generic placeholder
  const displayName = "family member and respected guest";
  const replacedText = bodyText.replace("{name}", displayName);

  return `
    <section id="fathers-letter">
      <div class="section-header">
        <div class="section-eyebrow">
          ${getTranslation("father.eyebrow", config, translations) || "From Priya's Father"}
        </div>
        <div class="section-title">
          ${getTranslation("father.title", config, translations) || "A Few Words From the Heart"}
        </div>
      </div>

      <div class="card">
        <div class="card-inner">
          <p class="muted" style="white-space: pre-line;">
            ${replacedText}
          </p>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate Gallery section
 */
function generateGallerySection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const gallery = (config.gallery as Record<string, unknown>) || {};
  const galleryImages = (gallery.images as Array<Record<string, unknown>>) || [];

  if (galleryImages.length === 0) {
    return "";
  }

  return `
    <section id="gallery">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("gallery.eyebrow", config, translations) || "Photo Story"}</div>
        <div class="section-title">
          ${getTranslation("gallery.title", config, translations) || "Our Journey in Moments"}
        </div>
        <div class="section-subtitle">
          ${
            getTranslation("gallery.subtitle", config, translations) ||
            "A few glimpses from the memories and moments that bring us here today."
          }
        </div>
      </div>

      <div class="card">
        <div class="card-inner">
          <div class="gallery-grid">
            ${galleryImages
              .map((img) => {
                const src = (img.src as string) || "";
                const alt = (img.alt as string) || "";
                const isPortrait = img.orientation === "portrait" || /portrait/i.test(alt);
                return `
              <div class="gallery-item">
                <div class="gallery-inner${isPortrait ? " tall" : ""}">
                  <img src="${src}" alt="${alt}" loading="lazy" />
                </div>
              </div>
            `;
              })
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate Events section
 */
function generateEventsSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const events = (config.events as Record<string, unknown>) || {};
  const day1Config = (events.day1 as Record<string, unknown>) || {};
  const day2Config = (events.day2 as Record<string, unknown>) || {};

  const day1Events = (day1Config.events as Array<Record<string, unknown>>) || [];
  const day2Events = (day2Config.events as Array<Record<string, unknown>>) || [];
  const day1Date = (day1Config.date as string) || "Thursday · 22 January 2026";
  const day2Date = (day2Config.date as string) || "Friday · 23 January 2026";

  if (day1Events.length === 0 && day2Events.length === 0) {
    return "";
  }

  return `
    <section id="events">
      <div class="section-header">
        <div class="section-eyebrow">
          ${getTranslation("events.eyebrow", config, translations) || "Program Details"}
        </div>
        <div class="section-title">${getTranslation("events.title", config, translations) || "The Celebrations"}</div>
        <div class="section-subtitle">
          ${
            getTranslation("events.subtitle", config, translations) ||
            "We would be honoured by your presence at each of these moments of joy."
          }
        </div>
      </div>

      <div class="card">
        <div class="card-inner event-grid">
          ${
            day1Events.length > 0
              ? `
          <div class="event-day">
            <div class="event-date-label">${getTranslation("events.day1", config, translations) || "Day One"}</div>
            <div class="event-date-main">${day1Date}</div>

            ${day1Events
              .map(
                (event) => `
              <div class="event-item">
                <div class="event-icon-wrapper">
                  ${
                    event.emoji
                      ? `
                  <div class="event-icon-emoji">${event.emoji}</div>
                  `
                      : event.image
                        ? `
                  <img src="${event.image}" alt="${event.label || ""}" class="event-icon-image" />
                  `
                        : ""
                  }
                </div>
                <div class="event-content">
                  <div class="event-left">
                    <div class="event-label">${event.label || ""}</div>
                    <div class="event-tag">${event.tag || ""}</div>
                  </div>
                  <div class="event-time">${event.time || ""}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }

          ${
            day2Events.length > 0
              ? `
          <div class="event-day">
            <div class="event-date-label">${getTranslation("events.day2", config, translations) || "Day Two"}</div>
            <div class="event-date-main">${day2Date}</div>

            ${day2Events
              .map(
                (event) => `
              <div class="event-item">
                <div class="event-icon-wrapper">
                  ${
                    event.emoji
                      ? `
                  <div class="event-icon-emoji">${event.emoji}</div>
                  `
                      : event.image
                        ? `
                  <img src="${event.image}" alt="${event.label || ""}" class="event-icon-image" />
                  `
                        : ""
                  }
                </div>
                <div class="event-content">
                  <div class="event-left">
                    <div class="event-label">${event.label || ""}</div>
                    <div class="event-tag">${event.tag || ""}</div>
                  </div>
                  <div class="event-time">${event.time || ""}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>

        <p class="muted" style="margin-top: 14px; font-size: 12px;">
          ${
            getTranslation("events.complete", config, translations) ||
            "Your presence and blessings at these ceremonies will make our celebration truly complete."
          }
        </p>
      </div>
    </section>
  `;
}

/**
 * Generate Venue section
 */
function generateVenueSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const wedding = (config.wedding as Record<string, unknown>) || {};
  const venue = (wedding.venue as Record<string, unknown>) || {};

  const venueName = (venue.name as string) || "Royal Lotus View Resotel";
  const venueAddress = (venue.address as string) || "";
  const venueTags = (venue.tags as string[]) || [];
  const mapsUrl = (venue.mapsUrl as string) || "";
  const mapsEmbedUrl = (venue.mapsEmbedUrl as string) || "";

  return `
    <section id="venue">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("venue.eyebrow", config, translations) || "Venue"}</div>
        <div class="section-title">${getTranslation("venue.title", config, translations) || "Where to Join Us"}</div>
        <div class="section-subtitle">
          ${
            getTranslation("venue.subtitle", config, translations) ||
            "A serene and elegant venue to witness the beginning of a lifetime of togetherness."
          }
        </div>
      </div>

      <div class="card">
        <div class="card-inner venue-grid">
          <div>
            <h3 class="headline">${venueName}</h3>
            ${
              venueAddress
                ? `
            <p class="venue-address" style="white-space: pre-line;">
              ${venueAddress}
            </p>
            `
                : ""
            }

            ${
              venueTags.length > 0
                ? `
            <div class="chip-row">
              ${venueTags.map((tag) => `<div class="chip">${tag}</div>`).join("")}
            </div>
            `
                : ""
            }

            <p class="muted" style="margin-bottom: 14px;">
              ${
                getTranslation("venue.arrive", config, translations) ||
                "Kindly arrive a little early to comfortably join us for the ceremonies. Our families eagerly await to welcome you with warmth and love."
              }
            </p>

            ${
              mapsUrl
                ? `
            <a class="btn btn-primary" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
              ${getTranslation("venue.maps", config, translations) || "Open in Google Maps"}
              <span class="btn-icon">➚</span>
            </a>
            `
                : ""
            }
          </div>

          <div class="map-card" aria-label="Venue map preview">
            ${
              mapsEmbedUrl
                ? `
            <iframe
              class="map-embed"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="${mapsEmbedUrl}"
              title="Venue Location"
            ></iframe>
            `
                : '<div class="map-placeholder"><p>Map will be displayed here</p></div>'
            }
            ${
              mapsUrl
                ? `
            <div class="map-footer">
              <span>Tap below to open the venue in your Maps.</span>
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
                View full map ↗
              </a>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate RSVP section
 */
function generateRSVPSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  const rsvp = (config.rsvp as Record<string, unknown>) || {};
  const contacts = (rsvp.contacts as Array<Record<string, unknown>>) || [];
  const couple = (config.couple as Record<string, unknown>) || {};
  const wedding = (config.wedding as Record<string, unknown>) || {};

  const brideName = ((couple.bride as Record<string, unknown>)?.name as string) || "";
  const groomName = ((couple.groom as Record<string, unknown>)?.name as string) || "";
  const dates = (wedding.dates as string[]) || [];
  const venue = (wedding.venue as Record<string, unknown>) || {};
  const venueName = (venue.name as string) || "";
  const venueCity = (venue.city as string) || "";

  return `
    <section id="rsvp">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("rsvp.eyebrow", config, translations) || "RSVP"}</div>
        <div class="section-title">${getTranslation("rsvp.title", config, translations) || "With Warm Regards"}</div>
        <div class="section-subtitle">
          ${
            getTranslation("rsvp.subtitle", config, translations) ||
            "Kindly confirm your presence and feel free to reach out for any assistance."
          }
        </div>
      </div>

      <div class="card">
        <div class="card-inner">
          <p class="rsvp-text">
            ${
              getTranslation("rsvp.text", config, translations) ||
              "On behalf of both families, you may contact the following for confirmations, travel details, or any other queries:"
            }
          </p>

          ${
            contacts.length > 0
              ? `
          <div class="rsvp-grid">
            ${contacts
              .map(
                (contact) => `
              <div class="rsvp-pill">
                <div class="rsvp-badge">${contact.badge || "RSVP"}</div>
                <span>${contact.name || ""}</span>
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }

          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 8px;">
            <button class="btn btn-primary" id="rsvpButton">
              ${getTranslation("hero.actions.rsvp", config, translations) || "RSVP Now"}
              <span class="btn-icon">✓</span>
            </button>
            <a class="btn btn-ghost" href="#" target="_blank" rel="noopener noreferrer">
              ${getTranslation("rsvp.share.button", config, translations) || "Share Invitation on WhatsApp"}
            </a>
            <p class="small-note">
              ${
                getTranslation("rsvp.share.note", config, translations) ||
                "You may share this link with friends and family whom you wish to invite."
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate Footer section
 */
function generateFooterSection(
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  return `
    <footer class="site-footer">
      <div class="footer-main">
        ${getTranslation("footer.compliments", config, translations) || "With Best Compliments"}
      </div>
      <div class="footer-line">
        ${
          getTranslation("footer.families", config, translations) ||
          "From the families of Capt (Dr) Priya Singh & Dr Saurabh Singh"
        }
      </div>
      <div class="footer-flowers">
        ${
          getTranslation("footer.flowers", config, translations) ||
          "Awaiting eyes • Blooming hearts • Cherished invitations, timeless blessings"
        }
      </div>
      <div class="footer-mini">
        ${getTranslation("footer.waiting", config, translations) || "We look forward to celebrating with you"}
      </div>
    </footer>
  `;
}

/**
 * Helper functions to check if data exists
 */
function hasCoupleData(config: Record<string, unknown>): boolean {
  const couple = (config.couple as Record<string, unknown>) || {};
  return !!(couple.bride || couple.groom);
}

function hasFathersLetterData(config: Record<string, unknown>): boolean {
  return !!getTranslation("father.body", config, {});
}

function hasGalleryData(config: Record<string, unknown>): boolean {
  const gallery = (config.gallery as Record<string, unknown>) || {};
  const images = (gallery.images as Array<unknown>) || [];
  return images.length > 0;
}

function hasEventsData(config: Record<string, unknown>): boolean {
  const events = (config.events as Record<string, unknown>) || {};
  const day1 = (events.day1 as Record<string, unknown>) || {};
  const day2 = (events.day2 as Record<string, unknown>) || {};
  const day1Events = (day1.events as Array<unknown>) || [];
  const day2Events = (day2.events as Array<unknown>) || [];
  return day1Events.length > 0 || day2Events.length > 0;
}

function hasVenueData(config: Record<string, unknown>): boolean {
  const wedding = (config.wedding as Record<string, unknown>) || {};
  const venue = (wedding.venue as Record<string, unknown>) || {};
  return !!venue.name;
}

function hasRSVPData(config: Record<string, unknown>): boolean {
  const rsvp = (config.rsvp as Record<string, unknown>) || {};
  return !!(rsvp.contacts || rsvp);
}

export default generateHTML;
