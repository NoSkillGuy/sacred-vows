/**
 * Wedding Data Schema
 * Defines the structure for wedding invitation data
 * 
 * This schema separates:
 * 1. Universal Content Data - Shared across all layouts (couple, events, venue, etc.)
 * 2. Layout Configuration - Per-layout settings (sections, themes)
 */

// ============================================================================
// UNIVERSAL CONTENT DATA TYPES
// These are shared across all layouts
// ============================================================================

/**
 * @typedef {Object} PersonInfo
 * @property {string} name - Person's full name
 * @property {string} title - Title (e.g., "Dr.", "Capt")
 * @property {Object} parents - Parent information
 * @property {string} parents.mother - Mother's name
 * @property {string} parents.father - Father's name
 * @property {string} image - Image URL/path
 */

/**
 * @typedef {Object} CoupleInfo
 * @property {PersonInfo} bride - Bride information
 * @property {PersonInfo} groom - Groom information
 */

/**
 * @typedef {Object} VenueInfo
 * @property {string} name - Venue name
 * @property {string} address - Full address
 * @property {string} city - City name
 * @property {string} state - State/Province
 * @property {string} mapsUrl - Google Maps URL
 * @property {string} mapsEmbedUrl - Google Maps embed URL
 * @property {string[]} tags - Venue tags (e.g., "Near Airport")
 */

/**
 * @typedef {Object} WeddingDetails
 * @property {string[]} dates - Array of wedding dates (ISO format)
 * @property {VenueInfo} venue - Venue information
 * @property {string} countdownTarget - Target date/time for countdown (ISO format)
 */

/**
 * @typedef {Object} Event
 * @property {string} id - Event identifier
 * @property {string} label - Event name
 * @property {string} tag - Event description/tag
 * @property {string} time - Event time (e.g., "3:00 PM")
 * @property {string} date - Event date (ISO format)
 * @property {string} emoji - Emoji icon (optional)
 * @property {string} image - Image URL (optional, if no emoji)
 */

/**
 * @typedef {Object} GalleryImage
 * @property {string} src - Image source URL
 * @property {string} alt - Alt text
 * @property {string} category - Image category (e.g., "couple", "bride", "groom", "family")
 */

/**
 * @typedef {Object} Contact
 * @property {string} name - Contact name
 * @property {string} badge - Contact badge/role (e.g., "RSVP", "Host")
 * @property {string} phone - Phone number (optional)
 * @property {string} email - Email address (optional)
 */

/**
 * @typedef {Object} RSVPConfig
 * @property {Contact[]} contacts - List of contacts
 * @property {string} whatsappNumber - WhatsApp number for RSVP
 * @property {string} maxDate - Maximum RSVP date
 */

/**
 * @typedef {Object} CustomContent
 * @property {Object} fathersLetter - Father's letter configuration
 * @property {string} fathersLetter.author - Letter author name
 */

/**
 * @typedef {Object} MusicConfig
 * @property {string} file - Music file path
 * @property {number} volume - Volume level (0-1)
 */

/**
 * @typedef {Object} HeroConfig
 * @property {string} mainImage - Hero section main image
 */

/**
 * @typedef {Object} BrandingInfo
 * @property {string} monogram - Couple monogram (e.g., "P&S")
 * @property {string} title - Brand title
 * @property {string} subtitle - Brand subtitle
 */

// ============================================================================
// LAYOUT CONFIGURATION TYPES
// These are per-layout settings
// ============================================================================

/**
 * @typedef {Object} SectionConfig
 * @property {string} id - Section identifier (e.g., 'hero', 'couple', 'events')
 * @property {boolean} enabled - Whether section is visible
 * @property {number} order - Display order (0-based)
 */

/**
 * @typedef {Object} ThemeColors
 * @property {string} primary - Primary color (hex)
 * @property {string} secondary - Secondary color (hex)
 * @property {string} background - Background color (hex)
 * @property {string} text - Text color (hex)
 * @property {string} accent - Accent color (hex, optional)
 */

/**
 * @typedef {Object} ThemeFonts
 * @property {string} heading - Heading font family
 * @property {string} body - Body font family
 * @property {string} script - Script/accent font family
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} preset - Theme preset ID (e.g., 'royal-gold') or 'custom'
 * @property {ThemeColors} colors - Theme colors
 * @property {ThemeFonts} fonts - Theme fonts
 */

/**
 * @typedef {Object} LayoutConfig
 * @property {SectionConfig[]} sections - Section configurations
 * @property {ThemeConfig} theme - Theme configuration
 */

// ============================================================================
// COMPLETE DATA STRUCTURES
// ============================================================================

/**
 * Universal Wedding Content Data
 * This data is preserved when switching layouts
 * 
 * @typedef {Object} UniversalWeddingData
 * @property {BrandingInfo} branding - Branding information
 * @property {CoupleInfo} couple - Couple information
 * @property {WeddingDetails} wedding - Wedding details
 * @property {Object} events - Events organized by day
 * @property {Object} gallery - Gallery configuration
 * @property {GalleryImage[]} gallery.images - Gallery images
 * @property {RSVPConfig} rsvp - RSVP configuration
 * @property {CustomContent} customContent - Custom content sections
 * @property {MusicConfig} music - Music configuration
 * @property {HeroConfig} hero - Hero section configuration
 */

