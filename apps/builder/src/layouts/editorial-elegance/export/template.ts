/**
 * Editorial Elegance Export Template
 * Generates HTML for exporting the editorial-elegance layout invitation
 */

import type { InvitationData } from "@shared/types/wedding-data";
import { generateCSS } from "./styles";

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

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = (
    typeof theme.colors === "object" && theme.colors !== null ? theme.colors : {}
  ) as Record<string, unknown>;
  const fonts = (
    typeof theme.fonts === "object" && theme.fonts !== null ? theme.fonts : {}
  ) as Record<string, unknown>;

  // Generate font imports
  const fontImports = generateFontImports(fonts);

  // Generate inline styles based on theme
  const getColor = (path: string[], fallback: string): string => {
    let value: unknown = colors;
    for (const key of path) {
      if (typeof value === "object" && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return fallback;
      }
    }
    return typeof value === "string" ? value : fallback;
  };

  const themeStyles = `
    :root {
      --ee-color-bg: ${getColor(["background", "page"], getColor(["background"], "#FAF9F7"))};
      --ee-color-text: ${getColor(["text", "primary"], getColor(["text"], "#1C1C1C"))};
      --ee-color-secondary: ${getColor(["secondary"], "#6B6B6B")};
      --ee-color-accent: ${getColor(["primary"], "#C6A15B")};
      --ee-color-divider: ${getColor(["divider"], "#E6E6E6")};
      --font-heading: ${(fonts.heading as string) || "Playfair Display"}, serif;
      --font-body: ${(fonts.body as string) || "Inter"}, sans-serif;
      --font-script: ${(fonts.script as string) || "Playfair Display"}, serif;
    }
  `;

  // Import CSS from styles.ts
  const css = await generateCSS(invitation);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding invitation for ${brideName} & ${groomName}" />
  <title>${brideName} & ${groomName} - Wedding</title>

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="${colors.primary || "#C6A15B"}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${brideName} & ${groomName} Wedding" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${fontImports}

  <!-- Inline Styles -->
  <style>
    ${themeStyles}
    ${css}
  </style>
</head>
<body class="editorial-elegance">
  ${generateBodyHTML(invitation, translations)}
