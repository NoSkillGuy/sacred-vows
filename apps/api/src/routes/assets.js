import express from 'express';
import { upload } from '../middleware/upload.js';
// import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Temporary storage for asset URLs (in production, use database)
const assets = [];

/**
 * Upload image
 * POST /api/assets/upload
 */
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, upload to S3/Cloudinary and get URL
    // For now, return a placeholder URL
    const asset = {
      id: Date.now().toString(),
      url: `/uploads/${req.file.filename}`, // In production, this would be the cloud URL
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user?.userId || 'anonymous',
      createdAt: new Date(),
    };

    assets.push(asset);

    res.json({ 
      url: asset.url,
      asset,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * Get user's assets
 * GET /api/assets
 */
router.get('/', (req, res) => {
  // In production, filter by userId
  // const userId = req.user.userId;
  // const userAssets = await prisma.asset.findMany({ where: { userId } });
  
  res.json({ assets });
});

/**
 * Delete asset
 * DELETE /api/assets/delete
 */
router.delete('/delete', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const assetIndex = assets.findIndex(a => a.url === url);
    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    assets.splice(assetIndex, 1);
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;

