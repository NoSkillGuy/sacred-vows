/**
 * Classic Scroll Layout Manifest
 * 
 * Defines the structure, sections, themes, and metadata for the classic-scroll layout.
 * This manifest is used by the builder to understand layout capabilities.
 */

import type { LayoutManifest } from '@shared/types/layout';
import { getLayoutPreviewUrl } from '../../services/defaultAssetService';

export const classicScrollManifest: LayoutManifest = {
  id: 'classic-scroll',
  name: 'Classic Scroll',
  version: '1.0.0',
  
  metadata: {
    name: 'Classic Scroll',
    description: 'Traditional single-column layout with elegant typography and centered content. Perfect for couples who appreciate classic design and formal celebrations.',
    previewImage: getLayoutPreviewUrl('classic-scroll', 'preview.jpg'),
    tags: ['elegant', 'classic', 'traditional', 'scroll', 'vertical'],
    author: 'Sacred Vows',
    version: '1.0.0',
  },
  
  sections: [
    {
      id: 'header',
      name: 'Header',
      required: true,
      order: 0,
    },
    {
      id: 'hero',
      name: 'Hero',
      required: true,
      order: 1,
    },
    {
      id: 'couple',
      name: 'Couple',
      required: false,
      order: 2,
    },
    {
      id: 'fathers-letter',
      name: "Father's Letter",
      required: false,
      order: 3,
    },
    {
      id: 'gallery',
      name: 'Gallery',
      required: false,
      order: 4,
    },
    {
      id: 'events',
      name: 'Events',
      required: false,
      order: 5,
    },
    {
      id: 'venue',
      name: 'Venue',
      required: false,
      order: 6,
    },
    {
      id: 'rsvp',
      name: 'RSVP',
      required: false,
      order: 7,
    },
    {
      id: 'footer',
      name: 'Footer',
      required: false,
      order: 8,
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
        background: {
          page: '#fff8f0',
        },
        text: {
          primary: '#2c2c2c',
        },
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
        background: {
          page: '#fff5f7',
        },
        text: {
          primary: '#4a3539',
        },
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
        background: {
          page: '#f9faf8',
        },
        text: {
          primary: '#3a4a3b',
        },
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
        background: {
          page: '#f8f9fa',
        },
        text: {
          primary: '#2c2c2c',
        },
        accent: '#5a6e82',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Poppins',
        script: 'Great Vibes',
      },
    },
  ],
  
  defaultSectionOrder: ['header', 'hero', 'couple', 'fathers-letter', 'gallery', 'events', 'venue', 'rsvp', 'footer'],
};

export default classicScrollManifest;

