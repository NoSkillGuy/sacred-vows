/**
 * Layout Service
 * Handles API calls for layout operations
 */

import { apiRequest } from './apiClient';
import type { LayoutManifest } from '@shared/types/layout';

interface LayoutOptions {
  category?: string;
  featured?: boolean;
}

interface LayoutsResponse {
  layouts: LayoutManifest[];
  categories: string[];
}

interface ManifestsResponse {
  manifests: LayoutManifest[];
}

interface LayoutResponse {
  layout: LayoutManifest;
}

interface ManifestResponse {
  manifest: LayoutManifest;
}

/**
 * Get all layouts
 * @param options - Filter options
 * @returns Layouts and categories
 */
export async function getLayouts(options: LayoutOptions = {}): Promise<LayoutsResponse> {
  try {
    const response = await apiRequest('/layouts/manifests', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifests');
    }

    const data = await response.json() as ManifestsResponse;
    const manifests = data.manifests || [];

    const categories = ['all', ...new Set(manifests.map((l) => (l.metadata?.tags?.[0] || '').toLowerCase()).filter(Boolean))];

    let filtered = manifests;

    if (options.category && options.category !== 'all') {
      filtered = filtered.filter((l) => (l.metadata?.tags?.[0] || '').toLowerCase() === options.category);
    }

    if (options.featured) {
      filtered = filtered.filter((l) => (l.metadata as { isFeatured?: boolean })?.isFeatured);
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
 * @returns Layout object
 */
export async function getLayout(id: string): Promise<LayoutManifest> {
  try {
    const response = await apiRequest(`/layouts/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout');
    }

    const data = await response.json() as LayoutResponse;
    return data.layout;
  } catch (error) {
    console.error('Get layout error:', error);
    throw error;
  }
}

/**
 * Get layout manifest (full configuration including sections and themes)
 * @param id - Layout ID
 * @returns Layout manifest object
 */
export async function getLayoutManifest(id: string): Promise<LayoutManifest> {
  try {
    const response = await apiRequest(`/layouts/${id}/manifest`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifest');
    }

    const data = await response.json() as ManifestResponse;
    return data.manifest;
  } catch (error) {
    console.error('Get layout manifest error:', error);
    throw error;
  }
}

/**
 * Get all available layout manifests (for layout switching)
 * @returns Array of layout manifests
 */
export async function getAllLayoutManifests(): Promise<LayoutManifest[]> {
  try {
    const response = await apiRequest('/layouts/manifests', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch layout manifests');
    }

    const data = await response.json() as ManifestsResponse;
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

