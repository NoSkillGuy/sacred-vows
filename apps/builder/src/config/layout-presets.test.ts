/**
 * Layout Presets Utility Tests
 *
 * Tests for presetToSectionConfigs utility function.
 */

import { describe, it, expect } from "vitest";
import { presetToSectionConfigs } from "./layout-presets";
import type { LayoutPreset } from "@shared/types/layout";

describe("presetToSectionConfigs", () => {
  const manifestSections = [
    { id: "hero", required: true, order: 0 },
    { id: "countdown", required: false, order: 1 },
    { id: "quote", required: false, order: 2 },
    { id: "editorial-intro", required: false, order: 3 },
    { id: "couple", required: false, order: 4 },
    { id: "events", required: false, order: 5 },
    { id: "location", required: false, order: 6 },
    { id: "gallery", required: false, order: 7 },
    { id: "rsvp", required: false, order: 8 },
    { id: "footer", required: true, order: 9 },
  ];

  describe("with null preset (start from scratch)", () => {
    it("should enable all sections in manifest order", () => {
      const result = presetToSectionConfigs(null, manifestSections);

      expect(result).toHaveLength(manifestSections.length);
      result.forEach((section, index) => {
        expect(section.enabled).toBe(true);
        expect(section.id).toBe(manifestSections[index].id);
        expect(section.order).toBe(manifestSections[index].order ?? index);
      });
    });

    it("should use section order from manifest when available", () => {
      const result = presetToSectionConfigs(null, manifestSections);

      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[9].order).toBe(9);
    });

    it("should use index as order when order is not specified", () => {
      const sectionsWithoutOrder = [
        { id: "hero", required: true },
        { id: "countdown", required: false },
      ];
      const result = presetToSectionConfigs(null, sectionsWithoutOrder);

      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
    });
  });

  describe("with Modern Editorial preset", () => {
    const modernEditorialPreset: LayoutPreset = {
      id: "modern-editorial",
      name: "Modern Editorial",
      emoji: "🖤",
      description: "Minimal & Luxe",
      useCase: "For couples who want elegance, restraint, and strong visual impact.",
      bestFor: "City weddings, intimate guest lists, design-forward couples",
      sectionIds: [
        "hero",
        "countdown",
        "quote",
        "editorial-intro",
        "couple",
        "events",
        "location",
        "gallery",
        "rsvp",
        "footer",
      ],
    };

    it("should enable preset sections and maintain preset order", () => {
      const result = presetToSectionConfigs(modernEditorialPreset, manifestSections);

      // All sections should be present
      expect(result).toHaveLength(manifestSections.length);

      // Preset sections should be enabled and in preset order
      const presetSectionIds = modernEditorialPreset.sectionIds;
      presetSectionIds.forEach((presetId, index) => {
        const section = result.find((s) => s.id === presetId);
        expect(section).toBeDefined();
        expect(section?.enabled).toBe(true);
        expect(section?.order).toBe(index);
      });
    });

    it("should include all manifest sections", () => {
      const result = presetToSectionConfigs(modernEditorialPreset, manifestSections);

      manifestSections.forEach((manifestSection) => {
        const section = result.find((s) => s.id === manifestSection.id);
        expect(section).toBeDefined();
      });
    });

    it("should place preset sections first, then others", () => {
      const result = presetToSectionConfigs(modernEditorialPreset, manifestSections);

      const presetSectionIds = new Set(modernEditorialPreset.sectionIds);
      let foundNonPresetSection = false;

      result.forEach((section) => {
        if (presetSectionIds.has(section.id)) {
          // Preset sections should come first
          expect(foundNonPresetSection).toBe(false);
        } else {
          foundNonPresetSection = true;
        }
      });
    });

    it("should maintain exact preset order for Modern Editorial sections", () => {
      const result = presetToSectionConfigs(modernEditorialPreset, manifestSections);

      // Verify sections are in exact preset order
      const presetOrder = modernEditorialPreset.sectionIds;
      const resultPresetSections = result.filter((s) => presetOrder.includes(s.id));

      resultPresetSections.forEach((section, index) => {
        expect(section.id).toBe(presetOrder[index]);
        expect(section.order).toBe(index);
        expect(section.enabled).toBe(true);
      });
    });
  });

  describe("with Love Story Feature preset", () => {
    const loveStoryPreset: LayoutPreset = {
      id: "love-story-feature",
      name: "Love Story Feature",
      emoji: "🤍",
      description: "Romantic & Narrative",
      useCase:
        "Feels like a full magazine wedding spread. Perfect for couples who love storytelling.",
      bestFor: "Couples who love storytelling, emotional depth, destination weddings",
      sectionIds: [
        "hero",
        "quote",
        "editorial-intro",
        "story",
        "couple",
        "wedding-party",
        "events",
        "location",
        "travel",
        "things-to-do",
        "gallery",
        "dress-code",
        "rsvp",
        "footer",
      ],
    };

    it("should filter out invalid section IDs not in manifest", () => {
      // Use a manifest that doesn't include all preset sections
      // This tests that invalid section IDs are filtered out
      const limitedManifest = [
        { id: "hero", required: true, order: 0 },
        { id: "quote", required: false, order: 1 },
        { id: "editorial-intro", required: false, order: 2 },
        { id: "couple", required: false, order: 3 },
        { id: "events", required: false, order: 4 },
        { id: "location", required: false, order: 5 },
        { id: "gallery", required: false, order: 6 },
        { id: "rsvp", required: false, order: 7 },
        { id: "footer", required: true, order: 8 },
      ];

      const result = presetToSectionConfigs(loveStoryPreset, limitedManifest);

      // All valid preset sections should be enabled
      const validPresetIds = loveStoryPreset.sectionIds.filter((id) =>
        limitedManifest.some((s) => s.id === id)
      );
      validPresetIds.forEach((id) => {
        const section = result.find((s) => s.id === id);
        expect(section?.enabled).toBe(true);
      });

      // Invalid preset sections (not in manifest) should be filtered out
      const invalidPresetIds = loveStoryPreset.sectionIds.filter(
        (id) => !limitedManifest.some((s) => s.id === id)
      );
      expect(invalidPresetIds.length).toBeGreaterThan(0); // Some should be invalid (e.g., "story", "wedding-party", "travel", "things-to-do", "dress-code")

      // Verify invalid sections are not in result
      invalidPresetIds.forEach((invalidId) => {
        const section = result.find((s) => s.id === invalidId);
        expect(section).toBeUndefined();
      });
    });
  });

  describe("required sections handling", () => {
    it("should always enable required sections even if not in preset", () => {
      const preset: LayoutPreset = {
        id: "test-preset",
        name: "Test Preset",
        emoji: "✨",
        description: "Test",
        useCase: "Test",
        bestFor: "Test",
        sectionIds: ["countdown", "quote"], // Doesn't include required "hero" or "footer"
      };

      const result = presetToSectionConfigs(preset, manifestSections);

      // Required sections should be enabled
      const heroSection = result.find((s) => s.id === "hero");
      const footerSection = result.find((s) => s.id === "footer");

      expect(heroSection?.enabled).toBe(true);
      expect(footerSection?.enabled).toBe(true);
    });

    it("should enable required sections in other sections (not preset)", () => {
      const preset: LayoutPreset = {
        id: "minimal-preset",
        name: "Minimal",
        emoji: "✨",
        description: "Minimal",
        useCase: "Minimal",
        bestFor: "Minimal",
        sectionIds: ["hero", "footer"], // Only required sections
      };

      const result = presetToSectionConfigs(preset, manifestSections);

      // Required sections in preset should be enabled
      expect(result.find((s) => s.id === "hero")?.enabled).toBe(true);
      expect(result.find((s) => s.id === "footer")?.enabled).toBe(true);

      // Other required sections should also be enabled
      const requiredSections = manifestSections.filter((s) => s.required === true);
      requiredSections.forEach((requiredSection) => {
        const section = result.find((s) => s.id === requiredSection.id);
        expect(section?.enabled).toBe(true);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty manifest sections", () => {
      const preset: LayoutPreset = {
        id: "test",
        name: "Test",
        emoji: "✨",
        description: "Test",
        useCase: "Test",
        bestFor: "Test",
        sectionIds: ["hero"],
      };

      const result = presetToSectionConfigs(preset, []);
      expect(result).toHaveLength(0);
    });

    it("should handle preset with no valid section IDs", () => {
      const preset: LayoutPreset = {
        id: "test",
        name: "Test",
        emoji: "✨",
        description: "Test",
        useCase: "Test",
        bestFor: "Test",
        sectionIds: ["invalid-1", "invalid-2"],
      };

      const result = presetToSectionConfigs(preset, manifestSections);

      // Should return only required sections (no valid preset sections)
      const requiredSections = manifestSections.filter((s) => s.required === true);
      expect(result).toHaveLength(requiredSections.length);

      // Required sections should still be enabled
      requiredSections.forEach((requiredSection) => {
        const section = result.find((s) => s.id === requiredSection.id);
        expect(section?.enabled).toBe(true);
      });
    });

    it("should handle empty preset sectionIds array", () => {
      const preset: LayoutPreset = {
        id: "test",
        name: "Test",
        emoji: "✨",
        description: "Test",
        useCase: "Test",
        bestFor: "Test",
        sectionIds: [],
      };

      const result = presetToSectionConfigs(preset, manifestSections);

      // Should return only required sections (no preset sections)
      const requiredSections = manifestSections.filter((s) => s.required === true);
      expect(result).toHaveLength(requiredSections.length);

      // Required sections should be enabled
      requiredSections.forEach((requiredSection) => {
        const section = result.find((s) => s.id === requiredSection.id);
        expect(section?.enabled).toBe(true);
      });
    });

    it("should return only preset sections plus required sections", () => {
      const preset: LayoutPreset = {
        id: "test",
        name: "Test",
        emoji: "✨",
        description: "Test",
        useCase: "Test",
        bestFor: "Test",
        sectionIds: ["hero", "footer"], // Only first and last
      };

      const result = presetToSectionConfigs(preset, manifestSections);

      // Should return only preset sections (hero, footer) plus any required sections not in preset
      const presetIds = new Set(preset.sectionIds);
      const requiredSections = manifestSections.filter(
        (s) => s.required === true && !presetIds.has(s.id)
      );
      const expectedLength = preset.sectionIds.length + requiredSections.length;

      expect(result).toHaveLength(expectedLength);
      expect(
        result.every((s) => presetIds.has(s.id) || s.id === "header" || s.id === "footer")
      ).toBe(true);
    });
  });

  describe("section config structure", () => {
    it("should return SectionConfig with correct structure", () => {
      const preset: LayoutPreset = {
        id: "test",
        name: "Test",
        emoji: "✨",
        description: "Test",
        useCase: "Test",
        bestFor: "Test",
        sectionIds: ["hero"],
      };

      const result = presetToSectionConfigs(preset, manifestSections);

      result.forEach((section) => {
        expect(section).toHaveProperty("id");
        expect(section).toHaveProperty("enabled");
        expect(section).toHaveProperty("order");
        expect(section).toHaveProperty("config");
        expect(typeof section.id).toBe("string");
        expect(typeof section.enabled).toBe("boolean");
        expect(typeof section.order).toBe("number");
        expect(typeof section.config).toBe("object");
      });
    });

    it("should initialize config as empty object", () => {
      const result = presetToSectionConfigs(null, manifestSections);

      result.forEach((section) => {
        expect(section.config).toEqual({});
      });
    });
  });
});
