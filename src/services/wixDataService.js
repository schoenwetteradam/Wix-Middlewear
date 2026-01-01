import axios from 'axios';
import logger from '../utils/logger.js';
import config from '../config/config.js';

/**
 * Wix Data API Service
 * Direct REST API integration with Wix Data Collections
 * Documentation: https://dev.wix.com/api/rest/wix-data/wix-data/data-items
 */

const WIX_DATA_API_BASE = 'https://www.wixapis.com/wix-data/v2';

/**
 * Creates a Wix Data API client
 */
class WixDataService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.headers = {
      'Authorization': accessToken,
      'Content-Type': 'application/json',
      'wix-site-id': config.wix.siteId || '',
    };
  }

  /**
   * Insert a new item into a collection
   * @param {string} collectionId - Collection name
   * @param {object} data - Item data
   * @returns {Promise<object>} Created item
   */
  async insert(collectionId, data) {
    try {
      const payload = {
        dataItem: {
          data: {
            ...data,
            _createdDate: new Date().toISOString(),
            _updatedDate: new Date().toISOString(),
          },
        },
      };

      const response = await axios.post(
        `${WIX_DATA_API_BASE}/collections/${collectionId}/dataItems`,
        payload,
        { headers: this.headers }
      );

      logger.debug('Item inserted into collection', { collectionId, itemId: response.data.dataItem._id });
      return response.data.dataItem;
    } catch (error) {
      logger.error('Failed to insert item', { collectionId, error: error.response?.data || error.message });
      throw new Error(`Failed to insert item: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get a single item by ID
   * @param {string} collectionId - Collection name
   * @param {string} itemId - Item ID
   * @returns {Promise<object>} Item data
   */
  async get(collectionId, itemId) {
    try {
      const response = await axios.get(
        `${WIX_DATA_API_BASE}/collections/${collectionId}/dataItems/${itemId}`,
        { headers: this.headers }
      );

      logger.debug('Item retrieved', { collectionId, itemId });
      return response.data.dataItem;
    } catch (error) {
      logger.error('Failed to get item', { collectionId, itemId, error: error.response?.data || error.message });
      throw new Error(`Failed to get item: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update an existing item
   * @param {string} collectionId - Collection name
   * @param {string} itemId - Item ID
   * @param {object} data - Updated data
   * @returns {Promise<object>} Updated item
   */
  async update(collectionId, itemId, data) {
    try {
      const payload = {
        dataItem: {
          _id: itemId,
          data: {
            ...data,
            _updatedDate: new Date().toISOString(),
          },
        },
      };

      const response = await axios.put(
        `${WIX_DATA_API_BASE}/collections/${collectionId}/dataItems/${itemId}`,
        payload,
        { headers: this.headers }
      );

      logger.debug('Item updated', { collectionId, itemId });
      return response.data.dataItem;
    } catch (error) {
      logger.error('Failed to update item', { collectionId, itemId, error: error.response?.data || error.message });
      throw new Error(`Failed to update item: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete an item
   * @param {string} collectionId - Collection name
   * @param {string} itemId - Item ID
   * @returns {Promise<void>}
   */
  async delete(collectionId, itemId) {
    try {
      await axios.delete(
        `${WIX_DATA_API_BASE}/collections/${collectionId}/dataItems/${itemId}`,
        { headers: this.headers }
      );

      logger.debug('Item deleted', { collectionId, itemId });
    } catch (error) {
      logger.error('Failed to delete item', { collectionId, itemId, error: error.response?.data || error.message });
      throw new Error(`Failed to delete item: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Query items with filters, sorting, and pagination
   * @param {string} collectionId - Collection name
   * @param {object} options - Query options
   * @param {object} options.filter - Filter object
   * @param {object} options.sort - Sort options
   * @param {number} options.skip - Number of items to skip
   * @param {number} options.limit - Number of items to return
   * @returns {Promise<object>} Query results with items and metadata
   */
  async query(collectionId, options = {}) {
    try {
      const payload = {
        query: {
          filter: options.filter || {},
          sort: options.sort || [{ fieldName: '_createdDate', order: 'desc' }],
          paging: {
            offset: options.skip || 0,
            limit: options.limit || 50,
          },
        },
      };

      const response = await axios.post(
        `${WIX_DATA_API_BASE}/collections/${collectionId}/dataItems/query`,
        payload,
        { headers: this.headers }
      );

      logger.debug('Query executed', { collectionId, count: response.data.dataItems?.length || 0 });
      return {
        items: response.data.dataItems || [],
        totalCount: response.data.totalCount || 0,
        pageSize: response.data.pageSize || 0,
      };
    } catch (error) {
      logger.error('Failed to query items', { collectionId, error: error.response?.data || error.message });
      throw new Error(`Failed to query items: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Count items matching a filter
   * @param {string} collectionId - Collection name
   * @param {object} filter - Filter object
   * @returns {Promise<number>} Count of matching items
   */
  async count(collectionId, filter = {}) {
    try {
      const result = await this.query(collectionId, { filter, limit: 0 });
      return result.totalCount;
    } catch (error) {
      logger.error('Failed to count items', { collectionId, error: error.message });
      throw error;
    }
  }

  /**
   * Bulk insert multiple items
   * @param {string} collectionId - Collection name
   * @param {Array<object>} items - Array of items to insert
   * @returns {Promise<Array<object>>} Array of created items
   */
  async bulkInsert(collectionId, items) {
    try {
      const payload = {
        dataItems: items.map(item => ({
          data: {
            ...item,
            _createdDate: new Date().toISOString(),
            _updatedDate: new Date().toISOString(),
          },
        })),
      };

      const response = await axios.post(
        `${WIX_DATA_API_BASE}/collections/${collectionId}/dataItems/bulkInsert`,
        payload,
        { headers: this.headers }
      );

      logger.debug('Bulk insert completed', { collectionId, count: items.length });
      return response.data.dataItems || [];
    } catch (error) {
      logger.error('Failed to bulk insert items', { collectionId, error: error.response?.data || error.message });
      throw new Error(`Failed to bulk insert: ${error.response?.data?.message || error.message}`);
    }
  }
}

/**
 * Factory function to create a WixDataService instance
 * @param {string} accessToken - Wix OAuth access token
 * @returns {WixDataService}
 */
export const createWixDataService = (accessToken) => {
  return new WixDataService(accessToken);
};

export default WixDataService;
