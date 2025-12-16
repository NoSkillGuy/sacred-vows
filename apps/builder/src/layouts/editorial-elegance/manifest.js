/**
 * Editorial Elegance Layout Manifest
 * 
 * Defines the structure, sections, themes, and metadata for the editorial-elegance layout.
 * A luxury magazine-style layout inspired by Vogue/Harper's Bazaar editorials.
 */

import { SECTION_TYPES } from '../../shared/src/types/wedding-data';

export const editorialEleganceManifest = {
  id: 'editorial-elegance',
  name: 'Editorial Elegance',
  version: '1.0.0',
  
  metadata: {
    description: 'Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.',
    previewImage: '/layouts/editorial-elegance/preview.jpg',
    tags: ['luxury', 'minimal', 'editorial', 'modern', 'premium', 'magazine'],
    author: 'Sacred Vows',
    category: 'Modern',
    featured: true,
    status: 'ready',
  },
  
  sections: [
    {
      id: 'hero',
      name: 'Editorial Cover',
      icon: '📰',
      description: 'Full-height hero with image or video background',
      required: true,
      enabled: true,
      order: 0,
      config: {
        alignment: 'center', // 'center' | 'bottom-left'
        mediaType: 'image', // 'image' | 'video'
      },
    },
    {
      id: 'editorial-intro',
      name: 'Editorial Intro',
      icon: '✍️',
      description: 'Magazine-style opening paragraph with portrait',
      required: false,
      enabled: true,
      order: 1,
      config: {
        layout: 'two-column', // 'two-column' | 'centered'
      },
    },
    {
      id: 'events',
      name: 'Event Schedule',
      icon: '📅',
      description: 'Horizontal card-based event schedule',
      required: false,
      enabled: true,
      order: 2,
      config: {},
    },
    {
      id: 'wedding-party',
      name: 'Wedding Party',
      icon: '👥',
      description: 'Bride, groom, and optional party members (2-4 photos)',
      required: false,
      enabled: true,
      order: 3,
      config: {
        showBios: false,
        filter: 'bw', // 'none' | 'bw'
      },
    },
    {
      id: 'location',
      name: 'Location',
      icon: '📍',
      description: 'Venue details with embedded map',
      required: false,
      enabled: true,
      order: 4,
      config: {
        mapStyle: 'desaturated',
      },
    },
    {
      id: 'gallery',
      name: 'Gallery',
      icon: '🖼️',
      description: 'Editorial-style masonry or single-column gallery (8-12 images)',
      required: false,
      enabled: true,
      order: 5,
      config: {
        layout: 'masonry', // 'masonry' | 'single-column'
        maxImages: 12,
      },
    },
    {
      id: 'rsvp',
      name: 'RSVP',
      icon: '✉️',
      description: 'Ultra-minimal centered RSVP form',
      required: false,
      enabled: true,
      order: 6,
      config: {},
    },
    {
      id: 'footer',
      name: 'Footer',
      icon: '📄',
      description: 'Minimal footer with couple names',
      required: true,
      enabled: true,
      order: 7,
      config: {},
    },
  ],
  
  themes: {
    default: {
      id: 'default',
      name: 'Editorial Classic',
      isDefault: true,
      colors: {
        background: '#FAF9F7', // Ivory off-white
        text: '#1C1C1C', // Near black
        secondary: '#6B6B6B', // Soft grey
        primary: '#C6A15B', // Champagne gold (accent only)
        divider: '#E6E6E6',
      },
      fonts: {
        heading: 'Playfair Display', // Luxury serif
        body: 'Inter', // Clean sans
        script: 'Playfair Display', // Reuse heading for consistency
      },
      typography: {
        heroNames: '80px',
        sectionHeadings: '42px',
        subHeadings: '24px',
        bodyText: '18px',
        metaText: '14px',
        letterSpacing: {
          metaText: '0.1em', // Uppercase meta (dates)
        },
      },
    },
    variants: [
      {
        id: 'warm-editorial',
        name: 'Warm Editorial',
        colors: {
          background: '#FAF7F2',
          text: '#2C2416',
          secondary: '#7C7265',
          primary: '#B8956A',
          divider: '#E8E4DE',
        },
      },
      {
        id: 'cool-editorial',
        name: 'Cool Editorial',
        colors: {
          background: '#F9FAFB',
          text: '#1A1D23',
          secondary: '#64748B',
          primary: '#94A3B8',
          divider: '#E2E8F0',
        },
      },
    ],
  },
  
  features: {
    videoHero: true,
    imageFilters: true,
    embeddedMaps: true,
    masonryGallery: true,
    minimalAnimations: true,
    premiumFonts: false, // Phase 2
  },
};

