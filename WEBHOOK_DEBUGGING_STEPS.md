# Webhook Debugging Steps - "Booking Created/Updated" Error

You're seeing "The webhook server returned an error" even though the URL is correct. Let's debug this step by step.

## Step 1: Check What Event Type Wix is Sending

The webhook is configured as "Booking Created/Updated" - this might send a different event type than expected.

**Check Vercel Logs:**
```bash
vercel logs --follow
```

Or in Vercel Dashboard → Your Project → Deployments → Select latest → Logs

Look for:
- `"Webhook received"` - This shows what event type is being sent
- `"Webhook signature verified"` - Means JWT verification passed
- Any error messages

## Step 2: Verify the Event Type

"Booking Created/Updated" webhook might send:
- `wix.bookings.v2.booking_created`
- `wix.bookings.v2.booking_updated`
- Or both event types

Our code handles:
- ✅ `wix.bookings.v2.booking_created`
- ✅ `wix.bookings.v1.booking_created`
- ✅ `bookings/booking-created`

But might NOT handle:
- ❌ `wix.bookings.v2.booking_updated` (if that's what it's sending)

## Step 3: Test the Endpoint Directly

Test if your endpoint is accessible:

```bash
# Test health endpoint first
curl https://wix-keeping-it-cute-app.vercel.app/health

# Should return: {"status":"ok"}

# Test webhook endpoint (will fail JWT but should respond)
curl -X POST https://wix-keeping-it-cute-app.vercel.app/plugins-and-webhooks/bookings/created \
  -H "Content-Type: text/plain" \
  -d "test"

# Should return an error about JWT verification (but endpoint exists)
```

## Step 4: Check Public Key

The error could be JWT verification failing if the public key doesn't match:

1. **In Wix Dashboard:** Build → Webhooks → Public Key
2. **Copy the current public key**
3. **Verify it matches your `pubic.pem` file:**
   ```bash
   # View your public key file
   cat pubic.pem
   # or on Windows:
   type pubic.pem
   ```
4. **If they don't match:** Update `pubic.pem` and redeploy

## Step 5: Check if Webhook is Actually Being Sent

1. Go to Wix Dashboard → Build → Webhooks → Logs
2. Look for recent webhook attempts
3. Check the status code and response
4. Look at the request/response details

## Step 6: Verify Your Code is Deployed

Make sure your latest code (with the webhook handlers) is deployed:

```bash
# Check if you need to deploy
git status

# Deploy to Vercel
vercel --prod
```

## Common Issues and Fixes

### Issue 1: Event Type Mismatch
**Symptom:** Webhook received but event type not handled

**Fix:** Check logs to see what event type is being sent, then add it to the switch statement

### Issue 2: Public Key Mismatch
**Symptom:** "Webhook signature verification failed" in logs

**Fix:** Update `pubic.pem` file with the current public key from Wix Dashboard

### Issue 3: Endpoint Not Found (404)
**Symptom:** Webhook can't reach the endpoint

**Fix:** 
- Verify the URL is correct
- Check that the route exists in your code
- Ensure app is deployed

### Issue 4: Timeout
**Symptom:** Webhook times out (>1250ms)

**Fix:** ✅ Already handled - webhooks return 200 immediately

## Quick Test: Use the Generic Endpoint

If the route-based handler isn't working, try using the catch-all endpoint:

**In Wix Dashboard, change the callback URL to:**
```
https://wix-keeping-it-cute-app.vercel.app/plugins-and-webhooks/webhook
```

The catch-all handler (`router.post('/*', ...)`) will handle any path and switch on the event type.

## What to Look for in Logs

When you check Vercel logs, you should see one of these:

### ✅ Success Case:
```
Webhook signature verified { eventType: 'wix.bookings.v2.booking_created', instanceId: '...' }
Booking created webhook received { instanceId: '...', eventType: '...' }
```

### ❌ JWT Verification Failed:
```
JWT verification failed: { error: 'invalid signature', name: 'JsonWebTokenError' }
```

### ❌ Event Type Not Handled:
```
Webhook received { path: '/bookings/created', eventType: 'wix.bookings.v2.booking_updated', ... }
Unknown or unhandled webhook event type { eventType: 'wix.bookings.v2.booking_updated', ... }
```

### ❌ Public Key Not Configured:
```
WIX_PUBLIC_KEY not configured
```

## Next Steps

1. **Check Vercel logs** - This will tell you exactly what's happening
2. **Check Wix webhook logs** - See what status code is being returned
3. **Test the endpoint** - Verify it's accessible
4. **Verify public key** - Ensure it matches
5. **Check event type** - See what event type is actually being sent

Once you have the logs, we can pinpoint the exact issue!
