import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import logger from '../utils/logger.js';

const router = express.Router();
const projectRoot = process.cwd();

// In-memory storage for installed instances (in production, use a database)
const installedInstances = new Map();

function sendFrontend(res) {
  const frontendPath = path.join(projectRoot, 'frontend/build/index.html');
  res.sendFile(frontendPath, (err) => {
    if (err) {
      logger.warn('Frontend build not found for install route, serving fallback HTML');
      res
        .status(200)
        .send(
          '<!DOCTYPE html><html><head><title>Wix App</title></head><body>' +
            '<h1>Wix App is running</h1>' +
            '<p>The frontend build was not found. Run <code>npm run build:frontend</code> and redeploy.</p>' +
            '</body></html>'
        );
    }
  });
}

/**
 * Wix app installation endpoint (optional - Wix handles installation automatically)
 * This endpoint is only used if Wix explicitly calls it during installation
 * Wix handles the installation flow via OAuth callback, so this is minimal
 */
const handleInstall = async (req, res) => {
  try {
    logger.info('Install endpoint called', { query: req.query });
    
    // Extract instance information if provided (for logging/debugging)
    const { instance, appInstance, token, redirectUrl, returnUrl } = req.query;
    let instanceId = instance || appInstance;
    
    // If we have a token, try to extract instance ID from it (for logging only)
    if (!instanceId && token) {
      try {
        const decodedToken = jwt.decode(token);
        if (decodedToken && typeof decodedToken === 'object') {
          instanceId = decodedToken.instanceId || decodedToken.instance || decodedToken.sub || decodedToken.app_instance_id;
        }
      } catch (error) {
        // Ignore - token might not be a JWT
      }
    }
    
    // Store instance for debugging/admin purposes (optional)
    if (instanceId) {
      installedInstances.set(instanceId, {
        instanceId,
        installedAt: new Date(),
      });
      logger.info('Instance stored', { instanceId, totalInstances: installedInstances.size });
    }

    // If Wix provided a redirect URL, send the user back to Wix to finish install
    const redirectTarget = redirectUrl || returnUrl || req.body?.redirectUrl || req.body?.returnUrl;
    if (redirectTarget) {
      logger.info('Redirecting back to Wix from install', { redirectUrl: redirectTarget });
      return res.redirect(redirectTarget);
    }
    
    // Serve the app if this URL is used as the App URL by mistake
    // This keeps the installation flow working even if /install is configured
    return sendFrontend(res);
  } catch (error) {
    logger.error('Installation endpoint error:', error);
    res.status(500).json({ error: 'Installation error', message: error.message });
  }
};

router.get('/', handleInstall);
router.post('/', handleInstall);

/**
 * Get list of installed instances (for debugging/admin purposes)
 */
router.get('/instances', (req, res) => {
  const instances = Array.from(installedInstances.values()).map(instance => ({
    instanceId: instance.instanceId,
    installedAt: instance.installedAt,
  }));

  res.json({
    totalInstances: instances.length,
    instances,
  });
});

export default router;
