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

    /* Countdown Section */
    .ee-countdown-section {
      text-align: center;
    }

    .ee-countdown-container {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-countdown-values {
      font-family: var(--font-heading);
      font-size: clamp(32px, 5vw, 56px);
      font-weight: var(--ee-weight-regular);
      letter-spacing: var(--ee-spacing-heading);
      color: var(--ee-color-text);
      margin-top: var(--ee-space-sm);
    }

    /* Editorial Quote Section */
    .ee-quote-section {
      text-align: center;
      padding: var(--ee-space-xl) var(--ee-space-sm);
    }

    .ee-quote-container {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-quote-text {
      font-family: var(--font-heading);
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.4;
      font-weight: var(--ee-weight-light);
      font-style: italic;
      color: var(--ee-color-text);
      margin: 0;
      padding: 0;
      border: none;
      quotes: none;
    }

    .ee-quote-attribution {
      display: block;
      margin-top: var(--ee-space-md);
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      font-style: normal;
      color: var(--ee-color-secondary);
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
    }

    /* Couple Section */
    .ee-couple-section {
      max-width: var(--ee-max-width-card);
      margin: 0 auto;
    }

    .ee-couple-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--ee-space-lg);
      margin-top: var(--ee-space-lg);
    }

    .ee-couple-member {
      text-align: center;
    }

    .ee-couple-image-wrapper {
      width: 100%;
      max-width: 300px;
      margin: 0 auto var(--ee-space-md);
      aspect-ratio: 3 / 4;
      overflow: hidden;
    }

    .ee-couple-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ee-couple-label {
      margin-bottom: var(--ee-space-xs);
    }

    .ee-couple-name {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      margin-bottom: var(--ee-space-sm);
      color: var(--ee-color-text);
    }

    .ee-couple-parents {
      margin-top: var(--ee-space-sm);
    }

    .ee-couple-parents-label {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      margin-bottom: var(--ee-space-xs);
    }

    .ee-couple-parent-name {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      color: var(--ee-color-text);
      margin: var(--ee-space-xs) 0;
    }

    /* Love Story Section */
    .ee-story-section {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-story-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-story-main {
      margin: var(--ee-space-lg) 0;
    }

    .ee-story-text {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: 0;
    }

    .ee-drop-cap::first-letter {
      float: left;
      font-family: var(--font-heading);
      font-size: 4.5em;
      line-height: 0.8;
      padding-right: 8px;
      padding-top: 4px;
      color: var(--ee-color-text);
    }

    .ee-story-chapters {
      margin: var(--ee-space-lg) 0;
    }

    .ee-story-chapter {
      margin: var(--ee-space-md) 0;
    }

    .ee-story-chapter-title {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      color: var(--ee-color-text);
      margin: 0 0 var(--ee-space-sm) 0;
    }

    .ee-story-chapter-text {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: 0;
    }

    .ee-story-pull-quotes {
      margin: var(--ee-space-lg) 0;
    }

    .ee-pull-quote {
      font-family: var(--font-heading);
      font-size: clamp(24px, 3vw, 32px);
      line-height: 1.5;
      font-style: italic;
      color: var(--ee-color-text);
      margin: var(--ee-space-md) 0;
      padding: var(--ee-space-md) 0;
      border-left: 2px solid var(--ee-color-accent);
      padding-left: var(--ee-space-md);
      quotes: none;
      display: flex;
      flex-direction: column;
      gap: var(--ee-space-sm);
    }

    .ee-pull-quote-attribution {
      display: block;
      margin-top: var(--ee-space-sm);
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      font-style: normal;
      color: var(--ee-color-secondary);
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
    }

    /* Wedding Party Section */
    .ee-wedding-party-section {
      max-width: var(--ee-max-width-card);
      margin: 0 auto;
    }

    .ee-party-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--ee-space-md);
      margin-top: var(--ee-space-lg);
    }

    .ee-party-member {
      text-align: center;
    }

    .ee-party-image-wrapper {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      margin-bottom: var(--ee-space-sm);
    }

    .ee-party-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ee-filter-bw {
      filter: grayscale(100%);
    }

    .ee-party-title {
      margin-bottom: var(--ee-space-xs);
    }

    .ee-party-name {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      margin-bottom: var(--ee-space-xs);
      color: var(--ee-color-text);
    }

    .ee-party-bio {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin-top: var(--ee-space-xs);
    }

    /* Travel Section */
    .ee-travel-section {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-travel-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-travel-intro {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-md) 0;
    }

    .ee-travel-hotels {
      margin: var(--ee-space-lg) 0;
    }

    .ee-hotel-card {
      margin: var(--ee-space-md) 0;
      padding: var(--ee-space-md) 0;
      border-bottom: 1px solid var(--ee-color-divider);
    }

    .ee-hotel-card:last-child {
      border-bottom: none;
    }

    .ee-hotel-name {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      margin-bottom: var(--ee-space-xs);
      color: var(--ee-color-text);
    }

    .ee-hotel-description {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-xs) 0;
    }

    .ee-hotel-address {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      margin: var(--ee-space-xs) 0;
    }

    /* Things to Do Section */
    .ee-things-to-do-section {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-things-to-do-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-things-to-do-intro {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-md) 0;
      font-style: italic;
    }

    .ee-things-to-do-activities {
      margin: var(--ee-space-lg) 0;
    }

    .ee-activity-item {
      margin: var(--ee-space-md) 0;
      padding: var(--ee-space-md) 0;
      border-bottom: 1px solid var(--ee-color-divider);
    }

    .ee-activity-item:last-child {
      border-bottom: none;
    }

    .ee-activity-name {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      margin-bottom: var(--ee-space-xs);
      color: var(--ee-color-text);
    }

    .ee-activity-category {
      display: inline-block;
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
      margin-bottom: var(--ee-space-xs);
    }

    .ee-activity-description {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-xs) 0;
    }

    .ee-activity-address {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      margin: var(--ee-space-xs) 0;
    }

    /* Dress Code Section */
    .ee-dress-code-section {
      text-align: center;
    }

    .ee-dress-code-container {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-dress-code-text {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-md) 0;
    }

    .ee-dress-code-colors {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--ee-space-md);
      margin: var(--ee-space-lg) 0;
    }

    .ee-color-swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ee-space-xs);
    }

    .ee-color-swatch-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid var(--ee-color-divider);
    }

    .ee-color-swatch-label {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
    }

    .ee-dress-code-inspiration {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--ee-space-sm);
      margin: var(--ee-space-lg) 0;
    }

    .ee-inspiration-image {
      aspect-ratio: 1;
      overflow: hidden;
    }

    .ee-inspiration-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Registry Section */
    .ee-registry-section {
      text-align: center;
    }

    .ee-registry-container {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-registry-intro {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-md) 0;
      font-style: italic;
    }

    .ee-registry-links {
      margin: var(--ee-space-lg) 0;
    }

    .ee-registry-link {
      display: inline-block;
      margin: var(--ee-space-xs);
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
    }

    /* Guest Notes Section */
    .ee-guest-notes-section {
      max-width: var(--ee-max-width-card);
      margin: 0 auto;
    }

    .ee-guest-notes-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-guest-notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--ee-space-md);
      margin: var(--ee-space-lg) 0;
    }

    .ee-guest-note-card {
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid var(--ee-color-divider);
      padding: var(--ee-space-md);
      transform: rotate(-1deg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .ee-guest-note-card:nth-child(even) {
      transform: rotate(1deg);
    }

    .ee-guest-note-text {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: 0 0 var(--ee-space-xs) 0;
    }

    .ee-guest-note-author {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      margin: var(--ee-space-xs) 0 0 0;
      font-style: italic;
    }

    /* RSVP Section */
    .ee-rsvp-section {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-rsvp-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-rsvp-form {
      margin: var(--ee-space-lg) 0;
    }

    .ee-form-field {
      margin-bottom: var(--ee-space-md);
    }

    .ee-input {
      width: 100%;
      padding: var(--ee-space-sm) 0;
      border: none;
      border-bottom: 1px solid var(--ee-color-divider);
      background: transparent;
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      color: var(--ee-color-text);
      transition: border-color 0.2s ease;
    }

    .ee-input:focus {
      outline: none;
      border-bottom-color: var(--ee-color-accent);
    }

    .ee-input::placeholder {
      color: var(--ee-color-secondary);
    }

    .ee-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .ee-submit-button {
      margin-top: var(--ee-space-md);
      padding: var(--ee-space-sm) var(--ee-space-md);
      border: 1px solid var(--ee-color-text);
      background: transparent;
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      color: var(--ee-color-text);
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
    }

    .ee-submit-button:hover {
      background: var(--ee-color-text);
      color: var(--ee-color-bg);
    }

    /* FAQ Section */
    .ee-faq-section {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-faq-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-faq-list {
      margin: var(--ee-space-lg) 0;
    }

    .ee-faq-item {
      margin: var(--ee-space-md) 0;
      border-bottom: 1px solid var(--ee-color-divider);
    }

    .ee-faq-item:last-child {
      border-bottom: none;
    }

    .ee-faq-question {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--ee-space-md) 0;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      color: var(--ee-color-text);
      transition: color 0.2s ease;
    }

    .ee-faq-question:hover {
      color: var(--ee-color-accent);
    }

    .ee-faq-toggle {
      font-size: 24px;
      color: var(--ee-color-secondary);
      margin-left: var(--ee-space-sm);
      transition: transform 0.2s ease;
    }

    .ee-faq-answer {
      padding: 0 0 var(--ee-space-md) 0;
    }

    .ee-faq-answer p {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: 0;
    }

    /* Contact Section */
    .ee-contact-section {
      max-width: var(--ee-max-width-text);
      margin: 0 auto;
    }

    .ee-contact-container {
      padding: 0 var(--ee-space-sm);
    }

    .ee-contact-intro {
      font-family: var(--font-body);
      font-size: var(--ee-text-body);
      line-height: var(--ee-line-editorial);
      color: var(--ee-color-text);
      margin: var(--ee-space-md) 0;
      text-align: center;
    }

    .ee-contact-list {
      margin: var(--ee-space-lg) 0;
    }

    .ee-contact-item {
      margin: var(--ee-space-md) 0;
      padding: var(--ee-space-md) 0;
      border-bottom: 1px solid var(--ee-color-divider);
      text-align: center;
    }

    .ee-contact-item:last-child {
      border-bottom: none;
    }

    .ee-contact-name {
      font-family: var(--font-heading);
      font-size: var(--ee-text-subheading);
      font-weight: var(--ee-weight-regular);
      margin-bottom: var(--ee-space-xs);
      color: var(--ee-color-text);
    }

    .ee-contact-role {
      font-family: var(--font-body);
      font-size: var(--ee-text-meta);
      color: var(--ee-color-secondary);
      text-transform: uppercase;
      letter-spacing: var(--ee-spacing-meta);
      margin-bottom: var(--ee-space-xs);
    }

    .ee-contact-direct {
      text-align: center;
      margin: var(--ee-space-lg) 0;
    }

    /* Mobile Responsive for New Sections */
    @media (max-width: 768px) {
      .ee-couple-grid {
        grid-template-columns: 1fr;
      }

      .ee-party-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }

      .ee-guest-notes-grid {
        grid-template-columns: 1fr;
      }

      .ee-dress-code-colors {
        gap: var(--ee-space-sm);
      }
    }
  `;

  return css;
}
