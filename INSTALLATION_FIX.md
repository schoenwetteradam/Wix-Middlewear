# Fix: App Installation Not Working

## The Problem

When trying to install your custom app on a Wix site, you see:
- 400 errors in the console
- Installation modal stuck
- "Go to the other tab to complete installation" message
- App won't install

## Root Causes

1. **App URL not configured correctly** in Wix App Dashboard
2. **App not deployed** to Vercel (or wrong URL)
3. **Installation endpoint not accessible**
4. **Missing environment variables** in Vercel

---

## ✅ Step-by-Step Fix

### Step 1: Deploy Your App to Vercel

**If you haven't deployed yet:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Note your deployment URL:**
   - Example: `https://your-app-name.vercel.app`
   - You'll need this for Step 2

### Step 2: Configure App URL in Wix App Dashboard

1. Go to: https://dev.wix.com/ → Your App
2. Navigate to **Build** → **OAuth**
3. Set **App URL:**
   ```
   https://your-app-name.vercel.app/
   ```
   ⚠️ **Important:**
   - Must use HTTPS (required by Wix)
   - Must end with `/`
   - Must match your Vercel URL exactly
   - Must be publicly accessible

4. Set **Redirect URL:**
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
   (Or just `/` if callback not implemented)

5. **Save** the changes

### Step 3: Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `WIX_APP_ID` | `a88e57a2-8663-43a0-954a-1d669869b8bb` |
| `WIX_APP_SECRET` | `641a5b63-f3b1-40c6-8b45-d7e14d54f8f0` |
| `WIX_PUBLIC_KEY` | `[Your public key from Wix]` |
| `BASE_URL` | `https://your-app-name.vercel.app` |
| `JWT_SECRET` | `[Generate a random secret]` |
| `NODE_ENV` | `production` |

4. **Redeploy** after adding variables:
   ```bash
   vercel --prod
   ```

### Step 4: Verify Installation Endpoint Works

Test your installation endpoint:

```bash
# Test locally
curl http://localhost:3000/?token=test

# Test on Vercel
curl https://your-app-name.vercel.app/?token=test
```

Both should return HTML (not JSON error).

### Step 5: Try Installing Again

1. Go to your Wix site
2. **Settings** → **Apps** → **Custom Apps**
3. Find your app → Click **Install**
4. Should work now!

---

## 🔍 Troubleshooting

### Still Getting 400 Errors?

**Check 1: App URL Accessibility**
```bash
curl https://your-app-name.vercel.app/health
```
Should return: `{"status":"ok"}`

**Check 2: Installation Endpoint**
```bash
curl https://your-app-name.vercel.app/?token=test
```
Should return HTML page (not JSON)

**Check 3: Vercel Logs**
```bash
vercel logs --follow
```
Look for errors when installation is attempted

**Check 4: Wix App Dashboard**
- Go to **Build** → **OAuth**
- Verify App URL matches Vercel URL exactly
- Check for typos or missing `/`

### Installation Modal Stuck?

1. **Close the modal** (click Cancel or X)
2. **Clear browser cache** for `manage.wix.com`
3. **Try in incognito/private window**
4. **Wait 5 minutes** (sometimes Wix needs time to propagate changes)
5. **Try again**

### "Go to the other tab" Message?

This means:
- Installation started but didn't complete
- Check the other tab/window that opened
- If no other tab, close modal and try again
- Make sure popup blockers are disabled

---

## ✅ Checklist

Before trying to install:

- [ ] App deployed to Vercel
- [ ] App URL set in Wix App Dashboard (Build → OAuth)
- [ ] App URL matches Vercel URL exactly
- [ ] App URL uses HTTPS
- [ ] Environment variables set in Vercel
- [ ] App redeployed after setting variables
- [ ] `/health` endpoint works
- [ ] `/?token=test` endpoint works
- [ ] Browser cache cleared
- [ ] Tried in incognito mode

---

## 🎯 Quick Fix Summary

**Most common issue:** App URL in Wix App Dashboard doesn't match Vercel URL

**Solution:**
1. Deploy to Vercel
2. Copy exact Vercel URL
3. Paste in Wix App Dashboard → Build → OAuth → App URL
4. Save and wait 2-3 minutes
5. Try installing again

---

## 📚 Related Guides

- **`NEXT_STEPS.md`** - Complete deployment guide
- **`SETUP_CREDENTIALS.md`** - Environment variables setup
- **`POST_INSTALLATION_SETUP.md`** - After installation steps

---

## 🆘 Still Not Working?

If installation still fails after all steps:

1. **Check Vercel deployment status:**
   - Is it deployed?
   - Are there build errors?
   - Is the function working?

2. **Check Wix App Dashboard:**
   - Is App URL correct?
   - Are permissions enabled?
   - Is app in "Published" mode?

3. **Check browser console:**
   - What exact error messages?
   - What URLs are failing?
   - Any CORS errors?

4. **Contact Wix Support:**
   - They can check app configuration
   - They can verify webhook URLs
   - They can check installation logs
