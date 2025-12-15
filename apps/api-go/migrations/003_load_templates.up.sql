-- Data Migration: Load templates into database
-- This migration contains all template data embedded as SQL INSERT statements.
-- Templates are stored with both manifest and config as JSONB columns.
-- This file is the source of truth for templates - edit directly to add/modify templates.

-- Template: royal-elegance
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, "isActive", created_at, updated_at)
VALUES (
  'royal-elegance',
  'Royal Elegance',
  'The live Priya & Saurabh invitation with classic gold flourishes, soft blush gradients, and traditional detailing.',
  '/templates/royal-elegance/preview.jpg',
  '["elegant", "classic", "traditional"]'::JSONB,
  '1.0.0',
  $json${
  "id": "royal-elegance",
  "name": "Royal Elegance",
  "version": "1.0.0",
  "metadata": {
    "description": "Live Priya & Saurabh invitation — classic gold with blush gradients and traditional detailing.",
    "previewImage": "/templates/royal-elegance/preview.jpg",
    "tags": ["elegant", "classic", "traditional"],
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
  "themes": [
    {
      "id": "royal-gold",
      "name": "Royal Gold",
      "isDefault": true,
      "colors": {
        "primary": "#d4af37",
        "secondary": "#8b6914",
        "background": "#fff8f0",
        "text": "#2c2c2c",
        "accent": "#c9a227"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "rose-blush",
      "name": "Rose Blush",
      "isDefault": false,
      "colors": {
        "primary": "#c77d8a",
        "secondary": "#9b5c6a",
        "background": "#fff5f7",
        "text": "#4a3539",
        "accent": "#e8b4b8"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Lato",
        "script": "Dancing Script"
      }
    },
    {
      "id": "ivory-cream",
      "name": "Ivory Cream",
      "isDefault": false,
      "colors": {
        "primary": "#a67c52",
        "secondary": "#8b6914",
        "background": "#fffef5",
        "text": "#3d3d3d",
        "accent": "#d4b896"
      },
      "fonts": {
        "heading": "Libre Baskerville",
        "body": "Inter",
        "script": "Alex Brush"
      }
    },
    {
      "id": "forest-sage",
      "name": "Forest Sage",
      "isDefault": false,
      "colors": {
        "primary": "#6b8e6b",
        "secondary": "#4a6f4a",
        "background": "#f5f8f5",
        "text": "#2c3c2c",
        "accent": "#8fbc8f"
      },
      "fonts": {
        "heading": "EB Garamond",
        "body": "Montserrat",
        "script": "Tangerine"
      }
    },
    {
      "id": "midnight-navy",
      "name": "Midnight Navy",
      "isDefault": false,
      "colors": {
        "primary": "#1e3a5f",
        "secondary": "#2c5282",
        "background": "#f7fafc",
        "text": "#1a202c",
        "accent": "#4299e1"
      },
      "fonts": {
        "heading": "Crimson Text",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "lavender-dream",
      "name": "Lavender Dream",
      "isDefault": false,
      "colors": {
        "primary": "#9b8bb4",
        "secondary": "#7a6a96",
        "background": "#f8f5fc",
        "text": "#3c3544",
        "accent": "#c4b5dc"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Lato",
        "script": "Dancing Script"
      }
    }
  ],
  "theme": {
    "preset": "royal-gold",
    "colors": {
      "primary": "#d4af37",
      "secondary": "#8b6914",
      "background": "#fff8f0",
      "text": "#2c2c2c",
      "accent": "#c9a227"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Poppins",
      "script": "Great Vibes"
    }
  }
}

$json$::JSONB,
  $json${
  "id": "royal-elegance",
  "name": "Royal Elegance",
  "version": "1.0.0",
  "description": "The live Priya & Saurabh invitation with classic gold flourishes, soft blush gradients, and traditional detailing.",
  "names": "Capt (Dr) Priya & Dr Saurabh",
  "date": "22 & 23 January 2026",
  "previewImage": "/templates/royal-elegance/preview.jpg",
  "previewImages": [
    "/templates/royal-elegance/preview-1.jpg",
    "/templates/royal-elegance/preview-2.jpg"
  ],
  "tags": ["elegant", "classic", "traditional"],
  "category": "traditional",
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
      "id": "royal-gold",
      "name": "Royal Gold",
      "isDefault": true,
      "colors": {
        "primary": "#d4af37",
        "secondary": "#8b6914",
        "background": "#fff8f0",
        "text": "#2c2c2c",
        "accent": "#c9a227"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "rose-blush",
      "name": "Rose Blush",
      "isDefault": false,
      "colors": {
        "primary": "#c77d8a",
        "secondary": "#9b5c6a",
        "background": "#fff5f7",
        "text": "#4a3539",
        "accent": "#e8b4b8"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Lato",
        "script": "Dancing Script"
      }
    },
    {
      "id": "ivory-cream",
      "name": "Ivory Cream",
      "isDefault": false,
      "colors": {
        "primary": "#a67c52",
        "secondary": "#8b6914",
        "background": "#fffef5",
        "text": "#3d3d3d",
        "accent": "#d4b896"
      },
      "fonts": {
        "heading": "Libre Baskerville",
        "body": "Inter",
        "script": "Alex Brush"
      }
    },
    {
      "id": "forest-sage",
      "name": "Forest Sage",
      "isDefault": false,
      "colors": {
        "primary": "#6b8e6b",
        "secondary": "#4a6f4a",
        "background": "#f5f8f5",
        "text": "#2c3c2c",
        "accent": "#8fbc8f"
      },
      "fonts": {
        "heading": "EB Garamond",
        "body": "Montserrat",
        "script": "Tangerine"
      }
    },
    {
      "id": "midnight-navy",
      "name": "Midnight Navy",
      "isDefault": false,
      "colors": {
        "primary": "#1e3a5f",
        "secondary": "#2c5282",
        "background": "#f7fafc",
        "text": "#1a202c",
        "accent": "#4299e1"
      },
      "fonts": {
        "heading": "Crimson Text",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "lavender-dream",
      "name": "Lavender Dream",
      "isDefault": false,
      "colors": {
        "primary": "#9b8bb4",
        "secondary": "#7a6a96",
        "background": "#f8f5fc",
        "text": "#3c3544",
        "accent": "#c4b5dc"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Lato",
        "script": "Dancing Script"
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