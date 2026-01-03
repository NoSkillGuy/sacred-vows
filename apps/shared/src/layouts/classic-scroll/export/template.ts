/**
 * Copyright (c) 2024 Sacred Vows. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file and its contents are proprietary to Sacred Vows and protected by
 * copyright law. Unauthorized copying, reproduction, distribution, or use of
 * this file, via any medium, is strictly prohibited and may result in severe
 * civil and criminal penalties.
 *
 * For licensing inquiries, contact: legal@sacredvows.com
 */

/**
 * Classic Scroll Layout Export Template
 *
 * Generates HTML for exporting the classic-scroll layout invitation.
 * This ensures the exported invitation matches exactly what was built in the builder.
 */

import type { InvitationData } from "../../../types/wedding-data";
import { generateProtectionBundle } from "../../../lib/protection-bundle";
import { getCopyrightMetaContent } from "../../../lib/legal-warnings";

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
  const couple = data?.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = data?.wedding || {};
  const venue = wedding?.venue || {};
  const hero = (data as Record<string, unknown>)?.hero as { mainImage?: string } | undefined;
  const gallery = (data as Record<string, unknown>)?.gallery as
    | { images?: Array<{ src: string; alt?: string; orientation?: string }> }
    | undefined;
  const events = (data as Record<string, unknown>)?.events as
    | {
        day1?: {
          date?: string;
          events?: Array<{
            emoji?: string;
            image?: string;
            label?: string;
            tag?: string;
            time?: string;
          }>;
        };
        day2?: {
          date?: string;
          events?: Array<{
            emoji?: string;
            image?: string;
            label?: string;
            tag?: string;
            time?: string;
          }>;
        };
      }
    | undefined;
  const rsvp = (data as Record<string, unknown>)?.rsvp as
    | { contacts?: Array<{ badge?: string; name?: string }> }
    | undefined;
  const branding = (data as Record<string, unknown>)?.branding as
    | { monogram?: string; logo?: string; title?: string; subtitle?: string }
    | undefined;
  const music = (data as Record<string, unknown>)?.music as
    | { file?: string; volume?: number }
    | undefined;
  const customTranslations = (data as Record<string, unknown>)?.customTranslations as
    | Record<string, unknown>
    | undefined;

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const weddingDate = wedding.dates?.[0] || "";
  const countdownTarget = wedding.countdownTarget;
  const heroImage = hero?.mainImage;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};

  // Helper functions to safely extract color values (handles both string and object formats)
  const getBackgroundPage = (): string => {
    if (typeof colors.background === "string") {
      return colors.background;
    }
    if (colors.background && typeof colors.background === "object" && "page" in colors.background) {
      return (colors.background as { page?: string }).page || "#fff8f0";
    }
    return "#fff8f0";
  };

  const getBackgroundCard = (): string => {
    if (colors.background && typeof colors.background === "object") {
      const bg = colors.background as { card?: string; section?: string };
      return bg.card || bg.section || "#fff7ee";
    }
    return "#fff7ee";
  };

  const getTextPrimary = (): string => {
    if (typeof colors.text === "string") {
      return colors.text;
    }
    if (colors.text && typeof colors.text === "object" && "primary" in colors.text) {
      return (colors.text as { primary?: string }).primary || "#2f2933";
    }
    return "#2f2933";
  };

  const getTextMuted = (): string => {
    if (colors.text && typeof colors.text === "object" && "muted" in colors.text) {
      return (colors.text as { muted?: string }).muted || "#6c5b5b";
    }
    if (typeof colors.text === "string") {
      return colors.text;
    }
    return "#6c5b5b";
  };

  // Helper to get translations
  const getTranslation = (key: string): string => {
    let customValue: unknown = null;
    if (customTranslations) {
      const keys = key.split(".");
      let current: unknown = customTranslations;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    return (customValue as string) || (translations?.[key] as string) || "";
  };

  // Generate inline styles based on theme
  const themeStyles = `
    :root {
      --bg-page: ${getBackgroundPage()};
      --bg-card: ${getBackgroundCard()};
      --border-gold: ${colors.primary || "#d4af37"};
      --accent-gold: ${colors.primary || "#d4af37"};
      --accent-rose: ${colors.accent || "#c27d88"};
      --text-main: ${getTextPrimary()};
      --text-muted: ${getTextMuted()};
      --button-primary: ${colors.primary || "#7c2831"};
      --font-heading: ${theme.fonts?.heading || "Playfair Display"};
      --font-body: ${theme.fonts?.body || "Poppins"};
      --font-script: ${theme.fonts?.script || "Great Vibes"};
    }
  `;

  // Generate protection bundle (enabled in production/published sites)
  const isProduction = true; // Always enable protection for published HTML
  const protection = generateProtectionBundle(isProduction);

  return `<!DOCTYPE html>
${protection.htmlComment}
${protection.decoyComments}
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding invitation for ${brideName} & ${groomName}" />
  <meta name="copyright" content="${getCopyrightMetaContent()}" />

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="${colors.primary || "#d4af37"}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${brideName} & ${groomName} Wedding" />
  <meta name="mobile-web-app-capable" content="yes" />

  <!-- Manifest -->
  <link rel="manifest" href="./manifest.json" />

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap" rel="stylesheet" />

  <title>${brideName} & ${groomName} - Wedding Invitation</title>
  <link rel="stylesheet" href="styles.css" />
  <style>${themeStyles}</style>
  ${protection.protectionScript ? `<script data-protection="true">${protection.protectionScript}</script>` : ""}
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';" />
</head>
<body>
  ${generateHeaderHTML(branding, music, translations, getTranslation)}
  ${generateHeroHTML(brideName, groomName, weddingDate, countdownTarget, heroImage, translations, getTranslation)}
  ${generateCoupleHTML(couple, translations, getTranslation)}
  ${generateFathersLetterHTML(translations, getTranslation)}
  ${generateGalleryHTML(gallery, translations, getTranslation)}
  ${generateEventsHTML(events, translations, getTranslation)}
  ${generateVenueHTML(venue, translations, getTranslation)}
  ${generateRSVPHTML(rsvp, brideName, groomName, wedding, venue, translations, getTranslation)}
  ${generateFooterHTML(translations, getTranslation)}
  ${protection.copyrightFooter}
  ${generateHeaderScript(music)}
  ${generateCountdownScript(countdownTarget, translations)}
</body>
</html>`;
}

