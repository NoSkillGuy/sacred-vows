/**
 * Font Service - Handles Google Fonts and Premium Fonts
 *
 * This service provides infrastructure for loading both free Google Fonts
 * and premium commercial fonts (Phase 2 feature).
 */

interface PremiumFontConfig {
  type: "premium";
  provider: string;
  fallback: string;
  license: string;
  url: string | null;
}

interface FontInfo {
  name: string;
  type: "google" | "premium";
  style: "serif" | "sans-serif" | "script";
  available: boolean;
  fallback?: string;
}

interface ThemeFonts {
  heading?: string;
  body?: string;
  script?: string;
}

// Premium font configurations
const premiumFonts: Record<string, PremiumFontConfig> = {
  Canela: {
    type: "premium",
    provider: "commercial",
    fallback: "Playfair Display",
    license: "requires-purchase",
    url: null, // To be configured when license is purchased
  },
  "GT Super": {
    type: "premium",
    provider: "commercial",
    fallback: "Inter",
    license: "requires-purchase",
    url: null,
  },
  // Add more premium fonts as needed
};

/**
 * Check if a font is premium
 * @param fontName - Font name to check
 * @returns True if font is premium
 */
export function isPremiumFont(fontName: string): boolean {
  return fontName in premiumFonts;
}

/**
 * Get premium font configuration
 * @param fontName - Font name
 * @returns Premium font config or null
 */
export function getPremiumFontConfig(fontName: string): PremiumFontConfig | null {
  return premiumFonts[fontName] || null;
}

/**
 * Load a font (Google or Premium)
 * @param fontName - Font name to load
 * @returns Resolved font name (or fallback for premium)
 */
export async function loadFont(fontName: string): Promise<string> {
  // Check if premium
  if (isPremiumFont(fontName)) {
    const config = getPremiumFontConfig(fontName);
    if (!config) {
      return fontName;
    }

    // If premium font URL is configured, load it
    if (config.url) {
      try {
        await loadPremiumFont(fontName, config.url);
        return fontName;
      } catch (error) {
        console.warn(`Failed to load premium font "${fontName}", using fallback:`, error);
        return config.fallback;
      }
    }

    // Otherwise return fallback
    console.info(
      `Premium font "${fontName}" not yet configured, using fallback: ${config.fallback}`
    );
    return config.fallback;
  }

  // Load from Google Fonts (already handled by CSS imports)
  return fontName;
}

/**
 * Load a premium font from a URL
 * @param fontName - Font name
 * @param url - Font URL
 */
async function loadPremiumFont(fontName: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font from ${url}`));
    document.head.appendChild(link);
  });
}

/**
 * Get all available fonts (Google + Premium)
 * @returns Array of font objects with name, type, and availability
 */
export function getAllFonts(): FontInfo[] {
  // Google Fonts (from ThemeModal.jsx)
  const googleFonts: FontInfo[] = [
    { name: "Playfair Display", type: "google", style: "serif", available: true },
    { name: "Cormorant Garamond", type: "google", style: "serif", available: true },
    { name: "Libre Baskerville", type: "google", style: "serif", available: true },
    { name: "Crimson Text", type: "google", style: "serif", available: true },
    { name: "EB Garamond", type: "google", style: "serif", available: true },
    { name: "Poppins", type: "google", style: "sans-serif", available: true },
    { name: "Inter", type: "google", style: "sans-serif", available: true },
    { name: "Lato", type: "google", style: "sans-serif", available: true },
    { name: "Montserrat", type: "google", style: "sans-serif", available: true },
    { name: "Quicksand", type: "google", style: "sans-serif", available: true },
    { name: "Great Vibes", type: "google", style: "script", available: true },
    { name: "Dancing Script", type: "google", style: "script", available: true },
    { name: "Tangerine", type: "google", style: "script", available: true },
    { name: "Alex Brush", type: "google", style: "script", available: true },
    { name: "Parisienne", type: "google", style: "script", available: true },
  ];

  // Premium fonts
  const premiumFontList: FontInfo[] = Object.entries(premiumFonts).map(([name, config]) => ({
    name,
    type: "premium",
    style: "serif", // Default, can be configured per font
    available: !!config.url, // Only available if URL is configured
    fallback: config.fallback,
  }));

  return [...googleFonts, ...premiumFontList];
}

/**
 * Generate font import links for export
 * @param fonts - Font configuration object
 * @returns HTML link tags for font imports
 */
export function generateFontImports(fonts: ThemeFonts): string {
  const fontList = new Set<string>();

  if (fonts.heading) fontList.add(fonts.heading);
  if (fonts.body) fontList.add(fonts.body);
  if (fonts.script) fontList.add(fonts.script);

  const fontUrls = Array.from(fontList)
    .filter((font) => !isPremiumFont(font)) // Only include Google Fonts for now
    .map((font) => {
      const fontName = font.replace(/\s+/g, "+");
      return `<link href="https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600&display=swap" rel="stylesheet" />`;
    })
    .join("\n  ");

  return fontUrls;
}
