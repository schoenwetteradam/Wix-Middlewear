import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import config from './config/config.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

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

// Security middleware - conditionally apply Helmet based on route
app.use((req, res, next) => {
  // For install routes, use a permissive CSP that allows inline scripts
  if ((req.path === '/' && req.query.token) || req.path.startsWith('/install')) {
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for installation
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })(req, res, next);
  } else {
    // For all other routes, use strict CSP
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })(req, res, next);
  }
});

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

// Root endpoint - Handle Wix app installation or show API information
app.get('/', (req, res, next) => {
  // If there's a token parameter, this is a Wix app installation request
  if (req.query.token) {
    // Forward to installation handler
    return installRoutes(req, res, next);
  }

  // Otherwise, show API information
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
