# Quick Reference - Webhook URLs & Integration

## 🔗 Webhook URLs (Configure in Wix App Dashboard)

**After deploying to Vercel, replace `your-app.vercel.app` with your actual domain**

### Main Webhook Endpoints

```
Base URL: https://your-app.vercel.app/plugins-and-webhooks
```

| Event | Webhook URL |
|-------|-------------|
| Booking Created | `https://your-app.vercel.app/plugins-and-webhooks/bookings/created` |
| Booking Cancelled | `https://your-app.vercel.app/plugins-and-webhooks/bookings/cancelled` |
| Event Created | `https://your-app.vercel.app/plugins-and-webhooks/events/created` |
| Generic | `https://your-app.vercel.app/plugins-and-webhooks/*` |

---

## 📝 Wix Events to Subscribe To

In **Wix Developers Console → Webhooks**, subscribe to:

- ✅ `wix.bookings.booking_created_v2`
- ✅ `wix.bookings.booking_cancelled_v2`
- ✅ `wix.bookings.booking_confirmed_v2`
- ✅ `wix.events.event_created`
- ✅ `wix.contacts.contact_created_v4`

---

## 🗄️ Data Collections to Create in Wix

Navigate to **Wix Site → Settings → Developer Tools → Data Collections**

Create these 5 collections:

1. **SalonAppointments**
2. **SalonEvents**
3. **SalonEventRegistrations**
4. **SalonStaff**
5. **SalonNotifications**

See `WIX_DATA_COLLECTIONS.md` for field schemas.

---

## 🔑 Environment Variables for Vercel

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```bash
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
JWT_SECRET=<generate-random-32-char-string>
ALLOWED_ORIGINS=https://yoursite.wixsite.com/salon
BASE_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## 🎨 Widget Code for Wix Site

### Simple Booking Button (Add to any page)

```javascript
import { fetch } from 'wix-fetch';
import wixUsers from 'wix-users';

$w.onReady(function () {
  $w('#bookNowButton').onClick(() => openBookingForm());
});

function openBookingForm() {
  const user = wixUsers.currentUser;
  if (!user.loggedIn) {
    wixUsers.promptLogin({ mode: 'login' });
  } else {
    wixLocation.to('/book-appointment');
  }
}
```

### Display Events (Simple)

```javascript
import wixData from 'wix-data';

$w.onReady(async function () {
  const events = await wixData.query('SalonEvents')
    .eq('status', 'published')
    .eq('isPublic', true)
    .ascending('startTime')
    .limit(5)
    .find();

  $w('#eventsRepeater').data = events.items;
});
```

---

## 🌐 API Endpoints Summary

**Base URL:** `https://your-app.vercel.app`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API info & specification |
| GET | `/health` | Health check |
| GET | `/api/appointments` | List appointments (auth required) |
| POST | `/api/appointments` | Create appointment (auth required) |
| GET | `/api/events` | List events (auth required) |
| POST | `/api/events` | Create event (auth required) |
| GET | `/api/staff` | List staff (auth required) |
| GET | `/api/dashboard/kpis` | Get metrics (auth required) |
| POST | `/api/notifications/send-reminder` | Send reminder (auth required) |
| POST | `/plugins-and-webhooks/*` | Webhook handler (public) |

---

## ⚡ Quick Deploy Steps

### 1. Deploy to Vercel
```bash
cd /path/to/Wix-Middlewear
vercel --prod
```

### 2. Set Environment Variables
```bash
vercel env add WIX_APP_ID production
vercel env add WIX_APP_SECRET production
vercel env add JWT_SECRET production
```

### 3. Update Wix App Settings
- Go to https://dev.wix.com/
- Update **App URL** and **Redirect URL** with Vercel domain
- Add webhook URLs from table above

### 4. Create Data Collections
- Create 5 collections in Wix site (see list above)
- Enable "App can read/write" permission

### 5. Test
```bash
curl https://your-app.vercel.app/health
curl https://your-app.vercel.app/
```

---

## 🐛 Troubleshooting

### No data appearing in collections?
- Check Data Collections exist with correct names
- Verify "App can read/write" permission enabled
- Check Vercel logs: `vercel logs`

### Webhooks not firing?
- Verify webhook URLs in Wix Dashboard
- Check HTTPS (not HTTP)
- View Vercel logs for incoming requests

### CORS errors?
- Add your Wix site URL to `ALLOWED_ORIGINS` env variable
- Format: `https://site1.com,https://site2.com`

### Authentication errors?
- Verify `WIX_APP_ID` and `WIX_APP_SECRET` match Wix Dashboard
- Check JWT middleware is not blocking public webhooks

---

## 📚 Full Documentation

- **Complete Setup:** `COMPLETE_SETUP_GUIDE.md`
- **Wix Integration:** `WIX_SITE_INTEGRATION.md`
- **Data Collections:** `WIX_DATA_COLLECTIONS.md`
- **API Verification:** `API_VERIFICATION.md`
- **Test Results:** `API_TEST_RESULTS.md`

---

## 📞 Support

**Logs:**
- Vercel: `vercel logs --follow`
- Wix: Developers Console → Event Logs

**Documentation:**
- Wix Data API: https://dev.wix.com/api/rest/wix-data
- Wix Webhooks: https://dev.wix.com/api/rest/getting-started/webhooks
