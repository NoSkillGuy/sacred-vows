/**
 * Layout Preset Utilities
 *
 * Utility functions for working with layout-specific presets.
 * Presets are now defined in each layout's manifest (see LayoutManifest.presets).
 */

import type { SectionConfig } from "@shared/types/wedding-data";
import type { LayoutPreset } from "@shared/types/layout";

/**
 * Convert preset section IDs to SectionConfig array
 * Validates that all section IDs exist in the layout manifest
 * Returns all sections from manifest, with preset sections enabled and ordered
 *
 * @param preset - The preset to convert (null for default/all enabled)
 * @param manifestSections - Available sections from layout manifest
 * @returns Array of SectionConfig with all sections, preset ones enabled and ordered
 *
 * @example
 * ```typescript
 * const manifestSections = [
 *   { id: 'hero', required: true },
 *   { id: 'countdown', required: false },
 *   { id: 'quote', required: false },
 * ];
 * const preset = {
 *   id: 'modern-editorial',
 *   name: 'Modern Editorial',
 *   sectionIds: ['hero', 'countdown', 'quote'],
 * };
 * const sections = presetToSectionConfigs(preset, manifestSections);
 * // Returns all sections with preset ones enabled and ordered
 * // sections[0] = { id: 'hero', enabled: true, order: 0, config: {} }
 * // sections[1] = { id: 'countdown', enabled: true, order: 1, config: {} }
 * // sections[2] = { id: 'quote', enabled: true, order: 2, config: {} }
 * ```
 *
 * @example
 * ```typescript
 * // Start from scratch (null preset) - enables all sections
 * const sections = presetToSectionConfigs(null, manifestSections);
 * // All sections are enabled in manifest order
 * ```
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
