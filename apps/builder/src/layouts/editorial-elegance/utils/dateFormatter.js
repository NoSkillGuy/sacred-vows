/**
 * Date Formatting Utilities for Editorial Elegance Layout
 * Handles date formatting with proper error handling and fallbacks
 */

/**
 * Format a wedding date string to a readable format
 * @param {string|Date} dateStr - Date string (ISO format) or Date object
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string or fallback text
 */
export function formatWeddingDate(dateStr, locale = 'en-US') {
  if (!dateStr || dateStr === 'Date TBD' || dateStr === '') {
    return '';
  }

  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  } catch (error) {
    console.warn('Date formatting error:', error, dateStr);
    return '';
  }
}

/**
 * Format an event date string to a readable format
 * @param {string|Date} dateStr - Date string (ISO format) or Date object
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string or fallback text
 */
export function formatEventDate(dateStr, locale = 'en-US') {
  return formatWeddingDate(dateStr, locale);
}

/**
 * Check if a date string is valid
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {boolean} True if date is valid
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

