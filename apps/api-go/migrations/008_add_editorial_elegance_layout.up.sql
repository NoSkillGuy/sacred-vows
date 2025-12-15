-- Data Migration: Add Editorial Elegance layout
-- This migration adds the editorial-elegance layout to the database.
-- Editorial Elegance is a luxury magazine-style layout inspired by Vogue/Harper's Bazaar.

INSERT INTO layouts (id, name, description, preview_image, tags, version, config, manifest, "isActive", created_at, updated_at)
VALUES (
  'editorial-elegance',
  'Editorial Elegance',
  'Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.',
  '/layouts/editorial-elegance/preview.jpg',
  '["luxury", "minimal", "editorial", "modern", "premium", "magazine"]'::JSONB,
  '1.0.0',
  $json${
  "id": "editorial-elegance",
  "name": "Editorial Elegance",
  "version": "1.0.0",
  "metadata": {
    "description": "Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.",
    "previewImage": "/layouts/editorial-elegance/preview.jpg",
    "tags": ["luxury", "minimal", "editorial", "modern", "premium", "magazine"],
    "author": "Sacred Vows",
    "category": "Modern",
    "featured": true,
    "status": "ready"
  },
  "sections": [
    {
      "id": "hero",
      "name": "Editorial Cover",
      "icon": "📰",
      "description": "Full-height hero with image or video background",
      "required": true,
      "enabled": true,
      "order": 0,
      "config": {
        "alignment": "center",
        "mediaType": "image"
      }
    },
    {
      "id": "editorial-intro",
      "name": "Editorial Intro",
      "icon": "✍️",
      "description": "Magazine-style opening paragraph with portrait",
      "required": false,
      "enabled": true,
      "order": 1,
      "config": {
        "layout": "two-column"
      }
    },
    {
      "id": "events",
      "name": "Event Schedule",
      "icon": "📅",
      "description": "Horizontal card-based event schedule",
      "required": false,
      "enabled": true,
      "order": 2,
      "config": {}
    },
    {
      "id": "wedding-party",
      "name": "Wedding Party",
      "icon": "👥",
      "description": "Bride, groom, and optional party members (2-4 photos)",
      "required": false,
      "enabled": false,
      "order": 3,
      "config": {
        "showBios": false,
        "filter": "bw"
      }
    },
    {
      "id": "location",
      "name": "Location",
      "icon": "📍",
      "description": "Venue details with embedded map",
      "required": false,
      "enabled": true,
      "order": 4,
      "config": {
        "mapStyle": "desaturated"
      }
    },
    {
      "id": "gallery",
      "name": "Gallery",
      "icon": "🖼️",
      "description": "Editorial-style masonry or single-column gallery (8-12 images)",
      "required": false,
      "enabled": true,
      "order": 5,
      "config": {
        "layout": "masonry",
        "maxImages": 12
      }
    },
    {
      "id": "rsvp",
      "name": "RSVP",
      "icon": "✉️",
      "description": "Ultra-minimal centered RSVP form",
      "required": false,
      "enabled": true,
      "order": 6,
      "config": {}
    },
    {
      "id": "footer",
      "name": "Footer",
      "icon": "📄",
      "description": "Minimal footer with couple names",
      "required": true,
      "enabled": true,
      "order": 7,
      "config": {}
    }
  ],
  "themes": [
    {
      "id": "editorial-classic",
      "name": "Editorial Classic",
      "isDefault": true,
      "colors": {
        "primary": "#C6A15B",
        "background": "#FAF9F7",
        "text": "#1C1C1C",
        "accent": "#C6A15B",
        "secondary": "#6B6B6B",
        "divider": "#E6E6E6"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      },
      "typography": {
        "heroNames": "80px",
        "sectionHeadings": "42px",
        "subHeadings": "24px",
        "bodyText": "18px",
        "metaText": "14px",
        "letterSpacing": {
          "metaText": "0.1em"
        }
      }
    },
    {
      "id": "warm-editorial",
      "name": "Warm Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#B8956A",
        "background": "#FAF7F2",
        "text": "#2C2416",
        "accent": "#B8956A",
        "secondary": "#7C7265",
        "divider": "#E8E4DE"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    },
    {
      "id": "cool-editorial",
      "name": "Cool Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#94A3B8",
        "background": "#F9FAFB",
        "text": "#1A1D23",
        "accent": "#94A3B8",
        "secondary": "#64748B",
        "divider": "#E2E8F0"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    }
  ],
  "features": {
    "videoHero": true,
    "imageFilters": true,
    "embeddedMaps": true,
    "masonryGallery": true,
    "minimalAnimations": true,
    "premiumFonts": false
  }
}
$json$::JSONB,
  $json${
  "id": "editorial-elegance",
  "name": "Editorial Elegance",
  "version": "1.0.0",
  "description": "Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.",
  "previewImage": "/layouts/editorial-elegance/preview.jpg",
  "previewImages": [
    "/layouts/editorial-elegance/preview-1.jpg",
    "/layouts/editorial-elegance/preview-2.jpg"
  ],
  "tags": ["luxury", "minimal", "editorial", "modern", "premium", "magazine"],
  "category": "Modern",
  "author": "Sacred Vows",
  "price": 0,
  "currency": "INR",
  "status": "ready",
  "isAvailable": true,
  "isFeatured": true,
  "sections": [
    {
      "id": "hero",
      "name": "Editorial Cover",
      "description": "Full-height hero with image or video background",
      "icon": "📰",
      "required": true,
      "defaultEnabled": true
    },
    {
      "id": "editorial-intro",
      "name": "Editorial Intro",
      "description": "Magazine-style opening paragraph with portrait",
      "icon": "✍️",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "events",
      "name": "Event Schedule",
      "description": "Horizontal card-based event schedule",
      "icon": "📅",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "wedding-party",
      "name": "Wedding Party",
      "description": "Bride, groom, and optional party members (2-4 photos)",
      "icon": "👥",
      "required": false,
      "defaultEnabled": false
    },
    {
      "id": "location",
      "name": "Location",
      "description": "Venue details with embedded map",
      "icon": "📍",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "gallery",
      "name": "Gallery",
      "description": "Editorial-style masonry or single-column gallery (8-12 images)",
      "icon": "🖼️",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "rsvp",
      "name": "RSVP",
      "description": "Ultra-minimal centered RSVP form",
      "icon": "✉️",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "footer",
      "name": "Footer",
      "description": "Minimal footer with couple names",
      "icon": "📄",
      "required": true,
      "defaultEnabled": true
    }
  ],
  "defaultSectionOrder": [
    "hero",
    "editorial-intro",
    "events",
    "wedding-party",
    "location",
    "gallery",
    "rsvp",
    "footer"
  ],
  "themes": [
    {
      "id": "editorial-classic",
      "name": "Editorial Classic",
      "isDefault": true,
      "colors": {
        "primary": "#C6A15B",
        "background": "#FAF9F7",
        "text": "#1C1C1C",
        "accent": "#C6A15B",
        "secondary": "#6B6B6B"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    },
    {
      "id": "warm-editorial",
      "name": "Warm Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#B8956A",
        "background": "#FAF7F2",
        "text": "#2C2416",
        "accent": "#B8956A",
        "secondary": "#7C7265"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    },
    {
      "id": "cool-editorial",
      "name": "Cool Editorial",
      "isDefault": false,
      "colors": {
        "primary": "#94A3B8",
        "background": "#F9FAFB",
        "text": "#1A1D23",
        "accent": "#94A3B8",
        "secondary": "#64748B"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "script": "Playfair Display"
      }
    }
  ]
}
$json$::JSONB,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

