import express from 'express';
import bookingsService from '../services/bookingsService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateWixJWT } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/staff
 * Get all staff members
 */
router.get('/', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;

  const staffMembers = await bookingsService.getStaffMembers(instanceId);

  res.json({
    success: true,
    data: staffMembers,
    count: staffMembers.length,
  });
}));

/**
 * GET /api/staff/:staffMemberId/appointments
 * Get appointments for a specific staff member
 */
router.get('/:staffMemberId/appointments', validateWixJWT, asyncHandler(async (req, res) => {
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
 * GET /api/staff/services
 * Get all available services
 */
router.get('/services', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;

  const services = await bookingsService.getServices(instanceId);

  res.json({
    success: true,
    data: services,
    count: services.length,
  });
}));

export default router;
