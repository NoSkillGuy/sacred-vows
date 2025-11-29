import express from 'express';

const router = express.Router();

// Template list (in production, load from database or file system)
const templates = [
  {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    description: 'Elegant wedding invitation template with classic design',
    previewImage: '/templates/royal-elegance/preview.jpg',
    tags: ['elegant', 'classic', 'traditional', 'indian'],
    version: '1.0.0',
  },
];

/**
 * Get all templates
 * GET /api/templates
 */
router.get('/', (req, res) => {
  res.json({ templates });
});

/**
 * Get single template
 * GET /api/templates/:id
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const template = templates.find(t => t.id === id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json({ template });
});

export default router;

