# Salon Events & Appointments - Wix Custom App

A comprehensive Wix app for managing salon appointments, events, staff scheduling, and KPI metrics.

## Features

### 🗓️ Appointment Management
- Create, view, update, and cancel appointments
- Staff-specific appointment views
- Real-time availability checking
- Automated booking confirmations

### 📅 Event Management
- Create and manage salon events (classes, workshops, promotions)
- Event registration tracking
- Customer-facing event display widget
- Automated event reminders

### 👥 Staff Management
- Staff schedule overview
- Individual staff appointment tracking
- Performance metrics per staff member
- Service assignment

### 📊 KPI Dashboard
- Total appointments and revenue tracking
- Completion and cancellation rates
- Staff performance metrics
- Popular services analysis
- Appointments by day of week

### 🔔 Notifications & Reminders
- Automated email reminders (24 hours before appointment)
- Booking confirmation emails
- Cancellation notifications
- Event reminders
- Customizable email templates

### 🔗 Wix Integration
- Full Wix Bookings API integration
- Wix Events API integration
- Wix CRM/Contacts integration
- Wix eCommerce integration support
- OAuth authentication
- Webhooks for real-time updates

## Technology Stack

### Backend
- Node.js + Express
- Wix JavaScript SDK
- JWT authentication
- Winston logging
- Node-cron for scheduled tasks
- Axios for HTTP requests

### Frontend
- React 18
- React Router
- Axios
- date-fns for date formatting
- Recharts for data visualization

## Project Structure

```
Wix-Middlewear/
├── src/
│   ├── config/
│   │   └── config.js              # App configuration
│   ├── middleware/
│   │   ├── auth.js                # Authentication middleware
│   │   └── errorHandler.js        # Error handling
│   ├── routes/
│   │   ├── appointments.js        # Appointment endpoints
│   │   ├── events.js              # Event endpoints
│   │   ├── staff.js               # Staff endpoints
│   │   ├── dashboard.js           # Dashboard/KPI endpoints
│   │   ├── notifications.js       # Notification endpoints
│   │   ├── webhooks.js            # Wix webhook handlers
│   │   └── health.js              # Health check
│   ├── services/
│   │   ├── wixClient.js           # Wix SDK client
│   │   ├── bookingsService.js     # Bookings service
│   │   ├── eventsService.js       # Events service
│   │   ├── crmService.js          # CRM service
│   │   ├── notificationService.js # Email/SMS notifications
│   │   └── reminderService.js     # Automated reminders
│   ├── utils/
│   │   └── logger.js              # Winston logger
│   └── server.js                  # Main Express server
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js       # Main dashboard
│   │   │   ├── StaffSchedule.js   # Staff schedule view
│   │   │   ├── Appointments.js    # Appointments view
│   │   │   ├── Events.js          # Events management
│   │   │   └── EventsWidget.js    # Customer-facing widget
│   │   ├── utils/
│   │   │   └── api.js             # API client
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── logs/                          # Application logs
├── .env.example                   # Environment variables template
├── .gitignore
├── package.json
├── WIX_APP_SETUP_GUIDE.md        # Wix app configuration guide
└── DEPLOYMENT_GUIDE.md           # Deployment instructions
```

