import createWixClient from './wixClient.js';
import logger from '../utils/logger.js';

/**
 * Service for managing Wix Events
 */
class EventsService {
  /**
   * Get all upcoming events for a site
   */
  async getUpcomingEvents(instanceId, options = {}) {
    try {
      const wixClient = await createWixClient(instanceId);

      const { limit = 50, offset = 0, startDate = new Date() } = options;

      const response = await wixClient.events.queryEvents({
        filter: {
          startDate: { $gte: startDate.toISOString() },
          status: 'SCHEDULED',
        },
        sort: { startDate: 'asc' },
        paging: { limit, offset },
      });

      logger.info('Retrieved upcoming events', {
        instanceId,
        count: response.events?.length || 0,
      });

      return response.events || [];
    } catch (error) {
      logger.error('Failed to get upcoming events:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(instanceId, eventData) {
    try {
      const wixClient = await createWixClient(instanceId);

      const event = await wixClient.events.createEvent({
        event: {
          title: eventData.title,
          description: eventData.description,
          scheduleConfig: {
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            timeZone: eventData.timeZone || 'America/New_York',
          },
          location: eventData.location,
          categories: eventData.categories || ['SALON_EVENT'],
          guestsCanInvite: eventData.guestsCanInvite || false,
          registration: {
            type: eventData.requiresRegistration ? 'RSVP' : 'NONE',
            externalUrl: eventData.registrationUrl,
          },
        },
      });

      logger.info('Event created', {
        instanceId,
        eventId: event.id,
        title: eventData.title,
      });

      return event;
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
      const wixClient = await createWixClient(instanceId);

      const event = await wixClient.events.updateEvent({
        eventId,
        event: eventData,
      });

      logger.info('Event updated', { instanceId, eventId });
      return event;
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
      const wixClient = await createWixClient(instanceId);

      await wixClient.events.deleteEvent({ eventId });

      logger.info('Event deleted', { instanceId, eventId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete event:', error);
      throw error;
    }
  }

  /**
   * Get event registrations/RSVPs
   */
  async getEventRegistrations(instanceId, eventId) {
    try {
      const wixClient = await createWixClient(instanceId);

      const response = await wixClient.events.queryRsvps({
        filter: { eventId },
      });

      logger.info('Retrieved event registrations', {
        instanceId,
        eventId,
        count: response.rsvps?.length || 0,
      });

      return response.rsvps || [];
    } catch (error) {
      logger.error('Failed to get event registrations:', error);
      throw error;
    }
  }
}

export default new EventsService();
