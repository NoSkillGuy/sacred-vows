/**
 * Asset Service
 * Handles image uploads and asset management
 * In production, this would integrate with Cloudinary, AWS S3, or similar
 */

import { apiRequest } from './apiClient';

/**
 * Upload an image file
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} URL of uploaded image
 */
export async function uploadImage(file) {
  try {
    // In production, this would make an API call to upload to Cloudinary/S3
    // For now, we'll return a placeholder
    
    const formData = new FormData();
    formData.append('image', file);

    // Use apiRequest which handles auth headers automatically
    // apiClient will not set Content-Type for FormData
    const response = await apiRequest('/assets/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Image upload error:', error);
    // Fallback: create object URL for local preview
    return URL.createObjectURL(file);
  }
}

/**
 * Delete an uploaded image
 * @param {string} imageUrl - URL of image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  try {
    const response = await apiRequest('/assets/delete', {
      method: 'DELETE',
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error('Image delete error:', error);
  }
}

/**
 * Get list of uploaded assets for current user
 * @returns {Promise<Array>} Array of asset objects
 */
export async function getAssets() {
  try {
    const response = await apiRequest('/assets', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assets');
    }

    const data = await response.json();
    return data.assets || [];
  } catch (error) {
    console.error('Get assets error:', error);
    return [];
  }
}

