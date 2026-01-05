import config from '../config/config.js';
import logger from '../utils/logger.js';
import axios from 'axios';

/**
 * Creates a Wix SDK client with elevated app permissions
 * NOTE: Wix SDK packages removed due to private registry dependencies
 * This is a stub implementation that should be replaced with actual Wix SDK when available
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

    // Stub implementation - replace with actual Wix SDK client
    const wixClient = {
      auth: accessToken,
      events: {},
      services: {},
      contacts: {},
      products: {},
    };

    logger.debug('Wix client stub created successfully', { instanceId });
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
  // Check if credentials are configured
  if (!config.wix.appId || !config.wix.appSecret) {
    logger.warn('Wix credentials not configured (WIX_APP_ID or WIX_APP_SECRET missing)');
    throw new Error('Wix credentials not configured');
  }

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