/**
 * Complete Invitation Data Structure
 * Stored in the database for each invitation
 * 
 * @typedef {Object} InvitationData
 * @property {string} id - Invitation ID
 * @property {string} layoutId - Current layout ID
 * @property {UniversalWeddingData} data - Universal content data
 * @property {LayoutConfig} layoutConfig - Layout-specific configuration
 * @property {Object} translations - Multi-language translations (optional)
 */

// ============================================================================
// SECTION DEFINITIONS
// Standard sections available across all layouts
// ============================================================================

/**
 * Standard section types available in the builder
 */
export const SECTION_TYPES = {
  HEADER: 'header',
  HERO: 'hero',
  COUPLE: 'couple',
  FATHERS_LETTER: 'fathers-letter',
  GALLERY: 'gallery',
  EVENTS: 'events',
  VENUE: 'venue',
  RSVP: 'rsvp',
  FOOTER: 'footer',
};

/**
 * Section metadata for UI display
 */
export const SECTION_METADATA = {
  [SECTION_TYPES.HEADER]: {
    id: SECTION_TYPES.HEADER,
    name: 'Header',
    description: 'Navigation and branding header',
    icon: '📌',
    required: true,
  },
  [SECTION_TYPES.HERO]: {
    id: SECTION_TYPES.HERO,
    name: 'Hero Banner',
    description: 'Main hero section with couple photo and countdown',
    icon: '🖼️',
    required: false,
  },
  [SECTION_TYPES.COUPLE]: {
    id: SECTION_TYPES.COUPLE,
    name: 'Couple Profile',
    description: 'Bride and groom information with photos',
    icon: '💑',
    required: false,
  },
  [SECTION_TYPES.FATHERS_LETTER]: {
    id: SECTION_TYPES.FATHERS_LETTER,
    name: "Father's Letter",
    description: 'Heartfelt letter from the father',
    icon: '✉️',
    required: false,
  },
  [SECTION_TYPES.GALLERY]: {
    id: SECTION_TYPES.GALLERY,
    name: 'Photo Gallery',
    description: 'Photo gallery with lightbox',
    icon: '📷',
    required: false,
  },
  [SECTION_TYPES.EVENTS]: {
    id: SECTION_TYPES.EVENTS,
    name: 'Events Timeline',
    description: 'Wedding events schedule',
    icon: '📅',
    required: false,
  },
  [SECTION_TYPES.VENUE]: {
    id: SECTION_TYPES.VENUE,
    name: 'Venue Details',
    description: 'Venue location with map',
    icon: '📍',
    required: false,
  },
  [SECTION_TYPES.RSVP]: {
    id: SECTION_TYPES.RSVP,
    name: 'RSVP Section',
    description: 'Guest RSVP form and contacts',
    icon: '💌',
    required: false,
  },
  [SECTION_TYPES.FOOTER]: {
    id: SECTION_TYPES.FOOTER,
    name: 'Footer',
    description: 'Closing message and credits',
    icon: '🎀',
    required: true,
  },
};

/**
 * Default section order for new invitations
 */
export const DEFAULT_SECTION_ORDER = [
  SECTION_TYPES.HEADER,
  SECTION_TYPES.HERO,
  SECTION_TYPES.COUPLE,
  SECTION_TYPES.FATHERS_LETTER,
  SECTION_TYPES.GALLERY,
  SECTION_TYPES.EVENTS,
  SECTION_TYPES.VENUE,
  SECTION_TYPES.RSVP,
  SECTION_TYPES.FOOTER,
];

/**
 * Create default section configuration
 * @param {string[]} sectionOrder - Ordered array of section IDs
 * @returns {SectionConfig[]} Default section configurations
 */
export function createDefaultSections(sectionOrder = DEFAULT_SECTION_ORDER) {
  return sectionOrder.map((id, index) => ({
    id,
    enabled: true,
    order: index,
  }));
}

/**
 * Default theme configuration
 */
export const DEFAULT_THEME = {
  preset: 'custom',
  colors: {
    primary: '#d4af37',
    secondary: '#8b6914',
    background: '#fff8f0',
    text: '#2c2c2c',
    accent: '#c9a227',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Poppins',
    script: 'Great Vibes',
  },
};

/**
 * Create default layout configuration
 * @param {string} layoutId - Layout ID
 * @returns {LayoutConfig} Default layout configuration
 */
export function createDefaultTemplateConfig(layoutId = 'royal-elegance') {
  return {
    sections: createDefaultSections(),
    theme: { ...DEFAULT_THEME },
  };
}

// Legacy export for backward compatibility
export const WeddingDataSchema = {
  SECTION_TYPES,
  SECTION_METADATA,
  DEFAULT_SECTION_ORDER,
  DEFAULT_THEME,
  createDefaultSections,
  createDefaultTemplateConfig,
};
