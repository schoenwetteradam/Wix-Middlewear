# Quick Start: Wix Configuration Summary

This document provides a quick answer to: **"What variables/secrets/code do I need to add to my Wix site or Wix custom app?"**

---

## ✅ What You Need to Configure

### 1. **In Wix App Dashboard** (https://dev.wix.com/)

#### A. OAuth Settings
- **App URL:** `https://your-app.vercel.app/`
- **Redirect URL:** `https://your-app.vercel.app/auth/callback`

#### B. Get Your Credentials
- **App ID:** Copy from Settings → API Keys
- **App Secret:** Copy from Settings → API Keys  
- **Public Key:** Copy from Build → Webhooks → Public Key (or use `pubic.pem` file ✅)

#### C. Permissions
Enable these permissions:
- ✅ Wix Data (Read & Write)
- ✅ Bookings (Read, Write, Staff Read, Services Read)
- ✅ Events (Read, Write, RSVPs Read)
- ✅ Contacts (Read, Write)
- ✅ Site (Read)
- ✅ Members (Read, Write) - if using member areas

#### D. Webhooks
Base URL: `https://your-app.vercel.app/plugins-and-webhooks`
- ✅ `app/installed` → `/plugins-and-webhooks/app/installed`
- ✅ `app/removed` → `/plugins-and-webhooks/app/removed`
- ✅ Optional: Booking and Event webhooks

#### E. Dashboard Extension
Create dashboard pages for staff access:
- **Main Dashboard:** `https://your-app.vercel.app/`
- **Appointments:** `https://your-app.vercel.app/appointments`
- **Staff Schedule:** `https://your-app.vercel.app/staff-schedule`
- **Events:** `https://your-app.vercel.app/events`

---

### 2. **In Vercel** (Environment Variables)

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
WIX_APP_ID=your-app-id-here
WIX_APP_SECRET=your-app-secret-here

# Optional (if not using pubic.pem file)
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
[Your public key]
-----END PUBLIC KEY-----"

# Recommended
JWT_SECRET=generate-random-string-here
BASE_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-wix-site.com
```

**Note:** The `pubic.pem` file in your project root is already configured ✅, so `WIX_PUBLIC_KEY` env var is optional.

---

### 3. **In Your Wix Site**

#### A. Create Data Collections
Create these 5 collections in Settings → Developer Tools → Data Collections:
1. **SalonAppointments**
2. **SalonEvents**
3. **SalonEventRegistrations**
4. **SalonStaff**
5. **SalonNotifications**

See `WIX_DATA_COLLECTIONS.md` for detailed schemas.

#### B. Install the App
1. Go to Settings → Apps → Custom Apps
2. Find your app and click "Install"
3. Authorize permissions

---

## 🎯 For Staff/Site Members Access

### What's Already Set Up ✅

1. **Backend API endpoints** - All routes are protected with JWT validation
2. **Frontend authentication** - Uses Wix SDK `fetchWithAuth` 
3. **Dashboard extensions** - Ready to be configured in Wix dashboard
4. **Data collections** - Schemas documented for staff/member access

### What You Need to Do

1. **Create Dashboard Extension** (Wix App Dashboard → Extensions → Dashboard)
   - This allows staff to access the app from Wix Dashboard
   - Point to your Vercel URLs

2. **Configure Data Collection Permissions**
   - Set permissions so staff/site members can view their own appointments
   - Allow app to read/write all data

3. **Install App on Site**
   - Staff members need the app installed on the site they're accessing
   - Each installation creates a unique `instanceId`

---

## 📝 Quick Checklist

### Wix App Dashboard:
- [ ] OAuth URLs configured
- [ ] App ID and Secret copied
- [ ] Public Key saved (or using `pubic.pem` ✅)
- [ ] Permissions enabled
- [ ] Webhooks configured
- [ ] Dashboard extensions created

### Vercel:
- [ ] `WIX_APP_ID` environment variable set
- [ ] `WIX_APP_SECRET` environment variable set
- [ ] `JWT_SECRET` environment variable set (recommended)
- [ ] App deployed to Vercel

### Wix Site:
- [ ] Data Collections created (5 collections)
- [ ] Collection permissions configured
- [ ] App installed on site
- [ ] Test with staff member account

---

## 🚀 Testing

1. **Test Installation:**
   ```bash
   curl https://your-app.vercel.app/health
   # Should return: {"status":"ok"}
   ```

2. **Install App on Test Site:**
   - Check webhook logs in Wix dashboard
   - Verify `app/installed` webhook received

3. **Test Staff Access:**
   - Log in as staff member
   - Access dashboard from Wix Dashboard
   - Verify appointments/schedule load correctly

---

## 📚 Detailed Guides

For step-by-step instructions, see:
- **[WIX_CONFIGURATION_CHECKLIST.md](./WIX_CONFIGURATION_CHECKLIST.md)** - Complete configuration checklist
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Detailed setup walkthrough
- **[WIX_DATA_COLLECTIONS.md](./WIX_DATA_COLLECTIONS.md)** - Data collection schemas
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Deployment instructions

---

## ❓ Common Questions

**Q: Do I need to add code to my Wix site?**  
A: No! The app runs on Vercel. You only need to configure the Wix App Dashboard and install the app.

**Q: How do staff members access the app?**  
A: Through Dashboard Extensions configured in Wix App Dashboard. Staff will see your app in their Wix Dashboard.

**Q: What about site visitors?**  
A: Use Site Widget Extensions for customer-facing features (e.g., events widget).

**Q: Where is the public key stored?**  
A: It's in the `pubic.pem` file in your project root ✅. You can also set it as `WIX_PUBLIC_KEY` environment variable.

**Q: Do I need a database?**  
A: No! The app uses Wix Data Collections (configured in your Wix site).

---

## ✅ Summary

**You need to configure:**
1. ✅ Wix App Dashboard (OAuth, Permissions, Webhooks, Extensions)
2. ✅ Vercel environment variables (App ID, Secret, optional Public Key)
3. ✅ Wix Site (Data Collections, Install app)

**You DON'T need to:**
- ❌ Add code to your Wix site
- ❌ Set up a separate database
- ❌ Configure the public key (already done ✅)

The app is ready to use once you complete the Wix App Dashboard configuration and deploy to Vercel!
