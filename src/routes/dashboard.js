import express from 'express';
import bookingsService from '../services/bookingsService.js';
import eventsService from '../services/eventsService.js';
import crmService from '../services/crmService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateWixJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/dashboard/kpis
 * Get KPI metrics for the salon dashboard
 */
router.get('/kpis', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of current month
  const end = endDate ? new Date(endDate) : new Date(); // Today

  logger.info('Calculating KPIs', { instanceId, startDate: start, endDate: end });

  // Fetch all necessary data in parallel
  const [
    allBookings,
    upcomingEvents,
    staffMembers,
  ] = await Promise.all([
    bookingsService.getAllBookings(instanceId, { startDate: start, endDate: end }),
    eventsService.getUpcomingEvents(instanceId, { startDate: start }),
    bookingsService.getStaffMembers(instanceId),
  ]);

  // Calculate KPIs
  const kpis = {
    totalAppointments: allBookings.length,
    completedAppointments: allBookings.filter(b => b.status === 'CONFIRMED').length,
    cancelledAppointments: allBookings.filter(b => b.status === 'CANCELLED').length,
    pendingAppointments: allBookings.filter(b => b.status === 'PENDING').length,

    totalEvents: upcomingEvents.length,

    totalStaff: staffMembers.length,

    // Revenue calculation (if booking includes price)
    totalRevenue: allBookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + (b.payment?.amount || 0), 0),

    // Appointment rate by staff
    staffPerformance: staffMembers.map(staff => {
      const staffBookings = allBookings.filter(b => b.staffMemberId === staff.id);
      return {
        staffId: staff.id,
        staffName: staff.name,
        totalAppointments: staffBookings.length,
        completedAppointments: staffBookings.filter(b => b.status === 'CONFIRMED').length,
        revenue: staffBookings
          .filter(b => b.status === 'CONFIRMED')
          .reduce((sum, b) => sum + (b.payment?.amount || 0), 0),
      };
    }),

    // Appointments by day of week
    appointmentsByDay: calculateAppointmentsByDay(allBookings),

    // Popular services
    popularServices: calculatePopularServices(allBookings),

    // Date range
    dateRange: {
      startDate: start,
      endDate: end,
    },
  };

  res.json({
    success: true,
    data: kpis,
  });
}));

/**
 * GET /api/dashboard/upcoming
 * Get upcoming appointments and events for quick overview
 */
router.get('/upcoming', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const limit = parseInt(req.query.limit) || 10;

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const [appointments, events] = await Promise.all([
    bookingsService.getAllBookings(instanceId, {
      startDate: now,
      endDate: endOfDay,
      limit,
    }),
    eventsService.getUpcomingEvents(instanceId, {
      startDate: now,
      limit: 5,
    }),
  ]);

  res.json({
    success: true,
    data: {
      appointments,
      events,
    },
  });
}));

/**
 * GET /api/dashboard/staff-overview
 * Get overview of all staff members and their schedules
 */
router.get('/staff-overview', validateWixJWT, asyncHandler(async (req, res) => {
  const instanceId = req.instanceId;
  const date = req.query.date ? new Date(req.query.date) : new Date();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const staffMembers = await bookingsService.getStaffMembers(instanceId);

  const staffOverview = await Promise.all(
    staffMembers.map(async (staff) => {
      const bookings = await bookingsService.getStaffBookings(instanceId, staff.id, {
        startDate: startOfDay,
        endDate: endOfDay,
      });

      return {
        staffId: staff.id,
        staffName: staff.name,
        email: staff.email,
        bookingsToday: bookings.length,
        appointments: bookings.sort((a, b) =>
          new Date(a.startTime) - new Date(b.startTime)
        ),
      };
    })
  );

  res.json({
    success: true,
    data: staffOverview,
  });
}));

/**
 * Helper: Calculate appointments by day of week
 */
function calculateAppointmentsByDay(bookings) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay = days.map(day => ({ day, count: 0 }));

  bookings.forEach(booking => {
    const dayIndex = new Date(booking.startTime).getDay();
    byDay[dayIndex].count++;
  });

  return byDay;
}

/**
 * Helper: Calculate popular services
 */
function calculatePopularServices(bookings) {
  const serviceCount = {};

  bookings.forEach(booking => {
    const serviceId = booking.serviceId;
    serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
  });

  return Object.entries(serviceCount)
    .map(([serviceId, count]) => ({ serviceId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default router;
