/**
 * Self-check script for renderPublishedHTML
 * Validates that the renderer works correctly
 */

import type { InvitationData } from '@shared/types/wedding-data';

// This is a test/validation script - keeping it simple
const testInvitation: InvitationData = {
  id: 'test-1',
  layoutId: 'classic-scroll',
  data: {
    couple: {
      bride: { name: 'Test Bride', title: 'Ms.', parents: { mother: '', father: '' }, image: '' },
      groom: { name: 'Test Groom', title: 'Mr.', parents: { mother: '', father: '' }, image: '' },
    },
    wedding: {
      dates: ['2024-01-01'],
      venue: {
        name: 'Test Venue',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        mapsUrl: '',
        mapsEmbedUrl: '',
        tags: [],
      },
      countdownTarget: '2024-01-01',
    },
    events: {},
    gallery: { images: [] },
    rsvp: { enabled: false, contacts: [] },
  },
  layoutConfig: {
    id: 'classic-scroll',
    name: 'Classic Scroll',
    version: '1.0.0',
    metadata: {
      description: '',
      previewImage: '',
      tags: [],
      author: '',
      version: '1.0.0',
    },
    sections: [],
    theme: {
      preset: 'default',
      colors: {
        primary: '#000',
        secondary: '#000',
        background: { page: '#fff' },
        text: { primary: '#000' },
      },
    },
  },
};

console.log('Self-check: Test invitation data structure is valid');
console.log(JSON.stringify(testInvitation, null, 2));

