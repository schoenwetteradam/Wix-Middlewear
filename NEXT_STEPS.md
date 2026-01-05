# What to Do Next - Step-by-Step Guide

After setting up your credentials, follow these steps in order:

---

## ✅ Step 1: Complete Credential Setup

1. **Get your Public Key:**
   - Go to https://dev.wix.com/ → Your App → Build → Webhooks
   - Copy the Public Key
   - Add it to your `.env` file or save as `pubic.pem`

2. **Create `.env` file** in project root:
   ```bash
   WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
   WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
   WIX_PUBLIC_KEY="[your public key here]"
   PORT=3000
   NODE_ENV=development
   BASE_URL=http://localhost:3000
   JWT_SECRET=change-this-secret-in-production
   ```

3. **Verify setup:**
   ```bash
   # Install dependencies if not already done
   npm install
   
   # Start the server
   npm start
   ```

   You should see: `🚀 Salon Events Wix App server running on port 3000`

---

## ✅ Step 2: Test Locally

1. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok"}`

2. **Test installation endpoint:**
   - Open browser: `http://localhost:3000/?token=test`
   - Should show installation page (even with test token)

3. **Check for errors:**
   - Look at server console for any warnings
   - Should NOT see "WIX_PUBLIC_KEY not configured" error

---

## ✅ Step 3: Build Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Build the frontend:**
   ```bash
   npm run build
   ```

4. **Go back to root:**
   ```bash
   cd ..
   ```

---

## ✅ Step 4: Deploy to Vercel (or your hosting)

### Option A: Deploy to Vercel

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `WIX_APP_ID`
     - `WIX_APP_SECRET`
     - `WIX_PUBLIC_KEY` (important!)
     - `BASE_URL` (set to your Vercel URL)
     - `JWT_SECRET` (generate a random secret)
     - `NODE_ENV=production`

5. **Redeploy after adding variables:**
   ```bash
   vercel --prod
   ```

6. **Note your deployment URL:**
   - Example: `https://your-app.vercel.app`
   - You'll need this for the next steps

### Option B: Deploy to Other Platform

- Follow your platform's deployment instructions
- Make sure to set all environment variables
- Ensure the public key is set correctly

---

## ✅ Step 5: Configure Wix App Dashboard

### A. Update OAuth Settings

1. Go to https://dev.wix.com/ → Your App
2. Navigate to **Build** → **OAuth**
3. Set **Redirect URL:**
   ```
   https://your-app.vercel.app/auth/callback
   ```
   (Replace with your actual deployment URL)

4. Set **App URL:**
   ```
   https://your-app.vercel.app/
   ```

### B. Configure Permissions

1. Go to **Build** → **Permissions**
2. Enable these permissions:
   - ✅ Wix Data (Read & Write)
   - ✅ Bookings (Read, Write, Staff Read, Services Read)
   - ✅ Events (Read, Write, RSVPs Read)
   - ✅ Contacts (Read, Write)
   - ✅ Site (Read)

### C. Configure Webhooks (Optional but Recommended)

1. Go to **Build** → **Webhooks**
2. Add webhook:
   - **Event:** `app/installed`
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/app/installed`

---

## ✅ Step 6: Create Dashboard Extensions (IMPORTANT!)

This is the step that makes your app accessible in Wix Dashboard.

1. **Go to Extensions:**
   - In Wix App Dashboard → **Extensions** → **Dashboard Pages**

2. **Create Main Dashboard Page:**
   - Click **+ Create Extension** or **Add Dashboard Page**
   - **Name:** Salon Dashboard
   - **URL:** `https://your-app.vercel.app/`
   - **Description:** Staff dashboard for managing appointments and events
   - Click **Save**

3. **Create Additional Pages (Recommended):**
   
   **Appointments Page:**
   - **Name:** Appointments
   - **URL:** `https://your-app.vercel.app/appointments`
   
   **Staff Schedule Page:**
   - **Name:** Staff Schedule
   - **URL:** `https://your-app.vercel.app/staff-schedule`
   
   **Events Page:**
   - **Name:** Events
   - **URL:** `https://your-app.vercel.app/events`

