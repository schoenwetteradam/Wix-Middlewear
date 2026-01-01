import express from 'express';
import bookingsService from '../services/bookingsService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateWixJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/appointments
 * Get all appointments with optional filters
 */
router.get('/', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { startDate, endDate, status, staffMemberId } = req.query;

  const options = {};

  if (startDate) options.startDate = new Date(startDate);
  if (endDate) options.endDate = new Date(endDate);
  if (status) options.status = status;

  let bookings;

  if (staffMemberId) {
    bookings = await bookingsService.getStaffBookings(instanceId, staffMemberId, options);
  } else {
    bookings = await bookingsService.getAllBookings(instanceId, options);
  }

  res.json({
    success: true,
    data: bookings,
    count: bookings.length,
  });
}));

/**
 * POST /api/appointments
 * Create a new appointment
 */
router.post('/', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const bookingData = req.body;

  // Validate required fields
  if (!bookingData.serviceId || !bookingData.staffMemberId || !bookingData.startTime) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: serviceId, staffMemberId, startTime',
    });
  }

  const booking = await bookingsService.createBooking(instanceId, bookingData);

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Appointment created successfully',
  });
}));

/**
 * PUT /api/appointments/:bookingId/status
 * Update appointment status
 */
router.put('/:bookingId/status', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required',
    });
  }

  const booking = await bookingsService.updateBookingStatus(instanceId, bookingId, status);

  res.json({
    success: true,
    data: booking,
    message: 'Appointment status updated',
  });
}));

/**
 * DELETE /api/appointments/:bookingId
 * Cancel an appointment
 */
router.delete('/:bookingId', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { bookingId } = req.params;

  await bookingsService.cancelBooking(instanceId, bookingId);

  res.json({
    success: true,
    message: 'Appointment cancelled successfully',
  });
}));

/**
 * GET /api/appointments/staff/:staffMemberId
 * Get appointments for a specific staff member
 */
router.get('/staff/:staffMemberId', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { staffMemberId } = req.params;
  const { startDate, endDate, status } = req.query;

  const options = {};
  if (startDate) options.startDate = new Date(startDate);
  if (endDate) options.endDate = new Date(endDate);
  if (status) options.status = status;

  const bookings = await bookingsService.getStaffBookings(instanceId, staffMemberId, options);

  res.json({
    success: true,
    data: bookings,
    count: bookings.length,
  });
}));

/**
 * GET /api/appointments/availability
 * Get available time slots for booking
 */
router.get('/availability', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { serviceId, staffMemberId, date } = req.query;

  if (!serviceId || !staffMemberId || !date) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: serviceId, staffMemberId, date',
    });
  }

  const slots = await bookingsService.getAvailableSlots(
    instanceId,
    serviceId,
    staffMemberId,
    new Date(date)
  );

  res.json({
    success: true,
    data: slots,
    count: slots.length,
  });
}));

export default router;
