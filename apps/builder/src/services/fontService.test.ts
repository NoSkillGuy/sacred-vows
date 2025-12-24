import { describe, it, expect } from "vitest";
import { getAllFonts } from "./fontService";

describe("fontService", () => {
  describe("getAllFonts", () => {
    it("should return array of fonts with Google fonts", () => {
      const fonts = getAllFonts();

      expect(Array.isArray(fonts)).toBe(true);
      expect(fonts.length).toBeGreaterThan(0);

      // Check for some expected Google fonts
      const fontNames = fonts.map((f) => f.name);
      expect(fontNames).toContain("Playfair Display");
      expect(fontNames).toContain("Poppins");
      expect(fontNames).toContain("Great Vibes");
    });

    it("should include font type and style information", () => {
      const fonts = getAllFonts();

      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach((font) => {
        expect(font).toHaveProperty("name");
        expect(font).toHaveProperty("type");
        expect(font).toHaveProperty("style");
        expect(font).toHaveProperty("available");
        expect(["google", "premium"]).toContain(font.type);
        expect(["serif", "sans-serif", "script"]).toContain(font.style);
        expect(typeof font.available).toBe("boolean");
      });
    });

    it("should include Google fonts with correct properties", () => {
      const fonts = getAllFonts();
      const googleFonts = fonts.filter((f) => f.type === "google");

      expect(googleFonts.length).toBeGreaterThan(0);
      googleFonts.forEach((font) => {
        expect(font.available).toBe(true);
      });
    });
  });
});
