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
      logger.error('WIX_PUBLIC_KEY not configured');
      return res.status(500).json({
        error: 'Webhook signature verification failed',
        message: 'Server configuration error: Public key not configured',
      });
    }

    if (!req.body || typeof req.body !== 'string') {
      logger.error('Webhook body is missing or not a string', {
        bodyType: typeof req.body,
        hasBody: !!req.body,
      });
      return res.status(400).json({
        error: 'Webhook signature verification failed',
        message: 'Invalid request body',
      });
    }

    // Verify JWT signature and decode payload
    let rawPayload;
    try {
      rawPayload = jwt.verify(req.body, config.wix.publicKey, {
        algorithms: ['RS256'],
      });
    } catch (jwtError) {
      logger.error('JWT verification failed:', {
        error: jwtError.message,
        name: jwtError.name,
      });
      return res.status(400).json({
        error: 'Webhook signature verification failed',
        message: jwtError.message,
      });
    }

    // Parse event data
    let event, eventData;
    try {
      event = typeof rawPayload.data === 'string' 
        ? JSON.parse(rawPayload.data) 
        : rawPayload.data;
      
      eventData = typeof event.data === 'string'
        ? JSON.parse(event.data)
        : event.data;
    } catch (parseError) {
      logger.error('Failed to parse webhook event data:', parseError);
      return res.status(400).json({
        error: 'Webhook signature verification failed',
        message: 'Invalid event data format',
      });
    }

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
    logger.error('Webhook signature verification failed (unexpected error):', err);
    res.status(400).json({
      error: 'Webhook signature verification failed',
      message: err.message,
    });
  }
};

/**
 * Process booking created event
 * Shared handler for both route-based and event-type-based webhooks
 */
function handleBookingCreated(instanceId, data, eventType) {
  logger.info('Booking created webhook received', {
    instanceId,
    eventType,
  });

  // Process webhook asynchronously (fire and forget)
  setImmediate(async () => {
    try {
      // Handle different data structures
      const booking = data?.booking || data?.entity || data;

      if (!booking) {
        logger.warn('Booking created webhook: no booking data found', { data });
        return;
      }

      logger.info('Processing booking created event', {
        bookingId: booking.id || booking._id,
        instanceId,
      });

      // Send confirmation email asynchronously
      if (booking.contactId && instanceId) {
        try {
          const contact = await crmService.getContact(instanceId, booking.contactId);
          if (contact?.emails?.[0]?.email) {
            await notificationService.sendAppointmentConfirmation(booking, contact);
          }
        } catch (emailError) {
          // Log error but don't fail the webhook
          logger.error('Failed to send booking confirmation email:', emailError);
        }
      }
    } catch (error) {
      // Log error but don't fail the webhook (already responded)
      logger.error('Error processing booking created webhook (async):', error);
    }
  });
}

/**
 * POST /plugins-and-webhooks/bookings/created
 * Webhook handler for when a booking is created (route-based)
 * 
 * IMPORTANT: Wix requires webhooks to return 200 status within 1250ms
 * Heavy processing should be done asynchronously after responding
 */
router.post('/bookings/created', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data, eventType } = req.wixEvent;

  // Return 200 immediately to avoid timeout
  // Wix requires response within 1250ms
  res.status(200).json({ success: true, received: true });

  // Process asynchronously
  handleBookingCreated(instanceId, data, eventType);
}));

/**
 * POST /plugins-and-webhooks/bookings/cancelled
 * Webhook handler for when a booking is cancelled
 * 
 * IMPORTANT: Wix requires webhooks to return 200 status within 1250ms
 * Heavy processing should be done asynchronously after responding
 */
router.post('/bookings/cancelled', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data } = req.wixEvent;

  logger.info('Booking cancelled webhook received', {
    instanceId,
    eventType: req.wixEvent.eventType,
  });

  // Return 200 immediately to avoid timeout
  res.status(200).json({ success: true, received: true });

  // Process webhook asynchronously (fire and forget)
  setImmediate(async () => {
    try {
      const booking = data?.booking || data;

      if (!booking) {
        logger.warn('Booking cancelled webhook: no booking data found', { data });
        return;
      }

      // Send cancellation email asynchronously
      if (booking.contactId && instanceId) {
        try {
          const contact = await crmService.getContact(instanceId, booking.contactId);
          if (contact?.emails?.[0]?.email) {
            await notificationService.sendAppointmentCancellation(booking, contact);
          }
        } catch (emailError) {
          // Log error but don't fail the webhook
          logger.error('Failed to send booking cancellation email:', emailError);
        }
      }
    } catch (error) {
      // Log error but don't fail the webhook (already responded)
      logger.error('Error processing booking cancelled webhook (async):', error);
    }
  });
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
 * POST /plugins-and-webhooks/app/installed
 * Webhook handler for when the app is installed on a site
 * This is the recommended way to capture the instanceId
 */
router.post('/app/installed', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data } = req.wixEvent;

  logger.info('App installation webhook received', {
    instanceId,
    eventType: req.wixEvent.eventType,
    data,
  });

  // TODO: Store the instanceId in a database for production use
  // For now, just log it
  logger.info('App installed successfully via webhook', {
    instanceId,
    timestamp: new Date(),
  });

  res.json({ success: true });
}));

/**
 * POST /plugins-and-webhooks/app/removed
 * Webhook handler for when the app is removed from a site
 */
router.post('/app/removed', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data } = req.wixEvent;

  logger.info('App removal webhook received', {
    instanceId,
    eventType: req.wixEvent.eventType,
  });

  // TODO: Clean up instanceId from database in production
  logger.info('App removed from site', {
    instanceId,
    timestamp: new Date(),
  });

  res.json({ success: true });
}));

/**
 * Catch-all for service plugin endpoints and other webhook events
 * This handles event-type-based webhooks (like the Wix sample code)
 */
router.post('/*', verifyWebhookSignature, asyncHandler(async (req, res) => {
  const { instanceId, data, eventType } = req.wixEvent;

  logger.info('Webhook received', {
    path: req.path,
    eventType,
    instanceId,
  });

  // Return 200 immediately to avoid timeout
  res.status(200).json({ success: true, received: true });

  // Handle different event types (like the Wix sample code pattern)
  switch (eventType) {
    case 'wix.bookings.v2.booking_created':
    case 'wix.bookings.v1.booking_created':
    case 'bookings/booking-created':
      logger.info('Booking created event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      handleBookingCreated(instanceId, data, eventType);
      break;

    case 'wix.bookings.v2.booking_cancelled':
    case 'wix.bookings.v1.booking_cancelled':
    case 'bookings/booking-cancelled':
      logger.info('Booking cancelled event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      // Process booking cancelled asynchronously
      setImmediate(async () => {
        try {
          const booking = data?.booking || data?.entity || data;
          if (booking?.contactId && instanceId) {
            try {
              const contact = await crmService.getContact(instanceId, booking.contactId);
              if (contact?.emails?.[0]?.email) {
                await notificationService.sendAppointmentCancellation(booking, contact);
              }
            } catch (emailError) {
              logger.error('Failed to send booking cancellation email:', emailError);
            }
          }
        } catch (error) {
          logger.error('Error processing booking cancelled webhook (async):', error);
        }
      });
      break;

    default:
      logger.info('Unknown or unhandled webhook event type', {
        eventType,
        path: req.path,
        instanceId,
      });
      // Still return success - we received it
      break;
  }
}));

export default router;
