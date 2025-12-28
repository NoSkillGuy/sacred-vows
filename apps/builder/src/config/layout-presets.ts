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
 * When a preset is selected, returns ONLY preset sections (plus required sections like header/footer)
 * When no preset (null), returns all sections enabled
 *
 * @param preset - The preset to convert (null for default/all enabled)
 * @param manifestSections - Available sections from layout manifest
 * @returns Array of SectionConfig with only preset sections when preset is selected, or all sections when null
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
 * // Returns only preset sections enabled and ordered
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
    const result = manifestSections.map((section, index) => ({
      id: section.id,
      enabled: true,
      order: section.order !== undefined ? section.order : index,
      config: {},
    }));
    return result;
  }

  // Filter preset sections to only include those available in manifest
  const validPresetSectionIds = preset.sectionIds.filter((id) => manifestSectionMap.has(id));

  // Create a set of preset section IDs for quick lookup
  const presetSectionIdsSet = new Set(validPresetSectionIds);

  // Build result: ONLY include preset sections (plus required sections like header/footer if not in preset)
  const presetSections: SectionConfig[] = [];
  const requiredSections: SectionConfig[] = [];

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

  // Include required sections that aren't in the preset (like header/footer)
  // These are needed for the layout to function properly
  manifestSections.forEach((section) => {
    if (!presetSectionIdsSet.has(section.id) && section.required === true) {
      requiredSections.push({
        id: section.id,
        enabled: true,
        order: presetSections.length + requiredSections.length,
        config: {},
      });
    }
  });

  // Return only preset sections + required sections (not in preset)
  // This ensures only the preset sections (plus required ones) show up in the UI
  const result = [...presetSections, ...requiredSections];
  return result;
}
