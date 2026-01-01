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

const app = express();

// Security middleware
app.use(helmet());

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.use('/health', healthRoutes);

// API routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Wix webhooks and service plugins endpoint
app.use('/plugins-and-webhooks', webhookRoutes);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Widget routes - serve the standalone widget
app.get('/widget/events', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/widget-events.html'));
});

// Dashboard routes - placeholder for now
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Salon Events Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #4A90E2; }
        .status { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>🎨 Salon Events Dashboard</h1>
      <div class="status">
        <strong>✅ Backend API is running!</strong>
        <p>This is a placeholder for the full React dashboard.</p>
        <p>API endpoints are available at <code>/api/*</code></p>
      </div>
      <h3>Available Endpoints:</h3>
      <ul>
        <li><a href="/health">/health</a> - Health check</li>
        <li><a href="/widget/events">/widget/events</a> - Events Widget</li>
        <li>/api/appointments - Appointments API</li>
        <li>/api/events - Events API</li>
        <li>/api/staff - Staff API</li>
        <li>/api/dashboard/kpis - KPI Dashboard API</li>
      </ul>
    </body>
    </html>
  `);
});

app.get('/appointments', (req, res) => {
  res.send('<h1>Appointments</h1><p>Appointments view - React dashboard coming soon</p><p><a href="/">Back to home</a></p>');
});

app.get('/staff-schedule', (req, res) => {
  res.send('<h1>Staff Schedule</h1><p>Staff schedule view - React dashboard coming soon</p><p><a href="/">Back to home</a></p>');
});

app.get('/events', (req, res) => {
  res.send('<h1>Events Management</h1><p>Events management - React dashboard coming soon</p><p><a href="/">Back to home</a></p>');
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
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

export default app;
