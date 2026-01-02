# Wix Webhook Event Types

This document explains the different event type formats Wix uses for webhooks.

## Event Type Formats

Wix can send webhooks in different event type formats:

### 1. Full Event Type Format (REST API)
```
wix.bookings.v2.booking_created
wix.bookings.v2.booking_cancelled
wix.events.v2.event_created
```

### 2. Simple Event Type Format
```
bookings/booking-created
bookings/booking-cancelled
events/event-created
```

### 3. App Events
```
app/installed
app/removed
```

## How Webhooks Work

Wix supports two webhook patterns:

### Pattern 1: Route-Based (Current Implementation)
Each event type has its own URL path:
- `POST /plugins-and-webhooks/bookings/created`
- `POST /plugins-and-webhooks/bookings/cancelled`
- `POST /plugins-and-webhooks/app/installed`

**Configuration in Wix Dashboard:**
- Event: `bookings/booking-created`
- URL: `https://your-app.vercel.app/plugins-and-webhooks/bookings/created`

### Pattern 2: Single Endpoint (Sample Code Pattern)
All webhooks go to one endpoint, handler switches on `event.eventType`:
- `POST /plugins-and-webhooks/webhook` (or any path)

**Configuration in Wix Dashboard:**
- Event: `wix.bookings.v2.booking_created`
- URL: `https://your-app.vercel.app/plugins-and-webhooks/webhook`

## Current Implementation

Our codebase supports **both patterns**:

1. **Route-based handlers** - Specific routes like `/bookings/created`
2. **Catch-all handler** - Handles event-type-based webhooks via switch statement

The catch-all handler (`router.post('/*', ...)`) will handle any webhook that doesn't match a specific route and switch on the `eventType`.

## Event Type Handling

The catch-all handler checks for these event types:

```javascript
switch (eventType) {
  case 'wix.bookings.v2.booking_created':
  case 'wix.bookings.v1.booking_created':
  case 'bookings/booking-created':
    // Handle booking created
    break;
  // ... etc
}
```

## Configuration Recommendation

**For your setup, use Route-Based pattern:**

1. In Wix Dashboard → Webhooks
2. Add webhook with:
   - **Event:** `bookings/booking-created` (or `wix.bookings.v2.booking_created`)
   - **URL:** `https://your-app.vercel.app/plugins-and-webhooks/bookings/created`

This will match the route-based handler which is more explicit and easier to debug.

## Debugging

If webhooks aren't working:

1. Check Vercel logs to see what event type is being received
2. Verify the webhook URL matches exactly (no trailing slash)
3. Ensure the event type in Wix Dashboard matches your handler
4. Check that the catch-all handler is logging the event type

Look for logs like:
```
Webhook received { eventType: 'wix.bookings.v2.booking_created', ... }
```

This will tell you what event type Wix is actually sending.
