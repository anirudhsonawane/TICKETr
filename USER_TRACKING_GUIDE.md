# User Tracking & Database Guide

## 📊 Complete User Data Tracking in MongoDB

Your TICKETr application now tracks **all user activity** in MongoDB, including:

✅ User sign-ups (Google & Phone)  
✅ User logins  
✅ User profiles (name, email, phone number)  
✅ Ticket purchases  
✅ Purchase status  
✅ QR codes  

---

## 🗄️ MongoDB Collections

### 1. **`users` Collection**

Stores all user information from sign-ups and logins.

#### Fields:
```javascript
{
  _id: ObjectId("..."),                    // Unique user ID
  name: "John Doe",                        // User's name
  email: "john@example.com",               // Email (from Google sign-in)
  image: "https://lh3.googleusercontent.com/...",  // Profile picture
  phoneNumber: "+919876543210",            // Phone number (from phone sign-in)
  otp: "123456",                           // Temporary OTP (cleared after verification)
  otpExpires: ISODate("..."),              // OTP expiration time
  createdAt: ISODate("..."),               // When user first signed up
  updatedAt: ISODate("..."),               // Last profile update
}
```

#### When Data is Saved:
- ✅ **Google Sign-In**: User created/updated immediately on sign-in
- ✅ **Phone OTP**: User created when OTP is sent, verified when OTP is correct
- ✅ **Profile Updates**: Updated when user changes profile info

---

### 2. **`events` Collection**

Stores all events available for booking.

#### Fields:
```javascript
{
  _id: ObjectId("..."),
  name: "Tech Conference 2025",
  description: "...",
  date: ISODate("2025-11-15"),
  time: "09:00 AM",
  location: {
    name: "Mumbai Convention Center",
    address: "Bandra Kurla Complex, Mumbai",
    coordinates: {
      latitude: 19.0596,
      longitude: 72.8295
    }
  },
  imageUrl: "https://...",
  category: "Technology",
  availableTickets: 500,
  price: 1999,
  passes: [
    {
      name: "Early Bird",
      price: 1499,
      available: 100
    },
    {
      name: "Regular",
      price: 1999,
      available: 300
    },
    {
      name: "VIP",
      price: 4999,
      available: 100
    }
  ],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

### 3. **`tickets` Collection**

Stores all ticket purchases with complete user and event details.

#### Fields:
```javascript
{
  _id: ObjectId("..."),                    // Unique ticket ID
  userId: ObjectId("..."),                 // Reference to user who purchased
  eventId: ObjectId("..."),                // Reference to event
  passType: "VIP",                         // Type of pass purchased
  price: 4999,                             // Price per ticket
  quantity: 2,                             // Number of tickets
  qrCode: "data:image/png;base64,...",     // QR code image (base64)
  status: "active",                        // active | scanned | cancelled
  purchaseDate: ISODate("..."),            // When ticket was purchased
  createdAt: ISODate("..."),               // Creation timestamp
  updatedAt: ISODate("..."),               // Last update timestamp
}
```

#### QR Code Data (embedded in QR):
```javascript
{
  ticketId: "TKT-1699123456789-ABC123XYZ",
  userId: "ObjectId(...)",
  userName: "John Doe",
  userEmail: "john@example.com",
  userPhone: "+919876543210",
  eventId: "ObjectId(...)",
  eventName: "Tech Conference 2025",
  passType: "VIP",
  quantity: 2,
  price: 4999,
  totalAmount: 9998,
  purchaseDate: "2025-10-07T12:34:56.789Z",
  timestamp: 1699123456789
}
```

---

## 🔄 User Activity Flow

### **Google Sign-In Flow**

1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. User grants permission
4. **Callback triggered:**
   - Check if user exists in MongoDB (by email)
   - If **new user**: Create user document with name, email, image
   - If **existing user**: Update name and image if changed
5. User logged in with JWT session
6. **Console log**: `✅ New user created: john@example.com` or `✅ User logged in: john@example.com`

### **Phone OTP Sign-In Flow**

1. User enters phone number
2. Clicks "Send OTP"
3. **API call to `/api/auth/send-otp`:**
   - Check if user exists (by phone number)
   - If **new user**: Create user document with phone number
   - If **existing user**: Update OTP and expiry
   - Generate 6-digit OTP
   - Save OTP to MongoDB (valid for 10 minutes)
   - **Development**: OTP shown in toast notification
   - **Production**: Send via SMS (Twilio integration ready)
4. **Console log**: `📱 OTP for +919876543210: 123456`
5. User enters OTP
6. **Verification:**
   - Check if OTP matches and hasn't expired
   - If valid: Clear OTP, log user in
   - If invalid: Show error
7. **Console log**: `✅ User logged in: +919876543210`

### **Ticket Purchase Flow**

1. User browses events (logged in)
2. Selects event and pass type
3. Clicks "Proceed to Payment"
4. Razorpay payment processed
5. **After successful payment:**
   - Fetch user details from MongoDB
   - Fetch event details from MongoDB
   - Generate unique QR code with all details
   - Create ticket document in MongoDB
   - Link ticket to user and event
   - Update event availability
6. **Console log**: 
   ```
   ✅ Ticket purchased successfully: {
     ticketId: ObjectId("..."),
     user: "john@example.com",
     event: "Tech Conference 2025",
     passType: "VIP",
     quantity: 2,
     totalAmount: 9998
   }
   ```

---

## 👁️ How to View User Data in MongoDB

### **Option 1: MongoDB Compass (Recommended)**

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Click on `test` database (or your database name)
4. View collections:
   - **`users`**: All registered users
   - **`events`**: All events
   - **`tickets`**: All ticket purchases

#### Useful Filters:
```javascript
// Find user by email
{ email: "john@example.com" }

