/**
 * Asset Service
 * Handles image uploads and asset management
 */

import { apiRequest } from './apiClient';
import { getAccessToken } from './tokenStorage';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Upload a single image file with progress tracking
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Progress callback (progress: number 0-100)
 * @returns {Promise<{url: string, asset: object}>} Upload result
 */
export async function uploadImage(file, onProgress) {
  // Client-side validation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
  }

  const formData = new FormData();
  formData.append('image', file);

  const uploadFn = async () => {
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = getAccessToken();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ url: data.url, asset: data.asset });
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('POST', `${API_BASE_URL}/assets/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.withCredentials = true; // Include cookies
      xhr.send(formData);
    });
  };

  return retryWithBackoff(uploadFn);
}

/**
 * Upload multiple image files
 * @param {File[]} files - Array of image files to upload
 * @param {Function} onFileProgress - Progress callback (fileIndex: number, progress: number 0-100)
 * @returns {Promise<Array<{url: string, asset: object, error?: Error}>>} Array of upload results
 */
export async function uploadImages(files, onFileProgress) {
  const results = await Promise.allSettled(
    files.map((file, index) =>
      uploadImage(file, (progress) => {
        if (onFileProgress) {
          onFileProgress(index, progress);
        }
      }).then(result => ({ ...result, index }))
    )
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        url: null,
        asset: null,
        error: result.reason,
        index,
      };
    }
  });
}

/**
 * Delete an uploaded image
 * @param {string} imageUrl - URL of image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  const response = await apiRequest('/assets/delete', {
    method: 'DELETE',
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
    throw new Error(errorData.error || 'Delete failed');
  }
}

/**
 * Get list of uploaded assets for current user
 * @returns {Promise<Array>} Array of asset objects
 */
export async function getAssets() {
  const response = await apiRequest('/assets', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch assets' }));
    throw new Error(errorData.error || 'Failed to fetch assets');
  }

  const data = await response.json();
  return data.assets || [];
}

/**
 * Get asset count by URLs
 * @param {string[]} urls - Array of asset URLs
 * @returns {Promise<number>} Count of existing assets
 */
export async function getAssetCountByUrls(urls) {
  const response = await apiRequest('/assets/count-by-urls', {
    method: 'POST',
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to get asset count' }));
    throw new Error(errorData.error || 'Failed to get asset count');
  }

  const data = await response.json();
  return data.count || 0;
}

