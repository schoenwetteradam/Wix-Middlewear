# Wix Configuration Checklist

This document lists **everything** you need to configure in your Wix Custom App Dashboard and Wix Site to get your app working with staff/site members.

---

## 📋 Prerequisites

Before configuring, ensure you have:
- ✅ Your app deployed to Vercel (or another hosting provider)
- ✅ Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- ✅ Access to Wix Developers Dashboard: https://dev.wix.com/

---

## Part 1: Wix App Dashboard Configuration

### 1.1 OAuth Settings

**Location:** Your App → **Build** → **OAuth**

Configure these URLs:

#### App URL (Installation URL)
```
https://your-app.vercel.app/
```
*This is where Wix redirects users after installing your app*

#### Redirect URL (OAuth Callback)
```
https://your-app.vercel.app/auth/callback
```
*This is where Wix sends users after OAuth authentication*

**Note:** If you don't have an `/auth/callback` endpoint yet, you can use `/` for now.

---

### 1.2 App Credentials (API Keys)

**Location:** Your App → **Settings** → **API Keys**

Copy these values - you'll need them for environment variables:

- **App ID**: `your-app-id-here`
- **App Secret Key**: `your-app-secret-here`

**⚠️ SECURITY:** Never commit these to Git! Add them as environment variables in Vercel.

---

### 1.3 Public Key (Webhook Verification)

**Location:** Your App → **Build** → **Webhooks** → **Public Key**

1. Click **"Generate Public Key"** (if not already generated)
2. Copy the entire public key (including `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----`)
3. Save it to `pubic.pem` file in your project root (already done ✅)
4. **OR** add it as `WIX_PUBLIC_KEY` environment variable in Vercel

The app will automatically load from `pubic.pem` file if the environment variable is not set.

---

### 1.4 Permissions

**Location:** Your App → **Build** → **Permissions**

Enable the following permissions:

#### Required Permissions:

**Wix Data:**
- ✅ `wix-data.read` - Read Data Collections
- ✅ `wix-data.write` - Write to Data Collections

**Bookings:**
- ✅ `bookings.read` - Read bookings and appointments
- ✅ `bookings.write` - Create and manage bookings
- ✅ `bookings.staff.read` - Read staff member information
- ✅ `bookings.services.read` - Read service information

**Events:**
- ✅ `events.read` - Read events
- ✅ `events.write` - Create and manage events
- ✅ `events.rsvps.read` - Read event RSVPs

**Contacts/CRM:**
- ✅ `contacts.read` - Read contact information
- ✅ `contacts.write` - Create and update contacts

**Site:**
- ✅ `site.read` - Read site information

**Site Members (if you have member areas):**
- ✅ `members.read` - Read site member information
- ✅ `members.write` - Update site member information

Click **"Save"** after selecting all permissions.

---

### 1.5 Webhooks Configuration

**Location:** Your App → **Build** → **Webhooks**

Configure the following webhooks:

#### Base URL
All webhooks use this base URL:
```
https://your-app.vercel.app/plugins-and-webhooks
```

#### Webhook Events:

1. **App Installed**
   - **Event:** `app/installed`
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/app/installed`
   - **Purpose:** Capture instanceId when app is installed

2. **App Removed**
   - **Event:** `app/removed`
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/app/removed`
   - **Purpose:** Clean up when app is uninstalled

3. **Booking Created** (Optional but recommended)
   - **Event:** `bookings/booking-created`
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/bookings/created`
   - **Purpose:** Real-time notifications when bookings are created

4. **Booking Cancelled** (Optional but recommended)
   - **Event:** `bookings/booking-cancelled`
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/bookings/cancelled`
   - **Purpose:** Handle booking cancellations

5. **Event Created** (Optional but recommended)
   - **Event:** `events/event-created`
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/events/created`
   - **Purpose:** Handle event creation

**Note:** The webhook endpoint `/plugins-and-webhooks` is already set up in your codebase and will verify JWT signatures automatically using your public key.

---

### 1.6 Dashboard Extension (For Staff Access)

**Location:** Your App → **Build** → **Extensions** → **Dashboard**

Create a Dashboard Page extension:

#### Configuration:
- **Extension Name:** "Salon Management Dashboard"
- **Extension Type:** Dashboard Page
- **Page URL:** `https://your-app.vercel.app/`
- **Icon URL:** (optional) Your app icon URL
- **Description:** "Manage appointments, events, and staff schedules"

#### Dashboard Pages (Multiple pages can be created):

1. **Main Dashboard:**
   - **Name:** "Dashboard"
   - **URL:** `https://your-app.vercel.app/`

2. **Appointments:**
   - **Name:** "Appointments"
   - **URL:** `https://your-app.vercel.app/appointments`

3. **Staff Schedule:**
   - **Name:** "Staff Schedule"
   - **URL:** `https://your-app.vercel.app/staff-schedule`

4. **Events:**
   - **Name:** "Events"
   - **URL:** `https://your-app.vercel.app/events`

**Important:** These URLs should serve your React frontend application. Staff members will access these pages from the Wix Dashboard.

---

### 1.7 Site Widget Extension (For Customer-Facing Features)

**Location:** Your App → **Build** → **Extensions** → **Site Widget**

Create a Site Widget extension:

#### Configuration:
- **Widget Name:** "Upcoming Events"
- **Widget URL:** `https://your-app.vercel.app/widget/events`
- **Width:** 800px (or responsive)
- **Height:** 600px (or auto)

