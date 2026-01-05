import { createWixDataService } from './wixDataService.js';
import { getAppAccessToken } from './wixClient.js';
import logger from '../utils/logger.js';

const EVENTS_COLLECTION = 'SalonEvents';
const REGISTRATIONS_COLLECTION = 'SalonEventRegistrations';

/**
 * Service for managing Salon Events using Wix Data Collections
 */
class EventsService {
  /**
   * Get data service instance
   */
  async getDataService(instanceId) {
    try {
      const accessToken = await getAppAccessToken();
      return createWixDataService(accessToken);
    } catch (error) {
      logger.warn('Failed to get Wix data service, returning empty data', { error: error.message, instanceId });
      // Return a stub service that returns empty data
      return {
        query: async () => ({ items: [], totalCount: 0 }),
        insert: async () => ({ data: { _id: 'stub', data: {} } }),
        update: async () => ({ data: { _id: 'stub', data: {} } }),
        delete: async () => ({ data: {} }),
      };
    }
  }

  /**
   * Get all upcoming events for a site
   */
  async getUpcomingEvents(instanceId, options = {}) {
    try {
      const dataService = await this.getDataService(instanceId);

      const { limit = 50, offset = 0, startDate = new Date() } = options;

      // If dataService is a stub (no credentials), return empty array
      if (!dataService.query || typeof dataService.query !== 'function') {
        logger.warn('Wix credentials not configured, returning empty events', { instanceId });
        return [];
      }

      const result = await dataService.query(EVENTS_COLLECTION, {
        filter: {
          startTime: { $gte: startDate.toISOString() },
          status: { $eq: 'published' },
        },
        sort: [{ fieldName: 'startTime', order: 'asc' }],
        skip: offset,
        limit,
      });

      logger.info('Retrieved upcoming events', {
        instanceId,
        count: result.items.length,
      });

      return result.items.map(item => item.data);
    } catch (error) {
      logger.error('Failed to get upcoming events:', error);
      return [];
    }
  }

  /**
   * Create a new event
   */
  async createEvent(instanceId, eventData) {
    try {
      const dataService = await this.getDataService(instanceId);

      const event = {
        title: eventData.title,
        description: eventData.description,
        eventType: eventData.eventType || 'special_event',
        startTime: eventData.startDate || eventData.startTime,
        endTime: eventData.endDate || eventData.endTime,
        location: eventData.location || '',
        capacity: eventData.capacity || 0,
        registeredCount: 0,
        price: eventData.price || 0,
        imageUrl: eventData.imageUrl || '',
        status: eventData.status || 'published',
        isPublic: eventData.isPublic !== false,
        createdBy: eventData.createdBy || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdEvent = await dataService.insert(EVENTS_COLLECTION, event);

      logger.info('Event created', {
        instanceId,
        eventId: createdEvent.data._id,
        title: eventData.title,
      });

      return createdEvent.data;
    } catch (error) {
      logger.error('Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(instanceId, eventId, eventData) {
    try {
      const dataService = await this.getDataService(instanceId);

      const updateData = {
        ...eventData,
        updatedAt: new Date().toISOString(),
      };

      const event = await dataService.update(EVENTS_COLLECTION, eventId, updateData);

      logger.info('Event updated', { instanceId, eventId });
      return event.data;
    } catch (error) {
      logger.error('Failed to update event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(instanceId, eventId) {
    try {
      const dataService = await this.getDataService(instanceId);

      await dataService.delete(EVENTS_COLLECTION, eventId);

      logger.info('Event deleted', { instanceId, eventId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete event:', error);
      throw error;
    }
  }

  /**
   * Get event registrations
   */
  async getEventRegistrations(instanceId, eventId) {
    try {
      const dataService = await this.getDataService(instanceId);

      const result = await dataService.query(REGISTRATIONS_COLLECTION, {
        filter: { eventId: { $eq: eventId } },
        sort: [{ fieldName: 'registrationDate', order: 'desc' }],
      });

      logger.info('Retrieved event registrations', {
        instanceId,
        eventId,
        count: result.items.length,
      });

      return result.items.map(item => item.data);
    } catch (error) {
      logger.error('Failed to get event registrations:', error);
      return [];
    }
  }

  /**
   * Register a customer for an event
   */
  async registerForEvent(instanceId, eventId, registrationData) {
    try {
      const dataService = await this.getDataService(instanceId);

      // Check event capacity
      const event = await dataService.get(EVENTS_COLLECTION, eventId);
      if (event.data.capacity > 0 && event.data.registeredCount >= event.data.capacity) {
        throw new Error('Event is at full capacity');
      }

      // Create registration
      const registration = {
        eventId,
        customerId: registrationData.customerId,
        customerName: registrationData.customerName,
        customerEmail: registrationData.customerEmail,
        customerPhone: registrationData.customerPhone || '',
        registrationDate: new Date().toISOString(),
        status: 'registered',
        notes: registrationData.notes || '',
        createdAt: new Date().toISOString(),
      };

      const createdRegistration = await dataService.insert(REGISTRATIONS_COLLECTION, registration);

      // Update event registered count
      await dataService.update(EVENTS_COLLECTION, eventId, {
        registeredCount: (event.data.registeredCount || 0) + 1,
      });

      logger.info('Event registration created', {
        instanceId,
        eventId,
        customerId: registrationData.customerId,
      });

      return createdRegistration.data;
    } catch (error) {
      logger.error('Failed to register for event:', error);
      throw error;
    }
  }

  /**
   * Cancel an event registration
   */
  async cancelRegistration(instanceId, registrationId) {
    try {
      const dataService = await this.getDataService(instanceId);

      const registration = await dataService.get(REGISTRATIONS_COLLECTION, registrationId);
      const eventId = registration.data.eventId;

      // Update registration status
      await dataService.update(REGISTRATIONS_COLLECTION, registrationId, {
        status: 'cancelled',
      });

      // Decrease event registered count
      const event = await dataService.get(EVENTS_COLLECTION, eventId);
      await dataService.update(EVENTS_COLLECTION, eventId, {
        registeredCount: Math.max(0, (event.data.registeredCount || 1) - 1),
      });

      logger.info('Event registration cancelled', {
        instanceId,
        registrationId,
        eventId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel registration:', error);
      throw error;
    }
  }
}

export default new EventsService();
