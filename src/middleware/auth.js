import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Validates JWT tokens from Wix requests
 * Handles tokens from:
 * - Frontend calls (site visitor/member tokens via fetchWithAuth)
 * - Webhook requests (verified separately in webhooks.js)
 * - OAuth callbacks
 */
export const validateWixJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('No authorization header provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Extract token (handle both "Bearer <token>" and just "<token>" formats)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    if (!token) {
      logger.warn('No authorization token provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!config.wix.publicKey) {
      logger.error('WIX_PUBLIC_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify JWT signature using Wix public key
    // Note: Frontend tokens from fetchWithAuth are signed by Wix and should verify
    const decoded = jwt.verify(token, config.wix.publicKey, {
      algorithms: ['RS256'],
    });

    // Extract instanceId from token
    // InstanceId can be in various locations depending on token type
    const instanceId = 
      decoded.instanceId ||
      decoded.data?.metadata?.instanceId ||
      decoded.data?.instanceId ||
      decoded.sub ||
      decoded.app_instance_id;

    // Attach decoded token to request
    req.wixAuth = decoded;
    req.instanceId = instanceId;

    if (!instanceId) {
      logger.warn('Could not extract instanceId from token', {
        tokenKeys: Object.keys(decoded),
        hasData: !!decoded.data
      });
      // Some endpoints might work without instanceId, but log for debugging
    }

    logger.debug('JWT validated successfully', { 
      instanceId: req.instanceId,
      hasInstanceId: !!req.instanceId
    });
    next();
  } catch (error) {
    logger.error('JWT validation failed:', error);
    return res.status(401).json({ 
      error: 'Invalid authorization token',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validates internal API keys for inter-service communication
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // In production, validate against stored API keys
  // For now, just check it exists
  next();
};

/**
 * Checks if user has required permissions
 */
export const checkPermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    const userPermissions = req.wixAuth?.data?.metadata?.permissions || [];

    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn('Insufficient permissions', {
        required: requiredPermissions,
        user: userPermissions
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
