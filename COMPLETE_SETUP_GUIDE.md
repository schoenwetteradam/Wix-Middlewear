# Complete Setup Guide: Salon Events Wix App

This guide walks you through **every step** to get your Salon Events app working with Wix and deployed on Vercel.

---

## 📋 Overview

Your app is a **Wix Custom App** that:
- Stores data in **Wix Data Collections** (no external database needed)
- Runs on **Vercel** (serverless hosting)
- Integrates with your Wix site for appointments and events

---

## Part 1: Create Wix Custom App (10 minutes)

### Step 1: Create a New Wix App

1. Go to **Wix Developers**: https://dev.wix.com/
2. Click **"Create New App"**
3. Fill in details:
   - **App Name**: "Salon Events & Appointments"
   - **Description**: "Manage salon appointments, events, and staff schedules"
   - **Category**: Business & Scheduling

### Step 2: Configure OAuth & Permissions

After creating the app, configure these settings:

#### A. OAuth Settings

Navigate to **OAuth** section:

1. **Redirect URL**:
   ```
   http://localhost:3000/auth/callback
   ```
   *(We'll update this to Vercel URL after deployment)*

2. **App URL**:
   ```
   http://localhost:3000
   ```
   *(We'll update this to Vercel URL after deployment)*

#### B. Permissions

Go to **Permissions** and enable these:

**Required Permissions:**
- ✅ **Wix Data** → Read & Write
  - Allows app to read/write to Data Collections

- ✅ **Contacts** → Read
  - Access customer contact information

- ✅ **Site Properties** → Read
  - Get site information

Click **"Save"** after selecting permissions.

### Step 3: Get App Credentials

1. Go to **App Settings** → **API Keys**
2. Copy these values (you'll need them later):
   - **App ID** (example: `abc123-def456-ghi789`)
   - **App Secret** (example: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**⚠️ IMPORTANT:** Keep the App Secret secure - never commit it to Git!

---

## Part 2: Set Up Wix Data Collections (15 minutes)

You need to create **5 Data Collections** in your Wix site to store app data.

### Step 1: Access Data Collections

1. Open your **Wix Site Dashboard**
2. Go to **Settings** (gear icon in left sidebar)
3. Click **Developer Tools** → **Data Collections**

### Step 2: Create Collections

Create each collection below with the **exact fields** specified:

---

#### Collection 1: SalonAppointments

Click **"Create Collection"** and name it: `SalonAppointments`

**Fields to add:**

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| customerId | Text | Yes | Wix contact ID |
| customerName | Text | Yes | Customer's name |
| customerEmail | Text | Yes | Customer's email |
| customerPhone | Text | No | Phone number |
| serviceId | Text | Yes | Service type ID |
| serviceName | Text | Yes | Service name |
| staffId | Text | No | Staff member ID |
| staffName | Text | No | Staff member name |
| startTime | Date & Time | Yes | Appointment start |
| endTime | Date & Time | Yes | Appointment end |
| duration | Number | No | Duration in minutes |
| status | Text | Yes | pending/confirmed/completed/cancelled |
| notes | Text | No | Additional notes |
| totalPrice | Number | No | Price |
| depositPaid | Boolean | No | Deposit status |
| reminderSent | Boolean | No | Reminder sent flag |

**Permissions:**
- Site members can view: **Own items only**
- Site admins can edit: **All items**
- App can read/write: **Yes**

---

#### Collection 2: SalonEvents

Create collection: `SalonEvents`

**Fields:**

| Field Name | Type | Required |
|------------|------|----------|
| title | Text | Yes |
| description | Rich Text | No |
| eventType | Text | No |
| startTime | Date & Time | Yes |
| endTime | Date & Time | Yes |
| location | Text | No |
| capacity | Number | No |
| registeredCount | Number | No |
| price | Number | No |
| imageUrl | Text | No |
| status | Text | Yes |
| isPublic | Boolean | No |
| createdBy | Text | No |

**Permissions:**
- Anyone can view: **Items marked as public**
- Site admins can edit: **All items**
- App can read/write: **Yes**

---

#### Collection 3: SalonEventRegistrations

Create collection: `SalonEventRegistrations`

**Fields:**

| Field Name | Type | Required |
|------------|------|----------|
| eventId | Text | Yes |
| customerId | Text | Yes |
| customerName | Text | Yes |
| customerEmail | Text | Yes |
| customerPhone | Text | No |
| registrationDate | Date & Time | Yes |
| status | Text | Yes |
| notes | Text | No |

**Permissions:**
- Site members can view: **Own items only**
- Site admins can edit: **All items**
- App can read/write: **Yes**

---

#### Collection 4: SalonStaff

Create collection: `SalonStaff`

**Fields:**

| Field Name | Type | Required |
|------------|------|----------|
| name | Text | Yes |
| email | Text | Yes |
| phone | Text | No |
| role | Text | No |
| specialties | Tags | No |
| isActive | Boolean | No |
| avatarUrl | Text | No |
| bio | Text | No |
| rating | Number | No |

**Permissions:**
- Anyone can view: **Active staff only**
- Site admins can edit: **All items**
- App can read/write: **Yes**

---

#### Collection 5: SalonNotifications

Create collection: `SalonNotifications`

**Fields:**

| Field Name | Type | Required |
|------------|------|----------|
| recipientId | Text | Yes |
| recipientType | Text | Yes |
| type | Text | Yes |
| title | Text | Yes |
| message | Text | Yes |
| relatedId | Text | No |
| status | Text | Yes |
| sentAt | Date & Time | No |

**Permissions:**
- Site members can view: **Own items only**
- App can read/write: **Yes**

---

### Step 3: Enable Sync

For each collection:
1. Click the collection name
2. Toggle **"Sync with Live Site"** → ON
3. Click **"Save"**

---

## Part 3: Deploy to Vercel (10 minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Set Environment Variables

Set these **before** deploying:

```bash
# Wix App Credentials (from Part 1, Step 3)
vercel env add WIX_APP_ID production
# Paste your App ID when prompted

vercel env add WIX_APP_SECRET production
# Paste your App Secret when prompted

# JWT Secret (generate a random string)
vercel env add JWT_SECRET production
# Paste a random 32+ character string

# Allowed Origins (your Wix site URL)
vercel env add ALLOWED_ORIGINS production
# Example: https://yoursite.wixsite.com/salon
```

**Optional:** Add these for preview/development:
```bash
vercel env add WIX_SITE_ID production
# Your Wix site ID (optional)
```

### Step 4: Deploy

```bash
# Navigate to your project directory
cd /path/to/Wix-Middlewear

# Deploy to production
vercel --prod
```

You'll get a URL like: `https://wix-middlewear-xyz.vercel.app`

**Copy this URL** - you'll need it in the next step!

---

## Part 4: Update Wix App URLs (5 minutes)

Now that your app is deployed, update the Wix app settings:

### Step 1: Update OAuth URLs

1. Go back to **Wix Developers**: https://dev.wix.com/
2. Open your app
3. Go to **OAuth** section
4. Update these URLs with your **Vercel deployment URL**:

   **App URL:**
   ```
   https://your-app.vercel.app
   ```

   **Redirect URL:**
   ```
   https://your-app.vercel.app/auth/callback
   ```

5. Click **"Save"**

### Step 2: Set Webhook Endpoint

1. In your Wix app settings
2. Go to **Webhooks** section
3. Add webhook endpoint:
   ```
   https://your-app.vercel.app/plugins-and-webhooks
   ```

4. Enable webhooks for:
   - ✅ App Installed
   - ✅ App Uninstalled
   - ✅ Contact Created
   - ✅ Contact Updated

---

## Part 5: Test Your App (5 minutes)

### Step 1: Install App on Your Wix Site

1. In Wix Developers, click **"Test Your App"**
2. Select your Wix site
3. Click **"Install"**
4. Authorize the app permissions

### Step 2: Verify Data Collections

1. Go to your Wix Site Dashboard
2. Navigate to **Data Collections**
3. You should see all 5 collections created earlier
4. Try creating a test appointment through the app

### Step 3: Check Vercel Logs

```bash
vercel logs https://your-app.vercel.app
```

Look for successful API calls and no errors.

---

## 🎯 Next Steps: Using Your App

### Creating Appointments

The app exposes REST API endpoints:

**Create Appointment:**
```bash
POST https://your-app.vercel.app/api/appointments
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "serviceId": "haircut",
  "serviceName": "Haircut",
  "startTime": "2024-03-20T10:00:00Z",
  "endTime": "2024-03-20T11:00:00Z",
  "staffId": "staff123"
}
```

**Get Appointments:**
```bash
GET https://your-app.vercel.app/api/appointments
```

### Creating Events

**Create Event:**
```bash
POST https://your-app.vercel.app/api/events
Content-Type: application/json

{
  "title": "Hair Color Workshop",
  "description": "Learn professional coloring techniques",
  "eventType": "workshop",
  "startTime": "2024-03-25T14:00:00Z",
  "endTime": "2024-03-25T16:00:00Z",
  "capacity": 20,
  "price": 50
}
```

---

## 🔧 Troubleshooting

### "403 Forbidden" when accessing Data Collections

**Solution:** Check that:
1. Data Collections exist in your Wix site
2. App has "Wix Data - Read & Write" permission
3. Collections have "App can read/write" enabled

### "Invalid access token" errors

**Solution:**
1. Verify `WIX_APP_ID` and `WIX_APP_SECRET` are correct
2. Re-generate App Secret in Wix Developers if needed
3. Update environment variables in Vercel

### CORS errors in browser

**Solution:**
1. Check `ALLOWED_ORIGINS` environment variable
2. Ensure your Wix site URL is included
3. Format: `https://site1.com,https://site2.com` (comma-separated)

### Webhooks not firing

**Solution:**
1. Verify webhook URL in Wix app settings
2. Check Vercel deployment logs for incoming requests
3. Ensure webhook endpoint returns 200 status

---

## 📚 Additional Resources

- **Wix Data API Docs**: https://dev.wix.com/api/rest/wix-data/wix-data/introduction
- **Vercel Docs**: https://vercel.com/docs
- **Project Documentation**: See `WIX_DATA_COLLECTIONS.md` for schema details

---

## ✅ Checklist

Before going live, verify:

- [ ] Wix app created with correct permissions
- [ ] All 5 Data Collections created in Wix site
- [ ] App deployed to Vercel successfully
- [ ] Environment variables set in Vercel
- [ ] Wix app URLs updated with Vercel deployment URL
- [ ] Webhook endpoint configured
- [ ] App installed and tested on Wix site
- [ ] Test appointment/event created successfully

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel deployment logs: `vercel logs`
2. Review Wix app event logs in Wix Developers
3. Verify Data Collection permissions
4. Check environment variables are set correctly

**Common Issue:** If data isn't saving, ensure the Data Collections are created with the **exact names** specified in this guide.
