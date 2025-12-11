/**
 * Wedding Configuration
 * Contains all default data for the wedding invitation builder
 * 
 * This configuration is separated into:
 * 1. Universal Content Data - Shared across all templates
 * 2. Template Configuration - Per-template settings (sections, themes)
 */

import { 
  SECTION_TYPES, 
  DEFAULT_SECTION_ORDER, 
  createDefaultSections,
  DEFAULT_THEME 
} from '../../../../packages/shared/src/types/wedding-data.js';

/**
 * Default universal wedding content data
 * This data is preserved when switching templates
 */
export const defaultWeddingConfig = {
  branding: {
    monogram: 'P&S',
    title: 'CAPT DR. PRIYA & DR. SAURABH',
    subtitle: '22 & 23 JANUARY 2026 · BENGALURU'
  },
  
  couple: {
    bride: {
      name: 'Capt Dr. Priya Singh',
      title: 'Capt Dr.',
      parents: {
        mother: 'Mrs. Geeta Singh',
        father: 'Mr. Sanjay Kumar Singh'
      },
      image: '/assets/photos/bride/1.jpeg'
    },
    groom: {
      name: 'Dr. Saurabh Singh',
      title: 'Dr.',
      parents: {
        mother: 'Mrs. Vibha Singh',
        father: 'Mr. Ashok Kumar Singh'
      },
      image: '/assets/photos/groom/1.jpeg'
    }
  },
  
  wedding: {
    dates: ['2026-01-22', '2026-01-23'],
    countdownTarget: '2026-01-23T21:00:00',
    venue: {
      name: 'Royal Lotus View Resotel',
      address: 'Royal Lotus View Resotel,\nKempegowda, International Airport Road,\nPO, behind ITC Factory,\nChikkajala, Tharabanahalli,\nBengaluru, Karnataka 562157',
      city: 'Bengaluru',
      state: 'Karnataka',
      mapsUrl: 'https://maps.app.goo.gl/pmjNuaGXQwdzSe6X6',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15552.234567890!2d77.6336814!3d13.1880748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1f47ee285e73%3A0x2fb4085d618d38a8!2sRoyal+Lotus+View+Resotel!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      tags: ['Bengaluru, Karnataka', 'Near Kempegowda International Airport']
    }
  },
  
  events: {
    day1: {
      date: 'Thursday · 22 January 2026',
      events: [
        {
          id: 'tilak',
          emoji: '🪔',
          label: 'Tilak',
          tag: 'Auspicious beginning',
          time: '3:00 PM',
          date: '2026-01-22'
        },
        {
          id: 'haldi',
          emoji: '🌼',
          label: 'Haldi',
          tag: 'Turmeric & traditions',
          time: '6:00 PM',
          date: '2026-01-22'
        },
        {
          id: 'mehandi',
          emoji: '🌺',
          label: 'Mehandi',
          tag: 'Henna & happiness',
          time: '9:00 PM',
          date: '2026-01-22'
        }
      ]
    },
    day2: {
      date: 'Friday · 23 January 2026',
      events: [
        {
          id: 'jaimala',
          emoji: '💐',
          label: 'Jaimala',
          tag: 'Exchange of garlands',
          time: '5:00 PM',
          date: '2026-01-23'
        },
        {
          id: 'dinner',
          emoji: '🍽️',
          label: 'Dinner',
          tag: 'Feast with family & friends',
          time: '8:00 PM',
          date: '2026-01-23'
        },
        {
          id: 'wedding',
          image: '/assets/photos/icons/3.jpg',
          label: 'Wedding',
          tag: 'Sacred vows',
          time: '9:00 PM',
          date: '2026-01-23'
        }
      ]
    }
  },
  
  gallery: {
    images: [
      { src: '/assets/photos/couple/2.jpeg', alt: 'Couple photo 1', category: 'couple' },
      { src: '/assets/photos/family/3.jpeg', alt: 'Couple photo 2', category: 'family' },
      { src: '/assets/photos/couple/7.jpeg', alt: 'Friends and candid moment', category: 'couple' },
      { src: '/assets/photos/couple/3.jpeg', alt: 'Traditional attire', category: 'couple' },
      { src: '/assets/photos/couple/1.jpeg', alt: 'Favourite memory together', category: 'couple' },
      { src: '/assets/photos/couple/8.jpeg', alt: 'Special capture', category: 'couple' }
    ]
  },
  
  rsvp: {
    contacts: [
      { badge: 'RSVP', name: 'Anil Kumar Singh' },
      { badge: 'RSVP', name: 'Arun Kumar Singh' },
      { badge: 'RSVP', name: 'Ashok Kumar Singh' },
      { badge: 'RSVP', name: 'Arvind Kumar Singh' },
      { badge: 'Host', name: 'Siva Praveen Rayapudi' },
      { badge: 'Host', name: 'Pooja Singh' }
    ],
    whatsappNumber: '918527476555',
    maxDate: '2026-01-24'
  },
  
  customContent: {
    fathersLetter: {
      author: 'Sanjay Kumar Singh',
    }
  },
  
  music: {
    file: '/assets/music/1.mp3',
    volume: 0.5
  },
  
  hero: {
    mainImage: '/assets/photos/couple/1.jpeg'
  },

  // Theme is now part of templateConfig, but keep here for backward compatibility
  theme: DEFAULT_THEME,
};

/**
 * Default template configuration
 * Per-template settings for sections and theme
 */
export const defaultTemplateConfig = {
  sections: createDefaultSections(),
  themes: [],
  theme: { ...DEFAULT_THEME },
};

// Re-export for convenience
export { SECTION_TYPES, DEFAULT_SECTION_ORDER, createDefaultSections, DEFAULT_THEME };
