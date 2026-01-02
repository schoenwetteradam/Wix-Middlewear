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
    // Handle test webhooks from Wix (empty or missing data)
    if (!payload || !payload.data || !payload.data.booking) {
      logger.info('Test webhook or empty payload received');
      return res.json({ success: true, message: 'Webhook endpoint ready' });
    }

    const { data } = payload;
    const booking = data.booking;
    const instanceId = data.instanceId;

    // Send confirmation email
    if (booking.contactId && instanceId) {
      const contact = await crmService.getContact(instanceId, booking.contactId);
      if (contact?.emails?.[0]?.email) {
        await notificationService.sendAppointmentConfirmation(booking, contact);
      }
    }

    res.json({ success: true, message: 'Booking confirmation processed' });
  } catch (error) {
    logger.error('Error processing booking created webhook:', error);
    // Still return 200 to prevent Wix from retrying
    res.json({ success: false, error: error.message });
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
    // Handle test webhooks from Wix (empty or missing data)
    if (!payload || !payload.data || !payload.data.booking) {
      logger.info('Test webhook or empty payload received');
      return res.json({ success: true, message: 'Webhook endpoint ready' });
    }

    const { data } = payload;
    const booking = data.booking;
    const instanceId = data.instanceId;

    // Send cancellation email
    if (booking.contactId && instanceId) {
      const contact = await crmService.getContact(instanceId, booking.contactId);
      if (contact?.emails?.[0]?.email) {
        await notificationService.sendAppointmentCancellation(booking, contact);
      }
    }

    res.json({ success: true, message: 'Booking cancellation processed' });
  } catch (error) {
    logger.error('Error processing booking cancelled webhook:', error);
    // Still return 200 to prevent Wix from retrying
    res.json({ success: false, error: error.message });
  }
}));

/**
 * POST /plugins-and-webhooks/events/created
 * Webhook handler for when an event is created
 */
router.post('/events/created', asyncHandler(async (req, res) => {
  const payload = req.body;

  logger.info('Event created webhook received', { payload });

  // Process event creation (no errors for test webhooks)
  res.json({ success: true, message: 'Event webhook endpoint ready' });
}));

/**
 * GET endpoints for webhook verification
 * Wix sometimes sends GET requests to verify the endpoint exists
 */
router.get('/bookings/created', (req, res) => {
  res.json({
    success: true,
    endpoint: 'bookings/created',
    message: 'Webhook endpoint is active',
    method: 'POST'
  });
});

router.get('/bookings/cancelled', (req, res) => {
  res.json({
    success: true,
    endpoint: 'bookings/cancelled',
    message: 'Webhook endpoint is active',
    method: 'POST'
  });
});

router.get('/events/created', (req, res) => {
  res.json({
    success: true,
    endpoint: 'events/created',
    message: 'Webhook endpoint is active',
    method: 'POST'
  });
});

/**
 * Catch-all for service plugin endpoints
 */
router.post('/*', asyncHandler(async (req, res) => {
  logger.info('Generic webhook/service plugin called', {
    path: req.path,
    body: req.body,
  });

  res.json({ success: true, message: 'Webhook received' });
}));

router.get('/*', (req, res) => {
  res.json({
    success: true,
    message: 'Wix webhook endpoint',
    availableEndpoints: [
      'POST /plugins-and-webhooks/bookings/created',
      'POST /plugins-and-webhooks/bookings/cancelled',
      'POST /plugins-and-webhooks/events/created'
    ]
  });
});

export default router;
