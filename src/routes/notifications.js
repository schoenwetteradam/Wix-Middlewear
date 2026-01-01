import express from 'express';
import notificationService from '../services/notificationService.js';
import reminderService from '../services/reminderService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateWixJWT } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/notifications/send-reminder
 * Manually send a reminder for an appointment
 */
router.post('/send-reminder', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      error: 'bookingId is required',
    });
  }

  await reminderService.sendManualAppointmentReminder(instanceId, bookingId);

  res.json({
    success: true,
    message: 'Reminder sent successfully',
  });
}));

/**
 * POST /api/notifications/test-email
 * Test email notification
 */
router.post('/test-email', validateWixJWT, asyncHandler(async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to) {
    return res.status(400).json({
      success: false,
      error: 'to email address is required',
    });
  }

  await notificationService.sendEmail(
    to,
    subject || 'Test Email',
    body || '<h1>Test Email</h1><p>This is a test email from Salon Events App.</p>'
  );

  res.json({
    success: true,
    message: 'Test email sent',
  });
}));

export default router;