</body>
</html>`;
}

/**
 * Generate font import links
 */
function generateFontImports(fonts: { heading?: string; body?: string; script?: string }): string {
  const fontList = new Set<string>();

  if (fonts.heading) fontList.add(fonts.heading);
  if (fonts.body) fontList.add(fonts.body);
  if (fonts.script) fontList.add(fonts.script);

  const fontUrls = Array.from(fontList)
    .map((font) => {
      const fontName = font.replace(/\s+/g, "+");
      return `<link href="https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600&display=swap" rel="stylesheet" />`;
    })
    .join("\n  ");

  return fontUrls;
}

/**
 * Generate body HTML for the invitation
 */
function generateBodyHTML(
  invitation: InvitationData,
  _translations?: Record<string, unknown>
): string {
  const { data } = invitation;
  const couple = data?.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = data?.wedding || {};
  const venue = wedding?.venue || {};
  const editorialIntro =
    ((data as Record<string, unknown>)?.editorialIntro as Record<string, unknown> | undefined) ||
    {};
  const events = (data as Record<string, unknown>)?.events as
    | { events?: Array<Record<string, unknown>> }
    | undefined;
  const eventsList = events?.events || [];
  const gallery = (data as Record<string, unknown>)?.gallery as
    | { images?: Array<{ src: string; alt?: string }> }
    | undefined;
  const galleryImages = gallery?.images || [];

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const weddingDate = wedding.dates?.[0] || "Date TBD";
  const city = venue.city || "City";

  // Date formatting with error handling
  const formatDate = (dateStr: string | Date | undefined): string => {
    if (!dateStr || dateStr === "Date TBD" || dateStr === "") {
      return "";
    }
    try {
      const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
      if (isNaN(date.getTime())) {
        return "";
      }
      return date
        .toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .toUpperCase();
    } catch {
      return "";
    }
  };

  let html = "";

  // Hero Section
  const heroData = (data as Record<string, unknown>)?.hero as { mainImage?: string } | undefined;
  const heroImage = heroData?.mainImage || "";
  html += `
    <section class="ee-hero" data-alignment="center">
      <div class="ee-hero-media">
        ${heroImage ? `<img src="${heroImage}" alt="${brideName} & ${groomName}" class="ee-hero-image" />` : ""}
        <div class="ee-hero-overlay"></div>
      </div>
      <div class="ee-hero-content">
        <div class="ee-hero-text">
          <h1 class="ee-hero-names">${brideName} & ${groomName}</h1>
          <div class="ee-divider"></div>
          ${formatDate(weddingDate) ? `<p class="ee-meta-text ee-hero-date">${formatDate(weddingDate)}</p>` : ""}
          <p class="ee-meta-text ee-hero-location">${city}</p>
        </div>
        <div class="ee-scroll-indicator">
          <span class="ee-scroll-line"></span>
        </div>
      </div>
    </section>
  `;

  // Countdown Section
  const countdownTarget = wedding.countdownTarget as string | undefined;
  if (countdownTarget) {
    try {
      const target = new Date(countdownTarget);
      if (!isNaN(target.getTime())) {
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        if (diff > 0) {
          const totalSeconds = Math.floor(diff / 1000);
          const days = Math.floor(totalSeconds / (3600 * 24));
          const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          const countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          html += `
            <section class="ee-section ee-countdown-section">
              <div class="ee-countdown-container">
                <p class="ee-meta-text">THE BIG DAY</p>
                <div class="ee-countdown-values">${countdown}</div>
              </div>
            </section>
          `;
        } else {
          html += `
            <section class="ee-section ee-countdown-section">
              <div class="ee-countdown-container">
                <p class="ee-meta-text">THE BIG DAY</p>
                <div class="ee-countdown-values">Today</div>
              </div>
            </section>
          `;
        }
      }
    } catch {
      // Invalid date, skip countdown
    }
  }

  // Quote Section
  const quote = (data as Record<string, unknown>)?.quote as
    | { text?: string; attribution?: string }
    | undefined;
  if (quote?.text) {
    let attribution = quote.attribution || "";
    if (!attribution || attribution.toLowerCase() === "rumi" || attribution === "RUMI") {
      attribution = groomName;
    }
    html += `
      <section class="ee-section ee-quote-section">
        <div class="ee-quote-container">
          <blockquote class="ee-quote-text">${quote.text}</blockquote>
          ${attribution ? `<cite class="ee-quote-attribution">— ${attribution}</cite>` : ""}
        </div>
      </section>
    `;
  }

  // Editorial Intro
  if (editorialIntro.text) {
    html += `
      <section class="ee-section ee-editorial-intro-section">
        <div class="ee-intro-container ee-intro-right">
          <div class="ee-intro-text">
            <p class="ee-editorial-intro">${editorialIntro.text}</p>
          </div>
          <div class="ee-intro-image-container">
            ${editorialIntro.image ? `<img src="${editorialIntro.image}" alt="Couple portrait" class="ee-intro-image" />` : ""}
          </div>
        </div>
      </section>
    `;
  }

  // Couple Section
  const brideImage = bride.image as string | undefined;
  const groomImage = groom.image as string | undefined;
  const brideMother = ((bride.parents as Record<string, unknown>)?.mother as string) || "";
  const brideFather = ((bride.parents as Record<string, unknown>)?.father as string) || "";
  const groomMother = ((groom.parents as Record<string, unknown>)?.mother as string) || "";
  const groomFather = ((groom.parents as Record<string, unknown>)?.father as string) || "";
  if (brideImage || groomImage || brideName || groomName) {
    html += `
      <section class="ee-section ee-couple-section">
        <div class="ee-section-header">
          <h2 class="ee-section-heading">The Couple</h2>
          <div class="ee-divider" />
        </div>
        <div class="ee-couple-grid">
          <div class="ee-couple-member">
            ${
              brideImage
                ? `
            <div class="ee-couple-image-wrapper">
              <img src="${brideImage}" alt="${brideName}" class="ee-couple-image" />
            </div>
            `
                : ""
            }
            <p class="ee-meta-text ee-couple-label">THE BRIDE</p>
            <h3 class="ee-couple-name">${brideName}</h3>
            ${
              brideMother || brideFather
                ? `
            <div class="ee-couple-parents">
              <p class="ee-couple-parents-label">Daughter of</p>
              ${brideMother ? `<p class="ee-couple-parent-name">${brideMother}</p>` : ""}
              ${brideFather ? `<p class="ee-couple-parent-name">${brideFather}</p>` : ""}
            </div>
            `
                : ""
            }
          </div>
          <div class="ee-couple-member">
            ${
              groomImage
                ? `
            <div class="ee-couple-image-wrapper">
              <img src="${groomImage}" alt="${groomName}" class="ee-couple-image" />
            </div>
            `
                : ""
            }
            <p class="ee-meta-text ee-couple-label">THE GROOM</p>
            <h3 class="ee-couple-name">${groomName}</h3>
            ${
              groomMother || groomFather
                ? `
            <div class="ee-couple-parents">
              <p class="ee-couple-parents-label">Son of</p>
              ${groomMother ? `<p class="ee-couple-parent-name">${groomMother}</p>` : ""}
              ${groomFather ? `<p class="ee-couple-parent-name">${groomFather}</p>` : ""}
            </div>
            `
                : ""
            }
          </div>
        </div>
      </section>
    `;
  }

  // Love Story Section
  const story = (data as Record<string, unknown>)?.story as
    | {
        text?: string;
        chapters?: Array<{ title?: string; text?: string }>;
        pullQuotes?: Array<{ text?: string; attribution?: string }>;
      }
    | undefined;
  if (story?.text || (story?.chapters && story.chapters.length > 0)) {
    html += `
      <section class="ee-section ee-story-section">
        <div class="ee-story-container">
          <h2 class="ee-section-heading">Our Story</h2>
          <div class="ee-divider" />
          ${
            story.text
              ? `
          <div class="ee-story-main">
            <p class="ee-story-text ee-drop-cap">${story.text}</p>
          </div>
          `
              : ""
          }
          ${
            story.chapters && story.chapters.length > 0
              ? `
          <div class="ee-story-chapters">
            ${story.chapters
              .map(
                (chapter, index) => `
              <div class="ee-story-chapter">
                <h3 class="ee-story-chapter-title">${chapter.title || `Chapter ${index + 1}`}</h3>
                ${chapter.text ? `<p class="ee-story-chapter-text">${chapter.text}</p>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
          ${
            story.pullQuotes && story.pullQuotes.length > 0
              ? `
          <div class="ee-story-pull-quotes">
            ${story.pullQuotes
              .map(
                (quote) => `
              <blockquote class="ee-pull-quote">
                ${quote.text || ""}
                ${quote.attribution ? `<cite class="ee-pull-quote-attribution">— ${quote.attribution}</cite>` : ""}
              </blockquote>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  // Events
  if (eventsList.length > 0) {
    html += `
      <section class="ee-section ee-events-section">
        <div class="ee-section-header">
          <h2 class="ee-section-heading">Events</h2>
          <div class="ee-divider"></div>
        </div>
        <div class="ee-event-cards">
          ${eventsList
            .map(
              (event: Record<string, unknown>) => `
            <div class="ee-event-card">
              <div class="ee-event-card-inner">
                <h3 class="ee-event-name">${event.label || ""}</h3>
                ${formatDate(event.date as string) ? `<p class="ee-meta-text ee-event-date">${formatDate(event.date as string)}</p>` : ""}
                <div class="ee-event-details">
                  <p class="ee-event-venue">${event.venue || "Venue TBD"}</p>
                  <p class="ee-event-time">${event.time || ""}</p>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  // Wedding Party Section
  const weddingParty = (data as Record<string, unknown>)?.weddingParty as
    | { members?: Array<{ name?: string; title?: string; image?: string; bio?: string }> }
    | undefined;
  if (weddingParty?.members && weddingParty.members.length > 0) {
    html += `
      <section class="ee-section ee-wedding-party-section">
        <div class="ee-section-header">
          <h2 class="ee-section-heading">Wedding Party</h2>
          <div class="ee-divider" />
        </div>
        <div class="ee-party-grid">
          ${weddingParty.members
            .map(
              (member) => `
            <div class="ee-party-member">
              ${
                member.image
                  ? `
              <div class="ee-party-image-wrapper">
                <img src="${member.image}" alt="${member.name || ""}" class="ee-party-image" />
              </div>
              `
                  : ""
              }
              ${member.title ? `<p class="ee-meta-text ee-party-title">${member.title}</p>` : ""}
              ${member.name ? `<h3 class="ee-party-name">${member.name}</h3>` : ""}
              ${member.bio ? `<p class="ee-party-bio">${member.bio}</p>` : ""}
            </div>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  // Gallery
  if (galleryImages.length > 0) {
    html += `
      <section class="ee-section ee-gallery-section">
        <div class="ee-gallery-container ee-gallery-masonry">
          ${galleryImages
            .slice(0, 12)
            .map(
              (img) => `
            <div class="ee-gallery-item">
              <img src="${img.src}" alt="${img.alt || ""}" class="ee-gallery-image" loading="lazy" />
            </div>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  // Dress Code Section
  const dressCode = (data as Record<string, unknown>)?.dressCode as
    | {
        colors?: Array<{ value?: string; label?: string } | string>;
        styleText?: string;
        inspirationImages?: Array<{ src?: string; alt?: string } | string>;
      }
    | undefined;
  if (dressCode?.styleText || (dressCode?.colors && dressCode.colors.length > 0)) {
    html += `
      <section class="ee-section ee-dress-code-section">
        <div class="ee-dress-code-container">
          <h2 class="ee-section-heading">Dress Code</h2>
          <div class="ee-divider" />
          ${dressCode.styleText ? `<p class="ee-dress-code-text">${dressCode.styleText}</p>` : ""}
          ${
            dressCode.colors && dressCode.colors.length > 0
              ? `
          <div class="ee-dress-code-colors">
            ${dressCode.colors
              .map((color, index) => {
                const colorValue = typeof color === "string" ? color : color.value || "";
                const colorLabel = typeof color === "object" ? color.label : "";
                return `
                <div class="ee-color-swatch">
                  <div class="ee-color-swatch-circle" style="background-color: ${colorValue}"></div>
                  ${colorLabel ? `<span class="ee-color-swatch-label">${colorLabel}</span>` : ""}
                </div>
              `;
              })
              .join("")}
          </div>
          `
              : ""
          }
          ${
            dressCode.inspirationImages && dressCode.inspirationImages.length > 0
              ? `
          <div class="ee-dress-code-inspiration">
            ${dressCode.inspirationImages
              .map((image, index) => {
                const imgSrc = typeof image === "string" ? image : image.src || "";
                const imgAlt =
                  typeof image === "object"
                    ? image.alt || `Inspiration ${index + 1}`
                    : `Inspiration ${index + 1}`;
                return `
                <div class="ee-inspiration-image">
                  <img src="${imgSrc}" alt="${imgAlt}" />
                </div>
              `;
              })
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  // Registry Section
  const registry = (data as Record<string, unknown>)?.registry as
    | { introText?: string; links?: Array<{ label?: string; url?: string }> }
    | undefined;
  if (registry?.introText || (registry?.links && registry.links.length > 0)) {
    html += `
      <section class="ee-section ee-registry-section">
        <div class="ee-registry-container">
          <h2 class="ee-section-heading">Registry</h2>
          <div class="ee-divider" />
          ${registry.introText ? `<p class="ee-registry-intro">${registry.introText}</p>` : ""}
          ${
            registry.links && registry.links.length > 0
              ? `
          <div class="ee-registry-links">
            ${registry.links
              .map(
                (link) => `
              <a href="${link.url || "#"}" target="_blank" rel="noopener noreferrer" class="ee-link ee-registry-link">
                ${link.label || link.url || ""}
              </a>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  // Guest Notes Section
  const guestNotes = (data as Record<string, unknown>)?.guestNotes as
    | { messages?: Array<{ text?: string; author?: string }> }
    | undefined;
  if (guestNotes?.messages && guestNotes.messages.length > 0) {
    html += `
      <section class="ee-section ee-guest-notes-section">
        <div class="ee-guest-notes-container">
          <h2 class="ee-section-heading">Messages from Our Guests</h2>
          <div class="ee-divider" />
          <div class="ee-guest-notes-grid">
            ${guestNotes.messages
              .map(
                (message) => `
              <div class="ee-guest-note-card">
                <p class="ee-guest-note-text">${message.text || ""}</p>
                ${message.author ? `<p class="ee-guest-note-author">— ${message.author}</p>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  // RSVP Section
  const rsvp = (data as Record<string, unknown>)?.rsvp as Record<string, unknown> | undefined;
  if (rsvp) {
    html += `
      <section class="ee-section ee-rsvp-section">
        <div class="ee-rsvp-container">
          <h2 class="ee-section-heading">RSVP</h2>
          <div class="ee-divider" />
          <form class="ee-rsvp-form">
            <div class="ee-form-field">
              <input type="text" placeholder="Your Name" required class="ee-input" />
            </div>
            <div class="ee-form-field">
              <select required class="ee-input">
                <option value="">Will you attend?</option>
                <option value="yes">Yes, I'll be there</option>
                <option value="no">Regretfully, I cannot attend</option>
              </select>
            </div>
            <div class="ee-form-field">
              <input type="number" min="1" placeholder="Number of guests" class="ee-input" />
            </div>
            <div class="ee-form-field">
              <textarea placeholder="Message (optional)" rows="3" class="ee-input ee-textarea"></textarea>
            </div>
            <button type="submit" class="ee-submit-button">Submit Response</button>
          </form>
        </div>
      </section>
    `;
  }

  // FAQ Section
  const faq = (data as Record<string, unknown>)?.faq as
    | { questions?: Array<{ question: string; answer: string }> }
    | undefined;
  if (faq?.questions && faq.questions.length > 0) {
    html += `
      <section class="ee-section ee-faq-section">
        <div class="ee-faq-container">
          <h2 class="ee-section-heading">FAQ</h2>
          <div class="ee-divider" />
          <div class="ee-faq-list">
            ${faq.questions
              .map(
                (item, index) => `
              <div class="ee-faq-item">
                <button type="button" class="ee-faq-question" aria-expanded="false">
                  ${item.question || ""}
                  <span class="ee-faq-toggle">+</span>
                </button>
                <div class="ee-faq-answer" style="display: none;">
                  <p>${item.answer || ""}</p>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  // Contact Section
  const contact = (data as Record<string, unknown>)?.contact as
    | {
        title?: string;
        contacts?: Array<{ name?: string; role?: string; email?: string; phone?: string }>;
        email?: string;
        phone?: string;
      }
    | undefined;
  if (
    contact?.title ||
    (contact?.contacts && contact.contacts.length > 0) ||
    contact?.email ||
    contact?.phone
  ) {
    html += `
      <section class="ee-section ee-contact-section">
        <div class="ee-contact-container">
          <h2 class="ee-section-heading">Contact</h2>
          <div class="ee-divider" />
          ${contact.title ? `<p class="ee-contact-intro">${contact.title}</p>` : ""}
          ${
            contact.contacts && contact.contacts.length > 0
              ? `
          <div class="ee-contact-list">
            ${contact.contacts
              .map(
                (contactItem) => `
              <div class="ee-contact-item">
                ${contactItem.name ? `<h3 class="ee-contact-name">${contactItem.name}</h3>` : ""}
                ${contactItem.role ? `<p class="ee-contact-role">${contactItem.role}</p>` : ""}
                ${contactItem.email ? `<a href="mailto:${contactItem.email}" class="ee-link">${contactItem.email}</a>` : ""}
                ${contactItem.phone ? `<a href="tel:${contactItem.phone}" class="ee-link">${contactItem.phone}</a>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
          ${
            contact.email || contact.phone
              ? `
          <div class="ee-contact-direct">
            ${contact.email ? `<a href="mailto:${contact.email}" class="ee-link">${contact.email}</a>` : ""}
            ${contact.phone ? `<a href="tel:${contact.phone}" class="ee-link">${contact.phone}</a>` : ""}
          </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  // Location
  if (venue.name) {
    html += `
      <section class="ee-section ee-location-section">
        <div class="ee-location-container">
          <div class="ee-location-details">
            <p class="ee-meta-text">THE CEREMONY</p>
            <h2 class="ee-section-heading">${venue.name}</h2>
            <div class="ee-divider" style="margin: var(--ee-space-sm) 0"></div>
            <p class="ee-location-address">
              ${venue.address || ""}<br />
              ${venue.city || ""}, ${venue.state || ""}
            </p>
            ${venue.mapsUrl ? `<a href="${venue.mapsUrl}" target="_blank" rel="noopener noreferrer" class="ee-link ee-map-link">Open in Maps →</a>` : ""}
          </div>
          <div class="ee-location-map ee-map-desaturated">
            ${venue.mapsEmbedUrl ? `<iframe src="${venue.mapsEmbedUrl}" width="100%" height="100%" style="border: 0" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map to ${venue.name}"></iframe>` : '<div class="ee-map-placeholder"><p>Map will be displayed here</p></div>'}
          </div>
        </div>
      </section>
    `;
  }

  // Travel Section
  const travel = (data as Record<string, unknown>)?.travel as
    | {
        cityIntro?: string;
        hotels?: Array<{ name?: string; description?: string; address?: string; website?: string }>;
      }
    | undefined;
  if (travel?.cityIntro || (travel?.hotels && travel.hotels.length > 0)) {
    html += `
      <section class="ee-section ee-travel-section">
        <div class="ee-travel-container">
          <h2 class="ee-section-heading">Travel & Stay</h2>
          <div class="ee-divider" />
          ${travel.cityIntro ? `<p class="ee-travel-intro">${travel.cityIntro}</p>` : ""}
          ${
            travel.hotels && travel.hotels.length > 0
              ? `
          <div class="ee-travel-hotels">
            ${travel.hotels
              .map(
                (hotel) => `
              <div class="ee-hotel-card">
                ${hotel.name ? `<h3 class="ee-hotel-name">${hotel.name}</h3>` : ""}
                ${hotel.description ? `<p class="ee-hotel-description">${hotel.description}</p>` : ""}
                ${hotel.address ? `<p class="ee-hotel-address">${hotel.address}</p>` : ""}
                ${hotel.website ? `<a href="${hotel.website}" target="_blank" rel="noopener noreferrer" class="ee-link">Visit Website →</a>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  // Things to Do Section
  const thingsToDo = (data as Record<string, unknown>)?.thingsToDo as
    | {
        intro?: string;
        activities?: Array<{
          name?: string;
          category?: string;
          description?: string;
          address?: string;
        }>;
      }
    | undefined;
  if (thingsToDo?.intro || (thingsToDo?.activities && thingsToDo.activities.length > 0)) {
    html += `
      <section class="ee-section ee-things-to-do-section">
        <div class="ee-things-to-do-container">
          <h2 class="ee-section-heading">Things to Do</h2>
          <div class="ee-divider" />
          ${thingsToDo.intro ? `<p class="ee-things-to-do-intro">${thingsToDo.intro}</p>` : ""}
          ${
            thingsToDo.activities && thingsToDo.activities.length > 0
              ? `
          <div class="ee-things-to-do-activities">
            ${thingsToDo.activities
              .map(
                (activity) => `
              <div class="ee-activity-item">
                ${activity.name ? `<h3 class="ee-activity-name">${activity.name}</h3>` : ""}
                ${activity.category ? `<span class="ee-activity-category">${activity.category}</span>` : ""}
                ${activity.description ? `<p class="ee-activity-description">${activity.description}</p>` : ""}
                ${activity.address ? `<p class="ee-activity-address">${activity.address}</p>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  // Gallery
  html += `
    <footer class="ee-section ee-footer-section">
      <div class="ee-footer-container" style="text-align: center;">
        <h3 class="ee-section-heading" style="font-size: 32px; margin-bottom: var(--ee-space-sm);">
          ${brideName} & ${groomName}
        </h3>
        <p style="color: var(--ee-color-secondary); font-size: 14px;">
          With love and gratitude
        </p>
        <div class="ee-divider" style="margin-top: var(--ee-space-md);"></div>
        <p style="color: var(--ee-color-secondary); font-size: 12px; margin-top: var(--ee-space-sm);">
          © ${new Date().getFullYear()}
        </p>
      </div>
    </footer>
  `;

  return html;
}
