import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import appointmentRoutes from './routes/appointments.js';
import eventsRoutes from './routes/events.js';
import staffRoutes from './routes/staff.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import webhookRoutes from './routes/webhooks.js';
import healthRoutes from './routes/health.js';
import installRoutes from './routes/install.js';

const app = express();

// Security middleware - apply Helmet with permissive CSP for all routes
// This is safe since we control all content and need inline scripts for installation
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts (needed for installation page)
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Body parsing middleware
// Note: Webhook routes use express.text() to preserve raw body for JWT verification
app.use('/plugins-and-webhooks', express.text({ type: '*/*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root endpoint - Handle Wix app installation or serve React app
app.get('/', (req, res, next) => {
  // If there's a token, instance, appInstance, or code parameter, this is a Wix app installation request
  if (req.query.token || req.query.instance || req.query.appInstance || req.query.code) {
    // Forward to installation handler
    return installRoutes(req, res, next);
  }

  // Otherwise, serve the React frontend
  const frontendPath = path.join(__dirname, '../../frontend/build/index.html');
  res.sendFile(frontendPath, (err) => {
    if (err) {
      // If build doesn't exist, fall back to API info
      logger.warn('Frontend build not found, serving API info');
      res.json({
        service: 'Salon Events Wix App API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          appointments: '/api/appointments',
          events: '/api/events',
          staff: '/api/staff',
          dashboard: '/api/dashboard',
          notifications: '/api/notifications',
          webhooks: '/plugins-and-webhooks',
          install: '/?token=<installation_token>',
        },
        note: 'Frontend build not found. Run "npm run build:frontend" to build the React app.',
      });
    }
  });
});

// Health check endpoint
app.use('/health', healthRoutes);

// Installation routes (for admin/debugging)
app.use('/install', installRoutes);

// API routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Wix webhooks and service plugins endpoint
app.use('/plugins-and-webhooks', webhookRoutes);

// Serve static files from React frontend build (if it exists)
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendBuildPath));

// Catch-all handler: serve React app for client-side routing
// This must come after API routes but before 404 handler
app.get('*', (req, res, next) => {
  // Skip if this is an API route or special route
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/plugins-and-webhooks') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/install')) {
    return next(); // Let it fall through to 404 handler
  }

  // Serve React app for all other routes (client-side routing)
  const frontendPath = path.join(__dirname, '../../frontend/build/index.html');
  res.sendFile(frontendPath, (err) => {
    if (err) {
      logger.warn(`Frontend file not found for ${req.path}:`, err.message);
      next(); // Fall through to 404 handler
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server only when not running as serverless function (Vercel)
// Vercel sets VERCEL env variable, so we check for its absence
if (!process.env.VERCEL) {
  const PORT = config.server.port;

  app.listen(PORT, () => {
    logger.info(`🚀 Salon Events Wix App server running on port ${PORT}`);
    logger.info(`📍 Environment: ${config.server.env}`);
    logger.info(`🔗 Base URL: ${config.server.baseUrl}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
  });
}

export default app;
