import { describe, it, expect } from 'vitest';
import { extractAssetURLs } from './assetUtils';

describe('assetUtils', () => {
  describe('extractAssetURLs', () => {
    it('should extract asset URLs from simple object', () => {
      const data = {
        image: '/uploads/test-image.jpg',
        logo: '/uploads/logo.png',
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(2);
      expect(urls).toContain('/uploads/test-image.jpg');
      expect(urls).toContain('/uploads/logo.png');
    });

    it('should extract asset URLs from nested objects', () => {
      const data = {
        couple: {
          bride: {
            image: '/uploads/bride.jpg',
          },
          groom: {
            image: '/uploads/groom.jpg',
          },
        },
        gallery: {
          main: '/uploads/gallery-main.jpg',
        },
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(3);
      expect(urls).toContain('/uploads/bride.jpg');
      expect(urls).toContain('/uploads/groom.jpg');
      expect(urls).toContain('/uploads/gallery-main.jpg');
    });

    it('should extract asset URLs from arrays', () => {
      const data = {
        gallery: {
          images: [
            '/uploads/image1.jpg',
            '/uploads/image2.jpg',
            '/uploads/image3.jpg',
          ],
        },
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(3);
      expect(urls).toContain('/uploads/image1.jpg');
      expect(urls).toContain('/uploads/image2.jpg');
      expect(urls).toContain('/uploads/image3.jpg');
    });

    it('should extract signed Google Cloud Storage URLs', () => {
      const data = {
        image: 'https://storage.googleapis.com/bucket/image.jpg?X-Goog-Signature=abc123',
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('storage.googleapis.com');
      expect(urls[0]).toContain('X-Goog-Signature');
    });

    it('should extract local dev asset URLs', () => {
      const data = {
        image1: 'http://localhost:3000/api/assets/upload/test.jpg',
        image2: 'http://localhost:3000/assets/upload/test2.jpg',
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(2);
      expect(urls.some(url => url.includes('/api/assets/'))).toBe(true);
      expect(urls.some(url => url.includes('/assets/upload'))).toBe(true);
    });

    it('should not extract non-asset URLs', () => {
      const data = {
        website: 'https://example.com',
        email: 'test@example.com',
        phone: '+1234567890',
        regularPath: '/some/path/without/uploads',
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(0);
    });

    it('should handle mixed data with asset and non-asset URLs', () => {
      const data = {
        image: '/uploads/test.jpg',
        website: 'https://example.com',
        couple: {
          bride: {
            image: '/uploads/bride.jpg',
            email: 'bride@example.com',
          },
        },
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(2);
      expect(urls).toContain('/uploads/test.jpg');
      expect(urls).toContain('/uploads/bride.jpg');
    });

    it('should return empty array for null or undefined', () => {
      expect(extractAssetURLs(null)).toEqual([]);
      expect(extractAssetURLs(undefined)).toEqual([]);
    });

    it('should return empty array for non-object types', () => {
      expect(extractAssetURLs('string')).toEqual([]);
      expect(extractAssetURLs(123)).toEqual([]);
      expect(extractAssetURLs(true)).toEqual([]);
    });

    it('should handle deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                image: '/uploads/deep-image.jpg',
              },
            },
          },
        },
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('/uploads/deep-image.jpg');
    });

    it('should deduplicate URLs', () => {
      const data = {
        image1: '/uploads/same-image.jpg',
        image2: '/uploads/same-image.jpg',
        couple: {
          bride: {
            image: '/uploads/same-image.jpg',
          },
        },
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('/uploads/same-image.jpg');
    });

    it('should handle arrays of objects with asset URLs', () => {
      const data = {
        gallery: {
          images: [
            { src: '/uploads/image1.jpg', alt: 'Image 1' },
            { src: '/uploads/image2.jpg', alt: 'Image 2' },
            { url: '/uploads/image3.jpg', caption: 'Image 3' },
          ],
        },
      };

      const urls = extractAssetURLs(data);

      expect(urls).toHaveLength(3);
      expect(urls).toContain('/uploads/image1.jpg');
      expect(urls).toContain('/uploads/image2.jpg');
      expect(urls).toContain('/uploads/image3.jpg');
    });

    it('should handle empty objects and arrays', () => {
      expect(extractAssetURLs({})).toEqual([]);
      expect(extractAssetURLs({ empty: [] })).toEqual([]);
      expect(extractAssetURLs({ nested: { empty: {} } })).toEqual([]);
    });
  });
});

