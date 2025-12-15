/**
 * Font Service - Handles Google Fonts and Premium Fonts
 * 
 * This service provides infrastructure for loading both free Google Fonts
 * and premium commercial fonts (Phase 2 feature).
 */

// Premium font configurations
const premiumFonts = {
  'Canela': {
    type: 'premium',
    provider: 'commercial',
    fallback: 'Playfair Display',
    license: 'requires-purchase',
    url: null, // To be configured when license is purchased
  },
  'GT Super': {
    type: 'premium',
    provider: 'commercial',
    fallback: 'Inter',
    license: 'requires-purchase',
    url: null,
  },
  // Add more premium fonts as needed
};

/**
 * Check if a font is premium
 * @param {string} fontName - Font name to check
 * @returns {boolean} True if font is premium
 */
export function isPremiumFont(fontName) {
  return fontName in premiumFonts;
}

/**
 * Get premium font configuration
 * @param {string} fontName - Font name
 * @returns {Object|null} Premium font config or null
 */
export function getPremiumFontConfig(fontName) {
  return premiumFonts[fontName] || null;
}

/**
 * Load a font (Google or Premium)
 * @param {string} fontName - Font name to load
 * @returns {Promise<string>} Resolved font name (or fallback for premium)
 */
export async function loadFont(fontName) {
  // Check if premium
  if (isPremiumFont(fontName)) {
    const config = getPremiumFontConfig(fontName);
    
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
    console.info(`Premium font "${fontName}" not yet configured, using fallback: ${config.fallback}`);
    return config.fallback;
  }
  
  // Load from Google Fonts (already handled by CSS imports)
  return fontName;
}

/**
 * Load a premium font from a URL
 * @param {string} fontName - Font name
 * @param {string} url - Font URL
 * @returns {Promise<void>}
 */
async function loadPremiumFont(fontName, url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font from ${url}`));
    document.head.appendChild(link);
  });
}

/**
 * Get all available fonts (Google + Premium)
 * @returns {Array<Object>} Array of font objects with name, type, and availability
 */
export function getAllFonts() {
  // Google Fonts (from ThemeModal.jsx)
  const googleFonts = [
    { name: 'Playfair Display', type: 'google', style: 'serif', available: true },
    { name: 'Cormorant Garamond', type: 'google', style: 'serif', available: true },
    { name: 'Libre Baskerville', type: 'google', style: 'serif', available: true },
    { name: 'Crimson Text', type: 'google', style: 'serif', available: true },
    { name: 'EB Garamond', type: 'google', style: 'serif', available: true },
    { name: 'Poppins', type: 'google', style: 'sans-serif', available: true },
    { name: 'Inter', type: 'google', style: 'sans-serif', available: true },
    { name: 'Lato', type: 'google', style: 'sans-serif', available: true },
    { name: 'Montserrat', type: 'google', style: 'sans-serif', available: true },
    { name: 'Quicksand', type: 'google', style: 'sans-serif', available: true },
    { name: 'Great Vibes', type: 'google', style: 'script', available: true },
    { name: 'Dancing Script', type: 'google', style: 'script', available: true },
    { name: 'Tangerine', type: 'google', style: 'script', available: true },
    { name: 'Alex Brush', type: 'google', style: 'script', available: true },
    { name: 'Parisienne', type: 'google', style: 'script', available: true },
  ];
  
  // Premium fonts
  const premiumFontList = Object.entries(premiumFonts).map(([name, config]) => ({
    name,
    type: 'premium',
    style: 'serif', // Default, can be configured per font
    available: !!config.url, // Only available if URL is configured
    fallback: config.fallback,
  }));
  
  return [...googleFonts, ...premiumFontList];
}

/**
 * Generate font import links for export
 * @param {Object} fonts - Font configuration object
 * @returns {string} HTML link tags for font imports
 */
export function generateFontImports(fonts) {
  const fontList = new Set();
  
  if (fonts.heading) fontList.add(fonts.heading);
  if (fonts.body) fontList.add(fonts.body);
  if (fonts.script) fontList.add(fonts.script);
  
  const fontUrls = Array.from(fontList)
    .filter(font => !isPremiumFont(font)) // Only include Google Fonts for now
    .map(font => {
      const fontName = font.replace(/\s+/g, '+');
      return `<link href="https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600&display=swap" rel="stylesheet" />`;
    })
    .join('\n  ');
  
  return fontUrls;
}

