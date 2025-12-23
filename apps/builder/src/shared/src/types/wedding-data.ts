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

export interface PersonInfo {
  name: string;
  title: string;
  parents: {
    mother: string;
    father: string;
  };
  image: string;
}

export interface CoupleInfo {
  bride: PersonInfo;
  groom: PersonInfo;
}

export interface VenueInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  tags: string[];
}

export interface WeddingDetails {
  dates: string[];
  venue: VenueInfo;
  countdownTarget: string;
}

export interface Event {
  id: string;
  label: string;
  tag: string;
  time: string;
  date: string;
  emoji?: string;
  image?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

export interface Contact {
  name: string;
  badge: string;
  phone?: string;
  email?: string;
}

export interface RSVPConfig {
  contacts: Contact[];
  whatsappNumber: string;
  maxDate: string;
}

export interface CustomContent {
  fathersLetter: {
    author: string;
  };
}

export interface MusicConfig {
  file: string;
  volume: number;
}

export interface HeroConfig {
  mainImage: string;
}

export interface BrandingInfo {
  monogram: string;
  logo?: string;
  title: string;
  subtitle: string;
}

export interface WeddingPartyMember {
  name: string;
  role?: string;
  image: string;
  bio: string;
}

export interface WeddingPartyInfo {
  bride: WeddingPartyMember;
  groom: WeddingPartyMember;
  members?: WeddingPartyMember[];
}

export interface VideoConfig {
  url: string;
  poster: string;
  muted?: boolean;
  loop?: boolean;
}

export interface EditorialIntroConfig {
  text: string;
  image: string;
  alignment: 'left' | 'right';
}

export interface ImageFilterConfig {
  filter: 'none' | 'bw' | 'sepia' | 'desaturated';
  intensity: number;
}

// ============================================================================
// LAYOUT CONFIGURATION TYPES
// These are per-layout settings
// ============================================================================

export interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent?: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  script: string;
}

export interface ThemeConfig {
  preset: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export interface LayoutConfig {
  sections: SectionConfig[];
  theme: ThemeConfig;
  themes?: ThemePreset[];
}

export interface ThemePreset {
  id: string;
  name: string;
  isDefault?: boolean;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

// ============================================================================
// COMPLETE DATA STRUCTURES
// ============================================================================

export interface UniversalWeddingData {
  branding: BrandingInfo;
  couple: CoupleInfo;
  wedding: WeddingDetails;
  events: Record<string, Event[]>;
  gallery: {
    images: GalleryImage[];
  };
  rsvp: RSVPConfig;
  customContent?: CustomContent;
  music?: MusicConfig;
  hero?: HeroConfig;
  theme?: ThemeConfig;
  [key: string]: unknown; // Allow additional properties
}

export interface InvitationData {
  id: string | null;
  layoutId: string;
  data: UniversalWeddingData;
  layoutConfig: LayoutConfig;
  translations?: Record<string, unknown> | null;
}

// ============================================================================
// SECTION DEFINITIONS
// Standard sections available across all layouts
// ============================================================================

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
} as const;

export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES];

export interface SectionMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  required: boolean;
}

export const SECTION_METADATA: Record<SectionType, SectionMetadata> = {
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

export const DEFAULT_SECTION_ORDER: SectionType[] = [
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

export function createDefaultSections(sectionOrder: SectionType[] = DEFAULT_SECTION_ORDER): SectionConfig[] {
  return sectionOrder.map((id, index) => ({
    id,
    enabled: true,
    order: index,
  }));
}

export const DEFAULT_THEME: ThemeConfig = {
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

export function createDefaultLayoutConfig(layoutId: string = 'classic-scroll'): LayoutConfig {
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
  createDefaultLayoutConfig,
};

