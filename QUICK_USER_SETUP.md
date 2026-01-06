# Quick Guide: Setting Up Staff/Admin/Member Access

## TL;DR - You Don't Create User Credentials!

Wix handles user authentication automatically. You just need to:
1. Configure permissions
2. Add staff in Wix Bookings
3. Create Dashboard Extensions
4. Users log in with their Wix accounts

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Configure App Permissions (2 minutes)

1. Go to: https://dev.wix.com/ → Your App
2. **Build** → **Permissions**
3. Enable:
   - ✅ Wix Data (Read & Write)
   - ✅ Bookings (Read, Write, Staff Read, Services Read)
   - ✅ Events (Read, Write, RSVPs Read)
   - ✅ Contacts (Read, Write)
   - ✅ Site (Read)
4. Click **Save**

### Step 2: Install App on Your Site (1 minute)

1. Go to your Wix site
2. **Settings** → **Apps** → **Custom Apps**
3. Find your app → Click **Install**
4. Authorize permissions

### Step 3: Add Staff Members (2 minutes)

1. In your Wix site: **Bookings** → **Staff**
2. Click **Add Staff Member**
3. Enter:
   - Name
   - Email (must be their Wix account email)
   - Services they provide
4. Save

**Important:** Staff must have a Wix account with that email!

### Step 4: Create Dashboard Extensions (3 minutes)

1. Go to: https://dev.wix.com/ → Your App
2. **Extensions** → **Dashboard Pages**
3. Click **+ Create Extension**
4. Create these pages:

| Name | URL |
|------|-----|
| Salon Dashboard | `https://your-app.vercel.app/` |
| Appointments | `https://your-app.vercel.app/appointments` |
| Staff Schedule | `https://your-app.vercel.app/staff-schedule` |
| Events | `https://your-app.vercel.app/events` |

5. Save each one

### Step 5: Test Access (1 minute)

1. **As Admin:**
   - Log into Wix as site owner
   - Go to Wix Dashboard
   - Click your app → Should see dashboard

2. **As Staff:**
   - Have staff member log into Wix
   - Go to Wix Dashboard
   - Click your app → Should see their schedule

---

## 🔑 How It Works

### The Flow:

```
User logs into Wix
    ↓
Wix generates JWT token (automatically)
    ↓
User clicks your app in Dashboard
    ↓
Wix SDK sends token to your app
    ↓
Your backend validates token (using Public Key)
    ↓
Token contains: userId, role, instanceId, permissions
    ↓
Your app grants access based on role
```

### You Don't Need To:
- ❌ Create user accounts
- ❌ Store passwords
- ❌ Manage authentication
- ❌ Generate tokens

### You Just Need To:
- ✅ Configure permissions
- ✅ Add staff in Wix Bookings
- ✅ Create Dashboard Extensions
- ✅ Validate tokens in your backend (already done!)

---

## 👥 User Types

### Admin (Site Owner):
- **Who:** You (site owner)
- **Access:** Everything
- **How:** Automatic - you're the owner
- **Token has:** `isOwner: true` or `role: 'admin'`

### Staff:
- **Who:** People you add in Wix Bookings
- **Access:** Their schedule, appointments, events
- **How:** Add them in Bookings → Staff
- **Token has:** `staffMemberId` or `role: 'staff'`

### Members (Optional):
- **Who:** Site members (if using Member Areas)
- **Access:** Their own appointments, event registrations
- **How:** Enable Member Areas in Wix site
- **Token has:** `memberId` or `role: 'member'`

---

## 📋 What's in the Token?

When a user accesses your app, the JWT token contains:

```javascript
{
  instanceId: "abc123...",      // Which site
  userId: "user456...",         // Wix user ID
  role: "staff" | "admin" | "member",
  staffMemberId: "staff789...", // If staff
  permissions: ["read", "write"], // What they can do
  // ... other Wix metadata
}
```

Your backend extracts this in `src/middleware/auth.js`:
- `req.instanceId` - Which site
- `req.wixAuth` - Full token data
- `req.wixAuth.role` - User role
- `req.wixAuth.staffMemberId` - Staff ID (if staff)

---

## 🚨 Common Issues

### "Staff can't see the app"

**Fix:**
1. ✅ Dashboard Extensions created?
2. ✅ App installed on site?
3. ✅ Staff added in Wix Bookings?
4. ✅ Staff logged into Wix with correct email?

### "Unauthorized error"

**Fix:**
1. ✅ Permissions enabled in App Dashboard?
2. ✅ App installed and authorized?
3. ✅ Public Key set correctly?

### "No data showing"

**Fix:**
1. ✅ Data Collections created in Wix site?
2. ✅ Collection permissions set?
3. ✅ Wix credentials set in Vercel?

---

## ✅ Checklist

- [ ] App permissions configured
- [ ] App installed on Wix site
- [ ] Staff members added in Bookings
- [ ] Dashboard Extensions created
- [ ] Environment variables set in Vercel
- [ ] Tested as admin
- [ ] Tested as staff

---

## 🎓 Full Details

For complete information, see:
- **`USER_AUTHENTICATION_GUIDE.md`** - Complete guide
- **`POST_INSTALLATION_SETUP.md`** - Dashboard Extensions setup
- **`SETUP_CREDENTIALS.md`** - App credentials setup

---

## 💡 Key Takeaway

**You don't create user credentials!**

Wix handles:
- User accounts
- Authentication
- Token generation
- Password management

You handle:
- Permissions configuration
- Adding staff members
- Creating Dashboard Extensions
- Validating tokens (already done in your code!)

Users just log into Wix with their existing Wix accounts, and your app automatically gets their authentication token! 🎉
