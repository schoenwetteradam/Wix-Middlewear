import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * OAuth callback endpoint
 * Called by Wix after OAuth authentication
 * Redirects to root path (/) with query parameters, which is handled by install route
 */
router.get('/callback', (req, res) => {
  logger.info('OAuth callback received', {
    query: req.query,
    path: req.path,
  });

  // Redirect to root with query parameters
  // The root route (/) handles OAuth callbacks via the install route
  const queryString = new URLSearchParams(req.query).toString();
  const redirectUrl = queryString ? `/?${queryString}` : '/';
  
  logger.info('Redirecting OAuth callback to root', { redirectUrl });
  return res.redirect(redirectUrl);
});

export default router;