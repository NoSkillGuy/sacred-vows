/**
 * Template Service
 * Handles API calls for template operations
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
 * Get all templates
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.featured - Filter featured only
 * @returns {Promise<{templates: Array, categories: Array}>}
 */
export async function getTemplates(options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/manifests`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template manifests');
    }

    const data = await response.json();
    const manifests = data.manifests || [];

    const categories = ['all', ...new Set(manifests.map((t) => t.category).filter(Boolean))];

    let filtered = manifests;

    if (options.category && options.category !== 'all') {
      filtered = filtered.filter((t) => t.category === options.category);
    }

    if (options.featured) {
      filtered = filtered.filter((t) => t.isFeatured);
    }

    return {
      templates: filtered,
      categories,
    };
  } catch (error) {
    console.error('Get templates error:', error);
    throw error;
  }
}

/**
 * Get single template by ID
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Template object
 */
export async function getTemplate(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Get template error:', error);
    throw error;
  }
}

/**
 * Get template manifest (full configuration including sections and themes)
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Template manifest object
 */
export async function getTemplateManifest(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}/manifest`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template manifest');
    }

    const data = await response.json();
    return data.manifest;
  } catch (error) {
    console.error('Get template manifest error:', error);
    throw error;
  }
}

/**
 * Get all available template manifests (for template switching)
 * @returns {Promise<Object[]>} Array of template manifests
 */
export async function getAllTemplateManifests() {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e85de9ab-c4a4-469a-8552-f24bbe0246a8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'A',
        location: 'templateService.js:getAllTemplateManifests:start',
        message: 'Fetching template manifests',
        data: { apiBase: API_BASE_URL },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const response = await fetch(`${API_BASE_URL}/templates/manifests`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template manifests');
    }

    const data = await response.json();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e85de9ab-c4a4-469a-8552-f24bbe0246a8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'A',
        location: 'templateService.js:getAllTemplateManifests:response',
        message: 'Received template manifests response',
        data: { status: response.status, count: (data?.manifests || []).length },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return data.manifests || [];
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e85de9ab-c4a4-469a-8552-f24bbe0246a8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'A',
        location: 'templateService.js:getAllTemplateManifests:error',
        message: 'Failed fetching template manifests',
        data: { error: error?.message },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    console.error('Get template manifests error:', error);
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
