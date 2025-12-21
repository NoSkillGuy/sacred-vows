/**
 * Editorial Elegance Layout Default Data
 * Provides default values for all sections using couple2 assets and real wedding details
 */

import { getLayoutAssetUrl } from '../../services/defaultAssetService';

const LAYOUT_ID = 'editorial-elegance';

export const editorialEleganceDefaults = {
  couple: {
    bride: {
      name: 'Pooja Singh',
      image: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/bride/1.jpeg')
    },
    groom: {
      name: 'Siva Praveen Rayapudi',
      image: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/1.jpeg')
    }
  },
  wedding: {
    dates: ['2021-05-15'],
    venue: {
      name: 'Halcyon Hotel Residences',
      address: '',
      city: '',
      state: '',
      mapsUrl: 'https://maps.app.goo.gl/s2JsPaRY3z6DbVkV6',
      mapsEmbedUrl: '' // Will be converted from mapsUrl if needed
    }
  },
  hero: {
    mainImage: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/1.jpeg'),
    alignment: 'center',
    mediaType: 'image'
  },
  editorialIntro: {
    text: 'Two paths, one story.\nRooted in tradition, bound by love,\nwe invite you to celebrate the beginning of forever.',
    image: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/2.jpeg'),
    alignment: 'right'
  },
  events: {
    events: [
      {
        label: 'Wedding Ceremony',
        date: '2021-05-15',
        time: '6:00 PM',
        venue: 'Halcyon Hotel Residences'
      }
    ]
  },
  weddingParty: {
    bride: {
      name: 'Pooja Singh',
      image: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/bride/1.jpeg'),
      bio: ''
    },
    groom: {
      name: 'Siva Praveen Rayapudi',
      image: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/1.jpeg'),
      bio: ''
    },
    members: [],
    showBios: false,
    filter: 'bw'
  },
  gallery: {
    images: [
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/1.jpeg'), alt: 'Couple photo 1', category: 'couple' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/2.jpeg'), alt: 'Couple photo 2', category: 'couple' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/3.jpeg'), alt: 'Couple photo 3', category: 'couple' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/4.jpeg'), alt: 'Couple photo 4', category: 'couple' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/5.jpeg'), alt: 'Couple photo 5', category: 'couple' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/couple/6.jpeg'), alt: 'Couple photo 6', category: 'couple' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/1.jpeg'), alt: 'Groom photo 1', category: 'groom' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/2.jpeg'), alt: 'Groom photo 2', category: 'groom' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/3.jpeg'), alt: 'Groom photo 3', category: 'groom' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/4.jpeg'), alt: 'Groom photo 4', category: 'groom' },
      { src: getLayoutAssetUrl(LAYOUT_ID, '/assets/photos/couple2/groom/5.jpeg'), alt: 'Groom photo 5', category: 'groom' }
    ]
  },
  galleryConfig: {
    layout: 'masonry',
    maxImages: 12
  },
  music: {
    file: getLayoutAssetUrl(LAYOUT_ID, '/assets/music/1.mp3'),
    volume: 0.5
  }
};

/**
 * Merge defaults with existing data, preserving user's customizations
 * @param {Object} existingData - Existing invitation data
 * @returns {Object} Merged data with defaults applied
 */
export function mergeWithDefaults(existingData = {}) {
  return {
    couple: {
      ...editorialEleganceDefaults.couple,
      ...existingData.couple,
      bride: {
        ...editorialEleganceDefaults.couple.bride,
        ...existingData.couple?.bride
      },
      groom: {
        ...editorialEleganceDefaults.couple.groom,
        ...existingData.couple?.groom
      }
    },
    wedding: {
      ...editorialEleganceDefaults.wedding,
      ...existingData.wedding,
      venue: {
        ...editorialEleganceDefaults.wedding.venue,
        ...existingData.wedding?.venue
      }
    },
    hero: {
      ...editorialEleganceDefaults.hero,
      ...existingData.hero
    },
    editorialIntro: {
      ...editorialEleganceDefaults.editorialIntro,
      ...existingData.editorialIntro
    },
    events: {
      ...editorialEleganceDefaults.events,
      ...existingData.events,
      events: existingData.events?.events?.length 
        ? existingData.events.events 
        : editorialEleganceDefaults.events.events
    },
    weddingParty: {
      ...editorialEleganceDefaults.weddingParty,
      ...existingData.weddingParty,
      bride: {
        ...editorialEleganceDefaults.weddingParty.bride,
        ...existingData.weddingParty?.bride
      },
      groom: {
        ...editorialEleganceDefaults.weddingParty.groom,
        ...existingData.weddingParty?.groom
      }
    },
    gallery: {
      ...editorialEleganceDefaults.gallery,
      ...existingData.gallery,
      images: existingData.gallery?.images?.length
        ? existingData.gallery.images
        : editorialEleganceDefaults.gallery.images
    },
    galleryConfig: {
      ...editorialEleganceDefaults.galleryConfig,
      ...existingData.galleryConfig
    },
    music: {
      ...editorialEleganceDefaults.music,
      ...existingData.music
    },
    // Preserve other data
    ...Object.keys(existingData).reduce((acc, key) => {
      if (!['couple', 'wedding', 'hero', 'editorialIntro', 'events', 'weddingParty', 'gallery', 'galleryConfig', 'music'].includes(key)) {
        acc[key] = existingData[key];
      }
      return acc;
    }, {})
  };
}

