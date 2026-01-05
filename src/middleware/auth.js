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
    
    // In development, allow requests without auth for testing
    if (!authHeader && process.env.NODE_ENV === 'development') {
      logger.warn('No authorization header provided (development mode - allowing request)');
      req.wixAuth = null;
      req.instanceId = null;
      return next();
    }
    
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

    // If no public key configured, try to decode without verification (development only)
    if (!config.wix.publicKey) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('WIX_PUBLIC_KEY not configured - decoding token without verification (development only)');
        try {
          const decoded = jwt.decode(token);
          if (decoded) {
            req.wixAuth = decoded;
            req.instanceId = decoded.instanceId || decoded.sub || decoded.app_instance_id;
            return next();
          }
        } catch (decodeError) {
          logger.error('Failed to decode token:', decodeError);
        }
      }
      logger.error('WIX_PUBLIC_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
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
    } catch (verifyError) {
      // In development, try to decode without verification for debugging
      if (process.env.NODE_ENV === 'development') {
        logger.warn('JWT verification failed, attempting decode without verification (development only):', verifyError.message);
        try {
          const decoded = jwt.decode(token);
          if (decoded) {
            req.wixAuth = decoded;
            req.instanceId = decoded.instanceId || decoded.sub || decoded.app_instance_id;
            logger.warn('Using unverified token (development only)');
            return next();
          }
        } catch (decodeError) {
          // Fall through to error response
        }
      }
      
      logger.error('JWT validation failed:', verifyError);
      return res.status(401).json({ 
        error: 'Invalid authorization token',
        message: process.env.NODE_ENV === 'development' ? verifyError.message : undefined
      });
    }
  } catch (error) {
    logger.error('Unexpected error in JWT validation:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
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
