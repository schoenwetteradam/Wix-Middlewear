# Salon Events & Appointments - Wix Custom App

A comprehensive Wix app for managing salon appointments, events, and staff scheduling with **Wix Data Collections** storage and **Vercel** deployment.

## 🚀 Quick Start

**New to this project?** Follow our step-by-step guide:

👉 **[COMPLETE SETUP GUIDE](./COMPLETE_SETUP_GUIDE.md)** 👈

This guide walks you through:
1. Creating your Wix Custom App (10 min)
2. Setting up Wix Data Collections (15 min)
3. Deploying to Vercel (10 min)
4. Connecting everything together (5 min)

---

## ⚡ What This App Does

Your app integrates with Wix to provide:
- **Appointment Management** - Book and manage salon appointments
- **Event Management** - Create workshops, classes, and promotions
- **Staff Scheduling** - Manage staff calendars and availability
- **Real-time Data** - All data stored in Wix Data Collections
- **Scalable Hosting** - Deployed on Vercel (serverless)

---

## 📦 What's Included

### Database (Wix Data Collections)
- ✅ **No external database needed**
- ✅ Uses Wix's built-in Data Collections
- ✅ Auto-scaling and real-time updates
- ✅ Data isolated per Wix site

### Backend (Node.js + Express)
- REST API for appointments and events
- Direct integration with Wix Data API
- JWT authentication
- Automated reminders and notifications

### Frontend (React)
- Dashboard for salon owners
- Staff schedule view
- Appointment management interface
- Event creation and registration

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Wix Site      │
│  (Your Salon)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────────┐
│  Vercel App     │◄────►│ Wix Data         │
│  (This Code)    │      │ Collections      │
└─────────────────┘      └──────────────────┘
         │
         ↓
    ┌────────┐
    │ Users  │
    └────────┘
```

**How it works:**
1. Your Wix site users interact with the app
2. App (hosted on Vercel) processes requests
3. Data is stored/retrieved from Wix Data Collections
4. Everything scales automatically

---

## 📋 Prerequisites

Before you start, you need:
- A **Wix account** with a site
- A **Vercel account** (free tier works)
- **Node.js 18+** installed locally
- **Git** installed

---

## 🎯 Setup Instructions

### Option A: Complete Setup (Recommended for first-time users)

Follow the **[COMPLETE SETUP GUIDE](./COMPLETE_SETUP_GUIDE.md)** for detailed step-by-step instructions.

### Option B: Quick Setup (For experienced developers)

1. **Create Wix App:**
   - Go to https://dev.wix.com/
   - Create new app with "Wix Data - Read & Write" permission
   - Copy App ID and App Secret

2. **Create Data Collections:**
   - See `WIX_DATA_COLLECTIONS.md` for schemas
   - Create 5 collections in your Wix site

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
   Set environment variables: `WIX_APP_ID`, `WIX_APP_SECRET`, `JWT_SECRET`

4. **Update Wix App URLs:**
   - Set App URL and Redirect URL to your Vercel deployment

---

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
- **Wix Data Collections** for data storage
- Wix Data REST API integration
- OAuth authentication
- Webhooks for real-time updates
- No external database required

---

## 📚 Documentation

### Backend
- **Node.js + Express** - Web server
- **Wix Data REST API** - Database operations
- **Vercel** - Serverless deployment
- JWT authentication
- Winston logging
- Node-cron for scheduled tasks

### Frontend
- **React 18**
- React Router
- Axios for API calls
- date-fns for date formatting
- Recharts for analytics

### Database
- **Wix Data Collections** - Managed by Wix
- No setup or maintenance required
- Auto-scaling
- Real-time sync

---

## 🗂️ Project Structure

```
Wix-Middlewear/
├── src/
│   ├── services/
│   │   ├── wixDataService.js       # Wix Data API client
│   │   ├── bookingsService.js      # Appointment management
│   │   ├── eventsService.js        # Event management
│   │   ├── wixClient.js            # OAuth client
│   │   ├── notificationService.js  # Notifications
│   │   └── reminderService.js      # Automated reminders
│   ├── routes/                     # API endpoints
│   ├── middleware/                 # Auth & error handling
│   └── server.js                   # Express server
├── frontend/                       # React dashboard
├── vercel.json                     # Vercel configuration
├── COMPLETE_SETUP_GUIDE.md        # 👈 Start here!
├── WIX_DATA_COLLECTIONS.md        # Database schemas
└── VERCEL_DEPLOYMENT.md           # Deployment guide
```

---

## 🔌 API Endpoints

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

## ✨ Features in Detail

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