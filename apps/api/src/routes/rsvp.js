import express from 'express';

const router = express.Router();

// Temporary storage for RSVP responses (in production, use database)
const rsvpResponses = [];

/**
 * Submit RSVP
 * POST /api/rsvp/:invitationId
 */
router.post('/:invitationId', (req, res) => {
  try {
    const { invitationId } = req.params;
    const { name, date, email, phone, message } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    const rsvp = {
      id: Date.now().toString(),
      invitationId,
      name,
      date,
      email: email || null,
      phone: phone || null,
      message: message || null,
      submittedAt: new Date(),
    };

    rsvpResponses.push(rsvp);

    res.status(201).json({ rsvp });
  } catch (error) {
    console.error('RSVP submission error:', error);
    res.status(500).json({ error: 'Failed to submit RSVP' });
  }
});

/**
 * Get RSVP responses for invitation
 * GET /api/rsvp/:invitationId
 */
router.get('/:invitationId', (req, res) => {
  const { invitationId } = req.params;
  const responses = rsvpResponses.filter(r => r.invitationId === invitationId);

  res.json({ responses, count: responses.length });
});

export default router;

