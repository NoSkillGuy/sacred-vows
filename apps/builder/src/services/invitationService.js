/**
 * Invitation Service
 * Handles API calls for invitation CRUD operations
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
 * Get all invitations for current user
 * @returns {Promise<Array>} Array of invitations
 */
export async function getInvitations() {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }

    const data = await response.json();
    return data.invitations || [];
  } catch (error) {
    console.error('Get invitations error:', error);
    throw error;
  }
}

/**
 * Get single invitation
 * @param {string} id - Invitation ID
 * @returns {Promise<Object>} Invitation object
 */
export async function getInvitation(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitation');
    }

    const data = await response.json();
    return data.invitation;
  } catch (error) {
    console.error('Get invitation error:', error);
    throw error;
  }
}

/**
 * Create new invitation
 * @param {Object} invitationData - Invitation data
 * @returns {Promise<Object>} Created invitation
 */
export async function createInvitation(invitationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(invitationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create invitation');
    }

    const data = await response.json();
    return data.invitation;
  } catch (error) {
    console.error('Create invitation error:', error);
    throw error;
  }
}

/**
 * Update invitation
 * @param {string} id - Invitation ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated invitation
 */
export async function updateInvitation(id, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update invitation');
    }

    const data = await response.json();
    return data.invitation;
  } catch (error) {
    console.error('Update invitation error:', error);
    throw error;
  }
}

/**
 * Delete invitation
 * @param {string} id - Invitation ID
 * @returns {Promise<void>}
 */
export async function deleteInvitation(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete invitation');
    }
  } catch (error) {
    console.error('Delete invitation error:', error);
    throw error;
  }
}

/**
 * Auto-save invitation (debounced)
 * @param {string} id - Invitation ID
 * @param {Object} data - Invitation data
 * @param {number} delay - Debounce delay in ms
 * @returns {Promise<Function>} Cancel function
 */
export function autoSaveInvitation(id, data, delay = 2000) {
  let timeoutId;

  const save = async () => {
    try {
      await updateInvitation(id, { data });
      console.log('Auto-saved');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const debouncedSave = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(save, delay);
  };

  return debouncedSave;
}

