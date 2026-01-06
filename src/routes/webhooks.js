import express from 'express';
import jwt from 'jsonwebtoken';
import { AppStrategy, createClient } from '@wix/sdk';
import { bookings } from '@wix/bookings';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import notificationService from '../services/notificationService.js';
import crmService from '../services/crmService.js';
import bookingsService from '../services/bookingsService.js';
import config from '../config/config.js';

const router = express.Router();

// Forward declaration for handleBookingCreated
let handleBookingCreated;

// Create Wix SDK client for webhook processing
let wixWebhookClient = null;
if (config.wix.appId && config.wix.publicKey) {
  try {
    wixWebhookClient = createClient({
      auth: AppStrategy({
        appId: config.wix.appId,
        publicKey: config.wix.publicKey,
      }),
      modules: { bookings },
    });
    
    logger.info('Wix SDK webhook client initialized');
  } catch (error) {
    logger.warn('Failed to initialize Wix SDK webhook client:', error.message);
  }
}

/**
 * Main webhook endpoint - processes all webhook events using Wix SDK
 * This is the recommended approach from Wix documentation
 */
router.post('/', express.text({ type: '*/*' }), asyncHandler(async (req, res) => {
  try {
    // Try using Wix SDK first (recommended approach)
    if (wixWebhookClient) {
      try {
        await wixWebhookClient.webhooks.process(req.body);
        logger.debug('Webhook processed successfully via Wix SDK');
        return res.status(200).send();
      } catch (sdkError) {
        logger.warn('Wix SDK webhook processing failed, falling back to manual verification:', sdkError.message);
        // Fall through to manual verification
      }
    }
    
    // Fallback to manual JWT verification
    return verifyWebhookSignature(req, res, () => {
      const { instanceId, data, eventType } = req.wixEvent;
      
      // Handle booking created events
      if (eventType?.includes('booking_created') || eventType?.includes('booking-created')) {
        handleBookingCreated(instanceId, data, eventType);
      }
      
      res.status(200).json({ success: true, message: 'Webhook received (manual verification)' });
    });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message,
    });
  }
}));

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
 * Extract booking data from different Wix webhook event structures
 * Handles: createdEvent, actionEvent, updatedEvent
 */
function extractBookingFromEvent(data) {
  // Booking Created: createdEvent.entity
  if (data?.createdEvent?.entity) {
    return data.createdEvent.entity;
  }
  
  // Booking Updated: updatedEvent.currentEntityAsJson
  if (data?.updatedEvent?.currentEntityAsJson) {
    return data.updatedEvent.currentEntityAsJson;
  }
  
  // Booking Declined/Rescheduled/MarkedAsPending: actionEvent.body.booking
  if (data?.actionEvent?.body?.booking) {
    return data.actionEvent.body.booking;
  }
  
  // Fallback: direct booking or entity
  return data?.booking || data?.entity || data;
}

/**
 * Process booking created event
 * Shared handler for both route-based and event-type-based webhooks
 * Saves booking to Wix Data Collection and sends confirmation email
 */
