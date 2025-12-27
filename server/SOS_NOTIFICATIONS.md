# SOS Alert Notification System

## 📢 Who Receives SOS Alerts?

When a user triggers an SOS alert, notifications are sent to **THREE different groups**:

### 1. 🚨 Emergency Contacts (via SMS + Email)
- **All emergency contacts** with `notifyOnSOS: true`
- Receive **BOTH** SMS and Email (if email provided)
- **Real-time delivery** using Twilio (SMS) and Nodemailer (Email)

### 2. 👨‍💼 Admin Users (In-App Notifications)
- **All admin users** in the system
- Receive **in-app notifications** in the database
- Can view active SOS alerts in Admin Dashboard

### 3. 📍 Location Tracking
- SOS alert records the user's GPS coordinates
- Location is shared via Google Maps link in notifications

---

## 📱 Notification Channels

### SMS Notifications (Twilio)
**What's Sent:**
```
🚨 EMERGENCY ALERT 🚨

John Doe has triggered an emergency SOS alert!

Location: 123 Main Street, City

View on map: https://www.google.com/maps?q=40.7128,-74.0060

Please check on them immediately or call emergency services.
```

### Email Notifications (SMTP)
**Subject:** `🚨 EMERGENCY: [User Name] needs help!`

**Content:** Professional HTML email with:
- Alert type (emergency/panic/medical/safety)
- User's name and contact information
- Full address and GPS coordinates  
- Google Maps link button
- Instructions on what to do
- Timestamp

### In-App Notifications (Admins)
- Shows up in Admin Dashboard
- Real-time alert banner for active SOS alerts
- Includes user info, location, and resolve button

---

## ⚙️ Setup Configuration

### 1. Email Setup (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Add to `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### 2. SMS Setup (Twilio)

1. **Create Twilio Account:**
   - Sign up at: https://www.twilio.com/try-twilio
   - Get $15 free trial credit

2. **Get Credentials:**
   - Account SID: https://console.twilio.com/
   - Auth Token: (Show it on dashboard)
   - Phone Number: Get a free trial number

3. **Add to `.env` file:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

**Note:** Trial accounts can only send to verified phone numbers.

---

## 🚀 How It Works

### Step 1: User Triggers SOS
```typescript
// Frontend (SOSButton.tsx)
await api.post('/sos/trigger', {
  location: {
    address: "123 Main St",
    lat: 40.7128,
    lng: -74.0060
  },
  alertType: 'emergency'
});
```

### Step 2: Backend Processes Alert
```typescript
// Backend (sos.ts)
1. Fetch user's emergency contacts
2. Create SOS Alert record in database
3. Send SMS to all emergency contacts
4. Send Email to all emergency contacts  
5. Create notifications for all admins
6. Return success response
```

### Step 3: Notifications Delivered
- **SMS:** Delivered within seconds via Twilio
- **Email:** Delivered within 1-2 minutes via SMTP
- **In-App:** Instant database notification

### Step 4: Response Tracking
```json
{
  "message": "SOS Alert triggered successfully",
  "sosAlert": { ... },
  "contactsNotified": 3,
  "notifications": {
    "emailsSent": 2,
    "smsSent": 3,
    "adminsNotified": 5
  }
}
```

---

## 📋 Emergency Contact Fields

When adding an emergency contact, users can provide:

```typescript
{
  name: string,           // Required: "Mom"
  phone: string,          // Required: "+919876543210"
  email: string,          // Optional: "mom@example.com"
  relationship: string,   // Required: "family"
  isPrimary: boolean,     // Optional: false
  notifyOnSOS: boolean   // Optional: true (default)
}
```

**If email is provided:** Contact receives BOTH SMS and Email  
**If email is not provided:** Contact receives SMS only

---

## 🔧 Testing Without Twilio/Gmail

If SMS/Email is not configured, the system will:

✅ Still create the SOS alert  
✅ Still notify admins in-app  
⚠️ Skip SMS sending (log warning)  
⚠️ Skip email sending (log warning)

**Console Output:**
```
⚠️  Twilio not configured. Skipping SMS notification.
⚠️  Email not configured. Skipping email notification.
✅  SOS Alert created successfully
✅  3 admins notified in-app
```

---

## 🎯 Features

### Multiple Alert Types
- `emergency` - General emergency
- `panic` - Personal safety threat
- `medical` - Medical emergency
- `safety` - Safety concern

### Smart Notification
- Only sends to contacts with `notifyOnSOS: true`
- Primary contacts are notified first (higher priority)
- Includes user's location and contact info
- Google Maps integration for directions

### Admin Dashboard
- View all active SOS alerts
- See user location on map
- Resolve SOS alerts
- Track notification delivery status

---

## 📊 Notification Delivery Report

Example response when SOS is triggered:

```json
{
  "message": "SOS Alert triggered successfully",
  "sosAlert": {
    "_id": "abc123",
    "userId": "user456",
    "location": {
      "address": "123 Main St",
      "lat": 40.7128,
      "lng": -74.0060
    },
    "status": "active",
    "alertType": "emergency",
    "createdAt": "2025-12-27T10:30:00Z"
  },
  "contactsNotified": 3,
  "notifications": {
    "emailsSent": 2,      // 2 contacts had email addresses
    "smsSent": 3,         // All 3 contacts had phone numbers
    "adminsNotified": 5   // 5 admins received in-app notification
  }
}
```

---

## 🛠️ Troubleshooting

### SMS Not Sending

**Check:**
1. ✅ Twilio credentials are correct
2. ✅ Phone numbers are in E.164 format (+country code)
3. ✅ Trial accounts: Recipient numbers are verified
4. ✅ Twilio balance is sufficient
5. ✅ Check Twilio logs: https://console.twilio.com/monitor/logs/sms

### Email Not Sending

**Check:**
1. ✅ SMTP credentials are correct
2. ✅ Using App Password (not regular password)
3. ✅ "Less secure apps" is NOT needed (use App Password)
4. ✅ Check spam folder
5. ✅ Check server logs for email errors

### No Notifications Received

**Check:**
1. ✅ Emergency contacts have `notifyOnSOS: true`
2. ✅ User has added emergency contacts
3. ✅ Phone numbers are correct format
4. ✅ Email addresses are valid
5. ✅ Check server console for error logs

---

## 📈 Future Enhancements

- [ ] WhatsApp notifications
- [ ] Voice call notifications
- [ ] Geofencing alerts
- [ ] Delivery confirmation tracking
- [ ] SMS delivery reports
- [ ] Email open tracking
- [ ] Multi-language support
- [ ] Custom message templates
- [ ] Notification retry logic
- [ ] Rate limiting per user

---

## 🔐 Security & Privacy

- Phone numbers are encrypted at rest
- SMS content includes minimal personal info
- Location data is only shared with emergency contacts
- Admin access is role-restricted
- All notifications are logged for audit

---

For more details, see:
- [NotificationService.ts](../services/NotificationService.ts)
- [sos.ts Routes](../routes/sos.ts)
- [EmergencyContact Model](../models/EmergencyContact.ts)
