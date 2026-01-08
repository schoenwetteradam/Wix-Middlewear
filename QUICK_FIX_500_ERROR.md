# Quick Fix: Vercel 500 Error

## Immediate Steps to Fix the Crash

### Step 1: Check the Actual Error (Most Important!)

The error message you're seeing is generic. You need to see the actual error:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the failed deployment
4. Click **"Functions"** tab
5. Click on the function
6. View **"Logs"** - this will show you the real error

**This is the most critical step!** The logs will tell you exactly what's wrong.

---

### Step 2: Common Quick Fixes

Based on the logs, try these fixes:

#### If Error Mentions Missing Environment Variables:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables for **Production** environment:
   - `WIX_APP_ID` = your app ID
   - `WIX_APP_SECRET` = your app secret
   - `WIX_PUBLIC_KEY` = your public key (or ensure `pubic.pem` exists)
   - `JWT_SECRET` = generate a random string
   - `NODE_ENV` = `production`
   - `BASE_URL` = `https://your-app.vercel.app`
   - `ALLOWED_ORIGINS` = your Wix site URLs

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

#### If Error Mentions Missing Modules:

1. Check `package.json` has all dependencies (not in `devDependencies`)
2. Redeploy:
   ```bash
   npm install
   vercel --prod
   ```

#### If Error is About File Paths:

The configuration should be correct. Check that:
- `api/index.js` exists
- `src/server.js` exists
- Files are committed to Git

---

### Step 3: Test the Fix

After fixing, test the health endpoint:
```bash
curl https://your-app.vercel.app/health
```

Should return: `{"status":"ok",...}`

---

## Full Troubleshooting Guide

For detailed troubleshooting steps, see: **[VERCEL_500_ERROR_TROUBLESHOOTING.md](./VERCEL_500_ERROR_TROUBLESHOOTING.md)**

---

## Staff Access

To allow staff members to view your webapp, see: **[STAFF_ACCESS_GUIDE.md](./STAFF_ACCESS_GUIDE.md)**

---

## Summary

1. ✅ **Check Vercel logs** for the actual error (critical!)
2. ✅ **Fix environment variables** if missing
3. ✅ **Redeploy** after making changes
4. ✅ **Test** with `/health` endpoint
5. ✅ **Share access** using the staff access guide

The logs will tell you exactly what's wrong - start there!
