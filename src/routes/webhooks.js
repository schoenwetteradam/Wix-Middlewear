import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import notificationService from '../services/notificationService.js';
import crmService from '../services/crmService.js';

const router = express.Router();

/**
 * POST /plugins-and-webhooks/bookings/created
 * Webhook handler for when a booking is created
 */
router.post('/bookings/created', asyncHandler(async (req, res) => {
  const payload = req.body;

  logger.info('Booking created webhook received', { payload });

  try {
    const { data } = payload;
    const booking = data.booking;
    const instanceId = data.instanceId;

    // Send confirmation email
    if (booking.contactId) {
      const contact = await crmService.getContact(instanceId, booking.contactId);
      if (contact?.emails?.[0]?.email) {
        await notificationService.sendAppointmentConfirmation(booking, contact);
      }
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error processing booking created webhook:', error);
    res.status(500).json({ error: error.message });
  }
}));

/**
 * POST /plugins-and-webhooks/bookings/cancelled
 * Webhook handler for when a booking is cancelled
 */
router.post('/bookings/cancelled', asyncHandler(async (req, res) => {
  const payload = req.body;

  logger.info('Booking cancelled webhook received', { payload });

  try {
    const { data } = payload;
    const booking = data.booking;
    const instanceId = data.instanceId;

    // Send cancellation email
    if (booking.contactId) {
      const contact = await crmService.getContact(instanceId, booking.contactId);
      if (contact?.emails?.[0]?.email) {
        await notificationService.sendAppointmentCancellation(booking, contact);
      }
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error processing booking cancelled webhook:', error);
    res.status(500).json({ error: error.message });
  }
}));

/**
 * POST /plugins-and-webhooks/events/created
 * Webhook handler for when an event is created
 */
router.post('/events/created', asyncHandler(async (req, res) => {
  const payload = req.body;

  logger.info('Event created webhook received', { payload });

  // Process event creation
  res.json({ success: true });
}));

/**
 * Catch-all for service plugin endpoints
 */
router.post('/*', asyncHandler(async (req, res) => {
  logger.info('Generic webhook/service plugin called', {
    path: req.path,
    body: req.body,
  });

  res.json({ success: true });
}));

export default router;
