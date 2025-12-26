/**
 * Editorial Elegance Export Styles
 * Concatenates and exports all CSS for the layout
 */

import type { InvitationData } from "@shared/types/wedding-data";

/**
 * Generate complete CSS for the invitation export
 * @param invitation - Invitation data with layoutConfig
 * @returns Promise with complete CSS string
 */
export async function generateCSS(invitation: InvitationData): Promise<string> {
  // In build environment, CSS is already processed
  // This function mainly handles dynamic theme variable injection

  const { layoutConfig, data } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Base CSS structure (would be imported from actual CSS files in production)
  const css = `
    /* Editorial Elegance - Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      /* Colors */
      --ee-color-bg: ${colors.background?.page || colors.background || "#FAF9F7"};
      --ee-color-text: ${colors.text?.primary || colors.text || "#1C1C1C"};
      --ee-color-secondary: ${colors.secondary || "#6B6B6B"};
      --ee-color-accent: ${colors.primary || "#C6A15B"};
      --ee-color-divider: ${colors.divider || "#E6E6E6"};

      /* Spacing */
      --ee-space-xs: 12px;
      --ee-space-sm: 24px;
      --ee-space-md: 48px;
      --ee-space-lg: 80px;
      --ee-space-xl: 120px;
      --ee-space-section: clamp(80px, 10vh, 160px);

      /* Typography */
      --ee-text-hero: clamp(48px, 8vw, 80px);
      --ee-text-section-heading: clamp(32px, 5vw, 42px);
      --ee-text-subheading: clamp(18px, 2.5vw, 24px);
      --ee-text-body: 18px;
      --ee-text-meta: 14px;

      --ee-spacing-meta: 0.1em;
      --ee-spacing-heading: -0.02em;

      --ee-line-editorial: 1.6;
      --ee-line-heading: 1.2;

      --ee-weight-light: 300;
      --ee-weight-regular: 400;
      --ee-weight-medium: 500;
      --ee-weight-bold: 600;

      /* Layout */
      --ee-max-width-text: 680px;
      --ee-max-width-card: 1200px;

      /* Fonts */
      --font-heading: ${fonts.heading || "Playfair Display"}, serif;
      --font-body: ${fonts.body || "Inter"}, sans-serif;
      --font-script: ${fonts.script || "Playfair Display"}, serif;
    }

    body {
      font-family: var(--font-body);
      background-color: var(--ee-color-bg);
      color: var(--ee-color-text);
      line-height: var(--ee-line-editorial);
    }

    .editorial-elegance {
      background-color: var(--ee-color-bg);
      color: var(--ee-color-text);
      min-height: 100vh;
    }

    /* Typography */
    .ee-hero-names {
      font-family: var(--font-heading);
      font-size: var(--ee-text-hero);
      line-height: var(--ee-line-heading);
      letter-spacing: var(--ee-spacing-heading);
      font-weight: var(--ee-weight-regular);
    }

    .ee-section-heading {
      font-family: var(--font-heading);
      font-size: var(--ee-text-section-heading);
      line-height: var(--ee-line-heading);
      letter-spacing: var(--ee-spacing-heading);
      font-weight: var(--ee-weight-regular);
    }

    .ee-meta-text {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
      font-weight: var(--ee-weight-medium);
      color: var(--ee-color-secondary);
    }

    .ee-editorial-intro {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      line-height: 1.7;
      font-weight: var(--ee-weight-light);
      font-style: italic;
    }

    /* Layout */
    .ee-section {
      padding: var(--ee-space-section) var(--ee-space-sm);
      max-width: 1440px;
      margin: 0 auto;
    }

    .ee-section-header {
      text-align: center;
      margin-bottom: var(--ee-space-lg);
    }

    .ee-divider {
      width: 60px;
      height: 1px;
      background-color: var(--ee-color-accent);
      margin: var(--ee-space-sm) auto;
    }

    .ee-link {
      color: var(--ee-color-text);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s ease;
    }

    .ee-link:hover {
      border-bottom-color: var(--ee-color-accent);
    }

    /* Hero */
    .ee-hero {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 600px;
      margin-top: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ee-hero-media {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    .ee-hero-image,
    .ee-hero-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ee-hero-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 2;
    }

    .ee-hero-content {
      position: relative;
      z-index: 3;
      text-align: center;
      color: #fff;
      padding: var(--ee-space-md);
    }

    .ee-hero-names {
      margin: 0 0 var(--ee-space-sm);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .ee-hero-date,
    .ee-hero-location {
      color: rgba(255, 255, 255, 0.95);
      margin: var(--ee-space-xs) 0;
    }

    .ee-scroll-indicator {
      position: absolute;
      bottom: var(--ee-space-md);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      animation: scroll-bounce 2s ease-in-out infinite;
    }

    .ee-scroll-line {
      width: 1px;
      height: 48px;
      background: linear-gradient(to bottom,
        rgba(255, 255, 255, 0.8),
        rgba(255, 255, 255, 0.2)
      );
    }

    @keyframes scroll-bounce {
      0%, 100% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, 8px); }
    }

    /* Editorial Intro */
    .ee-intro-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ee-space-lg);
      max-width: var(--ee-max-width-card);
      margin: 0 auto;
      align-items: center;
    }

    .ee-intro-text {
      max-width: var(--ee-max-width-text);
    }

    .ee-intro-image-container {
      width: 100%;
      height: 500px;
      overflow: hidden;
    }

    .ee-intro-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Event Cards */
    .ee-event-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--ee-space-md);
      max-width: var(--ee-max-width-card);
      margin: var(--ee-space-lg) auto 0;
    }

    .ee-event-card {
      border: 1px solid var(--ee-color-divider);
      padding: var(--ee-space-md);
      transition: all 0.3s ease;
    }

    .ee-event-card:hover {
      border-color: var(--ee-color-accent);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .ee-event-name {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      margin: 0 0 var(--ee-space-sm);
      font-weight: var(--ee-weight-regular);
    }

    .ee-event-date {
      margin: var(--ee-space-xs) 0 var(--ee-space-sm);
    }

    .ee-event-details {
      margin-top: var(--ee-space-sm);
    }

    .ee-event-venue {
      font-size: 16px;
      margin: 4px 0;
      color: var(--ee-color-text);
    }

    .ee-event-time {
      font-size: 14px;
      color: var(--ee-color-secondary);
    }

    /* Location */
    .ee-location-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ee-space-lg);
      max-width: var(--ee-max-width-card);
      margin: 0 auto;
    }

    .ee-location-details {
      padding: var(--ee-space-md);
    }

    .ee-location-address {
      margin: var(--ee-space-sm) 0;
      line-height: 1.8;
    }

    .ee-map-link {
      display: inline-block;
      margin-top: var(--ee-space-sm);
    }

    .ee-location-map {
      width: 100%;
      height: 400px;
      overflow: hidden;
    }

    .ee-location-map iframe {
      filter: grayscale(40%) contrast(85%);
    }

    .ee-map-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--ee-color-divider);
      color: var(--ee-color-secondary);
    }

    /* Gallery */
    .ee-gallery-container {
      max-width: 1440px;
      margin: 0 auto;
    }

    .ee-gallery-masonry {
      column-count: 3;
      column-gap: var(--ee-space-md);
    }

    .ee-gallery-item {
      break-inside: avoid;
      margin-bottom: var(--ee-space-md);
    }

    .ee-gallery-image {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .ee-hero {
        min-height: 100vh;
      }

      .ee-hero-content {
        padding: var(--ee-space-sm);
      }

      .ee-event-cards {
        grid-template-columns: 1fr;
        gap: var(--ee-space-sm);
      }

      .ee-intro-container,
      .ee-location-container {
        grid-template-columns: 1fr;
        gap: var(--ee-space-md);
      }

      .ee-gallery-masonry {
        column-count: 2;
        column-gap: var(--ee-space-sm);
      }

      .ee-intro-image-container {
        height: 400px;
      }

      .ee-location-map {
        height: 300px;
      }
    }

    @media (max-width: 480px) {
      .ee-gallery-masonry {
        column-count: 1;
      }
    }
  `;

  return css;
}
