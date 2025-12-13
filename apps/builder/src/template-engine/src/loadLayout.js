/**
 * Layout Loader
 * Loads layout configuration and components dynamically
 */

/**
 * Loads a layout definition (config + manifest) by ID
 * @param {string} layoutId - Layout identifier
 * @returns {Promise<{config: Object, manifest: Object}>} Layout files
 */
export async function loadLayout(layoutId) {
  try {
    // In production, this would fetch from API or load from file system
    const layoutMap = {
      'royal-elegance': {
        config: () => import('../../../layouts/royal-elegance/config.json'),
        manifest: () => import('../../../layouts/royal-elegance/manifest.json'),
      },
      'heritage-red': {
        config: () => import('../../../layouts/heritage-red/config.json'),
        manifest: () => import('../../../layouts/heritage-red/manifest.json'),
      },
    };

    const layoutLoader = layoutMap[layoutId];
    if (!layoutLoader) {
      throw new Error(`Layout ${layoutId} not found`);
    }

    const [config, manifest] = await Promise.all([
      layoutLoader.config(),
      layoutLoader.manifest(),
    ]);

    return {
      config: config.default || config,
      manifest: manifest.default || manifest,
    };
  } catch (error) {
    console.error(`Error loading layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Merges user data with layout defaults
 * @param {Object} layoutConfig - Layout configuration
 * @param {Object} userData - User-provided data
 * @returns {Object} Merged configuration
 */
export function mergeLayoutData(layoutConfig, userData) {
  // Deep merge layout defaults with user data
  const merged = {
    ...layoutConfig,
    ...userData,
  };

  // Deep merge nested objects
  if (layoutConfig.couple && userData.couple) {
    merged.couple = {
      bride: { ...layoutConfig.couple.bride, ...userData.couple.bride },
      groom: { ...layoutConfig.couple.groom, ...userData.couple.groom },
    };
  }

  if (layoutConfig.wedding && userData.wedding) {
    merged.wedding = {
      ...layoutConfig.wedding,
      ...userData.wedding,
      venue: { ...layoutConfig.wedding.venue, ...userData.wedding.venue },
    };
  }

  if (layoutConfig.events && userData.events) {
    merged.events = {
      day1: {
        ...layoutConfig.events.day1,
        ...userData.events.day1,
        events: userData.events.day1?.events || layoutConfig.events.day1?.events || [],
      },
      day2: {
        ...layoutConfig.events.day2,
        ...userData.events.day2,
        events: userData.events.day2?.events || layoutConfig.events.day2?.events || [],
      },
    };
  }

  if (layoutConfig.gallery && userData.gallery) {
    merged.gallery = {
      images: userData.gallery.images || layoutConfig.gallery.images || [],
    };
  }

  if (layoutConfig.rsvp && userData.rsvp) {
    merged.rsvp = {
      ...layoutConfig.rsvp,
      contacts: userData.rsvp.contacts || layoutConfig.rsvp.contacts || [],
    };
  }

  return merged;
}

/**
 * Validates layout configuration
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function validateLayoutConfig(config) {
  const requiredFields = ['id', 'name', 'version'];
  return requiredFields.every(field => config[field] !== undefined);
}