/**
 * Generate header HTML with music player
 */
function generateHeaderHTML(
  branding: { monogram?: string; logo?: string; title?: string; subtitle?: string } | undefined,
  music: { file?: string; volume?: number } | undefined,
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const monogram = branding?.monogram || "";
  const logo = branding?.logo;
  const title = branding?.title || "";
  const subtitle = branding?.subtitle || "";
  const musicFile = music?.file;
  const musicVolume = typeof music?.volume === "number" ? music.volume : 0.5;

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
          <a href="#top">${getTranslation("nav.home") || "Home"}</a>
          <a href="#couple">${getTranslation("nav.couple") || "Couple"}</a>
          <a href="#gallery">${getTranslation("nav.photos") || "Photos"}</a>
          <a href="#events">${getTranslation("nav.program") || "Program"}</a>
          <a href="#venue">${getTranslation("nav.venue") || "Venue"}</a>
          <a href="#rsvp">${getTranslation("nav.rsvp") || "RSVP"}</a>
        </nav>

        <div style="display: flex; align-items: center; gap: 10px;">
          ${
            musicFile
              ? `
            <div class="music-toggle" id="musicToggle">
              <div class="music-dot" id="musicDot"></div>
              <span id="musicToggleText">${getTranslation("music.play") || "Play Music"}</span>
            </div>
            <audio id="bg-music" loop>
              <source src="${musicFile}" type="audio/mpeg" />
            </audio>
          `
              : ""
          }
        </div>
      </div>
    </header>
  `;
}

/**
 * Generate hero section HTML
 */
function generateHeroHTML(
  brideName: string,
  groomName: string,
  weddingDate: string,
  countdownTarget: string | undefined,
  heroImage: string | undefined,
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const namesText =
    getTranslation("hero.names") || (brideName || groomName ? `${brideName} & ${groomName}` : "");
  const heroNames = namesText ? namesText.replace(/&/g, '<span class="hero-amp">&amp;</span>') : "";

  return `
    <section class="hero" id="top">
      <div class="hero-inner">
        <div>
          <div class="hero-eyebrow">${getTranslation("hero.eyebrow") || "The Wedding Of"}</div>
          <div class="hero-script">${getTranslation("hero.script") || "With the blessings of our families"}</div>
          <div class="hero-names">${heroNames}</div>
          <div class="hero-sub">${getTranslation("hero.sub") || "Two hearts, one destiny"}</div>
          <div class="hero-date">${getTranslation("hero.date") || weddingDate || "Date TBD"}</div>
          <div class="hero-location">${getTranslation("hero.location") || ""}</div>
          <div class="hero-divider"></div>
          ${
            countdownTarget
              ? `
            <div class="hero-countdown">
              <div class="hero-count-label">${getTranslation("hero.countdown") || "Countdown to Wedding"}</div>
              <div class="hero-countdown-values" id="countdown">Calculating...</div>
            </div>
          `
              : ""
          }
          <div class="hero-actions">
            <a href="#events" class="btn btn-primary">
              ${getTranslation("hero.actions.program") || "View Program Details"}
              <span class="btn-icon">↧</span>
            </a>
            <a href="#venue" class="btn btn-ghost">
              ${getTranslation("hero.actions.venue") || "View Venue & Directions"}
            </a>
            <a href="#rsvp" class="btn btn-primary">
              ${getTranslation("hero.actions.rsvp") || "RSVP Now"}
              <span class="btn-icon">✓</span>
            </a>
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
            <div class="hero-photo-caption">${getTranslation("hero.caption") || ""}</div>
          </aside>
        `
            : ""
        }
      </div>
    </section>
  `;
}