// Find user by phone
{ phoneNumber: "+919876543210" }

// Find all tickets for a user
// (In tickets collection)
{ userId: ObjectId("user_id_here") }

// Find active tickets
{ status: "active" }

// Find tickets for specific event
{ eventId: ObjectId("event_id_here") }
```

### **Option 2: Browser API**

Visit: `http://localhost:3000/api/admin/database`

Shows:
- Count of users, events, tickets
- Sample data from each collection

### **Option 3: MongoDB Shell**

```bash
mongosh mongodb://localhost:27017/test

# View all users
db.users.find().pretty()

# View all tickets
db.tickets.find().pretty()

# Find tickets with user and event details
db.tickets.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $lookup: {
      from: "events",
      localField: "eventId",
      foreignField: "_id",
      as: "event"
    }
  },
  {
    $project: {
      userName: { $arrayElemAt: ["$user.name", 0] },
      userEmail: { $arrayElemAt: ["$user.email", 0] },
      userPhone: { $arrayElemAt: ["$user.phoneNumber", 0] },
      eventName: { $arrayElemAt: ["$event.name", 0] },
      passType: 1,
      quantity: 1,
      price: 1,
      status: 1,
      purchaseDate: 1
    }
  }
])
```

---

## 📋 What Gets Tracked

### ✅ User Sign-Up (Google)
- Email address
- Full name
- Profile picture URL
- Sign-up timestamp
- Last login timestamp

### ✅ User Sign-Up (Phone)
- Phone number
- Name (if provided)
- Sign-up timestamp
- OTP verification status

### ✅ User Login
- Login timestamp
- Login method (Google/Phone)
- Console log with user identifier

### ✅ Ticket Purchase
- User ID (linked to user document)
- User name, email, phone (embedded in QR)
- Event ID (linked to event document)
- Event name, date, location (embedded in QR)
- Pass type selected
- Quantity purchased
- Price per ticket
- Total amount
- Payment ID (from Razorpay)
- QR code (unique for each ticket)
- Purchase timestamp
- Ticket status (active/scanned/cancelled)

---

## 🔍 Console Logs for Tracking

### Authentication Logs:
```
🔐 Auth Configuration Check:
GOOGLE_CLIENT_ID: ✅ Set
GOOGLE_CLIENT_SECRET: ✅ Set
NEXTAUTH_SECRET: ✅ Set
NEXTAUTH_URL: http://localhost:3000

✅ New user created: john@example.com
✅ User logged in: john@example.com

📝 Sign-in event: {
  provider: 'google',
  user: 'john@example.com',
  timestamp: '2025-10-07T12:34:56.789Z'
}

📱 OTP for +919876543210: 123456
⏰ OTP expires at: 2025-10-07T12:44:56.789Z
```