handleBookingCreated = function(instanceId, data, eventType) {
  logger.info('Booking created webhook received', {
    instanceId,
    eventType,
  });

  // Process webhook asynchronously (fire and forget)
  setImmediate(async () => {
    try {
      // Extract booking from event structure
      const booking = extractBookingFromEvent(data);

      if (!booking) {
        logger.warn('Booking created webhook: no booking data found', { data });
        return;
      }

      logger.info('Processing booking created event', {
        bookingId: booking.id || booking._id,
        instanceId,
      });

      // Save booking to Wix Data Collection (SalonAppointments)
      try {
        // Extract data from Wix v2 booking structure
        const slot = booking.bookedEntity?.slot || booking.slot;
        const contactDetails = booking.contactDetails || booking.contact;
        const resource = slot?.resource;
        
        const bookingData = {
          contactId: contactDetails?.contactId || booking.contactId,
          customerName: contactDetails?.firstName && contactDetails?.lastName 
            ? `${contactDetails.firstName} ${contactDetails.lastName}`
            : contactDetails?.firstName || contactDetails?.name || booking.customerName,
          customerEmail: contactDetails?.email || booking.customerEmail,
          customerPhone: contactDetails?.phone || booking.customerPhone,
          serviceId: slot?.serviceId || booking.serviceId,
          serviceName: booking.bookedEntity?.item?.service?.name || slot?.service?.name || booking.serviceName,
          staffMemberId: resource?.id || booking.staffMemberId,
          staffName: resource?.name || booking.staffName,
          startTime: slot?.startDate || booking.startDate || booking.startTime,
          endTime: slot?.endDate || booking.endDate || booking.endTime,
          duration: slot?.duration || booking.duration,
          status: booking.status || 'CREATED',
          notes: booking.notes || booking.comment || '',
          totalPrice: booking.totalPrice || booking.paymentStatus === 'PAID' ? booking.totalPrice : 0,
          locationId: slot?.location?.id,
          locationName: slot?.location?.name,
          numberOfParticipants: booking.numberOfParticipants || booking.totalParticipants || 1,
        };

        await bookingsService.createBooking(instanceId, bookingData);
        logger.info('Booking saved to SalonAppointments collection', {
          bookingId: booking.id || booking._id,
          instanceId,
        });
      } catch (saveError) {
        logger.error('Failed to save booking to collection:', saveError);
        // Continue to send email even if save fails
      }

      // Send confirmation email asynchronously
      const contactDetails = booking.contactDetails || booking.contact;
      const contactId = contactDetails?.contactId || booking.contactId;
      if (contactId && instanceId) {
        try {
          const contact = await crmService.getContact(instanceId, contactId);
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
};

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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhooks.js:226',message:'App installed webhook received',data:{instanceId,eventType:req.wixEvent.eventType,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
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
    // Booking Created
    case 'wix.bookings.v2.booking_created':
    case 'wix.bookings.v1.booking_created':
    case 'bookings/booking-created':
      logger.info('Booking created event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      handleBookingCreated(instanceId, data, eventType);
      break;

    // Booking Updated
    case 'wix.bookings.v2.booking_updated':
    case 'wix.bookings.v1.booking_updated':
    case 'bookings/booking-updated':
      logger.info('Booking updated event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      setImmediate(async () => {
        try {
          const booking = extractBookingFromEvent(data);
          if (booking?.id) {
            logger.info('Processing booking update', {
              bookingId: booking.id,
              instanceId,
              status: booking.status,
            });
            // Update booking in collection if needed
          }
        } catch (error) {
          logger.error('Error processing booking updated webhook (async):', error);
        }
      });
      break;

    // Booking Declined
    case 'wix.bookings.v2.booking_declined':
    case 'wix.bookings.v1.booking_declined':
    case 'bookings/booking-declined':
      logger.info('Booking declined event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      setImmediate(async () => {
        try {
          const booking = extractBookingFromEvent(data);
          const contactDetails = booking?.contactDetails || booking?.contact;
          if (contactDetails?.contactId && instanceId) {
            try {
              const contact = await crmService.getContact(instanceId, contactDetails.contactId);
              if (contact?.emails?.[0]?.email) {
                await notificationService.sendAppointmentCancellation(booking, contact);
              }
            } catch (emailError) {
              logger.error('Failed to send booking declined email:', emailError);
            }
          }
        } catch (error) {
          logger.error('Error processing booking declined webhook (async):', error);
        }
      });
      break;

    // Booking Cancelled
    case 'wix.bookings.v2.booking_cancelled':
    case 'wix.bookings.v1.booking_cancelled':
    case 'bookings/booking-cancelled':
      logger.info('Booking cancelled event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      setImmediate(async () => {
        try {
          const booking = extractBookingFromEvent(data);
          const contactDetails = booking?.contactDetails || booking?.contact;
          if (contactDetails?.contactId && instanceId) {
            try {
              const contact = await crmService.getContact(instanceId, contactDetails.contactId);
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

    // Booking Rescheduled
    case 'wix.bookings.v2.booking_rescheduled':
    case 'wix.bookings.v1.booking_rescheduled':
    case 'bookings/booking-rescheduled':
      logger.info('Booking rescheduled event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      setImmediate(async () => {
        try {
          const booking = extractBookingFromEvent(data);
          logger.info('Processing booking reschedule', {
            bookingId: booking?.id,
            instanceId,
            newStartDate: booking?.startDate,
            previousStartDate: data?.actionEvent?.body?.previousStartDate,
          });
          // Update booking in collection with new times
        } catch (error) {
          logger.error('Error processing booking rescheduled webhook (async):', error);
        }
      });
      break;

    // Booking Marked As Pending
    case 'wix.bookings.v2.booking_markedAsPending':
    case 'bookings/booking-markedAsPending':
      logger.info('Booking marked as pending event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      setImmediate(async () => {
        try {
          const booking = extractBookingFromEvent(data);
          logger.info('Processing booking marked as pending', {
            bookingId: booking?.id,
            instanceId,
          });
        } catch (error) {
          logger.error('Error processing booking marked as pending webhook (async):', error);
        }
      });
      break;

    // Number Of Participants Updated
    case 'wix.bookings.v2.booking_number_of_participants_updated':
    case 'bookings/booking-number_of_participants_updated':
      logger.info('Booking number of participants updated event detected via catch-all handler', {
        eventType,
        instanceId,
      });
      setImmediate(async () => {
        try {
          const booking = extractBookingFromEvent(data);
          logger.info('Processing number of participants update', {
            bookingId: booking?.id,
            instanceId,
            numberOfParticipants: booking?.numberOfParticipants || booking?.totalParticipants,
          });
        } catch (error) {
          logger.error('Error processing number of participants updated webhook (async):', error);
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
