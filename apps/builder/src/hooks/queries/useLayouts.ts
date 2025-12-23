/**
 * TanStack Query hooks for layout operations
 * Handles fetching layouts and layout manifests
 */

import { useQuery } from '@tanstack/react-query';
import {
  getLayouts,
  getLayout,
  getLayoutManifest,
  getAllLayoutManifests,
  type LayoutOptions,
} from '../../services/layoutService';
import type { LayoutManifest } from '@shared/types/layout';

// Query keys for consistent cache management
export const layoutKeys = {
  all: ['layouts'] as const,
  lists: () => [...layoutKeys.all, 'list'] as const,
  list: (options?: LayoutOptions) => [...layoutKeys.lists(), options] as const,
  details: () => [...layoutKeys.all, 'detail'] as const,
  detail: (id: string) => [...layoutKeys.details(), id] as const,
  manifests: () => [...layoutKeys.all, 'manifests'] as const,
  manifest: (id: string) => [...layoutKeys.manifests(), id] as const,
};

/**
 * Query hook to fetch all layouts with optional filters
 * @param options - Filter options (category, featured)
 */
export function useLayoutsQuery(options: LayoutOptions = {}) {
  return useQuery({
    queryKey: layoutKeys.list(options),
    queryFn: () => getLayouts(options),
  });
}

/**
 * Query hook to fetch all layout manifests (for layout switching)
 */
export function useAllLayoutManifestsQuery() {
  return useQuery({
    queryKey: layoutKeys.manifests(),
    queryFn: getAllLayoutManifests,
  });
}

/**
 * Query hook to fetch a single layout by ID
 * @param id - Layout ID
 * @param enabled - Whether the query should run (default: true)
 */
export function useLayoutQuery(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: layoutKeys.detail(id!),
    queryFn: () => getLayout(id!),
    enabled: Boolean(id) && enabled,
  });
}

/**
 * Query hook to fetch a layout manifest (full configuration including sections and themes)
 * @param id - Layout ID
 * @param enabled - Whether the query should run (default: true)
 */
export function useLayoutManifestQuery(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: layoutKeys.manifest(id!),
    queryFn: () => getLayoutManifest(id!),
    enabled: Boolean(id) && enabled,
  });
}

