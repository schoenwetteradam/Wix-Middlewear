import createWixClient from './wixClient.js';
import logger from '../utils/logger.js';

/**
 * Service for managing Wix CRM/Contacts
 */
class CRMService {
  /**
   * Get contact by ID
   */
  async getContact(instanceId, contactId) {
    try {
      const wixClient = await createWixClient(instanceId);

      const contact = await wixClient.contacts.getContact({ contactId });

      logger.info('Retrieved contact', { instanceId, contactId });
      return contact;
    } catch (error) {
      logger.error('Failed to get contact:', error);
      throw error;
    }
  }

  /**
   * Create a new contact
   */
  async createContact(instanceId, contactData) {
    try {
      const wixClient = await createWixClient(instanceId);

      const contact = await wixClient.contacts.createContact({
        contact: {
          name: {
            first: contactData.firstName,
            last: contactData.lastName,
          },
          emails: contactData.email ? [{ email: contactData.email, tag: 'main' }] : [],
          phones: contactData.phone ? [{ phone: contactData.phone, tag: 'mobile' }] : [],
          addresses: contactData.address ? [contactData.address] : [],
          customFields: contactData.customFields || {},
        },
      });

      logger.info('Contact created', {
        instanceId,
        contactId: contact.id,
        email: contactData.email,
      });

      return contact;
    } catch (error) {
      logger.error('Failed to create contact:', error);
      throw error;
    }
  }

  /**
   * Update contact
   */
  async updateContact(instanceId, contactId, contactData) {
    try {
      const wixClient = await createWixClient(instanceId);

      const contact = await wixClient.contacts.updateContact({
        contactId,
        contact: contactData,
      });

      logger.info('Contact updated', { instanceId, contactId });
      return contact;
    } catch (error) {
      logger.error('Failed to update contact:', error);
      throw error;
    }
  }

  /**
   * Query contacts
   */
  async queryContacts(instanceId, options = {}) {
    try {
      const wixClient = await createWixClient(instanceId);

      const { filter = {}, limit = 50, offset = 0 } = options;

      const response = await wixClient.contacts.queryContacts({
        filter,
        paging: { limit, offset },
      });

      logger.info('Queried contacts', {
        instanceId,
        count: response.contacts?.length || 0,
      });

      return response.contacts || [];
    } catch (error) {
      logger.error('Failed to query contacts:', error);
      throw error;
    }
  }

  /**
   * Search contacts by email or phone
   */
  async searchContacts(instanceId, searchTerm) {
    try {
      const wixClient = await createWixClient(instanceId);

      const response = await wixClient.contacts.queryContacts({
        filter: {
          $or: [
            { 'emails.email': { $contains: searchTerm } },
            { 'phones.phone': { $contains: searchTerm } },
            { 'name.first': { $contains: searchTerm } },
            { 'name.last': { $contains: searchTerm } },
          ],
        },
        paging: { limit: 20 },
      });

      logger.info('Searched contacts', {
        instanceId,
        searchTerm,
        count: response.contacts?.length || 0,
      });

      return response.contacts || [];
    } catch (error) {
      logger.error('Failed to search contacts:', error);
      throw error;
    }
  }

  /**
   * Get contact labels (for segmentation)
   */
  async getContactLabels(instanceId) {
    try {
      const wixClient = await createWixClient(instanceId);

      const response = await wixClient.contacts.queryLabels({
        paging: { limit: 100 },
      });

      logger.info('Retrieved contact labels', {
        instanceId,
        count: response.labels?.length || 0,
      });

      return response.labels || [];
    } catch (error) {
      logger.error('Failed to get contact labels:', error);
      throw error;
    }
  }

  /**
   * Add label to contact
   */
  async addLabelToContact(instanceId, contactId, labelId) {
    try {
      const wixClient = await createWixClient(instanceId);

      await wixClient.contacts.labelContact({
        contactId,
        labelId,
      });

      logger.info('Label added to contact', { instanceId, contactId, labelId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to add label to contact:', error);
      throw error;
    }
  }
}

export default new CRMService();
