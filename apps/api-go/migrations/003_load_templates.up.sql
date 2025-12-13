-- Data Migration: Load templates into database
-- This migration contains all template data embedded as SQL INSERT statements.
-- Templates are stored with both manifest and config as JSONB columns.
-- This file is the source of truth for templates - edit directly to add/modify templates.

-- Template: art-deco-glam
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'art-deco-glam',
  'Art Deco Glam',
  'Black and gold art-deco inspired layout for luxurious celebrations.',
  '/templates/art-deco-glam/preview.jpg',
  '["luxury", "art-deco", "gold"]'::JSONB,
  '1.0.0',
  $json${
  "id": "art-deco-glam",
  "name": "Art Deco Glam",
  "version": "1.0.0",
  "metadata": {
    "description": "Black and gold art-deco inspired layout for luxurious celebrations.",
    "previewImage": "/templates/art-deco-glam/preview.jpg",
    "tags": ["luxury", "art-deco", "gold"],
    "author": "Sacred Vows"
  },
  "sections": [
    { "id": "header", "enabled": true, "config": {} },
    { "id": "hero", "enabled": true, "config": {} },
    { "id": "couple", "enabled": true, "config": {} },
    { "id": "fathers-letter", "enabled": true, "config": {} },
    { "id": "gallery", "enabled": true, "config": {} },
    { "id": "events", "enabled": true, "config": {} },
    { "id": "venue", "enabled": true, "config": {} },
    { "id": "rsvp", "enabled": true, "config": {} },
    { "id": "footer", "enabled": true, "config": {} }
  ],
  "theme": {
    "colors": {
      "primary": "#d4af37",
      "secondary": "#0f0f10",
      "background": "#0a0a0c",
      "text": "#f5e9c9"
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
  "id": "art-deco-glam",
  "name": "Art Deco Glam",
  "version": "1.0.0",
  "description": "Black and gold art-deco inspired layout for luxurious celebrations.",
  "names": "Aarav & Nisha",
  "date": "Feb 22, 2026",
  "previewImage": "/templates/art-deco-glam/preview.jpg",
  "previewImages": [],
  "tags": ["luxury", "art-deco", "gold"],
  "category": "luxury",
  "author": "Sacred Vows",
  "price": 1099,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,

  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information with photos", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form and contacts", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message and credits", "icon": "🎀", "required": true, "defaultEnabled": true }
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
      "id": "deco-noir-brass",
      "name": "Deco Noir Brass",
      "isDefault": true,
      "colors": {
        "primary": "#d8b45a",
        "secondary": "#120e0b",
        "background": "#0a0a0f",
        "text": "#f4e8d5",
        "accent": "#9c7a2f"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "deco-emerald-onyx",
      "name": "Deco Emerald Onyx",
      "isDefault": false,
      "colors": {
        "primary": "#c3a75f",
        "secondary": "#0f2d2a",
        "background": "#0b1816",
        "text": "#e9e3d4",
        "accent": "#1f8b65"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
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

-- Template: coastal-breeze
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'coastal-breeze',
  'Coastal Breeze',
  'Airy minimal design inspired by coastal blues and creamy sands.',
  '/templates/coastal-breeze/preview.jpg',
  '["minimal", "coastal", "modern"]'::JSONB,
  '1.0.0',
  $json${
  "id": "coastal-breeze",
  "name": "Coastal Breeze",
  "version": "1.0.0",
  "metadata": {
    "description": "Airy minimal design inspired by coastal blues and creamy sands.",
    "previewImage": "/templates/coastal-breeze/preview.jpg",
    "tags": ["minimal", "coastal", "modern"],
    "author": "Sacred Vows"
  },
  "sections": [
    { "id": "header", "enabled": true, "config": {} },
    { "id": "hero", "enabled": true, "config": {} },
    { "id": "couple", "enabled": true, "config": {} },
    { "id": "fathers-letter", "enabled": true, "config": {} },
    { "id": "gallery", "enabled": true, "config": {} },
    { "id": "events", "enabled": true, "config": {} },
    { "id": "venue", "enabled": true, "config": {} },
    { "id": "rsvp", "enabled": true, "config": {} },
    { "id": "footer", "enabled": true, "config": {} }
  ],
  "theme": {
    "colors": {
      "primary": "#4c9fbf",
      "secondary": "#2d6a86",
      "background": "#f4fbff",
      "text": "#123041"
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
  "id": "coastal-breeze",
  "name": "Coastal Breeze",
  "version": "1.0.0",
  "description": "Airy minimal design inspired by coastal blues and creamy sands.",
  "names": "Ayaan & Lila",
  "date": "Jun 7, 2026",
  "previewImage": "/templates/coastal-breeze/preview.jpg",
  "previewImages": [],
  "tags": ["minimal", "coastal", "modern"],
  "category": "minimal",
  "author": "Sacred Vows",
  "price": 699,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,

  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information with photos", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form and contacts", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message and credits", "icon": "🎀", "required": true, "defaultEnabled": true }
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
      "id": "seafoam-breeze",
      "name": "Seafoam Breeze",
      "isDefault": true,
      "colors": {
        "primary": "#2b9fcf",
        "secondary": "#1b6d9b",
        "background": "#eef8ff",
        "text": "#0f3045",
        "accent": "#9ad7f2"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "sandstone-cove",
      "name": "Sandstone Cove",
      "isDefault": false,
      "colors": {
        "primary": "#c49a6c",
        "secondary": "#8b6b4b",
        "background": "#f9f1e3",
        "text": "#2f2316",
        "accent": "#e6c9a8"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
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

-- Template: desert-sunset
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'desert-sunset',
  'Desert Sunset',
  'Warm amber gradients with modern typography inspired by sunset hues.',
  '/templates/desert-sunset/preview.jpg',
  '["modern", "sunset", "warm"]'::JSONB,
  '1.0.0',
  $json${
  "id": "desert-sunset",
  "name": "Desert Sunset",
  "version": "1.0.0",
  "metadata": {
    "description": "Warm amber gradients with modern typography inspired by sunset hues.",
    "previewImage": "/templates/desert-sunset/preview.jpg",
    "tags": ["modern", "sunset", "warm"],
    "author": "Sacred Vows"
  },
  "sections": [
    { "id": "header", "enabled": true, "config": {} },
    { "id": "hero", "enabled": true, "config": {} },
    { "id": "couple", "enabled": true, "config": {} },
    { "id": "fathers-letter", "enabled": true, "config": {} },
    { "id": "gallery", "enabled": true, "config": {} },
    { "id": "events", "enabled": true, "config": {} },
    { "id": "venue", "enabled": true, "config": {} },
    { "id": "rsvp", "enabled": true, "config": {} },
    { "id": "footer", "enabled": true, "config": {} }
  ],
  "theme": {
    "colors": {
      "primary": "#d18f3f",
      "secondary": "#a86523",
      "background": "#fff3e0",
      "text": "#2f2415"
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
  "id": "desert-sunset",
  "name": "Desert Sunset",
  "version": "1.0.0",
  "description": "Warm amber gradients with modern typography inspired by sunset hues.",
  "names": "Zara & Imran",
  "date": "Oct 12, 2026",
  "previewImage": "/templates/desert-sunset/preview.jpg",
  "previewImages": [],
  "tags": ["modern", "sunset", "warm"],
  "category": "modern",
  "author": "Sacred Vows",
  "price": 799,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,

  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information with photos", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form and contacts", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message and credits", "icon": "🎀", "required": true, "defaultEnabled": true }
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
      "id": "amber-dusk",
      "name": "Amber Dusk",
      "isDefault": true,
      "colors": {
        "primary": "#d58a3a",
        "secondary": "#9c5a1f",
        "background": "#fff4e3",
        "text": "#2d1f12",
        "accent": "#f4c27a"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "rose-dune",
      "name": "Rose Dune",
      "isDefault": false,
      "colors": {
        "primary": "#c97162",
        "secondary": "#8a4c3f",
        "background": "#fff3ee",
        "text": "#2f1f1c",
        "accent": "#f0b7a1"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
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

-- Template: garden-romance
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'garden-romance',
  'Garden Romance',
  'Soft floral designs with watercolor elements. Beautiful for outdoor and garden weddings.',
  '/templates/garden-romance/preview.jpg',
  '["floral", "romantic", "garden"]'::JSONB,
  '1.0.0',
  NULL,
  $json${
  "id": "garden-romance",
  "name": "Garden Romance",
  "version": "1.0.0",
  "description": "Soft floral designs with watercolor elements. Beautiful for outdoor and garden weddings.",
  "names": "Anaya & Vihaan",
  "date": "May 16, 2026",
  "previewImage": "/templates/garden-romance/preview.jpg",
  "previewImages": [],
  "tags": ["floral", "romantic", "garden"],
  "category": "romantic",
  "author": "Sacred Vows",
  "price": 599,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,
  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message", "icon": "🎀", "required": true, "defaultEnabled": true }
  ],
  "defaultSectionOrder": ["header", "hero", "couple", "fathers-letter", "gallery", "events", "venue", "rsvp", "footer"],
  "themes": [
    {
      "id": "sage-romance",
      "name": "Sage Romance",
      "isDefault": true,
      "colors": {
        "primary": "#7BAF9E",
        "secondary": "#5F8F80",
        "background": "#F8FBF9",
        "text": "#2D3B34",
        "accent": "#DDEDE6"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Lato",
        "script": "Great Vibes"
      }
    },
    {
      "id": "eucalyptus-dream",
      "name": "Eucalyptus Dream",
      "isDefault": false,
      "colors": {
        "primary": "#A3C7B5",
        "secondary": "#7FA694",
        "background": "#F4FAF7",
        "text": "#26322D",
        "accent": "#E6F3EE"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
        "body": "Inter",
        "script": "Parisienne"
      }
    },
    {
      "id": "garden-vine",
      "name": "Garden Vine",
      "isDefault": false,
      "colors": {
        "primary": "#6E8F62",
        "secondary": "#4F6B46",
        "background": "#F6FBF3",
        "text": "#1F2A1D",
        "accent": "#D8E8CF"
      },
      "fonts": {
        "heading": "Cardo",
        "body": "Montserrat",
        "script": "Allura"
      }
    },
    {
      "id": "meadow-soft",
      "name": "Meadow Soft",
      "isDefault": false,
      "colors": {
        "primary": "#B9D6B1",
        "secondary": "#8CAF87",
        "background": "#FAFFFA",
        "text": "#2B3A2C",
        "accent": "#EAF6E7"
      },
      "fonts": {
        "heading": "Garamond",
        "body": "Source Sans Pro",
        "script": "Dancing Script"
      }
    },
    {
      "id": "olive-embrace",
      "name": "Olive Embrace",
      "isDefault": false,
      "colors": {
        "primary": "#8C9F59",
        "secondary": "#6F8043",
        "background": "#FBFFF7",
        "text": "#2B2F1E",
        "accent": "#EDF4DD"
      },
      "fonts": {
        "heading": "Merriweather",
        "body": "Roboto",
        "script": "Great Vibes"
      }
    },
    {
      "id": "forest-serenade",
      "name": "Forest Serenade",
      "isDefault": false,
      "colors": {
        "primary": "#4C704A",
        "secondary": "#3A5538",
        "background": "#F2F8F2",
        "text": "#192219",
        "accent": "#CDE4CC"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Nunito",
        "script": "Sacramento"
      }
    },
    {
      "id": "ivy-lantern",
      "name": "Ivy Lantern",
      "isDefault": false,
      "colors": {
        "primary": "#90A98F",
        "secondary": "#6C8C6A",
        "background": "#F5FBF4",
        "text": "#253225",
        "accent": "#E4F0E3"
      },
      "fonts": {
        "heading": "Lora",
        "body": "Open Sans",
        "script": "Marck Script"
      }
    },
    {
      "id": "whispering-garden",
      "name": "Whispering Garden",
      "isDefault": false,
      "colors": {
        "primary": "#A7C49B",
        "secondary": "#88A17D",
        "background": "#F7FFF5",
        "text": "#2A3729",
        "accent": "#EAF6DF"
      },
      "fonts": {
        "heading": "Baskerville",
        "body": "Poppins",
        "script": "Butterfly Kids"
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

-- Template: heritage-red
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'heritage-red',
  'Heritage Red',
  'Deep red and gold traditional motif with festive accents.',
  '/templates/heritage-red/preview.jpg',
  '["traditional", "red", "gold"]'::JSONB,
  '1.0.0',
  $json${
  "id": "heritage-red",
  "name": "Heritage Red",
  "version": "1.0.0",
  "metadata": {
    "description": "Deep red and gold traditional motif with festive accents.",
    "previewImage": "/templates/heritage-red/preview.jpg",
    "tags": ["traditional", "red", "gold"],
    "author": "Sacred Vows"
  },
  "sections": [
    { "id": "header", "enabled": true, "config": {} },
    { "id": "hero", "enabled": true, "config": {} },
    { "id": "couple", "enabled": true, "config": {} },
    { "id": "fathers-letter", "enabled": true, "config": {} },
    { "id": "gallery", "enabled": true, "config": {} },
    { "id": "events", "enabled": true, "config": {} },
    { "id": "venue", "enabled": true, "config": {} },
    { "id": "rsvp", "enabled": true, "config": {} },
    { "id": "footer", "enabled": true, "config": {} }
  ],
  "theme": {
    "preset": "heritage-red",
    "colors": {
      "primary": "#b21f2d",
      "secondary": "#8c0f1f",
      "accent": "#d4af37",
      "accentSoft": "#f5d48a",
      "muted": "#f3d6c8",
      "background": {
        "page": "#fff7f2",
        "section": "#fff3eb",
        "card": "#fff0e6",
        "raised": "#fbead9",
        "overlay": "rgba(178, 31, 45, 0.06)"
      },
      "text": {
        "primary": "#2b0b0f",
        "muted": "#5a2c32",
        "accent": "#b21f2d",
        "onPrimary": "#ffffff",
        "onAccent": "#2b0b0f"
      }
    },
    "states": {
      "hover": { "primary": "#991a27", "secondary": "#73101b", "accent": "#c79823" },
      "active": { "primary": "#7d1220", "secondary": "#5c0c16", "accent": "#a0781c" },
      "focus": { "ring": "0 0 0 3px rgba(178, 31, 45, 0.32)" },
      "disabled": { "background": "#f1d8d7", "text": "#9a7b7f", "border": "#d7b3b0" }
    },
    "gradients": {
      "hero": { "start": "rgba(178, 31, 45, 0.14)", "end": "rgba(140, 15, 31, 0.16)", "angle": "120deg" },
      "cta": { "start": "rgba(212, 175, 55, 0.18)", "end": "rgba(178, 31, 45, 0.12)", "angle": "60deg" }
    },
    "overlays": {
      "imageVeil": "rgba(178, 31, 45, 0.35)",
      "card": "rgba(255, 247, 242, 0.9)",
      "modal": "rgba(0, 0, 0, 0.32)"
    },
    "elevation": {
      "flat": "0 1px 3px rgba(0, 0, 0, 0.08)",
      "card": "0 18px 40px rgba(0, 0, 0, 0.07)",
      "popover": "0 22px 50px rgba(0, 0, 0, 0.12)",
      "modal": "0 26px 80px rgba(0, 0, 0, 0.18)"
    },
    "radii": { "xs": "8px", "sm": "12px", "md": "16px", "lg": "20px", "xl": "28px", "pill": "999px" },
    "borders": {
      "soft": { "color": "rgba(212, 175, 55, 0.35)", "width": "1px", "style": "solid" },
      "strong": { "color": "rgba(178, 31, 45, 0.4)", "width": "2px", "style": "solid" },
      "divider": { "color": "rgba(178, 31, 45, 0.12)", "width": "1px", "style": "solid" },
      "dashed": { "color": "rgba(212, 175, 55, 0.55)", "width": "1px", "style": "dashed" }
    },
    "spacing": {
      "scale": { "xxs": "4px", "xs": "8px", "sm": "12px", "md": "16px", "lg": "24px", "xl": "32px", "xxl": "48px" },
      "section": {
        "y": { "mobile": "50px", "desktop": "80px" },
        "x": { "mobile": "12px", "desktop": "24px" }
      },
      "gaps": { "cards": "18px", "grid": "20px" }
    },
    "layout": {
      "container": { "maxWidth": "1100px", "narrowWidth": "880px", "padding": { "mobile": "12px", "desktop": "24px" } },
      "breakpoints": { "xs": "360px", "sm": "480px", "md": "768px", "lg": "1024px", "xl": "1280px" },
      "grid": { "columns": { "mobile": 6, "desktop": 12 }, "gutters": { "mobile": "12px", "desktop": "20px" } }
    },
    "typography": {
      "family": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" },
      "weights": { "regular": 400, "medium": 500, "semibold": 600, "bold": 700 },
      "sizes": { "display": "48px", "h1": "40px", "h2": "32px", "h3": "28px", "h4": "24px", "h5": "20px", "h6": "18px", "lead": "18px", "body": "16px", "small": "14px", "meta": "12px" },
      "lineHeights": { "display": 1.1, "heading": 1.2, "body": 1.6, "tight": 1.3 },
      "letterSpacing": { "caps": "0.12em", "body": "0.01em", "tight": "-0.01em" },
      "decorations": { "underlineOffset": "2px", "linkDecoration": "underline" }
    },
    "links": { "color": "#b21f2d", "hoverColor": "#8c0f1f", "visitedColor": "#701018", "decoration": "underline", "hoverDecoration": "underline" },
    "buttons": {
      "primary": { "background": "#b21f2d", "text": "#ffffff", "border": "#b21f2d", "hoverBackground": "#991a27", "shadow": "0 12px 30px rgba(178, 31, 45, 0.28)" },
      "ghost": { "background": "transparent", "text": "#b21f2d", "border": "rgba(178, 31, 45, 0.28)", "hoverBackground": "rgba(178, 31, 45, 0.08)" },
      "outline": { "background": "#fff7f2", "text": "#8c0f1f", "border": "#d4af37", "hoverBackground": "rgba(212, 175, 55, 0.08)" },
      "subtle": { "background": "#fff0e6", "text": "#2b0b0f", "border": "rgba(178, 31, 45, 0.12)", "hoverBackground": "#fbead9" }
    },
    "forms": {
      "background": "#fffdfb",
      "border": "rgba(178, 31, 45, 0.18)",
      "focus": { "ring": "0 0 0 3px rgba(178, 31, 45, 0.25)", "border": "#b21f2d" },
      "text": "#2b0b0f",
      "placeholder": "#8c6a72",
      "success": { "border": "#3f9c53", "background": "rgba(63, 156, 83, 0.08)" },
      "error": { "border": "#c02b2b", "background": "rgba(192, 43, 43, 0.08)" }
    },
    "chips": { "fill": { "background": "rgba(178, 31, 45, 0.12)", "text": "#8c0f1f" }, "outline": { "border": "rgba(178, 31, 45, 0.35)", "text": "#2b0b0f" }, "radius": "999px", "gap": "8px" },
    "cards": { "surface": "#fff7f2", "shadow": "0 20px 40px rgba(0, 0, 0, 0.07)", "radius": "24px", "padding": { "dense": "16px", "default": "20px", "relaxed": "24px" } },
    "dividers": { "color": "rgba(212, 175, 55, 0.45)", "thickness": "1px", "inset": "24px" },
    "lists": { "bullet": "•", "iconBullet": "◆", "color": "#b21f2d" },
    "icons": { "stroke": "1.5px", "corner": "rounded", "size": "20px", "color": "#b21f2d" },
    "imagery": { "tint": "rgba(178, 31, 45, 0.12)", "saturation": 1.05, "vignette": "rgba(0,0,0,0.14)", "blur": "0px" },
    "illustrations": { "style": "duotone", "primaryColor": "#b21f2d", "secondaryColor": "#d4af37", "backgroundColor": "#fff7f2" },
    "motion": {
      "duration": { "fast": "150ms", "base": "220ms", "slow": "320ms" },
      "easing": { "standard": "cubic-bezier(0.4, 0, 0.2, 1)", "emphasized": "cubic-bezier(0.2, 0, 0, 1)", "out": "cubic-bezier(0, 0, 0.2, 1)" },
      "distance": { "x": "12px", "y": "16px" }
    },
    "sections": {
      "hero": { "layout": "two-column", "padding": { "mobile": "20px", "desktop": "32px" }, "accent": "gradient" },
      "story": { "layout": "split", "padding": { "mobile": "18px", "desktop": "28px" } },
      "events": { "layout": "timeline", "padding": { "mobile": "16px", "desktop": "24px" } },
      "gallery": { "layout": "masonry", "padding": { "mobile": "14px", "desktop": "22px" } },
      "rsvp": { "layout": "card", "padding": { "mobile": "18px", "desktop": "26px" } }
    },
    "cta": { "layouts": { "stacked": true, "inline": true, "iconPosition": "end" }, "spacing": { "mobile": "12px", "desktop": "16px" } },
    "shell": {
      "header": { "background": "linear-gradient(to bottom, rgba(255,248,240,0.98), rgba(255,248,240,0.95))", "divider": "rgba(212, 175, 55, 0.18)" },
      "footer": { "background": "#fff7f2", "divider": "rgba(212, 175, 55, 0.25)" },
      "social": { "iconFill": "#b21f2d", "iconBackground": "rgba(178, 31, 45, 0.08)" }
    },
    "accessibility": { "focusRing": "0 0 0 3px rgba(178, 31, 45, 0.45)", "contrastTarget": { "text": "4.5:1", "largeText": "3:1" }, "minTapSize": "44px" }
  }
}
$json$::JSONB,
  $json${
  "id": "heritage-red",
  "name": "Heritage Red",
  "version": "1.0.0",
  "description": "Deep red and gold traditional motif with festive accents.",
  "names": "Advait & Kavya",
  "date": "Dec 1, 2025",
  "previewImage": "/templates/heritage-red/preview.jpg",
  "previewImages": [],
  "tags": ["traditional", "red", "gold"],
  "category": "traditional",
  "author": "Sacred Vows",
  "price": 899,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,

  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information with photos", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form and contacts", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message and credits", "icon": "🎀", "required": true, "defaultEnabled": true }
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
      "id": "heritage-scarlet",
      "name": "Heritage Scarlet",
      "isDefault": true,
      "colors": {
        "primary": "#b92231",
        "secondary": "#821420",
        "background": "#fff3f0",
        "text": "#2c0d12",
        "accent": "#d8a33b"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "marigold-festival",
      "name": "Marigold Festival",
      "isDefault": false,
      "colors": {
        "primary": "#d58b00",
        "secondary": "#9c6400",
        "background": "#fff6e0",
        "text": "#2f210b",
        "accent": "#f5c74a"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
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

-- Template: luxury-noir
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'luxury-noir',
  'Luxury Noir',
  'Sophisticated black and gold design for glamorous evening celebrations and destination weddings.',
  '/templates/luxury-noir/preview.jpg',
  '["luxury", "black", "gold"]'::JSONB,
  '1.0.0',
  NULL,
  $json${
  "id": "luxury-noir",
  "name": "Luxury Noir",
  "version": "1.0.0",
  "description": "Sophisticated black and gold design for glamorous evening celebrations and destination weddings.",
  "names": "Arjun & Tara",
  "date": "Sep 9, 2026",
  "previewImage": "/templates/luxury-noir/preview.jpg",
  "previewImages": [],
  "tags": ["luxury", "black", "gold"],
  "category": "luxury",
  "author": "Sacred Vows",
  "price": 999,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,
  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message", "icon": "🎀", "required": true, "defaultEnabled": true }
  ],
  "defaultSectionOrder": ["header", "hero", "couple", "fathers-letter", "gallery", "events", "venue", "rsvp", "footer"],
  "themes": [
    {
      "id": "noir-opulence",
      "name": "Noir Opulence",
      "isDefault": true,
      "colors": { "primary": "#d9b24c", "secondary": "#1a1410", "background": "#0c0a0d", "text": "#f3e7d5", "accent": "#a6782f" },
      "fonts": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" }
    },
    {
      "id": "velvet-rose",
      "name": "Velvet Rose",
      "isDefault": false,
      "colors": { "primary": "#c07a8c", "secondary": "#8b5063", "background": "#f9f2f6", "text": "#3b2731", "accent": "#e6b7c7" },
      "fonts": { "heading": "Cormorant Garamond", "body": "Lato", "script": "Dancing Script" }
    },
    {
      "id": "evergreen-opal",
      "name": "Evergreen Opal",
      "isDefault": false,
      "colors": { "primary": "#6e9c89", "secondary": "#3f6b5a", "background": "#f3f8f5", "text": "#24332d", "accent": "#9ad1bc" },
      "fonts": { "heading": "EB Garamond", "body": "Montserrat", "script": "Tangerine" }
    }
  ]
}
$json$::JSONB,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Template: minimal-modern
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'minimal-modern',
  'Minimal Modern',
  'Clean, contemporary design with minimalist aesthetics. Ideal for couples who prefer understated elegance.',
  '/templates/minimal-modern/preview.jpg',
  '["minimal", "modern", "clean"]'::JSONB,
  '1.0.0',
  NULL,
  $json${
  "id": "minimal-modern",
  "name": "Minimal Modern",
  "version": "1.0.0",
  "description": "Clean, contemporary design with minimalist aesthetics. Ideal for couples who prefer understated elegance.",
  "names": "Neil & Sanya",
  "date": "Aug 3, 2026",
  "previewImage": "/templates/minimal-modern/preview.jpg",
  "previewImages": [],
  "tags": ["minimal", "modern", "clean"],
  "category": "modern",
  "author": "Sacred Vows",
  "price": 699,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,
  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message", "icon": "🎀", "required": true, "defaultEnabled": true }
  ],
  "defaultSectionOrder": ["header", "hero", "couple", "fathers-letter", "gallery", "events", "venue", "rsvp", "footer"],
  "themes": [
    {
      "id": "amber-sand",
      "name": "Amber Sand",
      "isDefault": true,
      "colors": { "primary": "#c89b3c", "secondary": "#8b6b2a", "background": "#fdf7ed", "text": "#2d281c", "accent": "#e7c46b" },
      "fonts": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" }
    },
    {
      "id": "quartz-rose",
      "name": "Quartz Rose",
      "isDefault": false,
      "colors": { "primary": "#d48792", "secondary": "#a26174", "background": "#fff6f8", "text": "#3d2f34", "accent": "#f1c3cc" },
      "fonts": { "heading": "Cormorant Garamond", "body": "Lato", "script": "Dancing Script" }
    },
    {
      "id": "pine-smoke",
      "name": "Pine Smoke",
      "isDefault": false,
      "colors": { "primary": "#5f7c76", "secondary": "#3c5752", "background": "#f2f6f5", "text": "#263330", "accent": "#8db6ad" },
      "fonts": { "heading": "EB Garamond", "body": "Montserrat", "script": "Tangerine" }
    }
  ]
}
$json$::JSONB,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Template: pastel-bloom
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'pastel-bloom',
  'Pastel Bloom',
  'Soft watercolor florals with romantic pastels and elegant typography.',
  '/templates/pastel-bloom/preview.jpg',
  '["floral", "romantic", "pastel"]'::JSONB,
  '1.0.0',
  $json${
  "id": "pastel-bloom",
  "name": "Pastel Bloom",
  "version": "1.0.0",
  "metadata": {
    "description": "Soft watercolor florals with romantic pastels and elegant typography.",
    "previewImage": "/templates/pastel-bloom/preview.jpg",
    "tags": ["floral", "romantic", "pastel"],
    "author": "Sacred Vows"
  },
  "sections": [
    { "id": "header", "enabled": true, "config": {} },
    { "id": "hero", "enabled": true, "config": {} },
    { "id": "couple", "enabled": true, "config": {} },
    { "id": "fathers-letter", "enabled": true, "config": {} },
    { "id": "gallery", "enabled": true, "config": {} },
    { "id": "events", "enabled": true, "config": {} },
    { "id": "venue", "enabled": true, "config": {} },
    { "id": "rsvp", "enabled": true, "config": {} },
    { "id": "footer", "enabled": true, "config": {} }
  ],
  "theme": {
    "colors": {
      "primary": "#e9b7c3",
      "secondary": "#d28fa5",
      "background": "#fff6f8",
      "text": "#3f2a32"
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
  "id": "pastel-bloom",
  "name": "Pastel Bloom",
  "version": "1.0.0",
  "description": "Soft watercolor florals with romantic pastels and elegant typography.",
  "names": "Rhea & Vivaan",
  "date": "Mar 2, 2026",
  "previewImage": "/templates/pastel-bloom/preview.jpg",
  "previewImages": [],
  "tags": ["floral", "romantic", "pastel"],
  "category": "romantic",
  "author": "Sacred Vows",
  "price": 649,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,

  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information with photos", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form and contacts", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message and credits", "icon": "🎀", "required": true, "defaultEnabled": true }
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
      "id": "blush-petal",
      "name": "Blush Petal",
      "isDefault": true,
      "colors": {
        "primary": "#e4b7c8",
        "secondary": "#c58ba3",
        "background": "#fff7fb",
        "text": "#3f2b34",
        "accent": "#f6d9e6"
      },
      "fonts": {
        "heading": "Playfair Display",
        "body": "Poppins",
        "script": "Great Vibes"
      }
    },
    {
      "id": "lilac-mist",
      "name": "Lilac Mist",
      "isDefault": false,
      "colors": {
        "primary": "#a9a3d6",
        "secondary": "#7d75b1",
        "background": "#f6f5ff",
        "text": "#2f2b3a",
        "accent": "#cfc8f0"
      },
      "fonts": {
        "heading": "Cormorant Garamond",
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

-- Template: royal-elegance
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
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

-- Template: rustic-charm
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'rustic-charm',
  'Rustic Charm',
  'Warm, earthy tones with hand-drawn elements. Perfect for intimate, countryside celebrations.',
  '/templates/rustic-charm/preview.jpg',
  '["rustic", "bohemian", "earthy"]'::JSONB,
  '1.0.0',
  NULL,
  $json${
  "id": "rustic-charm",
  "name": "Rustic Charm",
  "version": "1.0.0",
  "description": "Warm, earthy tones with hand-drawn elements. Perfect for intimate, countryside celebrations.",
  "names": "Kabir & Myra",
  "date": "Apr 5, 2026",
  "previewImage": "/templates/rustic-charm/preview.jpg",
  "previewImages": [],
  "tags": ["rustic", "bohemian", "earthy"],
  "category": "bohemian",
  "author": "Sacred Vows",
  "price": 549,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,
  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message", "icon": "🎀", "required": true, "defaultEnabled": true }
  ],
  "defaultSectionOrder": ["header", "hero", "couple", "fathers-letter", "gallery", "events", "venue", "rsvp", "footer"],
  "themes": [
    {
      "id": "harvest-wheat",
      "name": "Harvest Wheat",
      "isDefault": true,
      "colors": { "primary": "#cfa45c", "secondary": "#8f6a38", "background": "#fff9ee", "text": "#2f2616", "accent": "#e3c892" },
      "fonts": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" }
    },
    {
      "id": "rosewood-dust",
      "name": "Rosewood Dust",
      "isDefault": false,
      "colors": { "primary": "#c0806e", "secondary": "#8b594f", "background": "#f9f1ee", "text": "#342421", "accent": "#e1b6a7" },
      "fonts": { "heading": "Cormorant Garamond", "body": "Lato", "script": "Dancing Script" }
    },
    {
      "id": "fern-wood",
      "name": "Fern Wood",
      "isDefault": false,
      "colors": { "primary": "#6d8f5f", "secondary": "#4e6a43", "background": "#f4f7f1", "text": "#2c3528", "accent": "#98bb8a" },
      "fonts": { "heading": "EB Garamond", "body": "Montserrat", "script": "Tangerine" }
    }
  ]
}
$json$::JSONB,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Template: south-indian-silk
INSERT INTO templates (id, name, description, preview_image, tags, version, config, manifest, is_active, created_at, updated_at)
VALUES (
  'south-indian-silk',
  'South Indian Silk',
  'Rich silk patterns inspired by traditional South Indian wedding aesthetics with temple motifs.',
  '/templates/south-indian-silk/preview.jpg',
  '["south-indian", "traditional", "silk"]'::JSONB,
  '1.0.0',
  NULL,
  $json${
  "id": "south-indian-silk",
  "name": "South Indian Silk",
  "version": "1.0.0",
  "description": "Rich silk patterns inspired by traditional South Indian wedding aesthetics with temple motifs.",
  "names": "Karthik & Meera",
  "date": "Jan 12, 2026",
  "previewImage": "/templates/south-indian-silk/preview.jpg",
  "previewImages": [],
  "tags": ["south-indian", "traditional", "silk"],
  "category": "traditional",
  "author": "Sacred Vows",
  "price": 799,
  "currency": "INR",
  "status": "coming-soon",
  "isAvailable": false,
  "isComingSoon": true,
  "isFeatured": false,
  "sections": [
    { "id": "header", "name": "Header", "description": "Navigation and branding header", "icon": "📌", "required": true, "defaultEnabled": true },
    { "id": "hero", "name": "Hero Banner", "description": "Main hero section with couple photo", "icon": "🖼️", "required": false, "defaultEnabled": true },
    { "id": "couple", "name": "Couple Profile", "description": "Bride and groom information", "icon": "💑", "required": false, "defaultEnabled": true },
    { "id": "fathers-letter", "name": "Father's Letter", "description": "Heartfelt letter from the father", "icon": "✉️", "required": false, "defaultEnabled": true },
    { "id": "gallery", "name": "Photo Gallery", "description": "Photo gallery with lightbox", "icon": "📷", "required": false, "defaultEnabled": true },
    { "id": "events", "name": "Events Timeline", "description": "Wedding events schedule", "icon": "📅", "required": false, "defaultEnabled": true },
    { "id": "venue", "name": "Venue Details", "description": "Venue location with map", "icon": "📍", "required": false, "defaultEnabled": true },
    { "id": "rsvp", "name": "RSVP Section", "description": "Guest RSVP form", "icon": "💌", "required": false, "defaultEnabled": true },
    { "id": "footer", "name": "Footer", "description": "Closing message", "icon": "🎀", "required": true, "defaultEnabled": true }
  ],
  "defaultSectionOrder": ["header", "hero", "couple", "fathers-letter", "gallery", "events", "venue", "rsvp", "footer"],
  "themes": [
    {
      "id": "silk-kumkum",
      "name": "Silk Kumkum",
      "isDefault": true,
      "colors": { "primary": "#b8323a", "secondary": "#7f1f27", "background": "#fff4ef", "text": "#2f1115", "accent": "#d9a437" },
      "fonts": { "heading": "Playfair Display", "body": "Poppins", "script": "Great Vibes" }
    },
    {
      "id": "silk-rosewater",
      "name": "Silk Rosewater",
      "isDefault": false,
      "colors": { "primary": "#d18aa2", "secondary": "#a1607c", "background": "#fff6f8", "text": "#3d2430", "accent": "#efc4d7" },
      "fonts": { "heading": "Cormorant Garamond", "body": "Lato", "script": "Dancing Script" }
    },
    {
      "id": "silk-betel",
      "name": "Silk Betel",
      "isDefault": false,
      "colors": { "primary": "#5f8f6b", "secondary": "#3f6a4c", "background": "#f2f8f3", "text": "#243229", "accent": "#8fc19c" },
      "fonts": { "heading": "EB Garamond", "body": "Montserrat", "script": "Tangerine" }
    }
  ]
}
$json$::JSONB,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