/**
 * Generate couple section HTML
 */
function generateCoupleHTML(
  couple: {
    bride?: { name?: string; image?: string; parents?: { mother?: string; father?: string } };
    groom?: { name?: string; image?: string; parents?: { mother?: string; father?: string } };
  },
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const brideName = bride.name || "Capt (Dr) Priya Singh";
  const brideMother = bride.parents?.mother || "Mrs. Geeta Singh";
  const brideFather = bride.parents?.father || "Mr. Sanjay Kumar Singh";
  const brideImage = bride.image || "";
  const groomName = groom.name || "Dr Saurabh Singh";
  const groomMother = groom.parents?.mother || "Mrs. Vibha Singh";
  const groomFather = groom.parents?.father || "Mr. Ashok Kumar Singh";
  const groomImage = groom.image || "";
  const togetherText =
    getTranslation("couple.together") ||
    `Together, ${brideName} and ${groomName} look forward to beginning this beautiful journey with your blessings and presence.`;

  return `
    <section id="couple">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("couple.eyebrow") || "Couple & Families"}</div>
        <div class="section-title">${getTranslation("couple.title") || "In Honoured Union"}</div>
        <div class="section-subtitle">${getTranslation("couple.subtitle") || "With immense joy, the families invite you to join them in celebrating the union of their children."}</div>
      </div>
      <div class="card">
        <div class="card-inner">
          <p class="muted" style="margin-bottom: 20px; text-align: center;">${togetherText}</p>
          <div class="couple-grid">
            <div>
              <h3 class="headline">${getTranslation("couple.bride") || "The Bride"}</h3>
              <p class="muted">
                <strong>${brideName}</strong><br />
                <span class="relation-label">${getTranslation("couple.daughter") || "Daughter of"}</span> <strong>${brideMother}</strong> & <strong>${brideFather}</strong>.
              </p>
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.mother") || "Mother"}</div>
                <div class="person-name">${brideMother}</div>
              </div>
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.father") || "Father"}</div>
                <div class="person-name">${brideFather}</div>
              </div>
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
              <h3 class="headline">${getTranslation("couple.groom") || "The Groom"}</h3>
              <p class="muted">
                <strong>${groomName}</strong><br />
                <span class="relation-label">${getTranslation("couple.son") || "Son of"}</span> <strong>${groomMother}</strong> & <strong>${groomFather}</strong>.
              </p>
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.mother") || "Mother"}</div>
                <div class="person-name">${groomMother}</div>
              </div>
              <div class="person-block">
                <div class="person-role">${getTranslation("couple.father") || "Father"}</div>
                <div class="person-name">${groomFather}</div>
              </div>
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
 * Generate father's letter section HTML
 */
function generateFathersLetterHTML(
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const bodyText = getTranslation("father.body") || "";
  const displayName = "family member and respected guest";
  const finalBodyText = bodyText.replace("{name}", displayName);

  return `
    <section id="fathers-letter">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("father.eyebrow") || "From Priya's Father"}</div>
        <div class="section-title">${getTranslation("father.title") || "A Few Words From the Heart"}</div>
      </div>
      <div class="card">
        <div class="card-inner">
          <p class="muted" style="white-space: pre-line;">${finalBodyText}</p>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate gallery section HTML
 */
