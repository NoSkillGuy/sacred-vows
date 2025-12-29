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
 * Editorial Elegance Export Template
 * Generates HTML for exporting the editorial-elegance layout invitation
 */

import type { InvitationData } from "@shared/types/wedding-data";
import { generateCSS } from "./styles";
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

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Generate font imports
  const fontImports = generateFontImports(fonts);

  // Generate inline styles based on theme
  const themeStyles = `
    :root {
      --ee-color-bg: ${colors.background?.page || colors.background || "#FAF9F7"};
      --ee-color-text: ${colors.text?.primary || colors.text || "#1C1C1C"};
      --ee-color-secondary: ${colors.secondary || "#6B6B6B"};
      --ee-color-accent: ${colors.primary || "#C6A15B"};
      --ee-color-divider: ${colors.divider || "#E6E6E6"};
      --font-heading: ${fonts.heading || "Playfair Display"}, serif;
      --font-body: ${fonts.body || "Inter"}, sans-serif;
      --font-script: ${fonts.script || "Playfair Display"}, serif;
    }
  `;

  // Import CSS from styles.ts
  const css = await generateCSS(invitation);

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
  ${protection.protectionScript ? `<script data-protection="true">${protection.protectionScript}</script>` : ""}
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';" />
</head>
<body class="editorial-elegance">
  ${generateBodyHTML(invitation, translations)}
  ${protection.copyrightFooter}
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

  // Footer
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
