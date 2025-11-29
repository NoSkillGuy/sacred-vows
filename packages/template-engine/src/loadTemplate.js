/**
 * Template Loader
 * Loads template configuration and components dynamically
 */

/**
 * Loads a template by ID
 * @param {string} templateId - Template identifier
 * @returns {Promise<Object>} Template configuration and components
 */
export async function loadTemplate(templateId) {
  try {
    // In production, this would fetch from API or load from file system
    // For now, we'll use a simple mapping
    const templateMap = {
      'royal-elegance': () => import('../../../templates/royal-elegance/config.json'),
    };

    const templateLoader = templateMap[templateId];
    if (!templateLoader) {
      throw new Error(`Template ${templateId} not found`);
    }

    const templateConfig = await templateLoader();
    return templateConfig.default || templateConfig;
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    throw error;
  }
}

/**
 * Merges user data with template defaults
 * @param {Object} templateConfig - Template configuration
 * @param {Object} userData - User-provided data
 * @returns {Object} Merged configuration
 */
export function mergeTemplateData(templateConfig, userData) {
  // Deep merge template defaults with user data
  const merged = {
    ...templateConfig,
    ...userData,
  };

  // Deep merge nested objects
  if (templateConfig.couple && userData.couple) {
    merged.couple = {
      bride: { ...templateConfig.couple.bride, ...userData.couple.bride },
      groom: { ...templateConfig.couple.groom, ...userData.couple.groom },
    };
  }

  if (templateConfig.wedding && userData.wedding) {
    merged.wedding = {
      ...templateConfig.wedding,
      ...userData.wedding,
      venue: { ...templateConfig.wedding.venue, ...userData.wedding.venue },
    };
  }

  if (templateConfig.events && userData.events) {
    merged.events = {
      day1: {
        ...templateConfig.events.day1,
        ...userData.events.day1,
        events: userData.events.day1?.events || templateConfig.events.day1?.events || [],
      },
      day2: {
        ...templateConfig.events.day2,
        ...userData.events.day2,
        events: userData.events.day2?.events || templateConfig.events.day2?.events || [],
      },
    };
  }

  if (templateConfig.gallery && userData.gallery) {
    merged.gallery = {
      images: userData.gallery.images || templateConfig.gallery.images || [],
    };
  }

  if (templateConfig.rsvp && userData.rsvp) {
    merged.rsvp = {
      ...templateConfig.rsvp,
      contacts: userData.rsvp.contacts || templateConfig.rsvp.contacts || [],
    };
  }

  return merged;
}

/**
 * Validates template configuration
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function validateTemplateConfig(config) {
  const requiredFields = ['id', 'name', 'version'];
  return requiredFields.every(field => config[field] !== undefined);
}

