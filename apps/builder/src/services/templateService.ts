/**
 * Layout Service
 * Handles API calls for layout operations
 */

import { apiRequest } from './apiClient';
import type { LayoutManifest } from '@shared/types/layout';

/**
 * Filter options for layout queries
 */
export interface LayoutFilterOptions {
  category?: string;
  featured?: boolean;
}

/**
 * Response from getLayouts
 */
export interface LayoutsResponse {
  layouts: LayoutManifest[];
  categories: string[];
}

/**
 * Get all layouts
 * @param options - Filter options
 * @returns Promise with layouts and categories
 */
export async function getLayouts(options: LayoutFilterOptions = {}): Promise<LayoutsResponse> {
  try {
    const response = await apiRequest('/layouts/manifests', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifests');
    }

    const data = await response.json() as { manifests?: LayoutManifest[] };
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
 * @param id - Layout ID
 * @returns Promise with layout object
 */
export async function getLayout(id: string): Promise<LayoutManifest> {
  try {
    const response = await apiRequest(`/layouts/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout');
    }

    const data = await response.json() as { layout: LayoutManifest };
    return data.layout;
  } catch (error) {
    console.error('Get layout error:', error);
    throw error;
  }
}

/**
 * Get layout manifest (full configuration including sections and themes)
 * @param id - Layout ID
 * @returns Promise with layout manifest object
 */
export async function getLayoutManifest(id: string): Promise<LayoutManifest> {
  try {
    const response = await apiRequest(`/layouts/${id}/manifest`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifest');
    }

    const data = await response.json() as { manifest: LayoutManifest };
    return data.manifest;
  } catch (error) {
    console.error('Get layout manifest error:', error);
    throw error;
  }
}

/**
 * Get all available layout manifests (for layout switching)
 * @returns Promise with array of layout manifests
 */
export async function getAllLayoutManifests(): Promise<LayoutManifest[]> {
  try {
    const response = await apiRequest('/layouts/manifests', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifests');
    }

    const data = await response.json() as { manifests?: LayoutManifest[] };
    const manifests = data.manifests || [];

    return manifests;
  } catch (error) {
    console.error('Get layout manifests error:', error);
    throw error;
  }
}

/**
 * Format price for display
 * @param price - Price amount
 * @param currency - Currency code (default: INR)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

