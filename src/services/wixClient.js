import { createClient } from '@wix/sdk';
import { events } from '@wix/events';
import { services } from '@wix/bookings';
import { contacts } from '@wix/crm';
import { products } from '@wix/stores';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import axios from 'axios';

/**
 * Creates a Wix SDK client with elevated app permissions
 */
export const createWixClient = async (instanceId = null) => {
  try {
    let accessToken;

    if (instanceId) {
      // Get elevated access token for the instance
      accessToken = await getElevatedAccessToken(instanceId);
    } else {
      // Get app-level access token
      accessToken = await getAppAccessToken();
    }

    const wixClient = createClient({
      auth: accessToken,
      modules: {
        events,
        services,
        contacts,
        products,
      },
    });

    logger.debug('Wix client created successfully', { instanceId });
    return wixClient;
  } catch (error) {
    logger.error('Failed to create Wix client:', error);
    throw error;
  }
};

/**
 * Gets an app-level access token using client credentials
 */
export const getAppAccessToken = async () => {
  try {
    const response = await axios.post(config.wixOAuth.tokenEndpoint, {
      grant_type: 'client_credentials',
      client_id: config.wix.appId,
      client_secret: config.wix.appSecret,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.debug('App access token obtained');
    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to get app access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Wix');
  }
};

/**
 * Gets an elevated access token for a specific instance
 */
export const getElevatedAccessToken = async (instanceId) => {
  try {
    const response = await axios.post(config.wixOAuth.tokenEndpoint, {
      grant_type: 'client_credentials',
      client_id: config.wix.appId,
      client_secret: config.wix.appSecret,
      instance_id: instanceId,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.debug('Elevated access token obtained', { instanceId });
    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to get elevated access token:', error.response?.data || error.message);
    throw new Error('Failed to get elevated permissions');
  }
};

/**
 * Validates and extracts instance ID from access token
 */
export const getInstanceIdFromToken = async (accessToken) => {
  try {
    const response = await axios.post(config.wixOAuth.tokenInfoEndpoint, {
      token: accessToken,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.instanceId;
  } catch (error) {
    logger.error('Failed to get instance ID from token:', error);
    throw new Error('Invalid access token');
  }
};

export default createWixClient;
