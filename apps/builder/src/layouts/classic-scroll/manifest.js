/**
 * Classic Scroll Layout Manifest
 * 
 * Defines the structure, sections, themes, and metadata for the classic-scroll layout.
 * This manifest is used by the builder to understand layout capabilities.
 */

export const classicScrollManifest = {
  id: 'classic-scroll',
  name: 'Classic Scroll',
  version: '1.0.0',
  
  metadata: {
    description: 'Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings.',
    previewImage: '/layouts/classic-scroll/preview.jpg',
    tags: ['elegant', 'classic', 'traditional', 'scroll', 'vertical'],
    author: 'Sacred Vows',
    category: 'Traditional',
    featured: true,
    status: 'ready',
  },
  
  sections: [
    {
      id: 'header',
      name: 'Header',
      icon: '📋',
      description: 'Top navigation with language selector and branding',
      required: true,
      enabled: true,
      order: 0,
      config: {},
    },
    {
      id: 'hero',
      name: 'Hero',
      icon: '💑',
      description: 'Main hero section with couple names and date',
      required: true,
      enabled: true,
      order: 1,
      config: {},
    },
    {
      id: 'couple',
      name: 'Couple',
      icon: '👰',
      description: 'Couple introduction with photos and family details',
      required: false,
      enabled: true,
      order: 2,
      config: {},
    },
    {
      id: 'fathers-letter',
      name: "Father's Letter",
      icon: '✉️',
      description: 'Heartfelt message from parents',
      required: false,
      enabled: true,
      order: 3,
      config: {},
    },
    {
      id: 'gallery',
      name: 'Gallery',
      icon: '🖼️',
      description: 'Photo gallery showcasing memories',
      required: false,
      enabled: true,
      order: 4,
      config: {},
    },
    {
      id: 'events',
      name: 'Events',
      icon: '📅',
      description: 'Wedding events schedule',
      required: false,
      enabled: true,
      order: 5,
      config: {},
    },
    {
      id: 'venue',
      name: 'Venue',
      icon: '📍',
      description: 'Venue details with map',
      required: false,
      enabled: true,
      order: 6,
      config: {},
    },
    {
      id: 'rsvp',
      name: 'RSVP',
      icon: '✅',
      description: 'RSVP section for guest responses',
      required: false,
      enabled: true,
      order: 7,
      config: {},
    },
    {
      id: 'footer',
      name: 'Footer',
      icon: '🔚',
      description: 'Footer with additional information',
      required: false,
      enabled: true,
      order: 8,
      config: {},
    },
  ],
  
  themes: [
    {
      id: 'royal-gold',
      name: 'Royal Gold',
      isDefault: true,
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
    },
    {
      id: 'rose-blush',
      name: 'Rose Blush',
      isDefault: false,
      colors: {
        primary: '#c77d8a',
        secondary: '#9b5c6a',
        background: '#fff5f7',
        text: '#4a3539',
        accent: '#e8b4b8',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Poppins',
        script: 'Great Vibes',
      },
    },
    {
      id: 'sage-green',
      name: 'Sage Green',
      isDefault: false,
      colors: {
        primary: '#9bb69d',
        secondary: '#6b8a6e',
        background: '#f9faf8',
        text: '#3a4a3b',
        accent: '#c8d9c9',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Poppins',
        script: 'Great Vibes',
      },
    },
    {
      id: 'navy-elegance',
      name: 'Navy Elegance',
      isDefault: false,
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        background: '#f8f9fa',
        text: '#2c2c2c',
        accent: '#5a6e82',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Poppins',
        script: 'Great Vibes',
      },
    },
  ],
  
  features: {
    multiLanguage: true,
    responsiveDesign: true,
    darkMode: false,
    animations: true,
    pwa: true,
    offlineSupport: false,
  },
  
  requirements: {
    minScreenWidth: 320,
    recommendedScreenWidth: 375,
    supportedBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
  },
};

export default classicScrollManifest;

