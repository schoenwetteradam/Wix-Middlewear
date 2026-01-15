import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * OAuth callback endpoint
 * Called by Wix after OAuth authentication during app installation
 * Wix handles the installation flow automatically - this endpoint just acknowledges receipt
 */
router.get('/callback', (req, res) => {
  logger.info('OAuth callback received', {
    query: req.query,
    path: req.path,
  });

  // Extract authorization code if present (for logging)
  const { code, instance, appInstance, redirectUrl } = req.query;
  
  // Log the callback for debugging
  if (code) {
    logger.info('OAuth authorization code received', { 
      hasCode: !!code,
      instance: instance || appInstance,
      hasRedirectUrl: !!redirectUrl 
    });
  }

  // If Wix provided a redirectUrl, redirect back to Wix
  // This allows Wix to complete the installation flow
  if (redirectUrl) {
    logger.info('Redirecting back to Wix', { redirectUrl });
    return res.redirect(redirectUrl);
  }

  // Otherwise, return minimal success response
  // Wix will handle the rest of the installation flow
  res.status(200).send('<!DOCTYPE html><html><head><title>OAuth Callback</title></head><body><p>OAuth callback received. Wix will complete the installation.</p></body></html>');
});

export default router;