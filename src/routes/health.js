import express from 'express';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /health/ready
 * Readiness check endpoint
 */
router.get('/ready', (req, res) => {
  // Check if all required services are available
  const isReady = true; // Add actual checks if needed

  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
