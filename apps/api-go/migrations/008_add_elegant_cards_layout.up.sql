-- Add Elegant Cards Layout
-- This migration adds the new "Elegant Cards" layout to the layouts table
-- Modern card-based layout with elegant spacing, subtle shadows, and sophisticated typography

INSERT INTO layouts (id, name, description, preview_image, tags, version, config, manifest, "isActive", created_at, updated_at)
VALUES (
  'elegant-cards',
  'Elegant Cards',
  'Modern card-based layout with elegant spacing, subtle shadows, and sophisticated typography. Features a contemporary grid design perfect for modern weddings.',
  '/layouts/elegant-cards/preview.jpg',
  '["modern", "elegant", "cards"]'::JSONB,
  '1.0.0',
  $json${
  "id": "elegant-cards",
  "name": "Elegant Cards",
  "version": "1.0.0",
  "metadata": {
    "description": "Modern card-based layout with elegant spacing, subtle shadows, and sophisticated typography. Features a contemporary grid design perfect for modern weddings.",
    "previewImage": "/layouts/elegant-cards/preview.jpg",
    "tags": ["modern", "elegant", "cards"],
    "author": "Sacred Vows"
  },
  "sections": [
    {
      "id": "header",
      "enabled": true,
      "config": {}
    },
    {
      "id": "hero",
      "enabled": true,
      "config": {}
    },
    {
      "id": "couple",
      "enabled": true,
      "config": {}
    },
    {
      "id": "fathers-letter",
      "enabled": true,
      "config": {}
    },
    {
      "id": "gallery",
      "enabled": true,
      "config": {}
    },
    {
      "id": "events",
      "enabled": true,
      "config": {}
    },
    {
      "id": "venue",
      "enabled": true,
      "config": {}
    },
    {
      "id": "rsvp",
      "enabled": true,
      "config": {}
    },
    {
      "id": "footer",
      "enabled": true,
      "config": {}
    }
  ],
  "theme": {
    "preset": "modern-rose",
    "colors": {
      "primary": "#e8b4b8",
      "secondary": "#d4969c",
      "background": "#fffaf5",
      "text": "#2d2d2d",
      "accent": "#8b2942"
    },
    "fonts": {
      "heading": "Cormorant Garamond",
      "body": "Quicksand",
      "script": "Great Vibes"
    }
  }
}
$json$::JSONB,
  $json${
  "id": "elegant-cards",
  "name": "Elegant Cards",
  "version": "1.0.0",
  "description": "Modern card-based layout with elegant spacing, subtle shadows, and sophisticated typography. Features a contemporary grid design perfect for modern weddings.",
  "previewImage": "/layouts/elegant-cards/preview.jpg",
  "previewImages": [
    "/layouts/elegant-cards/preview-1.jpg",
    "/layouts/elegant-cards/preview-2.jpg"
  ],
  "tags": ["modern", "elegant", "cards"],
  "category": "modern",
  "author": "Sacred Vows",
  "price": 499,
  "currency": "INR",
  "status": "ready",
  "isAvailable": true,
  "isFeatured": true,

  "sections": [
    {
      "id": "header",
      "name": "Header",
      "description": "Navigation and branding header",
      "icon": "📌",
      "required": true,
      "defaultEnabled": true
    },
    {
      "id": "hero",
      "name": "Hero Banner",
      "description": "Main hero section with couple photo and countdown",
      "icon": "🖼️",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "couple",
      "name": "Couple Profile",
      "description": "Bride and groom information with photos",
      "icon": "💑",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "fathers-letter",
      "name": "Father's Letter",
      "description": "Heartfelt letter from the father",
      "icon": "✉️",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "gallery",
      "name": "Photo Gallery",
      "description": "Photo gallery with lightbox",
      "icon": "📷",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "events",
      "name": "Events Timeline",
      "description": "Wedding events schedule",
      "icon": "📅",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "venue",
      "name": "Venue Details",
      "description": "Venue location with map",
      "icon": "📍",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "rsvp",
      "name": "RSVP Section",
      "description": "Guest RSVP form and contacts",
      "icon": "💌",
      "required": false,
      "defaultEnabled": true
    },
    {
      "id": "footer",
      "name": "Footer",
      "description": "Closing message and credits",
      "icon": "🎀",
      "required": true,
      "defaultEnabled": true
    }
  ],

  "defaultSectionOrder": [
    "header",
    "hero",
    "couple",
    "fathers-letter",
    "gallery",
    "events",
    "venue",
    "rsvp",
    "footer"
  ],

  "themes": [
    {
      "id": "modern-rose",
      "name": "Modern Rose",
      "isDefault": true,
      "colors": {
        "primary": "#e8b4b8",
        "secondary": "#d4969c",
        "background": "#fffaf5",
        "text": "#2d2d2d",
        "accent": "#8b2942"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Quicksand",
        "script": "Great Vibes"
      }
    },
    {
      "id": "elegant-gold",
      "name": "Elegant Gold",
      "isDefault": false,
      "colors": {
        "primary": "#d4af37",
        "secondary": "#b8960c",
        "background": "#fff8f7",
        "text": "#2d2d2d",
        "accent": "#c9a227"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Quicksand",
        "script": "Great Vibes"
      }
    },
    {
      "id": "minimalist-sage",
      "name": "Minimalist Sage",
      "isDefault": false,
      "colors": {
        "primary": "#b8c9b8",
        "secondary": "#8fa88f",
        "background": "#fffaf5",
        "text": "#2d2d2d",
        "accent": "#7a9e7a"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Quicksand",
        "script": "Great Vibes"
      }
    },
    {
      "id": "classic-ivory",
      "name": "Classic Ivory",
      "isDefault": false,
      "colors": {
        "primary": "#a67c52",
        "secondary": "#8b6914",
        "background": "#fffff0",
        "text": "#3d3d3d",
        "accent": "#d4b896"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Quicksand",
        "script": "Great Vibes"
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

