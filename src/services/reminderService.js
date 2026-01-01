import cron from 'node-cron';
import bookingsService from './bookingsService.js';
import eventsService from './eventsService.js';
import crmService from './crmService.js';
import notificationService from './notificationService.js';
import logger from '../utils/logger.js';

/**
 * Service for managing automated reminders
 */
class ReminderService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all reminder cron jobs
   */
  startReminderJobs(instanceIds = []) {
    logger.info('Starting reminder jobs');

    // Run appointment reminders every hour
    const appointmentReminderJob = cron.schedule('0 * * * *', async () => {
      logger.info('Running appointment reminder job');
      await this.sendAppointmentReminders(instanceIds);
    });

    // Run event reminders daily at 9 AM
    const eventReminderJob = cron.schedule('0 9 * * *', async () => {
      logger.info('Running event reminder job');
      await this.sendEventReminders(instanceIds);
    });

    this.jobs.push(appointmentReminderJob, eventReminderJob);
    logger.info('Reminder jobs started');
  }

  /**
   * Stop all reminder jobs
   */
  stopReminderJobs() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    logger.info('Reminder jobs stopped');
  }

  /**
   * Send appointment reminders for appointments in the next 24 hours
   */
  async sendAppointmentReminders(instanceIds) {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      for (const instanceId of instanceIds) {
        try {
          const bookings = await bookingsService.getAllBookings(instanceId, {
            startDate: now,
            endDate: tomorrow,
            status: 'CONFIRMED',
          });

          logger.info(`Found ${bookings.length} appointments to remind`, { instanceId });

          for (const booking of bookings) {
            try {
              // Get contact details
              const contact = await crmService.getContact(instanceId, booking.contactId);

              if (contact?.emails?.[0]?.email) {
                await notificationService.sendAppointmentReminder(booking, contact);
                logger.info('Appointment reminder sent', {
                  instanceId,
                  bookingId: booking.id,
                  contactEmail: contact.emails[0].email,
                });
              }
            } catch (error) {
              logger.error('Failed to send appointment reminder:', {
                instanceId,
                bookingId: booking.id,
                error: error.message,
              });
            }
          }
        } catch (error) {
          logger.error('Failed to process reminders for instance:', {
            instanceId,
            error: error.message,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to send appointment reminders:', error);
    }
  }

  /**
   * Send event reminders for events in the next 7 days
   */
  async sendEventReminders(instanceIds) {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      for (const instanceId of instanceIds) {
        try {
          const events = await eventsService.getUpcomingEvents(instanceId, {
            startDate: now,
          });

          // Filter events in the next 7 days
          const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.scheduleConfig.startDate);
            return eventDate <= nextWeek;
          });

          logger.info(`Found ${upcomingEvents.length} events to remind`, { instanceId });

          for (const event of upcomingEvents) {
            try {
              // Get event registrations
              const registrations = await eventsService.getEventRegistrations(
                instanceId,
                event.id
              );

              for (const registration of registrations) {
                try {
                  const contact = await crmService.getContact(instanceId, registration.contactId);

                  if (contact?.emails?.[0]?.email) {
                    await notificationService.sendEventReminder(event, contact);
                    logger.info('Event reminder sent', {
                      instanceId,
                      eventId: event.id,
                      contactEmail: contact.emails[0].email,
                    });
                  }
                } catch (error) {
                  logger.error('Failed to send event reminder to contact:', {
                    instanceId,
                    eventId: event.id,
                    contactId: registration.contactId,
                    error: error.message,
                  });
                }
              }
            } catch (error) {
              logger.error('Failed to send event reminders:', {
                instanceId,
                eventId: event.id,
                error: error.message,
              });
            }
          }
        } catch (error) {
          logger.error('Failed to process event reminders for instance:', {
            instanceId,
            error: error.message,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to send event reminders:', error);
    }
  }

  /**
   * Send reminder manually for a specific appointment
   */
  async sendManualAppointmentReminder(instanceId, bookingId) {
    try {
      const bookings = await bookingsService.getAllBookings(instanceId);
      const booking = bookings.find(b => b.id === bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      const contact = await crmService.getContact(instanceId, booking.contactId);

      if (!contact?.emails?.[0]?.email) {
        throw new Error('Contact email not found');
      }

      await notificationService.sendAppointmentReminder(booking, contact);

      logger.info('Manual appointment reminder sent', {
        instanceId,
        bookingId,
        contactEmail: contact.emails[0].email,
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to send manual appointment reminder:', error);
      throw error;
    }
  }
}

export default new ReminderService();