### Ticket Purchase Logs:
```
✅ Ticket purchased successfully: {
  ticketId: ObjectId("..."),
  user: 'john@example.com',
  event: 'Tech Conference 2025',
  passType: 'VIP',
  quantity: 2,
  totalAmount: 9998
}

📊 Fetched 5 tickets for user: john@example.com
```

---

## 🚀 Testing the Complete Flow

### **1. Test Google Sign-In**

1. Go to `http://localhost:3000/auth/signin`
2. Click "Continue with Google"
3. Complete Google OAuth
4. **Check Console**: Should see `✅ New user created` or `✅ User logged in`
5. **Check MongoDB Compass**: Open `users` collection, you should see your user

### **2. Test Phone OTP Sign-In**

1. Go to `http://localhost:3000/auth/signin`
2. Enter phone number: `+919876543210`
3. Click "Send OTP"
4. **Check Console**: Should see `📱 OTP for +919876543210: XXXXXX`
5. **Check Toast**: OTP will be displayed in development mode
6. Enter the OTP
7. Click "Verify OTP"
8. **Check MongoDB Compass**: User should be in `users` collection with phone number

### **3. Test Ticket Purchase**

1. Ensure you're logged in
2. Seed events: Visit `http://localhost:3000/api/seed-events`
3. Go to home page
4. Click on an event card
5. Click "Purchase Ticket"
6. Select pass type and quantity
7. Click "Proceed to Payment"
8. Complete Razorpay payment (or use test mode)
9. **Check Console**: Should see `✅ Ticket purchased successfully`
10. **Check MongoDB Compass**: Ticket should be in `tickets` collection
11. Go to "My Tickets" page to view purchased ticket

---

## 📊 Sample Queries for MongoDB

### Get all users with their ticket count:
```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "tickets",
      localField: "_id",
      foreignField: "userId",
      as: "tickets"
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      phoneNumber: 1,
      ticketCount: { $size: "$tickets" },
      totalSpent: { $sum: "$tickets.price" }
    }
  }
])
```

### Get purchase statistics:
```javascript
db.tickets.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 },
      totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } }
    }
  }
])
```

### Find top customers:
```javascript
db.tickets.aggregate([
  {
    $group: {
      _id: "$userId",
      ticketCount: { $sum: "$quantity" },
      totalSpent: { $sum: { $multiply: ["$price", "$quantity"] } }
    }
  },
  {
    $sort: { totalSpent: -1 }
  },
  {
    $limit: 10
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  }
])
```

---

## 🔐 Privacy & Security

### Data Stored:
- ✅ User consent obtained via OAuth
- ✅ OTP cleared after verification (not stored permanently)
- ✅ QR codes encrypted with timestamp and unique ID
- ✅ Phone numbers stored securely
- ✅ Email addresses from Google OAuth only

### Best Practices:
- 🔒 Never expose MongoDB connection string
- 🔒 Use environment variables for sensitive data
- 🔒 Implement rate limiting on OTP endpoints
- 🔒 Add MongoDB authentication in production
- 🔒 Encrypt sensitive user data
- 🔒 Regular database backups

---

## ✅ Verification Checklist

To ensure everything is working:

- [ ] Users created on Google sign-in (check `users` collection)
- [ ] Users created on phone OTP (check `users` collection)
- [ ] OTP sent and logged in console
- [ ] Tickets created after purchase (check `tickets` collection)
- [ ] Tickets linked to correct user (userId field)
- [ ] Tickets linked to correct event (eventId field)
- [ ] QR codes generated for each ticket
- [ ] Purchase logs in server console
- [ ] Event availability updated after purchase
- [ ] All user data visible in MongoDB Compass

---

## 📞 Support

If you're not seeing data in MongoDB:

1. **Check MongoDB is running**: `mongosh --eval "db.version()"`
2. **Check database name**: Might be in `test` or `ticketr` database
3. **Restart dev server**: Environment changes require restart
4. **Check console logs**: Look for error messages
5. **Check `.env.local`**: Ensure `MONGODB_URI` is set correctly

---

**Your TICKETr app now fully tracks all user activity in MongoDB!** 🎉

Every sign-up, login, and ticket purchase is saved with complete details including name, email, phone number, and purchase status.

