# Wix App Setup Guide - Salon Events & Appointments

This guide will walk you through setting up your custom Wix app in the Wix App Dashboard to connect with your self-hosted application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating Your Wix App](#creating-your-wix-app)
3. [OAuth Configuration](#oauth-configuration)
4. [Permissions Setup](#permissions-setup)
5. [Webhooks Configuration](#webhooks-configuration)
6. [Dashboard Extension](#dashboard-extension)
7. [Site Widget Extension](#site-widget-extension)
8. [Testing Your App](#testing-your-app)

---

## Prerequisites

Before you begin, ensure you have:
- A Wix Studio account
- Your backend server deployed and accessible via HTTPS
- Your app credentials (provided in this guide):
  - **App ID:** `a88e57a2-8663-43a0-954a-1d669869b8bb`
  - **App Secret Key:** `641a5b63-f3b1-40c6-8b45-d7e14d54f8f0`

---

## Creating Your Wix App

### Step 1: Access Wix Studio
1. Log in to [Wix Studio](https://www.wix.com/studio)
2. Navigate to your workspace
3. Click on **Custom Apps** in the left sidebar

### Step 2: Create New App
1. Click **+ Create New App**
2. Enter your app details:
   - **App Name:** Salon Events & Appointments
   - **Description:** Comprehensive salon management system for appointments, events, and staff scheduling
   - **Category:** Business & Services

---

## OAuth Configuration

### Step 1: Navigate to OAuth Settings
1. In your app dashboard, go to **Build** → **OAuth**
2. Click **Get Started**

### Step 2: Configure OAuth Settings

**Redirect URL:**
```
https://your-domain.com/auth/callback
```

**App URL (for installed apps):**
```
https://your-domain.com/
```

### Step 3: Retrieve Your Credentials
Your OAuth credentials are:
- **App ID:** `a88e57a2-8663-43a0-954a-1d669869b8bb`
- **App Secret Key:** `641a5b63-f3b1-40c6-8b45-d7e14d54f8f0`

**IMPORTANT:** Save these credentials in your `.env` file:
```bash
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
```

### Step 4: Retrieve Your Public Key
1. In the OAuth page, scroll down to **Public Key**
2. Click **Generate Public Key** (if not already generated)
3. Copy the public key
4. Add it to your `.env` file:
```bash
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
[Your public key content here]
-----END PUBLIC KEY-----"
```

---

## Permissions Setup

### Step 1: Navigate to Permissions
1. In your app dashboard, go to **Build** → **Permissions**
2. Click **Add Permissions**

### Step 2: Required Permissions

Select the following permissions for your app:

**Bookings:**
- ✅ `bookings.read` - Read bookings and appointments
- ✅ `bookings.write` - Create and manage bookings
- ✅ `bookings.staff.read` - Read staff member information
- ✅ `bookings.services.read` - Read service information

**Events:**
- ✅ `events.read` - Read events
- ✅ `events.write` - Create and manage events
- ✅ `events.rsvps.read` - Read event RSVPs

**CRM/Contacts:**
- ✅ `contacts.read` - Read contact information
- ✅ `contacts.write` - Create and update contacts

**Site:**
- ✅ `site.read` - Read site information

### Step 3: Save Permissions
Click **Save** to apply all permissions.

---

## Webhooks Configuration

### Step 1: Navigate to Webhooks
1. In your app dashboard, go to **Build** → **Webhooks**
2. Click **+ Add Webhook**

### Step 2: Configure Webhooks

#### Webhook 1: Booking Created
```json
{
  "event": "bookings/booking-created",
  "url": "https://your-domain.com/plugins-and-webhooks/bookings/created"
}
```

#### Webhook 2: Booking Cancelled
```json
{
  "event": "bookings/booking-cancelled",
  "url": "https://your-domain.com/plugins-and-webhooks/bookings/cancelled"
}
```

#### Webhook 3: Event Created
```json
{
  "event": "events/event-created",
  "url": "https://your-domain.com/plugins-and-webhooks/events/created"
}
```

### Step 3: Webhook URL Format
All webhook URLs should follow this format:
```
https://your-domain.com/plugins-and-webhooks/{webhook-path}
```

Replace `your-domain.com` with your actual deployed domain.

---

## Dashboard Extension

The dashboard extension provides staff with access to the management interface.

### Step 1: Create Dashboard Extension
1. Go to **Extensions** in your app dashboard
2. Click **+ Create Extension**
3. Select **Dashboard Page**

### Step 2: Configure Dashboard Extension

```json
{
  "type": "dashboard-page",
  "name": "Salon Dashboard",
  "description": "Staff dashboard for managing appointments and events",
    "url": "https://your-domain.com/",
  "icon": "https://your-domain.com/assets/icon.png",
  "placement": {
    "location": "dashboard",
    "sectionId": "business-management"
  }
}
```

### Step 3: Dashboard Page Configuration

**Page URL:**
```
https://your-domain.com/
```

This URL should serve your React frontend application.

**Additional Dashboard Pages:**

You may want to create multiple dashboard pages:

1. **Main Dashboard:** `https://your-domain.com/` (or `/dashboard` if you prefer)
2. **Appointments:** `https://your-domain.com/appointments`
3. **Staff Schedule:** `https://your-domain.com/staff-schedule`
4. **Events:** `https://your-domain.com/events`

---

## Site Widget Extension

The site widget allows customers to view upcoming events on your Wix site.

### Step 1: Create Widget Extension
1. Go to **Extensions** in your app dashboard
2. Click **+ Create Extension**
3. Select **Site Widget**

### Step 2: Configure Widget Extension

```json
{
  "type": "widget",
  "name": "Salon Events Widget",
  "description": "Display upcoming salon events on your site",
  "url": "https://your-domain.com/widget/events",
  "width": 800,
  "height": 600,
  "responsive": true,
  "settings": {
    "limit": {
      "type": "number",
      "label": "Number of events to display",
      "default": 5
    }
  }
}
```

### Step 3: Widget URL
```
https://your-domain.com/widget/events
```

This URL should serve your EventsWidget component.

---

## Testing Your App

### Step 1: Test Mode
1. In your app dashboard, go to **Manage** → **Test Your App**
2. Click **Create Test Site**
3. This creates a test Wix site with your app pre-installed

### Step 2: Install on Test Site
1. Navigate to your test site
2. Your app should automatically be available in the dashboard
3. Check that all extensions appear correctly

### Step 3: Test Functionality

**Test Checklist:**
- [ ] OAuth authentication works
- [ ] Dashboard loads correctly
- [ ] Can view appointments
- [ ] Can view staff schedule
- [ ] Can view events
- [ ] KPI metrics display properly
- [ ] Events widget displays on site
- [ ] Webhooks are received (check logs)

### Step 4: Check Webhook Delivery
1. Go to **Build** → **Webhooks** in your app dashboard
2. Click on each webhook to view delivery logs
3. Verify that webhooks are being delivered successfully

---

## Environment Variables Reference

Make sure your `.env` file contains all required variables:

```bash
# Wix App Credentials
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
[Your public key content]
-----END PUBLIC KEY-----"

# Server Configuration
PORT=3000
NODE_ENV=production
BASE_URL=https://your-domain.com

# JWT Configuration
JWT_SECRET=your-secure-random-secret-key

# Notification Settings
ENABLE_EMAIL_NOTIFICATIONS=true
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key

# Frontend URL (for CORS)
ALLOWED_ORIGINS=https://your-wix-site.com,https://manage.wix.com
```

---

## API Endpoints Reference

Your backend exposes the following endpoints:

### Health Check
```
GET https://your-domain.com/health
```

### Appointments
```
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id/status
DELETE /api/appointments/:id
GET    /api/appointments/staff/:staffId
GET    /api/appointments/availability
```

### Events
```
GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/registrations
```

### Staff
```
GET    /api/staff
GET    /api/staff/:staffId/appointments
GET    /api/staff/services
```

### Dashboard
```
GET    /api/dashboard/kpis
GET    /api/dashboard/upcoming
GET    /api/dashboard/staff-overview
```

### Notifications
```
POST   /api/notifications/send-reminder
POST   /api/notifications/test-email
```

### Webhooks
```
POST   /plugins-and-webhooks/bookings/created
POST   /plugins-and-webhooks/bookings/cancelled
POST   /plugins-and-webhooks/events/created
```

---

## Troubleshooting

### Issue: "Invalid authorization token"
**Solution:**
- Verify your public key is correctly set in `.env`
- Check that the public key matches the one in your Wix app dashboard
- Ensure JWT validation is using the correct algorithm (RS256)

### Issue: Webhooks not being received
**Solution:**
- Verify your webhook URLs are publicly accessible
- Check your server logs for incoming requests
- Ensure your server accepts POST requests to webhook endpoints
- Verify SSL certificate is valid (webhooks require HTTPS)

### Issue: CORS errors
**Solution:**
- Add your Wix site domain to `ALLOWED_ORIGINS` in `.env`
- Check that CORS middleware is properly configured
- Verify the correct origin is being sent in requests

### Issue: OAuth authentication fails
**Solution:**
- Double-check App ID and App Secret in `.env`
- Verify redirect URL matches exactly in Wix dashboard
- Check that OAuth endpoint is accessible

---

## Next Steps

After completing this setup:

1. **Deploy Your Backend:** Deploy to a production server (AWS, Heroku, DigitalOcean, etc.)
2. **Update URLs:** Replace all `https://your-domain.com` with your actual domain
3. **Configure DNS:** Point your domain to your server
4. **SSL Certificate:** Ensure you have a valid SSL certificate
5. **Test Thoroughly:** Test all functionality on your test site
6. **Submit for Review:** Once ready, submit your app for Wix App Market review (optional)
7. **Install on Production:** Install the app on your actual Wix salon site

---

## Support

For issues or questions:
- Check the [Wix Developers Documentation](https://dev.wix.com/)
- Review server logs in `logs/combined.log`
- Contact Wix Developer Support

---

## Summary

You've now configured:
- ✅ OAuth authentication
- ✅ Required permissions
- ✅ Webhooks for real-time updates
- ✅ Dashboard extension for staff
- ✅ Site widget for customers

Your Salon Events & Appointments app is ready to connect with Wix!
