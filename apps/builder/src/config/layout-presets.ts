/**
 * Layout Presets for Invitation Flows
 *
 * Defines curated presets that provide starting points for invitation layouts.
 * Each preset specifies which sections are enabled and their order.
 */

import type { SectionConfig } from "@shared/types/wedding-data";

export interface LayoutPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  useCase: string;
  bestFor: string;
  sectionIds: string[];
}

/**
 * Modern Editorial (Minimal & Luxe)
 * For couples who want elegance, restraint, and strong visual impact.
 * Vibe: Vogue cover → short feature → RSVP
 * Best for: City weddings, intimate guest lists, design-forward couples
 */
export const MODERN_EDITORIAL_PRESET: LayoutPreset = {
  id: "modern-editorial",
  name: "Modern Editorial",
  emoji: "🖤",
  description: "Minimal & Luxe",
  useCase: "For couples who want elegance, restraint, and strong visual impact.",
  bestFor: "City weddings, intimate guest lists, design-forward couples",
  sectionIds: [
    "hero", // Editorial Cover
    "countdown", // Save the Date
    "quote", // Editorial Quote
    "editorial-intro", // Editorial Intro
    "couple", // The Couple
    "events", // Event Schedule
    "location", // Location
    "gallery", // Gallery
    "rsvp", // RSVP
    "footer", // Footer
  ],
};

/**
 * Love Story Feature (Romantic & Narrative)
 * Feels like a full magazine wedding spread.
 * Vibe: Long-form editorial article
 * Best for: Couples who love storytelling, emotional depth, destination weddings
 */
export const LOVE_STORY_FEATURE_PRESET: LayoutPreset = {
  id: "love-story-feature",
  name: "Love Story Feature",
  emoji: "🤍",
  description: "Romantic & Narrative",
  useCase: "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
  bestFor: "Couples who love storytelling, emotional depth, destination weddings",
  sectionIds: [
    "hero", // Editorial Cover
    "quote", // Editorial Quote
    "editorial-intro", // Editorial Intro
    "story", // Love Story
    "couple", // The Couple
    "wedding-party", // Wedding Party
    "events", // Event Schedule
    "location", // Location
    "travel", // Travel & Stay
    "things-to-do", // Things to Do
    "gallery", // Gallery
    "dress-code", // Dress Code
    "rsvp", // RSVP
    "footer", // Footer
  ],
};

/**
 * Guest Experience (Clean & Thoughtful)
 * Designed around guest clarity without killing elegance.
 * Vibe: Calm, curated, considerate
 * Best for: Larger weddings, mixed-age guests, practical planners
 */
export const GUEST_EXPERIENCE_PRESET: LayoutPreset = {
  id: "guest-experience",
  name: "Guest Experience",
  emoji: "✨",
  description: "Clean & Thoughtful",
  useCase: "Designed around guest clarity without killing elegance.",
  bestFor: "Larger weddings, mixed-age guests, practical planners",
  sectionIds: [
    "hero", // Editorial Cover
    "countdown", // Save the Date
    "editorial-intro", // Editorial Intro
    "events", // Event Schedule
    "location", // Location
    "travel", // Travel & Stay
    "dress-code", // Dress Code
    "faq", // FAQ
    "registry", // Registry
    "gallery", // Gallery
    "rsvp", // RSVP
    "contact", // Contact
    "footer", // Footer
  ],
};

/**
 * All available presets
 */
export const LAYOUT_PRESETS: LayoutPreset[] = [
  MODERN_EDITORIAL_PRESET,
  LOVE_STORY_FEATURE_PRESET,
  GUEST_EXPERIENCE_PRESET,
];

/**
 * Get a preset by ID
 */
export function getPresetById(presetId: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find((preset) => preset.id === presetId);
}

/**
 * Convert preset section IDs to SectionConfig array
 * Validates that all section IDs exist in the layout manifest
 * Returns all sections from manifest, with preset sections enabled and ordered
 *
 * @param preset - The preset to convert (null for default/all enabled)
 * @param manifestSections - Available sections from layout manifest
 * @returns Array of SectionConfig with all sections, preset ones enabled and ordered
 */
export function presetToSectionConfigs(
  preset: LayoutPreset | null,
  manifestSections: Array<{ id: string; required?: boolean; order?: number }>
): SectionConfig[] {
  // Create a map of available section IDs from manifest
  const manifestSectionMap = new Map(manifestSections.map((s) => [s.id, s]));

  // If no preset, enable all sections in manifest order
  if (!preset) {
    return manifestSections.map((section, index) => ({
      id: section.id,
      enabled: true,
      order: section.order !== undefined ? section.order : index,
      config: {},
    }));
  }

  // Filter preset sections to only include those available in manifest
  const validPresetSectionIds = preset.sectionIds.filter((id) => manifestSectionMap.has(id));

  // Create a set of preset section IDs for quick lookup
  const presetSectionIdsSet = new Set(validPresetSectionIds);

  // Build result: include all manifest sections
  const result: SectionConfig[] = [];
  const presetSections: SectionConfig[] = [];
  const otherSections: SectionConfig[] = [];

  // Process preset sections in preset order
  validPresetSectionIds.forEach((sectionId, index) => {
    const manifestSection = manifestSectionMap.get(sectionId);
    if (manifestSection) {
      presetSections.push({
        id: sectionId,
        enabled: true,
        order: index,
        config: {},
      });
    }
  });

  // Process other sections (not in preset, but in manifest)
  manifestSections.forEach((section) => {
    if (!presetSectionIdsSet.has(section.id)) {
      // Required sections are always enabled
      const enabled = section.required === true;
      otherSections.push({
        id: section.id,
        enabled,
        order:
          section.order !== undefined
            ? section.order
            : presetSections.length + otherSections.length,
        config: {},
      });
    }
  });

  // Combine: preset sections first, then others
  return [...presetSections, ...otherSections];
}
