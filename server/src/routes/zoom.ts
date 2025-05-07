import { Router } from 'express';
import { ZoomService } from '../services/zoom';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const zoomService = new ZoomService();

// Create a new Zoom meeting
router.post('/meetings', authenticateUser, async (req, res) => {
  try {
    const meeting = await zoomService.createMeeting(req.body);
    res.json(meeting);
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    res.status(500).json({ error: 'Failed to create Zoom meeting' });
  }
});

// Validate a Zoom meeting URL
router.post('/validate', authenticateUser, async (req, res) => {
  try {
    const { meetingUrl } = req.body;
    const isValid = await zoomService.validateMeeting(meetingUrl);
    res.json({ valid: isValid });
  } catch (error) {
    console.error('Error validating Zoom meeting:', error);
    res.status(500).json({ error: 'Failed to validate Zoom meeting' });
  }
});

export default router;
