# Wix Site Integration Guide

This guide shows you **exactly what to add** to your Wix site and how to configure webhooks.

---

## 🔗 Part 1: Webhook URLs for Wix App

After deploying to Vercel (e.g., `https://your-app.vercel.app`), configure these webhook URLs in your Wix App dashboard:

### Webhook Configuration

Go to **Wix Developers** → Your App → **Webhooks**

**Base Webhook URL:**
```
https://your-app.vercel.app/plugins-and-webhooks
```

### Specific Webhook Endpoints

| Event Type | Webhook URL | Purpose |
|------------|-------------|---------|
| Booking Created | `https://your-app.vercel.app/plugins-and-webhooks/bookings/created` | Send confirmation email |
| Booking Cancelled | `https://your-app.vercel.app/plugins-and-webhooks/bookings/cancelled` | Send cancellation notice |
| Event Created | `https://your-app.vercel.app/plugins-and-webhooks/events/created` | Log event creation |
| Generic Webhook | `https://your-app.vercel.app/plugins-and-webhooks/*` | Catch-all handler |

### In Wix Developers Console:

1. Navigate to **Webhooks** section
2. Click **"Add Webhook"**
3. Configure each webhook:

**Example for Bookings:**
```
Event: wix.bookings.booking_created_v2
Webhook URL: https://your-app.vercel.app/plugins-and-webhooks/bookings/created
HTTP Method: POST
```

**Events to Subscribe To:**
- ✅ `wix.bookings.booking_created_v2`
- ✅ `wix.bookings.booking_cancelled_v2`
- ✅ `wix.bookings.booking_confirmed_v2`
- ✅ `wix.events.event_created`
- ✅ `wix.contacts.contact_created_v4`

---

## 📝 Part 2: Code to Add to Your Wix Site

### Step 1: Enable Wix Developer Mode

1. Open your Wix site in the **Wix Editor**
2. Click **Dev Mode** (top right)
3. Enable Developer Tools

### Step 2: Install npm Package (Optional)

In your Wix site's **Package Manager**:

```bash
npm install axios
```

---

## 🎨 Widget Code for Wix Site

### Widget 1: Display Upcoming Events

Add this to a **Custom Element** or **Page Code**:

**File: `public/events-widget.js`**

```javascript
import wixData from 'wix-data';
import wixWindow from 'wix-window';

// Your Vercel API Base URL
const API_BASE = 'https://your-app.vercel.app';

$w.onReady(function () {
  loadUpcomingEvents();
});

async function loadUpcomingEvents() {
  try {
    // Show loading
    $w('#eventsRepeater').collapse();
    $w('#loadingEvents').expand();

    // Fetch events from Data Collection
    const results = await wixData.query('SalonEvents')
      .eq('status', 'published')
      .eq('isPublic', true)
      .ge('startTime', new Date())
      .ascending('startTime')
      .limit(10)
      .find();

    if (results.items.length > 0) {
      $w('#eventsRepeater').data = results.items;
      $w('#eventsRepeater').onItemReady(($item, itemData) => {
        $item('#eventTitle').text = itemData.title;
        $item('#eventDate').text = formatDate(itemData.startTime);
        $item('#eventDescription').text = itemData.description || '';
        $item('#eventPrice').text = itemData.price ? `$${itemData.price}` : 'Free';

        // Register button click
        $item('#registerButton').onClick(() => registerForEvent(itemData._id));
      });

      $w('#eventsRepeater').expand();
    } else {
      $w('#noEventsText').expand();
    }
  } catch (error) {
    console.error('Error loading events:', error);
    $w('#errorText').text = 'Unable to load events';
    $w('#errorText').expand();
  } finally {
    $w('#loadingEvents').collapse();
  }
}

async function registerForEvent(eventId) {
  try {
    const currentUser = wixWindow.currentUser;

    if (!currentUser.loggedIn) {
      wixWindow.openLightbox('login-lightbox');
      return;
    }

    // Create registration in Data Collection
    const registration = {
      eventId: eventId,
      customerId: currentUser.id,
      customerEmail: currentUser.email,
      registrationDate: new Date(),
      status: 'registered'
    };

    await wixData.insert('SalonEventRegistrations', registration);

    // Show success message
    $w('#successMessage').expand();
    setTimeout(() => $w('#successMessage').collapse(), 3000);

    // Reload events to update count
    loadUpcomingEvents();
  } catch (error) {
    console.error('Error registering for event:', error);
    $w('#errorText').text = 'Registration failed. Please try again.';
    $w('#errorText').expand();
  }
}

function formatDate(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
}
```

---

