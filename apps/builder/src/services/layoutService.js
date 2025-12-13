/**
 * Layout Service
 * Handles API calls for layout operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Set auth headers
function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

/**
 * Get all layouts
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.featured - Filter featured only
 * @returns {Promise<{layouts: Array, categories: Array}>}
 */
export async function getLayouts(options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/layouts/manifests`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifests');
    }

    const data = await response.json();
    const manifests = data.manifests || [];

    const categories = ['all', ...new Set(manifests.map((l) => l.category).filter(Boolean))];

    let filtered = manifests;

    if (options.category && options.category !== 'all') {
      filtered = filtered.filter((l) => l.category === options.category);
    }

    if (options.featured) {
      filtered = filtered.filter((l) => l.isFeatured);
    }

    return {
      layouts: filtered,
      categories,
    };
  } catch (error) {
    console.error('Get layouts error:', error);
    throw error;
  }
}

/**
 * Get single layout by ID
 * @param {string} id - Layout ID
 * @returns {Promise<Object>} Layout object
 */
export async function getLayout(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/layouts/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout');
    }

    const data = await response.json();
    return data.layout;
  } catch (error) {
    console.error('Get layout error:', error);
    throw error;
  }
}

/**
 * Get layout manifest (full configuration including sections and themes)
 * @param {string} id - Layout ID
 * @returns {Promise<Object>} Layout manifest object
 */
export async function getLayoutManifest(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/layouts/${id}/manifest`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifest');
    }

    const data = await response.json();
    return data.manifest;
  } catch (error) {
    console.error('Get layout manifest error:', error);
    throw error;
  }
}

/**
 * Get all available layout manifests (for layout switching)
 * @returns {Promise<Object[]>} Array of layout manifests
 */
export async function getAllLayoutManifests() {
  try {
    const response = await fetch(`${API_BASE_URL}/layouts/manifests`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifests');
    }

    const data = await response.json();
    const manifests = data.manifests || [];

    return manifests;
  } catch (error) {
    console.error('Get layout manifests error:', error);
    throw error;
  }
}

/**
 * Format price for display
 * @param {number} price - Price amount
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = 'INR') {
  if (currency === 'INR') {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}
