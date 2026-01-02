# Wix App Update Troubleshooting Guide

## Problem: App Update Stuck on Installation Screen

If your "Salon Events & Appointments" app update gets stuck on the installation screen, follow these steps:

---

## ✅ Solution Applied

The installation endpoint has been updated to automatically close the window/iframe after successful installation/update. This completes the Wix update flow properly.

---

## 🔍 Quick Checks

### 1. Verify App URL Configuration

**Location:** Wix App Dashboard → Build → OAuth

**App URL should be:**
```
https://your-app.vercel.app/
```
*(Make sure this matches your actual Vercel deployment URL)*

**Important:** 
- Must use HTTPS (required by Wix)
- No trailing slash (or consistent trailing slash)
- Must be publicly accessible

### 2. Check Deployment Status

Verify your app is deployed and accessible:
```bash
# Check if your app is live
curl https://your-app.vercel.app/health

# Should return: {"status":"ok"}
```

### 3. Test Installation Endpoint Directly

Try accessing the installation endpoint with a test parameter:
```
https://your-app.vercel.app/?token=test123
```

You should see the installation success page.

---

## 🛠️ Manual Fix Steps

If the update is still stuck:

### Option 1: Refresh the Wix Dashboard

1. Close the stuck installation/update window
2. Go back to your Wix site dashboard
3. Navigate to **Settings** → **Apps** → **Manage Apps**
4. Look for "Salon Events & Appointments"
5. Check if the update completed (status should show "Installed" or "Active")

### Option 2: Clear Browser Cache

1. Clear your browser cache and cookies for `manage.wix.com`
2. Try updating the app again

### Option 3: Reinstall the App

**Note:** This will reset your app configuration.

1. Go to **Settings** → **Apps** → **Manage Apps**
2. Find "Salon Events & Appointments"
3. Click **Delete app** (or **Uninstall**)
4. Reinstall the app from the App Market or Custom Apps section
5. Reconfigure your settings

### Option 4: Check Vercel Logs

Check your deployment logs for errors:

```bash
# View logs
vercel logs --follow

# Or check in Vercel Dashboard
# Dashboard → Your Project → Deployments → Select deployment → Logs
```

Look for:
- ✅ "App installed successfully" - Good! Installation completed
- ❌ Any error messages - These indicate the problem

---

## 🔧 Advanced Troubleshooting

### Check Installation Endpoint Response

The installation endpoint should:
1. Accept query parameters: `token`, `instance`, `appInstance`, `code`, `redirectUrl`
2. Return HTML with JavaScript that closes the window
3. Log installation events to server logs

### Verify OAuth Configuration

**Location:** Wix App Dashboard → Build → OAuth

- **App URL:** `https://your-app.vercel.app/`
- **Redirect URL:** `https://your-app.vercel.app/auth/callback` (or `/` if callback not implemented)

Both URLs must:
- Use HTTPS
- Be publicly accessible
- Match exactly (no typos, correct domain)

### Check Permissions

**Location:** Wix App Dashboard → Build → Permissions

Ensure all required permissions are enabled:
- ✅ Wix Data (Read & Write)
- ✅ Bookings (Read, Write, Staff Read, Services Read)
- ✅ Events (Read, Write, RSVPs Read)
- ✅ Contacts (Read, Write)
- ✅ Site (Read)

---

## 📝 What Changed in the Fix

The installation endpoint (`/install` route) now:

1. **Handles OAuth callbacks** - Detects `code` parameter and redirects if needed
2. **Auto-closes window** - JavaScript attempts to close iframe/popup after successful installation
3. **Sends postMessage** - Signals parent window (if in iframe) that installation completed
4. **Better logging** - Logs all installation attempts for debugging

---

## 🆘 Still Having Issues?

If none of the above works:

1. **Check Wix Status**: Visit https://status.wix.com/ to ensure Wix services are operational

2. **Contact Wix Support**: 
   - Go to https://dev.wix.com/
   - Use the support/help section
   - Mention you're updating a custom app

3. **Check for App Conflicts**:
   - Disable other custom apps temporarily
   - Try updating again
   - Re-enable other apps

4. **Try Different Browser**:
   - Use Chrome (recommended by Wix)
   - Clear cache and cookies
   - Try incognito/private mode

---

## ✅ Success Indicators

You'll know the update succeeded when:

- ✅ The installation window closes automatically
- ✅ App status in Wix dashboard shows "Installed" or "Active"
- ✅ No error messages appear
- ✅ You can access the app dashboard/features
- ✅ Server logs show "App installed successfully"

---

## 📚 Related Documentation

- [WIX_CONFIGURATION_CHECKLIST.md](./WIX_CONFIGURATION_CHECKLIST.md) - Complete configuration guide
- [WEBHOOK_TROUBLESHOOTING.md](./WEBHOOK_TROUBLESHOOTING.md) - Webhook-specific issues
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Full setup instructions

---

## Summary

The most common causes of stuck app updates are:

1. **Incorrect App URL** - URL doesn't match deployment or has typos
2. **App not accessible** - Deployment down or URL not publicly accessible  
3. **OAuth configuration mismatch** - URLs in Wix dashboard don't match actual endpoints
4. **Browser/cache issues** - Try clearing cache or different browser

The fix applied should resolve most issues by properly closing the installation window after successful update.
