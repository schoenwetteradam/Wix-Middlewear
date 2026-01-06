# User Authentication Guide - Staff, Admin, and Members

## Understanding Wix Authentication

There are **two types of credentials** in a Wix app:

1. **App Credentials** (What we've been setting up)
   - App ID, App Secret, Public Key
   - These authenticate your **app** to Wix
   - Used for backend API calls

2. **User Credentials** (What you're asking about)
   - Handled automatically by Wix
   - Staff, Admin, Members get tokens through Wix SDK
   - Your app receives these tokens, you don't create them

---

## How Wix Handles User Authentication

### For Staff/Admin/Members:

1. **User logs into Wix** (their Wix account)
2. **Wix generates a JWT token** with their user info
3. **Your app receives this token** via the Wix SDK
4. **Your backend validates the token** using the Public Key
5. **Token contains user info** (role, permissions, instanceId)

You **don't create** these credentials - Wix does it automatically!

---

## Step-by-Step: Setting Up User Access

### Step 1: Configure Permissions in Wix App Dashboard

1. Go to https://dev.wix.com/ → Your App
2. Navigate to **Build** → **Permissions**
3. Enable these permissions:

#### For Staff Access:
- ✅ **Wix Data** (Read & Write)
- ✅ **Bookings** (Read, Write, Staff Read, Services Read)
- ✅ **Events** (Read, Write, RSVPs Read)
- ✅ **Contacts** (Read, Write)
- ✅ **Site** (Read)

#### For Member Access (if using Member Areas):
- ✅ **Members** (Read, Write)
- ✅ **Wix Data** (Read - for their own data)

#### For Admin Access:
- ✅ All of the above
- ✅ **Site Settings** (if needed)

### Step 2: Configure Data Collection Permissions

In your **Wix site** (not App Dashboard):

1. Go to your Wix site editor
2. Navigate to **Settings** → **Developer Tools** → **Data Collections**
3. For each collection (SalonAppointments, SalonEvents, etc.):

#### For Staff Collections:
- **Who can read:** Staff members + App
- **Who can write:** Staff members + App
- **Who can delete:** Staff members + App

#### For Member Collections (if applicable):
- **Who can read:** Members (their own data) + App
- **Who can write:** Members (their own data) + App

### Step 3: Install App on Your Wix Site

1. Go to your Wix site → **Settings** → **Apps** → **Custom Apps**
2. Find your app and click **Install**
3. **Authorize all permissions** when prompted
4. This creates an `instanceId` for your site

### Step 4: Create Dashboard Extensions

1. Go to Wix App Dashboard → **Extensions** → **Dashboard Pages**
2. Create extensions for:
   - **Staff Dashboard:** `https://your-app.vercel.app/`
   - **Appointments:** `https://your-app.vercel.app/appointments`
   - **Staff Schedule:** `https://your-app.vercel.app/staff-schedule`
   - **Events:** `https://your-app.vercel.app/events`

3. **Important:** These extensions are what staff see in their Wix Dashboard

---

## How Authentication Works in Your App

### Frontend (React App):

The Wix SDK automatically handles authentication:

```javascript
// In frontend/src/utils/api.js
// The Wix SDK automatically gets the user's token
// You don't need to create credentials - Wix does it!

const authToken = await dashboard.auth().getAuthToken();
// This token contains:
// - User ID
// - User role (staff/admin/member)
// - Instance ID
// - Permissions
```

### Backend (Your API):

Your backend validates the token:

```javascript
// In src/middleware/auth.js
// The token is validated using WIX_PUBLIC_KEY
// User info is extracted from the token

const decoded = jwt.verify(token, config.wix.publicKey);
// decoded contains:
// - instanceId (which site)
// - userId (which user)
// - role (staff/admin/member)
// - permissions
```

---

## User Roles and Access

### Admin Users:
- **Who:** Site owner, site managers
- **Access:** Full access to all features
- **How:** Wix automatically identifies admins
- **Token contains:** `role: 'admin'` or `isOwner: true`

### Staff Members:
- **Who:** Staff added to your Wix site's Bookings app
- **Access:** Can view/manage appointments, events, their schedule
- **How:** Must be added as staff in Wix Bookings
- **Token contains:** `role: 'staff'` or staff member ID

### Site Members:
- **Who:** Members of your Wix site (if using Member Areas)
- **Access:** Can view their own appointments, register for events
- **How:** Must be a member of your Wix site
- **Token contains:** `role: 'member'` or member ID

---

## Setting Up Staff Members

### In Your Wix Site:

1. Go to **Bookings** → **Staff**
2. Click **Add Staff Member**
3. Enter staff details:
   - Name
   - Email
   - Phone
   - Services they provide
   - Schedule/availability

4. **Important:** Staff must have a Wix account and be logged in

### Staff Access Flow:

1. Staff logs into Wix (their account)
2. Goes to Wix Dashboard
3. Sees your app in the sidebar (from Dashboard Extensions)
4. Clicks your app
5. Wix SDK automatically authenticates them
6. Your app receives their token with staff info
7. Backend validates and grants access

---

## Setting Up Members (Optional)

If you want customers/members to access the app:

### Option 1: Member Areas (Recommended)

1. In your Wix site, enable **Member Areas**
2. Create a member area
3. Add your app as a widget/page in the member area
4. Members can log in and access the app

### Option 2: Public Widget

1. Create a **Site Widget Extension** in Wix App Dashboard
2. Point to: `https://your-app.vercel.app/widget/events`
3. Add widget to your site pages
4. Public visitors can see events (no login required)

---

## Testing User Access

### Test as Admin:

1. Log into your Wix site as the owner
2. Go to Wix Dashboard
3. Click your app
4. Should see full dashboard with all features

### Test as Staff:

1. Add a staff member in Wix Bookings
2. Have them log into Wix with their account
3. They go to Wix Dashboard
4. Should see your app (if Dashboard Extensions are set up)
5. Should see their schedule, appointments, etc.

### Test as Member:

1. Create a member account on your site
2. Log in as that member
3. Access the app through member area or widget
4. Should see their own data only

---

## Common Questions

### Q: Do I need to create user accounts?

**A:** No! Wix handles all user accounts. You just:
- Configure permissions in App Dashboard
- Set up data collection permissions
- Install the app on your site
- Wix handles the rest

### Q: How do I know who is logged in?

**A:** The JWT token from Wix contains:
- `userId` - Wix user ID
- `instanceId` - Which site they're on
- `role` - Their role (admin/staff/member)
- `permissions` - What they can do

### Q: Can I restrict access to certain features?

**A:** Yes! In your backend routes, check the user's role:

```javascript
// In src/routes/dashboard.js
router.get('/kpis', validateWixJWT, asyncHandler(async (req, res) => {
  const userRole = req.wixAuth?.role || req.wixAuth?.data?.role;
  
  // Only admins can see full KPIs
  if (userRole !== 'admin' && userRole !== 'owner') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // ... rest of code
}));
```

### Q: How do staff members get access?

**A:** They need to:
1. Be added as staff in your Wix site's Bookings app
2. Have a Wix account
3. Log into Wix
4. Access your app through Dashboard Extensions

### Q: What if a user doesn't have access?

**A:** Your backend should check permissions:

```javascript
// Check if user is staff
const isStaff = req.wixAuth?.staffMemberId || req.wixAuth?.data?.staffMemberId;
if (!isStaff) {
  return res.status(403).json({ error: 'Staff access required' });
}
```

---

## Configuration Checklist

### Wix App Dashboard:
- [ ] Permissions configured (Bookings, Events, Data, etc.)
- [ ] Dashboard Extensions created
- [ ] Site Widget Extension created (if needed)
- [ ] OAuth settings configured

### Wix Site:
- [ ] App installed on site
- [ ] Staff members added in Bookings
- [ ] Data Collections created
- [ ] Collection permissions set (who can read/write)
- [ ] Member Areas set up (if using members)

### Your Backend:
- [ ] Environment variables set (App ID, Secret, Public Key)
- [ ] Auth middleware validates tokens
- [ ] Routes check user permissions
- [ ] Error handling for unauthorized access

### Testing:
- [ ] Admin can access all features
- [ ] Staff can access their schedule/appointments
- [ ] Members can access their data (if applicable)
- [ ] Unauthorized users get proper error messages

---

## Summary

**You don't create user credentials** - Wix does it automatically!

1. **Configure permissions** in Wix App Dashboard
2. **Set up data collections** with proper permissions
3. **Install app** on your site
4. **Add staff members** in Wix Bookings
5. **Create Dashboard Extensions** so staff can access the app
6. **Wix handles authentication** - users log in with their Wix accounts
7. **Your app receives tokens** with user info automatically

The credentials you set (App ID, Secret, Public Key) are for your **app** to talk to Wix. User authentication is handled by Wix automatically when users log in!

---

## Next Steps

1. ✅ Set up App credentials (already done)
2. ⏳ Configure permissions in Wix App Dashboard
3. ⏳ Create Dashboard Extensions
4. ⏳ Install app on your site
5. ⏳ Add staff members in Wix Bookings
6. ⏳ Test access as different user types

See `POST_INSTALLATION_SETUP.md` for detailed steps on creating Dashboard Extensions.
