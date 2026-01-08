# Deployment Verification Guide

After a successful build, verify that your deployment is actually working.

## Step 1: Check If Deployment is Working

### Test the Health Endpoint

Try accessing your deployment's health endpoint:
```
https://your-app.vercel.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

**If you get a 500 error:**
- The build succeeded, but the runtime is failing
- Check the Function Logs (see Step 2)

---

## Step 2: Check Function Logs (If Still Getting 500 Error)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the latest deployment
4. Go to **"Functions"** tab
5. Click on the function (usually named after your route, e.g., `api/index.js`)
6. View **"Logs"** or **"Runtime Logs"**

**Look for:**
- Error messages
- Stack traces
- Missing environment variables
- Module not found errors

---

## Step 3: Check Environment Variables

Even if the build succeeds, missing environment variables cause runtime errors.

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify these are set for **Production**:
   - `WIX_APP_ID`
   - `WIX_APP_SECRET`
   - `WIX_PUBLIC_KEY` (or ensure `pubic.pem` exists)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `BASE_URL` (your Vercel URL)
   - `ALLOWED_ORIGINS`

3. **After adding/updating variables, redeploy:**
   ```bash
   vercel --prod
   ```

---

## Step 4: Test Your Webapp

Once the health endpoint works, test your actual webapp:

1. **Root URL:**
   ```
   https://your-app.vercel.app/
   ```
   Should show your React app or API info

2. **API Endpoints:**
   ```
   https://your-app.vercel.app/api/events
   https://your-app.vercel.app/api/appointments
   ```

---

## Common Issues After Successful Build

### Issue: Build Succeeds But 500 Error on Access

**Cause:** Missing environment variables or runtime error

**Fix:**
1. Check Function Logs (Step 2)
2. Verify Environment Variables (Step 3)
3. Check for runtime errors in logs

### Issue: Health Endpoint Works But Other Routes Fail

**Cause:** Route-specific errors (Wix API calls, authentication, etc.)

**Fix:**
1. Check Function Logs for specific route errors
2. Verify Wix credentials are correct
3. Check Wix API connectivity

### Issue: Security Vulnerabilities Warning

**Note:** Security vulnerabilities in dependencies usually don't cause 500 errors, but should be addressed.

**To check vulnerabilities:**
```bash
npm audit
```

**To fix automatically (may include breaking changes):**
```bash
npm audit fix
```

**To see details:**
```bash
npm audit --detail
```

---

## Quick Verification Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Root URL loads (React app or API info)
- [ ] Function logs show no errors
- [ ] Environment variables are set
- [ ] No runtime errors in logs

---

## Next Steps

1. **If health endpoint works:** Your deployment is successful! ✅
2. **If still getting 500 error:** Check Function Logs for the actual error
3. **For staff access:** See `STAFF_ACCESS_GUIDE.md`
4. **For troubleshooting:** See `VERCEL_500_ERROR_TROUBLESHOOTING.md`
