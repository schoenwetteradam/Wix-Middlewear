# Wix Data Collections Schema

This document defines the Data Collections needed for the Salon Events & Appointments app.

## Collections to Create in Wix

### 1. SalonAppointments
**Collection ID:** `SalonAppointments`

**Fields:**
- `_id` (Text, Auto-generated)
- `customerId` (Text, Required) - Wix Contact ID
- `customerName` (Text, Required)
- `customerEmail` (Text, Required)
- `customerPhone` (Text)
- `serviceId` (Text, Required) - Wix Bookings service ID
- `serviceName` (Text, Required)
- `staffId` (Text) - Staff member ID
- `staffName` (Text)
- `startTime` (DateTime, Required)
- `endTime` (DateTime, Required)
- `duration` (Number) - Duration in minutes
- `status` (Text, Required) - pending, confirmed, completed, cancelled, no_show
- `notes` (Text)
- `totalPrice` (Number)
- `depositPaid` (Boolean)
- `reminderSent` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Permissions:**
- Site members can read their own appointments
- Site admins can read/write all

---

### 2. SalonEvents
**Collection ID:** `SalonEvents`

**Fields:**
- `_id` (Text, Auto-generated)
- `title` (Text, Required)
- `description` (RichText)
- `eventType` (Text) - workshop, class, special_event, promotion
- `startTime` (DateTime, Required)
- `endTime` (DateTime, Required)
- `location` (Text)
- `capacity` (Number)
- `registeredCount` (Number)
- `price` (Number)
- `imageUrl` (Text)
- `status` (Text) - draft, published, cancelled, completed
- `isPublic` (Boolean)
- `createdBy` (Text)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Permissions:**
- Anyone can read published events
- Only admins can write

---

### 3. SalonEventRegistrations
**Collection ID:** `SalonEventRegistrations`

**Fields:**
- `_id` (Text, Auto-generated)
- `eventId` (Text, Required) - Reference to SalonEvents
- `customerId` (Text, Required) - Wix Contact ID
- `customerName` (Text, Required)
- `customerEmail` (Text, Required)
- `customerPhone` (Text)
- `registrationDate` (DateTime, Required)
- `status` (Text) - registered, attended, cancelled, no_show
- `notes` (Text)
- `createdAt` (DateTime)

**Permissions:**
- Site members can read their own registrations
- Site admins can read/write all

---

### 4. SalonStaff
**Collection ID:** `SalonStaff`

**Fields:**
- `_id` (Text, Auto-generated)
- `name` (Text, Required)
- `email` (Text, Required)
- `phone` (Text)
- `role` (Text) - stylist, therapist, manager, receptionist
- `specialties` (Array<Text>) - Services they can provide
- `workingHours` (Object) - Weekly schedule
- `isActive` (Boolean)
- `avatarUrl` (Text)
- `bio` (Text)
- `rating` (Number)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Permissions:**
- Anyone can read active staff
- Only admins can write

---

### 5. SalonNotifications
**Collection ID:** `SalonNotifications`

**Fields:**
- `_id` (Text, Auto-generated)
- `recipientId` (Text, Required) - Contact ID or staff ID
- `recipientType` (Text) - customer, staff, admin
- `type` (Text) - appointment_reminder, event_reminder, confirmation, cancellation
- `title` (Text, Required)
- `message` (Text, Required)
- `relatedId` (Text) - Appointment or Event ID
- `status` (Text) - pending, sent, failed
- `sentAt` (DateTime)
- `createdAt` (DateTime)

**Permissions:**
- Users can read their own notifications
- Only system can write

---

## How to Create Collections in Wix

1. Go to your Wix site dashboard
2. Click **Settings** → **Developer Tools** → **Data Collections**
3. Click **Create Collection** for each collection above
4. Add the fields as specified
5. Set the permissions as noted
6. Enable **Sync with Live Site**

## API Endpoints

Our app will use these endpoints:
- `POST /v2/data/collections/{collectionId}/items` - Create item
- `GET /v2/data/collections/{collectionId}/items/{itemId}` - Get item
- `PUT /v2/data/collections/{collectionId}/items/{itemId}` - Update item
- `DELETE /v2/data/collections/{collectionId}/items/{itemId}` - Delete item
- `POST /v2/data/collections/{collectionId}/query` - Query items

Authentication: OAuth 2.0 tokens via Wix App authentication
