# Troubleshooting Vercel 500 Error (FUNCTION_INVOCATION_FAILED)

This guide helps you diagnose and fix the `500: INTERNAL_SERVER_ERROR` with code `FUNCTION_INVOCATION_FAILED` on Vercel.

## Quick Diagnosis Steps

### 1. Check Vercel Function Logs

The most important step is to check the actual error in Vercel logs:

**Via Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the failed deployment
4. Go to the **"Functions"** tab
5. Click on the function that's failing
6. View the **"Logs"** section

**Via CLI:**
```bash
vercel logs [your-deployment-url] --follow
```

Look for:
- Error messages
- Stack traces
- Missing module errors
- Environment variable issues

---

## Common Causes and Fixes

### Cause 1: Missing Environment Variables

**Symptoms:**
- Error mentions undefined variables
- `WIX_APP_ID` or `WIX_APP_SECRET` is undefined
- Configuration errors

**Fix:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Ensure these variables are set for **Production**, **Preview**, and **Development**:
   - `WIX_APP_ID`
   - `WIX_APP_SECRET`
   - `WIX_PUBLIC_KEY` (or ensure `pubic.pem` file exists)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `BASE_URL` (your Vercel URL)
   - `ALLOWED_ORIGINS` (comma-separated list of allowed origins)

3. **Redeploy** after adding variables:
   ```bash
   vercel --prod
   ```

---

### Cause 2: Missing Dependencies

**Symptoms:**
- `Cannot find module 'xyz'` errors
- Package not found errors

**Fix:**
1. Ensure all dependencies are in `package.json` (not just `devDependencies`)
2. Check that `package.json` includes all required packages
3. Rebuild and redeploy:
   ```bash
   npm install
   vercel --prod
   ```

---

### Cause 3: Frontend Build Not Found

**Symptoms:**
- Errors related to `frontend/build` path
- File not found errors for static assets

**Fix:**
1. Ensure `buildCommand` in `vercel.json` runs successfully
2. Check that `npm run build:frontend` works locally:
   ```bash
   npm run build:frontend
   ```
3. Verify `frontend/build` directory exists after build

---

### Cause 4: Path Resolution Issues

**Symptoms:**
- `__dirname` errors
- File path resolution failures

**Fix:**
The code already handles this, but if issues persist:
1. Check that file paths use relative paths correctly
2. Ensure `api/index.js` correctly imports from `../src/server.js`

---

### Cause 5: Unhandled Promise Rejections

**Symptoms:**
- Function crashes without clear error
- Timeout errors

**Fix:**
Add error handling to async routes (already implemented in most routes).

---

### Cause 6: WIX_PUBLIC_KEY Format Issues

**Symptoms:**
- JWT verification errors
- Public key parsing errors

**Fix:**
1. If using environment variable, ensure proper formatting:
   - For multi-line: Use `\n` for newlines:
     ```
     WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
     ```
   - Or use Vercel's multi-line environment variable editor
2. Alternatively, ensure `pubic.pem` file exists in project root (already configured ✅)

---

## Step-by-Step Debugging

### Step 1: Verify Local Build Works

```bash
# Install dependencies
npm install

# Build frontend
npm run build:frontend

# Test server locally (simulating Vercel environment)
export VERCEL=1
node api/index.js
```

### Step 2: Check Vercel Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check **Build Logs** for errors during build phase

### Step 3: Check Function Logs

1. In the same deployment, go to **Functions** tab
2. Click on the function
3. Check **Runtime Logs** for runtime errors

### Step 4: Test Health Endpoint

Try accessing the health endpoint to see if the function loads:
```
https://your-app.vercel.app/health
```

If this works, the function is loading but specific routes might be failing.

---

## Quick Fix Checklist

- [ ] All environment variables set in Vercel Dashboard
- [ ] Environment variables set for correct environments (Production/Preview/Development)
- [ ] `package.json` has all dependencies (not just devDependencies)
- [ ] Frontend builds successfully (`npm run build:frontend`)
- [ ] `vercel.json` configuration is correct
- [ ] `api/index.js` exists and exports the app correctly
- [ ] Checked Vercel function logs for specific error
- [ ] Redeployed after making changes

---

## Getting More Help

If the error persists after following these steps:

1. **Copy the exact error** from Vercel logs
2. **Check the error ID** from the 500 error page (e.g., `cle1::4pshj-1767834449288-5e8f0a7f619f`)
3. **Review the stack trace** in Vercel logs
4. **Verify environment variables** are correctly set

---

## Verification Commands

After fixing, verify the deployment:

```bash
# Test health endpoint
curl https://your-app.vercel.app/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...,"environment":"production"}
```

If health endpoint works, your function is running correctly!
