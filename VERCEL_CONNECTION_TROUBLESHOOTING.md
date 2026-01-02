# Vercel Connection Refused - Troubleshooting Guide

If you're seeing "wix-middleware.vercel.app refused to connect", follow these steps:

## Quick Checks

### 1. Check Deployment Status

**In Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project (`wix-middleware` or similar)
3. Check the latest deployment status
4. Look for any build or runtime errors

**Common issues:**
- ❌ Build failed - Check build logs
- ❌ Function crashed - Check function logs
- ✅ Deployed but not accessible - Check configuration

### 2. View Deployment Logs

**Option A: Vercel Dashboard**
1. Go to your project → Deployments
2. Click on the latest deployment
3. Click "Logs" tab
4. Look for errors

**Option B: Vercel CLI**
```bash
vercel logs [deployment-url] --follow
```

### 3. Verify Environment Variables

**Check in Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Ensure all required variables are set:
   - `WIX_APP_ID`
   - `WIX_APP_SECRET`
   - `WIX_PUBLIC_KEY` (or ensure `pubic.pem` is in repo)
   - `JWT_SECRET`
   - `NODE_ENV=production`

**Test locally:**
```bash
# Check if app starts locally
npm start
```

### 4. Check Build Configuration

Verify `vercel.json` is correct:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### 5. Test the Health Endpoint

Try accessing directly:
```bash
curl https://wix-middleware.vercel.app/health
```

Should return: `{"status":"ok"}`

## Common Issues and Fixes

### Issue 1: Missing Environment Variables

**Symptom:** Function crashes on startup
**Fix:** Add all required environment variables in Vercel Dashboard

### Issue 2: Build Errors

**Symptom:** Build fails during deployment
**Fix:** 
- Check `package.json` has all dependencies
- Verify Node version compatibility
- Check for syntax errors

### Issue 3: Module Import Errors

**Symptom:** "Cannot find module" errors
**Fix:**
- Ensure all imports use correct paths
- Check ES module vs CommonJS compatibility
- Verify `package.json` has `"type": "module"`

### Issue 4: Function Timeout

**Symptom:** Request times out
**Fix:**
- Check for infinite loops
- Optimize slow database queries
- Increase function timeout in `vercel.json` (max 60s for Pro)

### Issue 5: Incorrect Entry Point

**Symptom:** 404 errors or function not found
**Fix:**
- Ensure `api/index.js` exists and exports the app correctly
- Verify `vercel.json` routes point to correct file

## Redeploy Steps

1. **Fix any issues found above**

2. **Redeploy:**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push
   ```
   (If connected to Git, Vercel auto-deploys)

   OR manually:
   ```bash
   vercel --prod
   ```

3. **Wait for deployment** (usually 1-2 minutes)

4. **Test again:**
   ```bash
   curl https://wix-middleware.vercel.app/health
   ```

## Verification Checklist

- [ ] Deployment status shows "Ready" in Vercel Dashboard
- [ ] No errors in build logs
- [ ] No errors in function logs
- [ ] All environment variables are set
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] Root endpoint `/` returns API info
- [ ] Can access app from browser

## Still Not Working?

1. **Check Vercel Status:** https://vercel-status.com/
2. **Try deploying to a new project:** `vercel --prod --name wix-middleware-new`
3. **Check DNS/URL:** Ensure URL is correct in Wix dashboard
4. **Contact Vercel Support:** If deployment is stuck or failing

## Quick Test Command

Test if your app works locally first:
```bash
# Install dependencies
npm install

# Set environment variables
export WIX_APP_ID=your-app-id
export WIX_APP_SECRET=your-secret
export NODE_ENV=production

# Start server
npm start

# In another terminal, test:
curl http://localhost:3000/health
```

If local works but Vercel doesn't, it's likely an environment variable or deployment configuration issue.