function generateGalleryHTML(
  gallery: { images?: Array<{ src: string; alt?: string; orientation?: string }> } | undefined,
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const galleryImages = gallery?.images || [];
  if (galleryImages.length === 0) return "";

  return `
    <section id="gallery">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("gallery.eyebrow") || "Photo Story"}</div>
        <div class="section-title">${getTranslation("gallery.title") || "Our Journey in Moments"}</div>
        <div class="section-subtitle">${getTranslation("gallery.subtitle") || "A few glimpses from the memories and moments that bring us here today."}</div>
      </div>
      <div class="card">
        <div class="card-inner">
          <div class="gallery-grid">
            ${galleryImages
              .map((img) => {
                const isPortrait =
                  img.orientation === "portrait" || /portrait/i.test(img.alt || "");
                return `
                  <div class="gallery-item">
                    <div class="gallery-inner${isPortrait ? " tall" : ""}">
                      <img src="${img.src}" alt="${img.alt || ""}" loading="lazy" />
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
 * Generate events section HTML
 */
function generateEventsHTML(
  events:
    | {
        day1?: {
          date?: string;
          events?: Array<{
            emoji?: string;
            image?: string;
            label?: string;
            tag?: string;
            time?: string;
          }>;
        };
        day2?: {
          date?: string;
          events?: Array<{
            emoji?: string;
            image?: string;
            label?: string;
            tag?: string;
            time?: string;
          }>;
        };
      }
    | undefined,
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const day1Config = events?.day1 || {};
  const day2Config = events?.day2 || {};
  const day1Events = day1Config.events || [];
  const day2Events = day2Config.events || [];
  const day1Date = day1Config.date || "Thursday · 22 January 2026";
  const day2Date = day2Config.date || "Friday · 23 January 2026";

  if (day1Events.length === 0 && day2Events.length === 0) return "";

  return `
    <section id="events">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("events.eyebrow") || "Program Details"}</div>
        <div class="section-title">${getTranslation("events.title") || "The Celebrations"}</div>
        <div class="section-subtitle">${getTranslation("events.subtitle") || "We would be honoured by your presence at each of these moments of joy."}</div>
      </div>
      <div class="card">
        <div class="card-inner event-grid">
          <div class="event-day">
            <div class="event-date-label">${getTranslation("events.day1") || "Day One"}</div>
            <div class="event-date-main">${day1Date}</div>
            ${day1Events
              .map(
                (event) => `
              <div class="event-item">
                <div class="event-icon-wrapper">
                  ${event.emoji ? `<div class="event-icon-emoji">${event.emoji}</div>` : event.image ? `<img src="${event.image}" alt="${event.label || ""}" class="event-icon-image" />` : ""}
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
          <div class="event-day">
            <div class="event-date-label">${getTranslation("events.day2") || "Day Two"}</div>
            <div class="event-date-main">${day2Date}</div>
            ${day2Events
              .map(
                (event) => `
              <div class="event-item">
                <div class="event-icon-wrapper">
                  ${event.emoji ? `<div class="event-icon-emoji">${event.emoji}</div>` : event.image ? `<img src="${event.image}" alt="${event.label || ""}" class="event-icon-image" />` : ""}
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
        </div>
        <p class="muted" style="margin-top: 14px; font-size: 12px;">
          ${getTranslation("events.complete") || "Your presence and blessings at these ceremonies will make our celebration truly complete."}
        </p>
      </div>
    </section>
  `;
}

/**
 * Generate venue section HTML
 */
function generateVenueHTML(
  venue: {
    name?: string;
    address?: string;
    tags?: string[];
    mapsUrl?: string;
    mapsEmbedUrl?: string;
  },
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const venueName = venue.name || "Royal Lotus View Resotel";
  const venueAddress = venue.address || "";
  const venueTags = venue.tags || [];
  const mapsUrl = venue.mapsUrl || "";
  const mapsEmbedUrl = venue.mapsEmbedUrl || "";

  return `
    <section id="venue">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("venue.eyebrow") || "Venue"}</div>
        <div class="section-title">${getTranslation("venue.title") || "Where to Join Us"}</div>
        <div class="section-subtitle">${getTranslation("venue.subtitle") || "A serene and elegant venue to witness the beginning of a lifetime of togetherness."}</div>
      </div>
      <div class="card">
        <div class="card-inner venue-grid">
          <div>
            <h3 class="headline">${venueName}</h3>
            <p class="venue-address" style="white-space: pre-line;">${venueAddress}</p>
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
              ${getTranslation("venue.arrive") || "Kindly arrive a little early to comfortably join us for the ceremonies. Our families eagerly await to welcome you with warmth and love."}
            </p>
            ${
              mapsUrl
                ? `
              <a class="btn btn-primary" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
                ${getTranslation("venue.maps") || "Open in Google Maps"}
                <span class="btn-icon">➚</span>
              </a>
            `
                : ""
            }
          </div>
          ${
            mapsEmbedUrl
              ? `
            <div class="map-card" aria-label="Venue map preview">
              <iframe class="map-embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapsEmbedUrl}" title="Venue Location"></iframe>
              <div class="map-footer">
                <span>Tap below to open the venue in your Maps.</span>
                ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">View full map ↗</a>` : ""}
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate RSVP section HTML
 */
function generateRSVPHTML(
  rsvp: { contacts?: Array<{ badge?: string; name?: string }> } | undefined,
  brideName: string,
  groomName: string,
  wedding: { dates?: string[]; venue?: { name?: string; city?: string } },
  venue: { name?: string; city?: string },
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  const contacts = rsvp?.contacts || [];
  const dates = wedding.dates || [];
  const venueName = venue.name || "";
  const venueCity = venue.city || "";

  return `
    <section id="rsvp">
      <div class="section-header">
        <div class="section-eyebrow">${getTranslation("rsvp.eyebrow") || "RSVP"}</div>
        <div class="section-title">${getTranslation("rsvp.title") || "With Warm Regards"}</div>
        <div class="section-subtitle">${getTranslation("rsvp.subtitle") || "Kindly confirm your presence and feel free to reach out for any assistance."}</div>
      </div>
      <div class="card">
        <div class="card-inner">
          <p class="rsvp-text">
            ${getTranslation("rsvp.text") || "On behalf of both families, you may contact the following for confirmations, travel details, or any other queries:"}
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
            <a class="btn btn-primary" href="#rsvp">
              ${getTranslation("hero.actions.rsvp") || "RSVP Now"}
              <span class="btn-icon">✓</span>
            </a>
            <a class="btn btn-ghost" href="#" onclick="handleWhatsAppShare(event); return false;" target="_blank" rel="noopener noreferrer">
              ${getTranslation("rsvp.share.button") || "Share Invitation on WhatsApp"}
            </a>
            <p class="small-note">
              ${getTranslation("rsvp.share.note") || "You may share this link with friends and family whom you wish to invite."}
            </p>
          </div>
        </div>
      </div>
    </section>
    <script>
      function handleWhatsAppShare(e) {
        e.preventDefault();
        const pageUrl = window.location.href;
        const dates = ${JSON.stringify(dates)};
        const formatDates = function(dates) {
          if (dates.length === 1) {
            return new Date(dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
          }
          return dates.map(function(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long" }); }).join(" and ") + " " + new Date(dates[0]).getFullYear();
        };
        const formattedDates = formatDates(dates);
        const defaultMessage = "You are warmly invited to the wedding of ${brideName} and ${groomName} on " + formattedDates + " at ${venueName}, ${venueCity}.\\n\\nPlease tap the link to view the full invitation:\\n";
        const message = encodeURIComponent(defaultMessage + pageUrl);
        window.open("https://wa.me/?text=" + message, "_blank");
      }
    </script>
  `;
}

/**
 * Generate footer HTML
 */
function generateFooterHTML(
  translations: Record<string, unknown> | undefined,
  getTranslation: (key: string) => string
): string {
  return `
    <footer class="site-footer">
      <div class="footer-main">${getTranslation("footer.compliments") || "With Best Compliments"}</div>
      <div class="footer-line">${getTranslation("footer.families") || "From the families of Capt (Dr) Priya Singh & Dr Saurabh Singh"}</div>
      <div class="footer-flowers">${getTranslation("footer.flowers") || "Awaiting eyes • Blooming hearts • Cherished invitations, timeless blessings"}</div>
      <div class="footer-mini">${getTranslation("footer.waiting") || "We look forward to celebrating with you"}</div>
    </footer>
  `;
}

/**
 * Generate JavaScript for music player
 */
function generateHeaderScript(music: { file?: string; volume?: number } | undefined): string {
  const musicFile = music?.file;
  const musicVolume = typeof music?.volume === "number" ? music.volume : 0.5;

  if (!musicFile) return "";

  return `
    <script>
      (function() {
        const audio = document.getElementById('bg-music');
        const toggle = document.getElementById('musicToggle');
        const dot = document.getElementById('musicDot');
        const text = document.getElementById('musicToggleText');
        if (!audio || !toggle || !dot || !text) return;

        let isPlaying = false;
        audio.volume = ${musicVolume};

        const updateUI = function(playing) {
          if (playing) {
            dot.classList.add('on');
            text.textContent = 'Pause Music';
          } else {
            dot.classList.remove('on');
            text.textContent = 'Play Music';
          }
        };

        audio.addEventListener('play', function() {
          isPlaying = true;
          updateUI(true);
        });

        audio.addEventListener('pause', function() {
          isPlaying = false;
          updateUI(false);
        });

        toggle.addEventListener('click', function() {
          if (isPlaying) {
            audio.pause();
          } else {
            audio.play().catch(function() {});
          }
        });

        // Try autoplay
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            isPlaying = false;
            updateUI(false);
          });
        }
      })();
    </script>
  `;
}

/**
 * Generate JavaScript for countdown
 */
function generateCountdownScript(
  countdownTarget: string | undefined,
  translations: Record<string, unknown> | undefined
): string {
  if (!countdownTarget) return "";

  const todayText =
    (translations?.["countdown.today"] as string) ||
    "Today we humbly celebrate this blessed union.";

  return `
    <script>
      (function() {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;

        const target = new Date('${countdownTarget}');
        if (isNaN(target.getTime())) return;

        function update() {
          const now = new Date();
          const diff = target - now;

          if (diff <= 0) {
            countdownEl.textContent = '${todayText}';
            return;
          }

          const seconds = Math.floor(diff / 1000);
          const days = Math.floor(seconds / (3600 * 24));
          const hours = Math.floor((seconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);

          countdownEl.textContent = days + 'd • ' + hours + 'h • ' + minutes + 'm';
        }

        update();
        setInterval(update, 60 * 1000);
      })();
    </script>
  `;
}

export default generateHTML;