4. **Publish Changes:**
   - Save all extensions
   - Wait a few minutes for changes to propagate

---

## ✅ Step 7: Install App on Your Wix Site

1. **Go to your Wix site:**
   - Log in to your Wix account
   - Open the site where you want to use the app

2. **Install the app:**
   - Go to **Settings** → **Apps** → **Custom Apps**
   - Find your app in the list
   - Click **Install**
   - Authorize all requested permissions

3. **Verify installation:**
   - Check that the app appears in your site's Apps list
   - Installation should complete without errors

---

## ✅ Step 8: Access Your App from Wix Dashboard

1. **Open Wix Dashboard:**
   - Go to your Wix site's dashboard
   - Look in the left sidebar or Apps section

2. **Find your app:**
   - You should see your app listed (based on the Dashboard Extensions you created)
   - Click on it to open

3. **Test the app:**
   - Dashboard should load
   - Check browser console for errors
   - Verify API calls are working (check Network tab)

---

## ✅ Step 9: Troubleshooting

If you see errors:

### 400 Bad Request Errors:
- ✅ Check that `WIX_PUBLIC_KEY` is set correctly in Vercel
- ✅ Verify the public key matches the one in Wix App Dashboard
- ✅ Check browser console for detailed error messages
- ✅ Verify Dashboard Extensions are created and published

### App Not Appearing in Dashboard:
- ✅ Verify Dashboard Extensions are created in Wix App Dashboard
- ✅ Check that extensions are saved and published
- ✅ Wait a few minutes for changes to propagate
- ✅ Try refreshing the Wix Dashboard

### Authentication Errors:
- ✅ Verify all environment variables are set in Vercel
- ✅ Check that the public key format is correct
- ✅ Ensure the app is properly installed on your site

---

## 📋 Quick Checklist

- [ ] Credentials set up in `.env` file
- [ ] Public key retrieved and added
- [ ] Server runs locally without errors
- [ ] Frontend built successfully
- [ ] App deployed to Vercel (or other platform)
- [ ] Environment variables set in deployment platform
- [ ] OAuth settings updated in Wix App Dashboard
- [ ] Permissions configured
- [ ] Dashboard Extensions created
- [ ] App installed on Wix site
- [ ] App accessible from Wix Dashboard
- [ ] No 400 errors in browser console
- [ ] API calls working correctly

---

## 🎯 Current Status

Based on what you've done:
- ✅ You have App ID and Secret
- ⏳ You need to get Public Key
- ⏳ You need to create `.env` file
- ⏳ You need to deploy the app
- ⏳ You need to create Dashboard Extensions
- ⏳ You need to install app on your site

---

## 🚀 Immediate Next Action

**Right now, do this:**

1. **Get your Public Key:**
   - Go to: https://dev.wix.com/
   - Your App → Build → Webhooks
   - Copy the Public Key

2. **Create `.env` file** in project root with your credentials

3. **Test locally:**
   ```bash
   npm start
   ```

4. **Once working locally, deploy to Vercel**

5. **Create Dashboard Extensions** (this is critical!)

6. **Install on your site and test**

---

## 📚 Need More Help?

- **Credential Setup:** See `SETUP_CREDENTIALS.md`
- **Post-Installation:** See `POST_INSTALLATION_SETUP.md`
- **Deployment:** See `VERCEL_DEPLOYMENT.md`
- **Troubleshooting:** See `ERROR_FIXES_SUMMARY.md`

---

## ⚡ Quick Command Reference

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start server locally
npm start

# Build frontend
cd frontend && npm run build && cd ..

# Deploy to Vercel
vercel
vercel --prod

# Test health endpoint
curl http://localhost:3000/health
```

---

**Start with getting your Public Key, then we'll move to deployment!** 🚀
