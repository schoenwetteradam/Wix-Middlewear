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

// Get project root directory (works in both local and Vercel environments)
const projectRoot = process.cwd();

// Import routes
import appointmentRoutes from './routes/appointments.js';
import eventsRoutes from './routes/events.js';
import staffRoutes from './routes/staff.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import webhookRoutes from './routes/webhooks.js';
import healthRoutes from './routes/health.js';
import installRoutes from './routes/install.js';
import authRoutes from './routes/auth.js';

const app = express();

// Security middleware - apply Helmet with permissive CSP for all routes
// This is safe since we control all content and need inline scripts for installation
app.use(helmet({
  frameguard: false, // Wix embeds the app in an iframe
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
      frameAncestors: ["'self'", "https://*.wix.com", "https://*.wixsite.com", "https://manage.wix.com"],
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
app.use((req, res, next) => {
  if (req.path.startsWith('/plugins-and-webhooks')) {
    return next();
  }
  return bodyParser.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/plugins-and-webhooks')) {
    return next();
  }
  return bodyParser.urlencoded({ extended: true })(req, res, next);
});

// Root endpoint - Always serve React app
// Wix handles installation automatically via OAuth callback
app.get('/', (req, res, next) => {
  // Serve the React frontend
  const frontendPath = path.join(projectRoot, 'frontend/build/index.html');
  res.sendFile(frontendPath, (err) => {
    if (err) {
      // If build doesn't exist, return a minimal HTML page so Wix can render it
      logger.warn('Frontend build not found, serving fallback HTML');
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
});

// Health check endpoint
app.use('/health', healthRoutes);

// Installation routes (optional - Wix handles installation automatically)
// Only used if Wix explicitly calls this endpoint
app.use('/install', installRoutes);

// OAuth authentication routes
app.use('/auth', authRoutes);

// API routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Wix webhooks and service plugins endpoint
app.use('/plugins-and-webhooks', webhookRoutes);

// Serve static files from React frontend build (if it exists)
const frontendBuildPath = path.join(projectRoot, 'frontend/build');
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
  const frontendPath = path.join(projectRoot, 'frontend/build/index.html');
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
