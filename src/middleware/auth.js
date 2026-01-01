import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Validates JWT tokens from Wix requests
 */
export const validateWixJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('No authorization token provided');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Verify JWT signature using Wix public key
    const decoded = jwt.verify(token, config.wix.publicKey, {
      algorithms: ['RS256'],
      audience: config.wix.appId,
      issuer: 'wix.com',
    });

    // Attach decoded token to request
    req.wixAuth = decoded;
    req.instanceId = decoded.data?.metadata?.instanceId;

    logger.debug('JWT validated successfully', { instanceId: req.instanceId });
    next();
  } catch (error) {
    logger.error('JWT validation failed:', error);
    return res.status(401).json({ error: 'Invalid authorization token' });
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
