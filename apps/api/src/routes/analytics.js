import express from 'express';
// import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Temporary storage for analytics (in production, use database)
const analytics = [];

/**
 * Track view
 * POST /api/analytics/view
 */
router.post('/view', (req, res) => {
  try {
    const { invitationId, referrer, userAgent } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const view = {
      id: Date.now().toString(),
      invitationId,
      type: 'view',
      referrer: referrer || null,
      userAgent: userAgent || null,
      timestamp: new Date(),
    };

    analytics.push(view);

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

/**
 * Get analytics for invitation
 * GET /api/analytics/:invitationId
 */
router.get('/:invitationId', (req, res) => {
  const { invitationId } = req.params;
  const invitationAnalytics = analytics.filter(a => a.invitationId === invitationId);

  const views = invitationAnalytics.filter(a => a.type === 'view');
  const rsvps = invitationAnalytics.filter(a => a.type === 'rsvp');

  res.json({
    invitationId,
    views: views.length,
    rsvps: rsvps.length,
    analytics: invitationAnalytics,
  });
});

export default router;

