/**
 * Wedding Data Schema
 * Defines the structure for user-provided wedding invitation data
 */

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
 * @property {string} messageTemplate - RSVP message template with {name} and {date} placeholders
 */

/**
 * @typedef {Object} TranslationSet
 * @property {Object} en - English translations
 * @property {Object} hi - Hindi translations
 * @property {Object} te - Telugu translations
 */

/**
 * @typedef {Object} CustomContent
 * @property {string} fathersLetter - Father's letter content with {name} placeholder
 */

/**
 * @typedef {Object} WeddingData
 * @property {CoupleInfo} couple - Couple information
 * @property {WeddingDetails} wedding - Wedding details
 * @property {Event[]} events - Event list
 * @property {GalleryImage[]} gallery - Gallery images
 * @property {RSVPConfig} rsvp - RSVP configuration
 * @property {TranslationSet} translations - Multi-language translations
 * @property {CustomContent} customContent - Custom content sections
 * @property {Object} branding - Branding information
 * @property {string} branding.monogram - Monogram (e.g., "P&S")
 * @property {string} branding.title - Brand title
 * @property {string} branding.subtitle - Brand subtitle
 * @property {string} music - Background music file path
 */

export const WeddingDataSchema = {
  // Schema validation can be added here
};

