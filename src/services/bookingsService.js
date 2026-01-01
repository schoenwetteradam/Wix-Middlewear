import { createWixDataService } from './wixDataService.js';
import { getAppAccessToken } from './wixClient.js';
import logger from '../utils/logger.js';

const APPOINTMENTS_COLLECTION = 'SalonAppointments';
const STAFF_COLLECTION = 'SalonStaff';

/**
 * Service for managing Salon Appointments using Wix Data Collections
 */
class BookingsService {
  /**
   * Get data service instance
   */
  async getDataService(instanceId) {
    const accessToken = await getAppAccessToken();
    return createWixDataService(accessToken);
  }

  /**
   * Get all services (appointment types)
   * Note: In production, create a SalonServices collection to manage service types
   */
  async getServices(instanceId) {
    try {
      // Stub implementation - replace with actual SalonServices collection query
      logger.info('Retrieved booking services (stub)', { instanceId });

      return [
        {
          id: 'haircut',
          name: 'Haircut',
          duration: 60,
          price: 50,
        },
        {
          id: 'coloring',
          name: 'Hair Coloring',
          duration: 120,
          price: 100,
        },
        {
          id: 'massage',
          name: 'Massage',
          duration: 90,
          price: 80,
        },
      ];
    } catch (error) {
      logger.error('Failed to get services:', error);
      throw error;
    }
  }

  /**
   * Create a new booking/appointment
   */
  async createBooking(instanceId, bookingData) {
    try {
      const dataService = await this.getDataService(instanceId);

      const appointmentData = {
        customerId: bookingData.contactId || bookingData.customerId,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        staffId: bookingData.staffMemberId || bookingData.staffId,
        staffName: bookingData.staffName,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: bookingData.duration,
        status: 'pending',
        notes: bookingData.notes || '',
        totalPrice: bookingData.totalPrice || 0,
        depositPaid: false,
        reminderSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const appointment = await dataService.insert(APPOINTMENTS_COLLECTION, appointmentData);

      logger.info('Appointment created', {
        instanceId,
        appointmentId: appointment.data._id,
        serviceId: bookingData.serviceId,
        staffId: bookingData.staffMemberId,
      });

      return appointment.data;
    } catch (error) {
      logger.error('Failed to create appointment:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific staff member
   */
  async getStaffBookings(instanceId, staffMemberId, options = {}) {
    try {
      const dataService = await this.getDataService(instanceId);

      const { startDate, endDate, status } = options;

      const filter = {
        staffId: { $eq: staffMemberId },
      };

      if (startDate) {
        filter.startTime = { $gte: startDate };
      }

      if (endDate) {
        filter.endTime = { $lte: endDate };
      }

      if (status) {
        filter.status = { $eq: status };
      }

      const result = await dataService.query(APPOINTMENTS_COLLECTION, {
        filter,
        sort: [{ fieldName: 'startTime', order: 'asc' }],
      });

      logger.info('Retrieved staff appointments', {
        instanceId,
        staffMemberId,
        count: result.items.length,
      });

      return result.items.map(item => item.data);
    } catch (error) {
      logger.error('Failed to get staff bookings:', error);
      throw error;
    }
  }

  /**
   * Get all bookings (for dashboard)
   */
  async getAllBookings(instanceId, options = {}) {
    try {
      const dataService = await this.getDataService(instanceId);

      const { startDate, endDate, status, limit = 100, offset = 0 } = options;

      const filter = {};

      if (startDate) {
        filter.startTime = { $gte: startDate };
      }

      if (endDate) {
        filter.endTime = { $lte: endDate };
      }

      if (status) {
        filter.status = { $eq: status };
      }

      const result = await dataService.query(APPOINTMENTS_COLLECTION, {
        filter,
        sort: [{ fieldName: 'startTime', order: 'asc' }],
        skip: offset,
        limit,
      });

      logger.info('Retrieved all appointments', {
        instanceId,
        count: result.items.length,
        totalCount: result.totalCount,
      });

      return result.items.map(item => item.data);
    } catch (error) {
      logger.error('Failed to get all bookings:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(instanceId, bookingId, status) {
    try {
      const dataService = await this.getDataService(instanceId);

      const appointment = await dataService.update(APPOINTMENTS_COLLECTION, bookingId, {
        status,
        updatedAt: new Date().toISOString(),
      });

      logger.info('Appointment status updated', {
        instanceId,
        bookingId,
        status,
      });

      return appointment.data;
    } catch (error) {
      logger.error('Failed to update appointment status:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(instanceId, bookingId) {
    try {
      const dataService = await this.getDataService(instanceId);

      await dataService.update(APPOINTMENTS_COLLECTION, bookingId, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });

      logger.info('Appointment cancelled', { instanceId, bookingId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel appointment:', error);
      throw error;
    }
  }

  /**
   * Get staff members
   */
  async getStaffMembers(instanceId) {
    try {
      const dataService = await this.getDataService(instanceId);

      const result = await dataService.query(STAFF_COLLECTION, {
        filter: { isActive: { $eq: true } },
        sort: [{ fieldName: 'name', order: 'asc' }],
      });

      logger.info('Retrieved staff members', {
        instanceId,
        count: result.items.length,
      });

      return result.items.map(item => item.data);
    } catch (error) {
      logger.error('Failed to get staff members:', error);
      // Return empty array if collection doesn't exist yet
      return [];
    }
  }

  /**
   * Get available time slots for a service and staff member
   * This calculates available slots based on existing appointments
   */
  async getAvailableSlots(instanceId, serviceId, staffMemberId, date) {
    try {
      const dataService = await this.getDataService(instanceId);

      // Get start and end of day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all appointments for this staff member on this day
      const result = await dataService.query(APPOINTMENTS_COLLECTION, {
        filter: {
          staffId: { $eq: staffMemberId },
          startTime: { $gte: startOfDay.toISOString() },
          endTime: { $lte: endOfDay.toISOString() },
          status: { $ne: 'cancelled' },
        },
        sort: [{ fieldName: 'startTime', order: 'asc' }],
      });

      const bookedSlots = result.items.map(item => ({
        start: new Date(item.data.startTime),
        end: new Date(item.data.endTime),
      }));

      // Generate available slots (9 AM - 6 PM, 30-minute intervals)
      const availableSlots = this.generateTimeSlots(date, bookedSlots);

      logger.info('Retrieved available slots', {
        instanceId,
        serviceId,
        staffMemberId,
        date,
        slotsCount: availableSlots.length,
      });

      return availableSlots;
    } catch (error) {
      logger.error('Failed to get available slots:', error);
      throw error;
    }
  }

  /**
   * Helper: Generate time slots for a day
   */
  generateTimeSlots(date, bookedSlots = []) {
    const slots = [];
    const workStart = 9; // 9 AM
    const workEnd = 18; // 6 PM
    const slotDuration = 30; // 30 minutes

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Check if slot is available (not overlapping with booked slots)
        const isAvailable = !bookedSlots.some(booked =>
          (slotStart >= booked.start && slotStart < booked.end) ||
          (slotEnd > booked.start && slotEnd <= booked.end)
        );

        if (isAvailable) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: true,
          });
        }
      }
    }

    return slots;
  }
}

export default new BookingsService();
