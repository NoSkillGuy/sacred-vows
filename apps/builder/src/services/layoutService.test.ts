import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLayouts, getLayout, getLayoutManifest, getAllLayoutManifests } from './layoutService';

// Mock apiClient
vi.mock('./apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('layoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLayouts', () => {
    it('should fetch all layouts successfully', async () => {
      const { apiRequest } = await import('./apiClient');
      const mockManifests = [
        {
          id: 'classic-scroll',
          name: 'Classic Scroll',
          metadata: { tags: ['classic'], isFeatured: true },
        },
        {
          id: 'editorial-elegance',
          name: 'Editorial Elegance',
          metadata: { tags: ['modern'], isFeatured: false },
        },
      ];

      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ manifests: mockManifests }),
      } as Response);

      const result = await getLayouts();

      expect(result.layouts).toEqual(mockManifests);
      expect(result.categories).toContain('all');
      expect(result.categories).toContain('classic');
      expect(result.categories).toContain('modern');
    });

    it('should filter layouts by category', async () => {
      const { apiRequest } = await import('./apiClient');
      const mockManifests = [
        {
          id: 'classic-scroll',
          name: 'Classic Scroll',
          metadata: { tags: ['classic'], isFeatured: true },
        },
        {
          id: 'editorial-elegance',
          name: 'Editorial Elegance',
          metadata: { tags: ['modern'], isFeatured: false },
        },
      ];

      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ manifests: mockManifests }),
      } as Response);

      const result = await getLayouts({ category: 'classic' });

      expect(result.layouts).toHaveLength(1);
      expect(result.layouts[0].id).toBe('classic-scroll');
    });

    it('should filter layouts by featured flag', async () => {
      const { apiRequest } = await import('./apiClient');
      const mockManifests = [
        {
          id: 'classic-scroll',
          name: 'Classic Scroll',
          metadata: { tags: ['classic'], isFeatured: true },
        },
        {
          id: 'editorial-elegance',
          name: 'Editorial Elegance',
          metadata: { tags: ['modern'], isFeatured: false },
        },
      ];

      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ manifests: mockManifests }),
      } as Response);

      const result = await getLayouts({ featured: true });

      expect(result.layouts).toHaveLength(1);
      expect(result.layouts[0].id).toBe('classic-scroll');
    });
  });

  describe('getLayout', () => {
    it('should fetch single layout by ID', async () => {
      const { apiRequest } = await import('./apiClient');
      const mockLayout = {
        id: 'classic-scroll',
        name: 'Classic Scroll',
        metadata: { tags: ['classic'] },
      };

      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ layout: mockLayout }),
      } as Response);

      const result = await getLayout('classic-scroll');

      expect(result).toEqual(mockLayout);
      expect(mockApiRequest).toHaveBeenCalledWith('/layouts/classic-scroll', { method: 'GET' });
    });
  });

  describe('getLayoutManifest', () => {
    it('should fetch layout manifest by ID', async () => {
      const { apiRequest } = await import('./apiClient');
      const mockManifest = {
        id: 'classic-scroll',
        name: 'Classic Scroll',
        sections: [{ id: 'hero', name: 'Hero', required: true }],
        themes: [],
      };

      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ manifest: mockManifest }),
      } as Response);

      const result = await getLayoutManifest('classic-scroll');

      expect(result).toEqual(mockManifest);
      expect(mockApiRequest).toHaveBeenCalledWith('/layouts/classic-scroll/manifest', { method: 'GET' });
    });
  });

  describe('getAllLayoutManifests', () => {
    it('should fetch all layout manifests', async () => {
      const { apiRequest } = await import('./apiClient');
      const mockManifests = [
        {
          id: 'classic-scroll',
          name: 'Classic Scroll',
          sections: [],
          themes: [],
        },
      ];

      const mockApiRequest = apiRequest as ReturnType<typeof vi.fn>;
      mockApiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({ manifests: mockManifests }),
      } as Response);

      const result = await getAllLayoutManifests();

      expect(result).toEqual(mockManifests);
      expect(mockApiRequest).toHaveBeenCalledWith('/layouts/manifests', { method: 'GET' });
    });
  });
});

