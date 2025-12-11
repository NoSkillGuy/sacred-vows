import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to templates directory (can be overridden in env for container)
const TEMPLATES_DIR = process.env.TEMPLATES_DIR
  ? path.resolve(process.env.TEMPLATES_DIR)
  : path.resolve(__dirname, '../../../../templates');

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
  const { features, tags, ...manifestWithoutFeatures } = input || {};
  const trimmedTags = Array.isArray(tags) ? tags.slice(0, 3) : tags;

  const themes = Array.isArray(manifestWithoutFeatures.themes)
    ? manifestWithoutFeatures.themes
    : [];

  const hasExplicitDefault = themes.some((theme) => theme?.isDefault);
  const normalizedThemes = themes.map((theme, index) => {
    if (hasExplicitDefault) return theme;
    return index === 0 ? { ...theme, isDefault: true } : theme;
  });

  const defaultTheme =
    normalizedThemes.find((theme) => theme?.isDefault) || normalizedThemes[0] || null;
  const defaultThemeColors = defaultTheme?.colors || null;
  const status =
    manifestWithoutFeatures.status ||
    (manifestWithoutFeatures.isAvailable
      ? 'ready'
      : manifestWithoutFeatures.isComingSoon
        ? 'coming-soon'
        : 'hidden');

  return {
    ...manifestWithoutFeatures,
    themes: normalizedThemes,
    defaultTheme,
    defaultThemeColors,
    ...(trimmedTags ? { tags: trimmedTags } : {}),
    id: manifestWithoutFeatures.id || templateId,
    name: manifestWithoutFeatures.name || templateId,
    status,
    isAvailable: status === 'ready',
    isComingSoon: status === 'coming-soon',
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
    if (!fs.existsSync(manifestPath)) {
      return null;
    }

    const content = fs.readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(content);
    return normalizeManifest(parsed, templateId);
  } catch (error) {
    console.error(`Failed to load manifest for ${templateId}:`, error);
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

  return catalog;
}

function manifestToSummary(manifest) {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    names: manifest.names,
    date: manifest.date,
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
    themes: manifest.themes,
    defaultTheme: manifest.defaultTheme,
    defaultThemeColors: manifest.defaultThemeColors,
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
