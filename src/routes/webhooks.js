import express from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import notificationService from '../services/notificationService.js';
import crmService from '../services/crmService.js';
import config from '../config/config.js';

const router = express.Router();

/**
 * Middleware to verify Wix webhook JWT signature
 * Must be used before any webhook handlers
 */
const verifyWebhookSignature = (req, res, next) => {
  try {
    if (!config.wix.publicKey) {
      throw new Error('WIX_PUBLIC_KEY not configured');
    }

    // Verify JWT signature and decode payload
    const rawPayload = jwt.verify(req.body, config.wix.publicKey);
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    // Attach parsed data to request object for handlers
    req.wixEvent = {
      eventType: event.eventType,
      instanceId: event.instanceId,
      eventId: event.eventId,
      eventTime: event.eventTime,
      data: eventData,
    };

    logger.debug('Webhook signature verified', {
      eventType: event.eventType,
      instanceId: event.instanceId,
    });

    next();
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    res.status(400).json({
      error: 'Webhook signature verification failed',
      message: err.message,
    });
  }
};

/**
 * POST /plugins-and-webhooks/bookings/created
 * Webhook handler for when a booking is created
 */
router.post('/bookings/created', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data } = req.wixEvent;

  logger.info('Booking created webhook received', {
    instanceId,
    eventType: req.wixEvent.eventType,
  });

  try {
    const booking = data.booking;

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
router.post('/bookings/cancelled', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data } = req.wixEvent;

  logger.info('Booking cancelled webhook received', {
    instanceId,
    eventType: req.wixEvent.eventType,
  });

  try {
    const booking = data.booking;

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
router.post('/events/created', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data } = req.wixEvent;

  logger.info('Event created webhook received', {
    instanceId,
    eventType: req.wixEvent.eventType,
  });

  // Process event creation
  res.json({ success: true });
}));

/**
 * Catch-all for service plugin endpoints and other webhook events
 */
router.post('/*', verifyWebhookSignature, asyncHandler(async (req, res) => {
  logger.info('Generic webhook/service plugin called', {
    path: req.path,
    eventType: req.wixEvent.eventType,
    instanceId: req.wixEvent.instanceId,
  });

  res.json({ success: true });
}));

export default router;
