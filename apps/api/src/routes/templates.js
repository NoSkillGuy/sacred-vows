import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to templates directory
const TEMPLATES_DIR = path.resolve(__dirname, '../../../../../templates');

// Template list with base information (used as fallback when a manifest file is missing)
const templateFallbacks = [
  {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    description: 'Elegant wedding invitation with classic gold accents and traditional Indian design elements. Perfect for traditional ceremonies.',
    price: 499,
    currency: 'INR',
    previewImage: '/templates/royal-elegance/preview.jpg',
    previewImages: [
      '/templates/royal-elegance/preview-1.jpg',
      '/templates/royal-elegance/preview-2.jpg',
    ],
    tags: ['elegant', 'classic', 'traditional', 'indian'],
    category: 'traditional',
    features: [
      'Bilingual support (English & Hindi)',
      'RSVP tracking with guest management',
      'Photo gallery with lightbox',
      'Event timeline with locations',
      'WhatsApp sharing',
      'Custom color themes',
      'Section reordering',
      'Mobile responsive',
    ],
    version: '1.0.0',
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: 'minimal-modern',
    name: 'Minimal Modern',
    description: 'Clean, contemporary design with minimalist aesthetics. Ideal for couples who prefer understated elegance.',
    price: 699,
    currency: 'INR',
    previewImage: '/templates/minimal-modern/preview.jpg',
    previewImages: [],
    tags: ['minimal', 'modern', 'clean', 'contemporary'],
    category: 'modern',
    features: [
      'Sleek animations',
      'Modern typography',
      'Photo-centric layout',
      'RSVP with dietary preferences',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'garden-romance',
    name: 'Garden Romance',
    description: 'Soft floral designs with watercolor elements. Beautiful for outdoor and garden weddings.',
    price: 599,
    currency: 'INR',
    previewImage: '/templates/garden-romance/preview.jpg',
    previewImages: [],
    tags: ['floral', 'romantic', 'garden', 'watercolor'],
    category: 'romantic',
    features: [
      'Animated floral borders',
      'Soft color palette',
      'Interactive guest book',
      'Weather widget for venue',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'south-indian-silk',
    name: 'South Indian Silk',
    description: 'Rich silk patterns inspired by traditional South Indian wedding aesthetics with temple motifs.',
    price: 799,
    currency: 'INR',
    previewImage: '/templates/south-indian-silk/preview.jpg',
    previewImages: [],
    tags: ['south-indian', 'traditional', 'silk', 'temple'],
    category: 'traditional',
    features: [
      'Tamil/Telugu/Kannada/Malayalam support',
      'Muhurtham display',
      'Traditional music integration',
      'Temple-style borders',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'rustic-charm',
    name: 'Rustic Charm',
    description: 'Warm, earthy tones with hand-drawn elements. Perfect for intimate, countryside celebrations.',
    price: 549,
    currency: 'INR',
    previewImage: '/templates/rustic-charm/preview.jpg',
    previewImages: [],
    tags: ['rustic', 'bohemian', 'earthy', 'hand-drawn'],
    category: 'bohemian',
    features: [
      'Hand-drawn illustrations',
      'Kraft paper textures',
      'Casual, warm typography',
      'Photo collage sections',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'luxury-noir',
    name: 'Luxury Noir',
    description: 'Sophisticated black and gold design for glamorous evening celebrations and destination weddings.',
    price: 999,
    currency: 'INR',
    previewImage: '/templates/luxury-noir/preview.jpg',
    previewImages: [],
    tags: ['luxury', 'black', 'gold', 'glamorous'],
    category: 'luxury',
    features: [
      'Dramatic animations',
      'Video background support',
      'Premium gold accents',
      'Countdown timer',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'desert-sunset',
    name: 'Desert Sunset',
    description: 'Warm amber gradients with modern typography inspired by sunset hues.',
    price: 799,
    currency: 'INR',
    previewImage: '/templates/desert-sunset/preview.jpg',
    previewImages: [],
    tags: ['modern', 'sunset', 'warm', 'gradient'],
    category: 'modern',
    features: [
      'Gradient hero with modern typography',
      'Photo gallery with lightbox',
      'Events timeline with icons',
      'RSVP with contact details',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'pastel-bloom',
    name: 'Pastel Bloom',
    description: 'Soft watercolor florals with romantic pastels and elegant typography.',
    price: 649,
    currency: 'INR',
    previewImage: '/templates/pastel-bloom/preview.jpg',
    previewImages: [],
    tags: ['floral', 'romantic', 'pastel', 'watercolor'],
    category: 'romantic',
    features: [
      'Watercolor floral hero',
      'Romantic typography',
      'Photo gallery with lightbox',
      'RSVP with contact cards',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'art-deco-glam',
    name: 'Art Deco Glam',
    description: 'Black and gold art-deco inspired layout for luxurious celebrations.',
    price: 1099,
    currency: 'INR',
    previewImage: '/templates/art-deco-glam/preview.jpg',
    previewImages: [],
    tags: ['luxury', 'art-deco', 'black', 'gold'],
    category: 'luxury',
    features: [
      'Art-deco frames and dividers',
      'Luxury black and gold palette',
      'Photo gallery with lightbox',
      'Event timeline with icons',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'coastal-breeze',
    name: 'Coastal Breeze',
    description: 'Airy minimal design inspired by coastal blues and creamy sands.',
    price: 699,
    currency: 'INR',
    previewImage: '/templates/coastal-breeze/preview.jpg',
    previewImages: [],
    tags: ['minimal', 'modern', 'coastal', 'blue'],
    category: 'minimal',
    features: [
      'Minimal coastal layout',
      'Clean typography with airy spacing',
      'Photo gallery with lightbox',
      'RSVP and contact cards',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
  {
    id: 'heritage-red',
    name: 'Heritage Red',
    description: 'Deep red and gold traditional motif with festive accents.',
    price: 899,
    currency: 'INR',
    previewImage: '/templates/heritage-red/preview.jpg',
    previewImages: [],
    tags: ['traditional', 'red', 'gold', 'festive'],
    category: 'traditional',
    features: [
      'Traditional red and gold palette',
      'Cultural motif borders',
      'Photo gallery with lightbox',
      'Events timeline and RSVP',
    ],
    version: '1.0.0',
    isAvailable: false,
    isComingSoon: true,
  },
];

// Default sections configuration for templates without manifest
const defaultSections = [
  { id: 'header', name: 'Header', required: true, defaultEnabled: true, icon: '📌', description: 'Navigation and branding header' },
  { id: 'hero', name: 'Hero Banner', required: false, defaultEnabled: true, icon: '🖼️', description: 'Main hero section with couple photo' },
  { id: 'couple', name: 'Couple Profile', required: false, defaultEnabled: true, icon: '💑', description: 'Bride and groom information' },
  { id: 'fathers-letter', name: "Father's Letter", required: false, defaultEnabled: true, icon: '✉️', description: 'Heartfelt letter from the father' },
  { id: 'gallery', name: 'Photo Gallery', required: false, defaultEnabled: true, icon: '📷', description: 'Photo gallery with lightbox' },
  { id: 'events', name: 'Events Timeline', required: false, defaultEnabled: true, icon: '📅', description: 'Wedding events schedule' },
  { id: 'venue', name: 'Venue Details', required: false, defaultEnabled: true, icon: '📍', description: 'Venue location with map' },
  { id: 'rsvp', name: 'RSVP Section', required: false, defaultEnabled: true, icon: '💌', description: 'Guest RSVP form' },
  { id: 'footer', name: 'Footer', required: true, defaultEnabled: true, icon: '🎀', description: 'Closing message' },
];

// Default themes for templates without manifest
const defaultThemes = [
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    isDefault: true,
    colors: { primary: '#d4af37', secondary: '#8b6914', background: '#fff8f0', text: '#2c2c2c', accent: '#c9a227' },
    fonts: { heading: 'Playfair Display', body: 'Poppins', script: 'Great Vibes' },
  },
  {
    id: 'rose-blush',
    name: 'Rose Blush',
    isDefault: false,
    colors: { primary: '#c77d8a', secondary: '#9b5c6a', background: '#fff5f7', text: '#4a3539', accent: '#e8b4b8' },
    fonts: { heading: 'Cormorant Garamond', body: 'Lato', script: 'Dancing Script' },
  },
  {
    id: 'forest-sage',
    name: 'Forest Sage',
    isDefault: false,
    colors: { primary: '#6b8e6b', secondary: '#4a6f4a', background: '#f5f8f5', text: '#2c3c2c', accent: '#8fbc8f' },
    fonts: { heading: 'EB Garamond', body: 'Montserrat', script: 'Tangerine' },
  },
];

// Default section order
const defaultSectionOrder = ['header', 'hero', 'couple', 'fathers-letter', 'gallery', 'events', 'venue', 'rsvp', 'footer'];

function getTemplateIds() {
  try {
    return fs.readdirSync(TEMPLATES_DIR).filter((entry) => {
      const fullPath = path.join(TEMPLATES_DIR, entry);
      return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
    });
  } catch (error) {
    console.error('Failed to read templates directory', error);
    return [];
  }
}

function normalizeManifest(input, templateId) {
  const status =
    input.status ||
    (input.isAvailable ? 'ready' : input.isComingSoon ? 'coming-soon' : 'hidden');

  return {
    ...input,
    id: input.id || templateId,
    name: input.name || templateId,
    version: input.version || '1.0.0',
    description: input.description || '',
    previewImage: input.previewImage,
    previewImages: input.previewImages || [],
    tags: input.tags || [],
    category: input.category || 'general',
    price: input.price ?? 0,
    currency: input.currency || 'INR',
    author: input.author || 'Sacred Vows',
    sections: input.sections || defaultSections,
    themes: input.themes || defaultThemes,
    defaultSectionOrder: input.defaultSectionOrder || defaultSectionOrder,
    status,
    isAvailable: status === 'ready',
    isComingSoon: status === 'coming-soon',
    isFeatured: input.isFeatured || false,
    features: input.features || [],
  };
}

/**
 * Load template manifest from file system or fallback data
 * @param {string} templateId - Template ID
 * @returns {Object|null} Template manifest or null if not found
 */
function loadManifest(templateId) {
  try {
    const manifestPath = path.join(TEMPLATES_DIR, templateId, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, 'utf8');
      const parsed = JSON.parse(content);
      return normalizeManifest(parsed, templateId);
    }
  } catch (error) {
    console.error(`Failed to load manifest for ${templateId}:`, error);
  }

  const fallback = templateFallbacks.find((template) => template.id === templateId);
  if (fallback) {
    return normalizeManifest(fallback, templateId);
  }

  return null;
}

function getTemplateCatalog() {
  const catalog = [];
  const templateIds = getTemplateIds();

  templateIds.forEach((templateId) => {
    const manifest = loadManifest(templateId);
    if (manifest) {
      catalog.push(manifest);
    }
  });

  // Include fallback templates that might not yet have a manifest directory
  templateFallbacks.forEach((fallback) => {
    if (!catalog.find((item) => item.id === fallback.id)) {
      catalog.push(normalizeManifest(fallback, fallback.id));
    }
  });

  return catalog;
}

function manifestToSummary(manifest) {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    price: manifest.price,
    currency: manifest.currency,
    previewImage: manifest.previewImage,
    previewImages: manifest.previewImages,
    tags: manifest.tags,
    category: manifest.category,
    status: manifest.status,
    isAvailable: manifest.isAvailable,
    isComingSoon: manifest.isComingSoon,
    isFeatured: manifest.isFeatured,
    version: manifest.version,
    features: manifest.features,
  };
}

/**
 * Get all templates
 * GET /api/templates
 * Query params: category (optional), featured (optional)
 */
router.get('/', (req, res) => {
  const { category, featured } = req.query;
  
  const catalog = getTemplateCatalog();

  let filteredTemplates = catalog;

  if (category && category !== 'all') {
    filteredTemplates = filteredTemplates.filter((t) => t.category === category);
  }

  if (featured === 'true') {
    filteredTemplates = filteredTemplates.filter((t) => t.isFeatured);
  }

  const categories = ['all', ...new Set(catalog.map((t) => t.category).filter(Boolean))];

  res.json({
    templates: filteredTemplates.map(manifestToSummary),
    categories,
  });
});

/**
 * Get all template manifests
 * GET /api/templates/manifests
 */
router.get('/manifests', (req, res) => {
  const manifests = getTemplateCatalog();
  res.json({ manifests });
});

/**
 * Get template manifest
 * GET /api/templates/:id/manifest
 * NOTE: This route must be defined BEFORE /:id to avoid being shadowed
 */
router.get('/:id/manifest', (req, res) => {
  const { id } = req.params;

  const manifest = loadManifest(id);

  if (!manifest) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json({ manifest });
});

/**
 * Get single template
 * GET /api/templates/:id
 * NOTE: This route must be defined AFTER more specific routes like /:id/manifest
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const manifest = loadManifest(id);

  if (!manifest) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json({ template: manifestToSummary(manifest) });
});

export default router;