### Widget 2: Book Appointment Form

**File: `public/booking-form.js`**

```javascript
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { fetch } from 'wix-fetch';

const API_BASE = 'https://your-app.vercel.app';

$w.onReady(function () {
  loadStaffMembers();
  loadServices();

  // Setup form submission
  $w('#bookingForm').onWixFormSubmit((event) => {
    createBooking(event);
  });
});

async function loadStaffMembers() {
  try {
    const results = await wixData.query('SalonStaff')
      .eq('isActive', true)
      .find();

    const staffOptions = results.items.map(staff => ({
      label: staff.name,
      value: staff._id
    }));

    $w('#staffDropdown').options = staffOptions;
  } catch (error) {
    console.error('Error loading staff:', error);
  }
}

async function loadServices() {
  // You can populate this from a collection or hardcode
  const services = [
    { label: 'Haircut', value: 'haircut' },
    { label: 'Hair Coloring', value: 'coloring' },
    { label: 'Styling', value: 'styling' },
    { label: 'Manicure', value: 'manicure' },
    { label: 'Pedicure', value: 'pedicure' }
  ];

  $w('#serviceDropdown').options = services;
}

async function createBooking(event) {
  try {
    $w('#submitButton').disable();
    $w('#loadingSpinner').show();

    const formData = event.target;
    const user = wixUsers.currentUser;

    // Prepare booking data
    const bookingData = {
      customerId: user.id,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      serviceId: formData.service,
      serviceName: $w('#serviceDropdown').options.find(s => s.value === formData.service).label,
      staffId: formData.staff,
      staffName: $w('#staffDropdown').options.find(s => s.value === formData.staff).label,
      startTime: formData.appointmentDate,
      endTime: new Date(formData.appointmentDate.getTime() + 60 * 60 * 1000), // +1 hour
      duration: 60,
      status: 'pending',
      notes: formData.notes || ''
    };

    // Save to Wix Data Collection
    const result = await wixData.insert('SalonAppointments', bookingData);

    // Also send to API for processing (webhooks, notifications)
    await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    // Show success
    $w('#successMessage').expand();
    $w('#bookingForm').reset();

    setTimeout(() => {
      $w('#successMessage').collapse();
    }, 5000);

  } catch (error) {
    console.error('Error creating booking:', error);
    $w('#errorMessage').text = 'Booking failed. Please try again.';
    $w('#errorMessage').expand();
  } finally {
    $w('#submitButton').enable();
    $w('#loadingSpinner').hide();
  }
}
```

---

### Widget 3: My Appointments (User Dashboard)

**File: `public/my-appointments.js`**

```javascript
import wixData from 'wix-data';
import wixUsers from 'wix-users';

$w.onReady(function () {
  loadMyAppointments();
});

async function loadMyAppointments() {
  try {
    const user = wixUsers.currentUser;

    if (!user.loggedIn) {
      $w('#loginPrompt').expand();
      return;
    }

    $w('#loadingSpinner').expand();

    // Query appointments for current user
    const results = await wixData.query('SalonAppointments')
      .eq('customerId', user.id)
      .descending('startTime')
      .find();

    if (results.items.length > 0) {
      $w('#appointmentsRepeater').data = results.items;
      $w('#appointmentsRepeater').onItemReady(($item, itemData) => {
        $item('#serviceName').text = itemData.serviceName;
        $item('#appointmentDate').text = formatDateTime(itemData.startTime);
        $item('#staffName').text = itemData.staffName || 'Any Staff';
        $item('#status').text = itemData.status.toUpperCase();

        // Status color
        const statusColors = {
          'pending': '#FFA500',
          'confirmed': '#4CAF50',
          'completed': '#2196F3',
          'cancelled': '#F44336'
        };
        $item('#statusBadge').style.backgroundColor = statusColors[itemData.status];

        // Cancel button
        if (itemData.status === 'pending' || itemData.status === 'confirmed') {
          $item('#cancelButton').show();
          $item('#cancelButton').onClick(() => cancelAppointment(itemData._id));
        } else {
          $item('#cancelButton').hide();
        }
      });

      $w('#appointmentsRepeater').expand();
    } else {
      $w('#noAppointmentsText').expand();
    }
  } catch (error) {
    console.error('Error loading appointments:', error);
  } finally {
    $w('#loadingSpinner').collapse();
  }
}

async function cancelAppointment(appointmentId) {
  try {
    const confirmed = await wixWindow.openLightbox('confirm-cancel-lightbox');

    if (confirmed) {
      await wixData.update('SalonAppointments', {
        _id: appointmentId,
        status: 'cancelled'
      });

      // Reload appointments
      loadMyAppointments();

      $w('#cancelSuccessMessage').expand();
      setTimeout(() => $w('#cancelSuccessMessage').collapse(), 3000);
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error);
  }
}

function formatDateTime(date) {
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
}
```

