import express from 'express';
// import { authenticateToken } from '../middleware/auth.js';
// In production, import Prisma client
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const router = express.Router();

// Temporary in-memory storage (replace with database)
const invitations = [];

/**
 * Get all invitations for current user
 * GET /api/invitations
 */
router.get('/', (req, res) => {
  // In production, filter by userId from authenticated user
  // const userId = req.user.userId;
  // const userInvitations = await prisma.invitation.findMany({ where: { userId } });
  
  res.json({ invitations });
});

/**
 * Get preview data
 * GET /api/invitations/:id/preview
 * NOTE: This route must be defined BEFORE /:id to avoid being shadowed
 */
router.get('/:id/preview', (req, res) => {
  const { id } = req.params;
  const invitation = invitations.find(inv => inv.id === id);

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  res.json({ 
    invitation: {
      id: invitation.id,
      templateId: invitation.templateId,
      data: invitation.data,
    }
  });
});

/**
 * Get single invitation
 * GET /api/invitations/:id
 * NOTE: This route must be defined AFTER more specific routes like /:id/preview
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const invitation = invitations.find(inv => inv.id === id);

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  res.json({ invitation });
});

/**
 * Create new invitation
 * POST /api/invitations
 */
router.post('/', (req, res) => {
  try {
    const { templateId, data } = req.body;

    const invitation = {
      id: Date.now().toString(),
      templateId: templateId || 'royal-elegance',
      data: data || {},
      userId: req.user?.userId || 'anonymous', // In production, from auth middleware
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    invitations.push(invitation);

    res.status(201).json({ invitation });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

/**
 * Update invitation
 * PUT /api/invitations/:id
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { data, templateId } = req.body;

    const invitationIndex = invitations.findIndex(inv => inv.id === id);
    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    invitations[invitationIndex] = {
      ...invitations[invitationIndex],
      data: data || invitations[invitationIndex].data,
      templateId: templateId || invitations[invitationIndex].templateId,
      updatedAt: new Date(),
    };

    res.json({ invitation: invitations[invitationIndex] });
  } catch (error) {
    console.error('Update invitation error:', error);
    res.status(500).json({ error: 'Failed to update invitation' });
  }
});

/**
 * Delete invitation
 * DELETE /api/invitations/:id
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const invitationIndex = invitations.findIndex(inv => inv.id === id);

  if (invitationIndex === -1) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  invitations.splice(invitationIndex, 1);
  res.json({ message: 'Invitation deleted' });
});

export default router;

