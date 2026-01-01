import axios from 'axios';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Service for sending notifications (email, SMS, push)
 */
class NotificationService {
  /**
   * Send email notification
   */
  async sendEmail(to, subject, body, options = {}) {
    try {
      if (!config.notifications.email.enabled) {
        logger.warn('Email notifications are disabled');
        return { success: false, reason: 'disabled' };
      }

      // Example using SendGrid (you can replace with your provider)
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: to }],
              subject: subject,
            },
          ],
          from: { email: options.from || 'noreply@salon.com' },
          content: [
            {
              type: 'text/html',
              value: body,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${config.notifications.email.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Email sent successfully', { to, subject });
      return { success: true, messageId: response.data };
    } catch (error) {
      logger.error('Failed to send email:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(booking, contact) {
    const subject = 'Appointment Reminder - Salon';
    const body = this.generateAppointmentReminderEmail(booking, contact);

    return await this.sendEmail(contact.email, subject, body);
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(booking, contact) {
    const subject = 'Appointment Confirmed - Salon';
    const body = this.generateAppointmentConfirmationEmail(booking, contact);

    return await this.sendEmail(contact.email, subject, body);
  }

  /**
   * Send appointment cancellation email
   */
  async sendAppointmentCancellation(booking, contact) {
    const subject = 'Appointment Cancelled - Salon';
    const body = this.generateAppointmentCancellationEmail(booking, contact);

    return await this.sendEmail(contact.email, subject, body);
  }

  /**
   * Send event reminder email
   */
  async sendEventReminder(event, contact) {
    const subject = `Event Reminder: ${event.title}`;
    const body = this.generateEventReminderEmail(event, contact);

    return await this.sendEmail(contact.email, subject, body);
  }

  /**
   * Generate appointment reminder email HTML
   */
  generateAppointmentReminderEmail(booking, contact) {
    const appointmentDate = new Date(booking.startTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${contact.name?.first || 'there'},</p>
              <p>This is a friendly reminder about your upcoming appointment:</p>

              <div class="details">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Service:</strong> ${booking.serviceName || 'Salon Service'}</p>
                <p><strong>Staff:</strong> ${booking.staffMemberName || 'Our team'}</p>
              </div>

              <p>We look forward to seeing you!</p>
              <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate appointment confirmation email HTML
   */
  generateAppointmentConfirmationEmail(booking, contact) {
    const appointmentDate = new Date(booking.startTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${contact.name?.first || 'there'},</p>
              <p>Your appointment has been confirmed:</p>

              <div class="details">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Service:</strong> ${booking.serviceName || 'Salon Service'}</p>
                <p><strong>Staff:</strong> ${booking.staffMemberName || 'Our team'}</p>
              </div>

              <p>We look forward to seeing you!</p>
            </div>
            <div class="footer">
              <p>Need to make changes? Contact us anytime.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate appointment cancellation email HTML
   */
  generateAppointmentCancellationEmail(booking, contact) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${contact.name?.first || 'there'},</p>
              <p>Your appointment has been cancelled as requested.</p>
              <p>We hope to see you again soon! Feel free to book a new appointment anytime.</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us anytime.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate event reminder email HTML
   */
  generateEventReminderEmail(event, contact) {
    const eventDate = new Date(event.scheduleConfig.startDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Event Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${contact.name?.first || 'there'},</p>
              <p>Don't forget about our upcoming event:</p>

              <div class="details">
                <h2>${event.title}</h2>
                <p>${event.description || ''}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
              </div>

              <p>We're excited to see you there!</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us anytime.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send SMS notification (placeholder - integrate with Twilio, etc.)
   */
  async sendSMS(to, message) {
    try {
      if (!config.notifications.sms.enabled) {
        logger.warn('SMS notifications are disabled');
        return { success: false, reason: 'disabled' };
      }

      // TODO: Integrate with SMS provider (Twilio, etc.)
      logger.info('SMS would be sent', { to, message });

      return { success: true };
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

export default new NotificationService();
