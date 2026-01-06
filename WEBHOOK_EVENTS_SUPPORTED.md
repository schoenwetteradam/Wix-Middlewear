# Supported Webhook Events

Your webhook handler now supports all Wix Bookings v2 webhook events.

## ✅ Supported Events

### 1. Booking Created
- **Event Type:** `wix.bookings.v2.booking_created`
- **Data Structure:** `createdEvent.entity`
- **Action:** Saves booking to SalonAppointments collection, sends confirmation email

### 2. Booking Updated
- **Event Type:** `wix.bookings.v2.booking_updated`
- **Data Structure:** `updatedEvent.currentEntityAsJson`
- **Action:** Logs update, can be extended to update collection

### 3. Booking Declined
- **Event Type:** `wix.bookings.v2.booking_declined`
- **Data Structure:** `actionEvent.body.booking`
- **Action:** Sends cancellation email to customer

### 4. Booking Cancelled
- **Event Type:** `wix.bookings.v2.booking_cancelled`
- **Data Structure:** `actionEvent.body.booking`
- **Action:** Sends cancellation email to customer

### 5. Booking Rescheduled
- **Event Type:** `wix.bookings.v2.booking_rescheduled`
- **Data Structure:** `actionEvent.body.booking`
- **Action:** Logs reschedule with old/new times

### 6. Booking Marked As Pending
- **Event Type:** `wix.bookings.v2.booking_markedAsPending`
- **Data Structure:** `actionEvent.body.booking`
- **Action:** Logs pending status change

### 7. Number Of Participants Updated
- **Event Type:** `wix.bookings.v2.booking_number_of_participants_updated`
- **Data Structure:** `actionEvent.body.booking`
- **Action:** Logs participant count change

---

## 📋 Data Extraction

The webhook handler automatically extracts booking data from different event structures:

```javascript
// Booking Created
createdEvent.entity

// Booking Updated  
updatedEvent.currentEntityAsJson

// Booking Declined/Rescheduled/MarkedAsPending
actionEvent.body.booking
```

All events are normalized to extract:
- Contact details (firstName, lastName, email, phone)
- Service information (serviceId, serviceName)
- Staff information (staffMemberId, staffName)
- Time slots (startDate, endDate, timezone)
- Location information
- Status and payment information

---

## 🔧 Configuration

### In Wix App Dashboard:

1. Go to **Build** → **Webhooks**
2. Add webhooks for each event type:

| Event | URL |
|-------|-----|
| Booking Created | `https://your-app.vercel.app/plugins-and-webhooks` |
| Booking Updated | `https://your-app.vercel.app/plugins-and-webhooks` |
| Booking Declined | `https://your-app.vercel.app/plugins-and-webhooks` |
| Booking Cancelled | `https://your-app.vercel.app/plugins-and-webhooks` |
| Booking Rescheduled | `https://your-app.vercel.app/plugins-and-webhooks` |
| Booking Marked As Pending | `https://your-app.vercel.app/plugins-and-webhooks` |
| Number Of Participants Updated | `https://your-app.vercel.app/plugins-and-webhooks` |

**Note:** All events can use the same endpoint - the handler routes based on event type.

---

## 📊 Event Data Structure

### Booking Created Example:
```json
{
  "createdEvent": {
    "entity": {
      "id": "booking-id",
      "bookedEntity": {
        "slot": {
          "serviceId": "service-id",
          "startDate": "2022-12-26T12:00:00.000Z",
          "resource": {
            "id": "staff-id",
            "name": "Tom Jones"
          }
        }
      },
      "contactDetails": {
        "firstName": "John",
        "email": "john@example.com"
      },
      "status": "CREATED"
    }
  }
}
```

### Booking Declined Example:
```json
{
  "actionEvent": {
    "body": {
      "booking": {
        "id": "booking-id",
        "status": "DECLINED",
        "contactDetails": {
          "contactId": "contact-id",
          "email": "john@example.com"
        }
      }
    }
  }
}
```

---

## ✅ Testing

### Test Webhook Locally:

1. **Start server:**
   ```bash
   npm start
   ```

2. **Send test webhook:**
   ```bash
   curl -X POST http://localhost:3000/plugins-and-webhooks \
     -H "Content-Type: text/plain" \
     -d "<JWT_TOKEN>"
   ```

3. **Check logs:**
   - Look for "Booking created event detected"
   - Check for successful processing

### Test on Vercel:

1. **Deploy to Vercel**
2. **Configure webhooks in Wix App Dashboard**
3. **Create a test booking** in your Wix site
4. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

---

## 🔍 Troubleshooting

### Webhook Not Received?

1. **Check webhook URL** in Wix App Dashboard
2. **Verify endpoint is accessible:**
   ```bash
   curl https://your-app.vercel.app/plugins-and-webhooks
   ```
3. **Check Vercel logs** for incoming requests
4. **Verify Public Key** is set correctly

### Webhook Received But Not Processed?

1. **Check server logs** for event type
2. **Verify event type** matches supported types
3. **Check data extraction** - look for "no booking data found" warnings

### Email Not Sent?

1. **Check contact details** in booking data
2. **Verify email service** is configured
3. **Check logs** for email errors

---

## 📚 Related Documentation

- **Wix Bookings API:** https://dev.wix.com/api/rest/wix-bookings
- **Webhook Documentation:** See Wix App Dashboard → Build → Webhooks
- **`WEBHOOK_TROUBLESHOOTING.md`** - Detailed troubleshooting guide

---

## 🎯 Summary

Your webhook handler now:
- ✅ Supports all Wix Bookings v2 events
- ✅ Extracts data from different event structures
- ✅ Processes events asynchronously (fast response)
- ✅ Handles errors gracefully
- ✅ Logs all events for debugging

All booking events are now properly handled! 🎉
