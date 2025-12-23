/**
 * Editorial Elegance Layout Manifest
 * 
 * Defines the structure, sections, themes, and metadata for the editorial-elegance layout.
 * A luxury magazine-style layout inspired by Vogue/Harper's Bazaar editorials.
 */

import type { LayoutManifest } from '@shared/types/layout';
import { getLayoutPreviewUrl } from '../../services/defaultAssetService';

export const editorialEleganceManifest: LayoutManifest = {
  id: 'editorial-elegance',
  name: 'Editorial Elegance',
  version: '1.0.0',
  
  metadata: {
    name: 'Editorial Elegance',
    description: 'Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.',
    previewImage: getLayoutPreviewUrl('editorial-elegance', 'preview.jpg'),
    tags: ['luxury', 'minimal', 'editorial', 'modern', 'premium', 'magazine'],
    author: 'Sacred Vows',
    version: '1.0.0',
  },
  
  sections: [
    {
      id: 'hero',
      name: 'Editorial Cover',
      required: true,
      order: 0,
    },
    {
      id: 'editorial-intro',
      name: 'Editorial Intro',
      required: false,
      order: 1,
    },
    {
      id: 'events',
      name: 'Event Schedule',
      required: false,
      order: 2,
    },
    {
      id: 'wedding-party',
      name: 'Wedding Party',
      required: false,
      order: 3,
    },
    {
      id: 'location',
      name: 'Location',
      required: false,
      order: 4,
    },
    {
      id: 'gallery',
      name: 'Gallery',
      required: false,
      order: 5,
    },
    {
      id: 'rsvp',
      name: 'RSVP',
      required: false,
      order: 6,
    },
    {
      id: 'footer',
      name: 'Footer',
      required: true,
      order: 7,
    },
  ],
  
  themes: [
    {
      id: 'default',
      name: 'Editorial Classic',
      isDefault: true,
      colors: {
        primary: '#C6A15B',
        secondary: '#6B6B6B',
        background: {
          page: '#FAF9F7',
        },
        text: {
          primary: '#1C1C1C',
          muted: '#6B6B6B',
        },
        accent: '#C6A15B',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Inter',
        script: 'Playfair Display',
      },
    },
  ],
  
  defaultSectionOrder: ['hero', 'editorial-intro', 'events', 'wedding-party', 'location', 'gallery', 'rsvp', 'footer'],
};