## Quick Start

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd Wix-Middlewear

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Wix app credentials
nano .env
```

Required environment variables:
```bash
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
WIX_PUBLIC_KEY="your-public-key-from-wix-dashboard"
PORT=3000
NODE_ENV=development
```

### 3. Create Logs Directory

```bash
mkdir -p logs
```

### 4. Run Development Server

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

Backend runs on: http://localhost:3000
Frontend runs on: http://localhost:3001

## API Documentation

### Health Check
```
GET /health
```

### Appointments
```
GET    /api/appointments                    # Get all appointments
POST   /api/appointments                    # Create appointment
PUT    /api/appointments/:id/status         # Update status
DELETE /api/appointments/:id                # Cancel appointment
GET    /api/appointments/staff/:staffId     # Get staff appointments
GET    /api/appointments/availability       # Check availability
```

### Events
```
GET    /api/events                          # Get all events
POST   /api/events                          # Create event
PUT    /api/events/:id                      # Update event
DELETE /api/events/:id                      # Delete event
GET    /api/events/:id/registrations        # Get registrations
```

### Staff
```
GET    /api/staff                           # Get all staff
GET    /api/staff/:id/appointments          # Get staff appointments
GET    /api/staff/services                  # Get all services
```

### Dashboard
```
GET    /api/dashboard/kpis                  # Get KPI metrics
GET    /api/dashboard/upcoming              # Get upcoming items
GET    /api/dashboard/staff-overview        # Staff overview
```

### Notifications
```
POST   /api/notifications/send-reminder     # Send manual reminder
POST   /api/notifications/test-email        # Test email
```

## Wix App Setup

See [WIX_APP_SETUP_GUIDE.md](./WIX_APP_SETUP_GUIDE.md) for detailed instructions on:
- Creating your Wix app
- Configuring OAuth
- Setting up permissions
- Configuring webhooks
- Adding dashboard extensions
- Adding site widgets

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment instructions including:
- Heroku deployment
- AWS EC2 deployment
- DigitalOcean deployment
- Docker deployment
- SSL configuration
- Production best practices

## Configuration

### Wix Credentials

Your Wix app credentials:
- **App ID:** `a88e57a2-8663-43a0-954a-1d669869b8bb`
- **App Secret:** `641a5b63-f3b1-40c6-8b45-d7e14d54f8f0`

Retrieve your public key from your Wix app dashboard (Build → OAuth).

### Email Notifications

Configure email provider in `.env`:

```bash
ENABLE_EMAIL_NOTIFICATIONS=true
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
```

Supported providers:
- SendGrid (default)
- Add others by modifying `src/services/notificationService.js`

### Reminder Schedule

Automated reminders run on a cron schedule:
- **Appointment reminders:** Every hour (for appointments in next 24 hours)
- **Event reminders:** Daily at 9 AM (for events in next 7 days)

Modify schedules in `src/services/reminderService.js`.

## Features in Detail

### KPI Metrics Calculated
- Total appointments (filtered by date range)
- Completed appointments
- Cancelled appointments
- Pending appointments
- Total revenue
- Staff performance (appointments + revenue per staff member)
- Appointments by day of week
- Popular services

### Notification Types
1. **Appointment Confirmation** - Sent when booking is created
2. **Appointment Reminder** - Sent 24 hours before appointment
3. **Appointment Cancellation** - Sent when booking is cancelled
4. **Event Reminder** - Sent for events in next 7 days

### Webhooks Handled
- `bookings/booking-created` - Triggers confirmation email
- `bookings/booking-cancelled` - Triggers cancellation email
- `events/event-created` - Logs event creation

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building Frontend

```bash
cd frontend
npm run build
```

## Security

- JWT authentication for API endpoints
- Wix JWT validation with public key
- CORS configuration
- Helmet.js for security headers
- Environment variable protection
- Input validation with Joi

## Monitoring

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output (development)

Log levels: error, warn, info, debug

## Troubleshooting

### Common Issues

**"Invalid authorization token"**
- Verify `WIX_PUBLIC_KEY` in `.env` matches Wix dashboard
- Ensure public key format is correct (including BEGIN/END markers)

**Webhooks not received**
- Verify webhook URLs in Wix dashboard
- Check server is publicly accessible via HTTPS
- Review `logs/combined.log` for incoming requests

**CORS errors**
- Add your Wix site domain to `ALLOWED_ORIGINS` in `.env`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Support

For issues or questions:
- Check [WIX_APP_SETUP_GUIDE.md](./WIX_APP_SETUP_GUIDE.md)
- Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Check application logs in `logs/`
- Contact: [your-email@domain.com]

## Roadmap

Future enhancements:
- [ ] SMS notifications via Twilio
- [ ] Advanced analytics dashboard
- [ ] Inventory management integration
- [ ] Customer loyalty program
- [ ] Multi-location support
- [ ] Mobile app
- [ ] Advanced reporting (PDF exports)
- [ ] Integration with more Wix services
- [ ] AI-powered scheduling optimization

---

**Built with ❤️ for salon businesses using Wix**