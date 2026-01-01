import express from 'express';
import eventsService from '../services/eventsService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateWixJWT } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/events
 * Get all upcoming events
 */
router.get('/', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { limit, offset, startDate } = req.query;

  const options = {};
  if (limit) options.limit = parseInt(limit);
  if (offset) options.offset = parseInt(offset);
  if (startDate) options.startDate = new Date(startDate);

  const events = await eventsService.getUpcomingEvents(instanceId, options);

  res.json({
    success: true,
    data: events,
    count: events.length,
  });
}));

/**
 * POST /api/events
 * Create a new event
 */
router.post('/', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const eventData = req.body;

  // Validate required fields
  if (!eventData.title || !eventData.startDate) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, startDate',
    });
  }

  const event = await eventsService.createEvent(instanceId, eventData);

  res.status(201).json({
    success: true,
    data: event,
    message: 'Event created successfully',
  });
}));

/**
 * PUT /api/events/:eventId
 * Update an event
 */
router.put('/:eventId', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { eventId } = req.params;
  const eventData = req.body;

  const event = await eventsService.updateEvent(instanceId, eventId, eventData);

  res.json({
    success: true,
    data: event,
    message: 'Event updated successfully',
  });
}));

/**
 * DELETE /api/events/:eventId
 * Delete an event
 */
router.delete('/:eventId', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { eventId } = req.params;

  await eventsService.deleteEvent(instanceId, eventId);

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
}));

/**
 * GET /api/events/:eventId/registrations
 * Get registrations for an event
 */
router.get('/:eventId/registrations', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { eventId } = req.params;

  const registrations = await eventsService.getEventRegistrations(instanceId, eventId);

  res.json({
    success: true,
    data: registrations,
    count: registrations.length,
  });
}));

export default router;
