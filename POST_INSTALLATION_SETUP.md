# Post-Installation Setup Guide

## Important: After Installing Your Wix Custom App

After you install your Wix custom app on your site, you **MUST** configure Dashboard Extensions to make the app accessible to staff members. Simply installing the app is not enough - you need to add it to your Wix Dashboard.

---

## ✅ Step-by-Step: Adding Dashboard Extensions

### Step 1: Access Wix App Dashboard

1. Go to [Wix App Dashboard](https://dev.wix.com/)
2. Log in with your Wix account
3. Select your custom app from the list

### Step 2: Create Dashboard Extension

1. In your app dashboard, navigate to **Extensions** → **Dashboard Pages**
2. Click **+ Create Extension** or **Add Dashboard Page**
3. Fill in the extension details:

#### Main Dashboard Page
- **Name:** Salon Dashboard
- **URL:** `https://your-app-domain.com/` (your deployed app URL)
- **Icon:** (optional) Upload an icon for your app
- **Description:** Staff dashboard for managing appointments and events

#### Additional Dashboard Pages (Optional but Recommended)

Create these additional pages for better organization:

**Appointments Page:**
- **Name:** Appointments
- **URL:** `https://your-app-domain.com/appointments`

**Staff Schedule Page:**
- **Name:** Staff Schedule
- **URL:** `https://your-app-domain.com/staff-schedule`

**Events Page:**
- **Name:** Events
- **URL:** `https://your-app-domain.com/events`

### Step 3: Save and Publish

1. Click **Save** for each dashboard page
2. If your app is in development mode, you may need to publish changes
3. Wait a few minutes for changes to propagate

### Step 4: Access from Wix Site Dashboard

1. Go to your Wix site's dashboard (the site where you installed the app)
2. Look for your app in the left sidebar or in the Apps section
3. Click on your app to open the dashboard extension
4. You should now see your React app loaded in the Wix Dashboard

---

## 🔧 Troubleshooting Common Issues

### Issue: "400 Bad Request" Errors

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 400`
- Dashboard shows error messages
- API calls fail

**Solutions:**

1. **Check Authentication:**
   - Ensure your app is properly installed on the site
   - Verify that the Wix SDK is initialized correctly
   - Check browser console for authentication errors

2. **Verify Public Key:**
   - Make sure `WIX_PUBLIC_KEY` is set in your environment variables
   - Or ensure `pubic.pem` file exists in your project root
   - The public key should match the one in your Wix App Dashboard

3. **Check API Base URL:**
   - Verify `REACT_APP_API_URL` is set correctly in your frontend build
   - Ensure the backend API is accessible from the Wix environment
   - Check CORS settings if you see CORS errors

4. **Development Mode:**
   - In development, the auth middleware is more lenient
   - Check server logs for detailed error messages
   - Ensure `NODE_ENV=development` is set for local testing

### Issue: App Doesn't Appear in Wix Dashboard

**Solutions:**

1. **Verify Extension Configuration:**
   - Go back to Wix App Dashboard → Extensions
   - Ensure dashboard pages are created and saved
   - Check that URLs are correct and accessible

2. **Check App Installation:**
   - Go to your Wix site → Settings → Apps → Custom Apps
   - Verify your app is installed
   - Try uninstalling and reinstalling if needed

3. **Clear Cache:**
   - Clear browser cache
   - Try incognito/private browsing mode
   - Wait a few minutes for changes to propagate

### Issue: "Key was not found in capsule" Error

**Explanation:**
This error is typically from Wix's internal systems and is usually harmless. It's related to Wix's message persistence system and doesn't affect your app functionality.

**Solution:**
- This is a Wix internal warning, not an error in your app
- You can safely ignore it
- It doesn't impact your app's functionality

### Issue: react-i18next Warning

**Symptoms:**
- Console shows: `react-i18next:: You will need to pass in an i18next instance`

**Solution:**
- This is a warning from a dependency, not a critical error
- Your app will still function normally
- If you want to fix it, you can initialize i18next (optional)

### Issue: Message Port Errors

**Symptoms:**
- `Unchecked runtime.lastError: The message port closed before a response was received`
- `A listener indicated an asynchronous response by returning true`

**Solutions:**

1. **Browser Extensions:**
   - These errors are often caused by browser extensions
   - Try disabling extensions one by one to identify the culprit
   - Use incognito mode to test without extensions

2. **Wix Internal:**
   - Some of these errors may be from Wix's internal systems
   - They typically don't affect your app functionality
   - Focus on fixing 400 errors first

---

## 📋 Post-Installation Checklist

After installing your app, verify these items:

### Wix App Dashboard:
- [ ] Dashboard Extensions created
- [ ] Extension URLs point to your deployed app
- [ ] Extensions are saved and published
- [ ] App is in "Published" or "Test" mode (not draft)

### Wix Site:
- [ ] App is installed on the site
- [ ] App appears in site's Apps section
- [ ] Staff members can see the app in their dashboard
- [ ] App opens without errors

### Your Backend:
- [ ] API endpoints are accessible
- [ ] Environment variables are set correctly
- [ ] Public key is configured
- [ ] CORS allows requests from Wix domains

### Testing:
- [ ] Dashboard loads without 400 errors
- [ ] API calls succeed (check Network tab)
- [ ] Data displays correctly
- [ ] No critical console errors

---

## 🎯 Quick Answer to Your Question

**Q: After installing the Wix custom app, do I need to place the Wix extension with our app onto our site?**

**A: YES!** Here's what you need to do:

1. **Install the app** on your Wix site (Settings → Apps → Custom Apps)
2. **Create Dashboard Extensions** in your Wix App Dashboard (Extensions → Dashboard Pages)
3. **Add the extension URLs** pointing to your deployed app
4. **Save and publish** the extensions
5. **Access the app** from your Wix site's dashboard

**Important:** Just installing the app is not enough. You must create Dashboard Extensions to make the app accessible to staff members. Without extensions, the app won't appear in the Wix Dashboard.

---

## 📚 Additional Resources

- [Wix Dashboard Extensions Documentation](https://dev.wix.com/docs/rest/api-reference/wix-apps/dashboard-extensions)
- [Wix App Setup Guide](./WIX_APP_SETUP_GUIDE.md)
- [Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)
- [Troubleshooting Guide](./WEBHOOK_TROUBLESHOOTING.md)

---

## 🆘 Still Having Issues?

If you're still experiencing problems after following this guide:

1. **Check Server Logs:** Look for detailed error messages in your backend logs
2. **Browser Console:** Check the browser console for JavaScript errors
3. **Network Tab:** Inspect API requests in the browser's Network tab
4. **Verify Configuration:** Double-check all environment variables and URLs
5. **Test in Incognito:** Rule out browser extension issues

For more help, refer to the troubleshooting sections in other documentation files.
