import createWixClient from './wixClient.js';
import logger from '../utils/logger.js';

/**
 * Service for managing Wix Bookings/Appointments
 */
class BookingsService {
  /**
   * Get all services (appointment types)
   */
  async getServices(instanceId) {
    try {
      const wixClient = await createWixClient(instanceId);

      const response = await wixClient.services.queryServices({
        paging: { limit: 100 },
      });

      logger.info('Retrieved booking services', {
        instanceId,
        count: response.services?.length || 0,
      });

      return response.services || [];
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
      const wixClient = await createWixClient(instanceId);

      const booking = await wixClient.services.createBooking({
        booking: {
          serviceId: bookingData.serviceId,
          staffMemberId: bookingData.staffMemberId,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          contactId: bookingData.contactId,
          formInfo: {
            additionalFields: bookingData.additionalFields || [],
          },
          numberOfParticipants: bookingData.numberOfParticipants || 1,
        },
      });

      logger.info('Booking created', {
        instanceId,
        bookingId: booking.id,
        serviceId: bookingData.serviceId,
        staffMemberId: bookingData.staffMemberId,
      });

      return booking;
    } catch (error) {
      logger.error('Failed to create booking:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific staff member
   */
  async getStaffBookings(instanceId, staffMemberId, options = {}) {
    try {
      const wixClient = await createWixClient(instanceId);

      const { startDate, endDate, status } = options;

      const filter = {
        staffMemberId,
      };

      if (startDate) {
        filter.startTime = { $gte: startDate };
      }

      if (endDate) {
        filter.endTime = { $lte: endDate };
      }

      if (status) {
        filter.status = status;
      }

      const response = await wixClient.services.queryBookings({
        filter,
        sort: { startTime: 'asc' },
      });

      logger.info('Retrieved staff bookings', {
        instanceId,
        staffMemberId,
        count: response.bookings?.length || 0,
      });

      return response.bookings || [];
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
      const wixClient = await createWixClient(instanceId);

      const { startDate, endDate, status, limit = 100, offset = 0 } = options;

      const filter = {};

      if (startDate) {
        filter.startTime = { $gte: startDate };
      }

      if (endDate) {
        filter.endTime = { $lte: endDate };
      }

      if (status) {
        filter.status = status;
      }

      const response = await wixClient.services.queryBookings({
        filter,
        sort: { startTime: 'asc' },
        paging: { limit, offset },
      });

      logger.info('Retrieved all bookings', {
        instanceId,
        count: response.bookings?.length || 0,
      });

      return response.bookings || [];
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
      const wixClient = await createWixClient(instanceId);

      const booking = await wixClient.services.updateBooking({
        bookingId,
        booking: { status },
      });

      logger.info('Booking status updated', {
        instanceId,
        bookingId,
        status,
      });

      return booking;
    } catch (error) {
      logger.error('Failed to update booking status:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(instanceId, bookingId) {
    try {
      const wixClient = await createWixClient(instanceId);

      await wixClient.services.cancelBooking({ bookingId });

      logger.info('Booking cancelled', { instanceId, bookingId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel booking:', error);
      throw error;
    }
  }

  /**
   * Get staff members
   */
  async getStaffMembers(instanceId) {
    try {
      const wixClient = await createWixClient(instanceId);

      const response = await wixClient.services.queryStaffMembers({
        paging: { limit: 100 },
      });

      logger.info('Retrieved staff members', {
        instanceId,
        count: response.staffMembers?.length || 0,
      });

      return response.staffMembers || [];
    } catch (error) {
      logger.error('Failed to get staff members:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a service and staff member
   */
  async getAvailableSlots(instanceId, serviceId, staffMemberId, date) {
    try {
      const wixClient = await createWixClient(instanceId);

      const response = await wixClient.services.queryAvailability({
        serviceId,
        staffMemberId,
        startDate: date,
        endDate: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000), // Next day
      });

      logger.info('Retrieved available slots', {
        instanceId,
        serviceId,
        staffMemberId,
        date,
        slotsCount: response.slots?.length || 0,
      });

      return response.slots || [];
    } catch (error) {
      logger.error('Failed to get available slots:', error);
      throw error;
    }
  }
}

export default new BookingsService();
