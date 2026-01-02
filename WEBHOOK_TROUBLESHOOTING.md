# Webhook Troubleshooting Guide

This guide helps you diagnose and fix webhook errors with your Wix app.

---

## Common Webhook Errors

### 1. "The webhook server returned an error"

This usually means one of the following:

#### A. Public Key Mismatch
**Symptom:** JWT verification fails, 400 error

**Fix:**
1. Go to Wix App Dashboard → Build → Webhooks → Public Key
2. Copy the current public key
3. Update `pubic.pem` file in your project root (or set `WIX_PUBLIC_KEY` env var)
4. Redeploy to Vercel

#### B. Webhook Timeout (> 1250ms)
**Symptom:** Webhook returns error after 1250ms

**Fix:**
- ✅ Already fixed! The webhook handlers now return 200 immediately
- Heavy processing (emails, API calls) happens asynchronously

#### C. Missing or Invalid Request Body
**Symptom:** "Invalid request body" error

**Fix:**
- Ensure the webhook route uses `express.text()` middleware (already configured ✅)
- Check that Wix is sending the webhook correctly

#### D. Missing Configuration
**Symptom:** "Public key not configured" error

**Fix:**
1. Ensure `pubic.pem` file exists in project root, OR
2. Set `WIX_PUBLIC_KEY` environment variable in Vercel

---

## Testing Webhooks

### 1. Check Webhook Logs in Wix Dashboard

1. Go to Wix App Dashboard → Build → Webhooks → Logs
2. Look for your webhook events
3. Check the status code and response

### 2. Test Webhook Endpoint Manually

```bash
# Test the endpoint is accessible
curl -X POST https://your-app.vercel.app/plugins-and-webhooks/bookings/created \
  -H "Content-Type: text/plain" \
  -d "test"
```

Expected: Should return an error about invalid JWT (but endpoint is accessible)

### 3. Check Server Logs

Check your Vercel deployment logs:
```bash
vercel logs
```

Or view in Vercel Dashboard → Your Project → Deployments → Select deployment → Logs

Look for:
- "Webhook signature verified" - Good! JWT verified successfully
- "Webhook signature verification failed" - JWT verification failed
- "Error processing webhook" - Processing error (non-fatal, webhook already responded)

---

## Webhook Best Practices (Already Implemented ✅)

### 1. Fast Response (< 1250ms)
✅ Webhooks now return 200 immediately after verification

### 2. Async Processing
✅ Heavy operations (emails, API calls) run asynchronously using `setImmediate()`

### 3. Error Handling
✅ Errors in async processing are logged but don't fail the webhook

### 4. Graceful Degradation
✅ Missing data or failed operations don't cause webhook failures

---

## Webhook URL Configuration

### Correct Webhook URL Format:

For booking created webhook:
```
https://wix-keeping-it-cute-app.vercel.app/plugins-and-webhooks/bookings/created
```

### All Webhook URLs:

| Event | URL |
|-------|-----|
| App Installed | `https://your-app.vercel.app/plugins-and-webhooks/app/installed` |
| App Removed | `https://your-app.vercel.app/plugins-and-webhooks/app/removed` |
| Booking Created | `https://your-app.vercel.app/plugins-and-webhooks/bookings/created` |
| Booking Cancelled | `https://your-app.vercel.app/plugins-and-webhooks/bookings/cancelled` |
| Event Created | `https://your-app.vercel.app/plugins-and-webhooks/events/created` |

**Important:** 
- Use HTTPS (required by Wix)
- No trailing slash
- Exact path matching (case-sensitive)

---

## Debugging Steps

### Step 1: Verify Public Key
```bash
# Check if pubic.pem file exists
ls pubic.pem

# Or check environment variable in Vercel
# Dashboard → Settings → Environment Variables → WIX_PUBLIC_KEY
```

### Step 2: Verify Webhook Endpoint is Accessible
```bash
# Health check
curl https://your-app.vercel.app/health

# Should return: {"status":"ok"}
```

### Step 3: Check Webhook Configuration in Wix
1. Go to Wix App Dashboard → Build → Webhooks
2. Verify webhook URL is correct
3. Check webhook status (should be "Active")
4. Review webhook logs

### Step 4: Check Server Logs
```bash
# View recent logs
vercel logs --follow

# Or check specific deployment
vercel logs [deployment-url]
```

Look for:
- ✅ "Webhook signature verified" - Success
- ❌ "Webhook signature verification failed" - JWT/auth issue
- ❌ "Public key not configured" - Config issue

---

## Common Error Messages

### "Webhook signature verification failed"
**Cause:** JWT signature doesn't match public key

**Fix:**
1. Regenerate public key in Wix Dashboard
2. Update `pubic.pem` file
3. Redeploy

### "Public key not configured"
**Cause:** `WIX_PUBLIC_KEY` env var not set and `pubic.pem` file missing

**Fix:**
1. Add `pubic.pem` file to project root, OR
2. Set `WIX_PUBLIC_KEY` environment variable in Vercel

### "Invalid request body"
**Cause:** Request body format is incorrect

**Fix:**
- Check that webhook route uses `express.text()` middleware (already done ✅)
- Verify Wix is sending webhook correctly

### "Webhook server returned an error"
**Cause:** Webhook handler returned non-200 status or timed out

**Fix:**
- ✅ Already fixed! Handlers now return 200 immediately
- Check server logs for specific error details

---

## Verification Checklist

- [ ] `pubic.pem` file exists in project root OR `WIX_PUBLIC_KEY` env var is set
- [ ] Webhook URL is correct (HTTPS, no trailing slash)
- [ ] Webhook is active in Wix Dashboard
- [ ] App is deployed to Vercel
- [ ] Server logs show "Webhook signature verified" for test webhooks
- [ ] Webhook returns 200 status within 1250ms

---

## Still Having Issues?

1. **Check Vercel Logs:**
   ```bash
   vercel logs --follow
   ```

2. **Test with a simple webhook first:**
   - Start with `/app/installed` webhook (simpler, less likely to fail)
   - Then test booking webhooks

3. **Verify Public Key:**
   - Ensure it matches exactly (including BEGIN/END markers)
   - Check for extra whitespace or line breaks

4. **Check Network/HTTPS:**
   - Ensure Vercel deployment is accessible via HTTPS
   - Check for firewall or network issues

5. **Review Wix Documentation:**
   - [Wix Webhooks Documentation](https://dev.wix.com/api/rest/getting-started/webhooks)
   - [Webhook Best Practices](https://dev.wix.com/api/rest/getting-started/webhooks#webhook-best-practices)

---

## Summary

The webhook handlers have been updated to:
- ✅ Return 200 status immediately (< 1250ms)
- ✅ Process heavy operations asynchronously
- ✅ Handle errors gracefully without failing webhooks
- ✅ Better error messages and logging

If you're still seeing errors, check:
1. Public key configuration
2. Webhook URL in Wix Dashboard
3. Server logs for specific error messages
