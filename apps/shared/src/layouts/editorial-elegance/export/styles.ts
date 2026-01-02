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
 * Editorial Elegance Export Styles
 * Concatenates and exports all CSS for the layout
 * Uses the same CSS files as the builder preview for consistency
 */

import type { InvitationData } from "../../../types/wedding-data";

// Import the actual CSS files (same as classic-scroll pattern)
import mainCSS from "../styles/main.css?inline";
import typographyCSS from "../styles/typography.css?inline";
import heroCSS from "../styles/hero.css?inline";
import editorialCardsCSS from "../styles/editorial-cards.css?inline";
import animationsCSS from "../styles/animations.css?inline";

/**
 * Generate complete CSS for the invitation export
 * @param invitation - Invitation data with layoutConfig
 * @returns Promise with complete CSS string
 */
export async function generateCSS(invitation: InvitationData): Promise<string> {
  const { layoutConfig, data } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Helper functions to safely extract color values (handles both string and object formats)
  const getBackgroundColor = (): string => {
    if (typeof colors.background === "string") {
      return colors.background;
    }
    if (colors.background && typeof colors.background === "object" && "page" in colors.background) {
      return (colors.background as { page?: string }).page || "#FAF9F7";
    }
    return "#FAF9F7";
  };

  const getTextColor = (): string => {
    if (typeof colors.text === "string") {
      return colors.text;
    }
    if (colors.text && typeof colors.text === "object" && "primary" in colors.text) {
      return (colors.text as { primary?: string }).primary || "#1C1C1C";
    }
    return "#1C1C1C";
  };

  const getDividerColor = (): string => {
    const colorsAny = colors as unknown as Record<string, unknown>;
    if (colorsAny.divider && typeof colorsAny.divider === "string") {
      return colorsAny.divider;
    }
    if (colorsAny.borders && typeof colorsAny.borders === "object" && colorsAny.borders !== null && "divider" in colorsAny.borders) {
      const borders = colorsAny.borders as Record<string, unknown>;
      const divider = borders.divider;
      if (divider && typeof divider === "object" && divider !== null && "color" in divider) {
        const dividerObj = divider as Record<string, unknown>;
        return typeof dividerObj.color === "string" ? dividerObj.color : "#E6E6E6";
      }
    }
    return "#E6E6E6";
  };

  // Generate dynamic theme variables that override the defaults in the CSS files
  const themeVariables = `
    :root {
      /* Colors - override defaults with user theme */
      --ee-color-bg: ${getBackgroundColor()};
      --ee-color-text: ${getTextColor()};
      --ee-color-secondary: ${colors.secondary || "#6B6B6B"};
      --ee-color-accent: ${colors.primary || "#C6A15B"};
      --ee-color-divider: ${getDividerColor()};

      /* Fonts - override defaults with user theme */
      --font-heading: ${fonts.heading || "Playfair Display"}, serif;
      --font-body: ${fonts.body || "Inter"}, sans-serif;
      --font-script: ${fonts.script || "Playfair Display"}, serif;
    }
  `;

  // Concatenate theme variables with actual CSS files
  // Theme variables come first to override defaults in the CSS files
  return `${themeVariables}\n\n${mainCSS}\n\n${typographyCSS}\n\n${heroCSS}\n\n${editorialCardsCSS}\n\n${animationsCSS}`;
}