This allows site visitors to see upcoming events directly on your Wix site pages.

---

## Part 2: Environment Variables (Vercel)

**Location:** Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

Add these environment variables:

### Required Variables:

```bash
WIX_APP_ID=your-app-id-from-wix-dashboard
WIX_APP_SECRET=your-app-secret-from-wix-dashboard
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
[Your public key content here]
-----END PUBLIC KEY-----"
```

**Note:** `WIX_PUBLIC_KEY` is optional if you have `pubic.pem` file in your project root (already configured ✅).

### Optional Variables:

```bash
JWT_SECRET=your-random-secret-string-here
BASE_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-wix-site.com,https://www.your-wix-site.com
LOG_LEVEL=info
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Part 3: Wix Site Configuration

### 3.1 Create Data Collections

**Location:** Your Wix Site → **Settings** → **Developer Tools** → **Data Collections**

Create the following collections (see `WIX_DATA_COLLECTIONS.md` for detailed schemas):

1. **SalonAppointments** - Store appointment data
2. **SalonEvents** - Store event data
3. **SalonEventRegistrations** - Store event registrations
4. **SalonStaff** - Store staff information
5. **SalonNotifications** - Store notification history

**Important:** 
- Set collection permissions to allow your app to read/write
- For staff/site members: Configure permissions so they can view their own appointments

### 3.2 Install the App on Your Site

**Location:** Your Wix Site → **Settings** → **Apps** → **Custom Apps**

1. Click **"Add App"**
2. Find your custom app in the list
3. Click **"Install"**
4. Authorize the requested permissions
5. After installation, note the **Instance ID** (you'll see it in the installation success page)

---

## Part 4: Testing the Configuration

### 4.1 Test App Installation

1. Install the app on your test site
2. Check that the installation webhook is received:
   - Go to Wix App Dashboard → **Webhooks** → **Logs**
   - Look for a successful `app/installed` webhook

### 4.2 Test Staff Access

1. Log in to your Wix site as a staff member (site member with appropriate role)
2. Go to the Wix Dashboard
3. Navigate to your app's dashboard extension
4. Verify that staff can:
   - View their appointments
   - See their schedule
   - Access the dashboard

### 4.3 Test API Endpoints

Use the following endpoints to test:

```bash
# Health check
curl https://your-app.vercel.app/health

# Should return: {"status":"ok"}
```

### 4.4 Test Webhooks

1. Create a test booking in your Wix site
2. Check webhook logs in Wix App Dashboard
3. Verify webhook is received and processed

---

## Part 5: Security Checklist

- ✅ App Secret is stored in Vercel environment variables (not in code)
- ✅ Public key is in `pubic.pem` file (or environment variable)
- ✅ Webhook endpoints verify JWT signatures
- ✅ API endpoints validate Wix JWT tokens
- ✅ CORS is configured for your Wix site domains
- ✅ `.env` file is in `.gitignore`

---

## Part 6: Troubleshooting

### App Installation Fails

**Check:**
- App URL is correct and accessible
- OAuth redirect URL matches exactly
- Permissions are properly configured

### Webhooks Not Received

**Check:**
- Webhook URL is correct and accessible
- Public key matches the one in Wix dashboard
- Webhook endpoint returns 200 status code
- Check webhook logs in Wix dashboard

### Staff Can't Access Dashboard

**Check:**
- Dashboard extension is created and published
- Dashboard extension URL is correct
- Site member has appropriate permissions
- App is installed on the site

### API Calls Fail with 401

**Check:**
- WIX_PUBLIC_KEY is set correctly
- JWT token is being sent in Authorization header
- Token is valid and not expired
- App ID matches in token verification

---

## Quick Reference

### URLs to Configure:

| Setting | URL |
|---------|-----|
| App URL | `https://your-app.vercel.app/` |
| Redirect URL | `https://your-app.vercel.app/auth/callback` |
| Webhook Base | `https://your-app.vercel.app/plugins-and-webhooks` |
| Dashboard | `https://your-app.vercel.app/` |
| Appointments | `https://your-app.vercel.app/appointments` |
| Staff Schedule | `https://your-app.vercel.app/staff-schedule` |
| Events | `https://your-app.vercel.app/events` |
| Events Widget | `https://your-app.vercel.app/widget/events` |

### Required Environment Variables:

| Variable | Source | Required |
|----------|--------|----------|
| `WIX_APP_ID` | Wix Dashboard → Settings → API Keys | Yes |
| `WIX_APP_SECRET` | Wix Dashboard → Settings → API Keys | Yes |
| `WIX_PUBLIC_KEY` | Wix Dashboard → Webhooks → Public Key | No* |
| `JWT_SECRET` | Generate randomly | Recommended |
| `BASE_URL` | Your Vercel URL | Optional |
| `ALLOWED_ORIGINS` | Your Wix site URLs | Recommended |

*Not required if `pubic.pem` file exists in project root.

---

## Next Steps

After completing this checklist:

1. ✅ Deploy to Vercel
2. ✅ Install app on your Wix site
3. ✅ Test with staff members
4. ✅ Test with site visitors (for widget)
5. ✅ Monitor webhook logs
6. ✅ Set up error monitoring (optional but recommended)

For detailed setup instructions, see:
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Step-by-step setup
- **[WIX_DATA_COLLECTIONS.md](./WIX_DATA_COLLECTIONS.md)** - Data collection schemas
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Deployment instructions