---

### Widget 4: Staff Schedule View (Admin)

**File: `public/staff-schedule.js`**

```javascript
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

const API_BASE = 'https://your-app.vercel.app';

$w.onReady(function () {
  loadStaffSchedule();

  // Refresh button
  $w('#refreshButton').onClick(() => loadStaffSchedule());
});

async function loadStaffSchedule() {
  try {
    $w('#loadingSpinner').expand();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all staff
    const staffResults = await wixData.query('SalonStaff')
      .eq('isActive', true)
      .find();

    const scheduleData = [];

    // Get appointments for each staff member
    for (const staff of staffResults.items) {
      const appointments = await wixData.query('SalonAppointments')
        .eq('staffId', staff._id)
        .between('startTime', today, endOfDay)
        .ascending('startTime')
        .find();

      scheduleData.push({
        staffId: staff._id,
        staffName: staff.name,
        appointments: appointments.items,
        totalAppointments: appointments.items.length
      });
    }

    // Display in repeater
    $w('#staffScheduleRepeater').data = scheduleData;
    $w('#staffScheduleRepeater').onItemReady(($item, itemData) => {
      $item('#staffNameText').text = itemData.staffName;
      $item('#appointmentCount').text = `${itemData.totalAppointments} appointments`;

      // Display appointments
      const appointmentsList = itemData.appointments
        .map(apt => `${formatTime(apt.startTime)} - ${apt.serviceName} (${apt.customerName})`)
        .join('\n');

      $item('#appointmentsListText').text = appointmentsList || 'No appointments today';
    });

    $w('#staffScheduleRepeater').expand();
  } catch (error) {
    console.error('Error loading schedule:', error);
  } finally {
    $w('#loadingSpinner').collapse();
  }
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

---

## 🔧 Part 3: Backend Configuration (Your API)

### Environment Variables to Set in Vercel

```bash
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0
JWT_SECRET=your-random-32-character-secret-key
ALLOWED_ORIGINS=https://yoursite.wixsite.com/salon
BASE_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## 📊 Part 4: Wix Data Collections Required

Create these 5 collections in your Wix site (Settings → Developer Tools → Data Collections):

1. **SalonAppointments** - Stores all bookings
2. **SalonEvents** - Stores salon events
3. **SalonEventRegistrations** - Event sign-ups
4. **SalonStaff** - Staff member info
5. **SalonNotifications** - Notification logs

See `WIX_DATA_COLLECTIONS.md` for detailed schemas.

---

## 🎯 Part 5: Testing the Integration

### Test 1: Create a Test Appointment

1. Add the booking form widget to your Wix site
2. Fill out the form
3. Submit
4. Check:
   - ✅ Appointment appears in `SalonAppointments` collection
   - ✅ Webhook fires to `/plugins-and-webhooks/bookings/created`
   - ✅ Confirmation email sent (if configured)

### Test 2: View Appointments

1. Add the "My Appointments" widget
2. Log in as a user
3. Should see your test appointment

### Test 3: Webhook Verification

Check Vercel logs:
```bash
vercel logs --follow
```

Look for:
```
POST /plugins-and-webhooks/bookings/created
Response: 200 OK
```

---

## 🚀 Deployment Checklist

- [ ] Deploy API to Vercel
- [ ] Set all environment variables in Vercel
- [ ] Create 5 Data Collections in Wix site
- [ ] Configure webhook URLs in Wix App dashboard
- [ ] Add widget code to Wix site pages
- [ ] Test booking flow end-to-end
- [ ] Verify webhooks are firing
- [ ] Test with real user account

---

## 📞 API Endpoints Your Wix Site Can Call

```javascript
// Get appointments
fetch('https://your-app.vercel.app/api/appointments')

// Create appointment
fetch('https://your-app.vercel.app/api/appointments', {
  method: 'POST',
  body: JSON.stringify(appointmentData)
})

// Get events
fetch('https://your-app.vercel.app/api/events')

// Get staff
fetch('https://your-app.vercel.app/api/staff')

// Get dashboard KPIs (requires auth)
fetch('https://your-app.vercel.app/api/dashboard/kpis')
```

---

## ✅ You're All Set!

Your Wix site is now integrated with the Salon Events API. Users can:
- Book appointments through your site
- View upcoming events
- Manage their bookings
- Receive email notifications

**Next:** Customize the widget styling to match your brand!
