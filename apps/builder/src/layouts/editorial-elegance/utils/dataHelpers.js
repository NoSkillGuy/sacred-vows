/**
 * Data Helper Utilities
 * Centralized functions for parsing and normalizing invitation data
 */

/**
 * Parse invitation data from various formats (string, array, object) to a normalized object
 * @param {any} data - Data in any format (string, array, object, null, undefined)
 * @param {Object} fallback - Fallback object to use if data is invalid (default: {})
 * @returns {Object} Normalized data object
 */
export function parseInvitationData(data, fallback = {}) {
  // Handle string data (JSON)
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      // Ensure parsed result is an object
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
      return fallback;
    } catch (e) {
      console.warn('Failed to parse data as JSON:', e);
      return fallback;
    }
  }
  
  // Handle array or invalid types
  if (Array.isArray(data) || !data || typeof data !== 'object') {
    return fallback;
  }
  
  // Return object as-is
  return data;
}

/**
 * Ensure data is a valid object, converting from string/array if needed
 * @param {any} data - Data to ensure is an object
 * @param {Object} fallback - Fallback object if data is invalid
 * @returns {Object} Valid object
 */
export function ensureDataIsObject(data, fallback = {}) {
  return parseInvitationData(data, fallback);
}

/**
 * Calculate section enabled state from manifest section definition
 * @param {Object} manifestSection - Section definition from manifest
 * @returns {boolean} True if section should be enabled
 */
export function calculateSectionEnabled(manifestSection) {
  return manifestSection.enabled !== false && 
         (manifestSection.enabled === true || manifestSection.defaultEnabled !== false);
}

