# MongoDB Data Viewing Guide

## 🗄️ How to View Your MongoDB Data

There are several ways to view and manage your MongoDB data for the TICKETr application.

---

## Option 1: MongoDB Compass (Recommended for Beginners) 🎯

**MongoDB Compass** is the official GUI tool from MongoDB.

### Installation:
1. Download from: https://www.mongodb.com/try/download/compass
2. Install the application
3. Launch MongoDB Compass

### Connecting:
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"

### Viewing Data:
1. You'll see a list of databases on the left
2. Click on `ticketr` database
3. You'll see collections:
   - `users` - User accounts and authentication data
   - `events` - Event listings
   - `tickets` - Purchased tickets
   - `accounts` - NextAuth account linking (if using database adapter)
   - `sessions` - User sessions (if using database adapter)

4. Click on any collection to view documents
5. Use the filter bar to search: `{ email: "user@example.com" }`

### Features:
- ✅ Visual interface
- ✅ Query builder
- ✅ Index management
- ✅ Performance insights
- ✅ Schema visualization

---

## Option 2: MongoDB Shell (mongosh) 💻

**MongoDB Shell** is the command-line interface for MongoDB.

### Installation:
Download from: https://www.mongodb.com/try/download/shell

Or install with npm:
```bash
npm install -g mongosh
```

### Connect to Database:
```bash
mongosh mongodb://localhost:27017/ticketr
```

### Basic Commands:

#### View All Databases:
```javascript
show dbs
```

#### Switch to ticketr Database:
```javascript
use ticketr
```

#### View All Collections:
```javascript
show collections
```

#### View All Users:
```javascript
db.users.find()
```

#### View Users (Pretty Print):
```javascript
db.users.find().pretty()
```

#### Count Documents:
```javascript
db.users.countDocuments()
db.events.countDocuments()
db.tickets.countDocuments()
```

#### Find Specific User by Email:
```javascript
db.users.findOne({ email: "user@example.com" })
```

#### View All Events:
```javascript
db.events.find().pretty()
```

#### View All Tickets for a User:
```javascript
db.tickets.find({ userId: ObjectId("user_id_here") }).pretty()
```

#### View Tickets with Event Details (Lookup):
```javascript
db.tickets.aggregate([
  {
    $lookup: {
      from: "events",
      localField: "eventId",
      foreignField: "_id",
      as: "eventDetails"
    }
  }
])
```

#### Delete All Documents in a Collection:
```javascript
db.users.deleteMany({})  // ⚠️ Use with caution!
```

#### Drop Entire Database:
```javascript
db.dropDatabase()  // ⚠️ This deletes everything!
```

---

## Option 3: VS Code Extension 📝

Install **MongoDB for VS Code** extension.

### Installation:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "MongoDB for VS Code"
4. Install the official MongoDB extension

### Connect:
1. Click the MongoDB icon in the sidebar
2. Click "Add Connection"
3. Enter: `mongodb://localhost:27017`
4. Click "Connect"

### View Data:
1. Expand "Connections" → "localhost:27017"
2. Expand "ticketr" database
3. Right-click a collection → "View Documents"

---

## Option 4: Studio 3T (Professional Tool) 🚀

**Studio 3T** is a powerful MongoDB GUI with more features.

### Download:
https://studio3t.com/download/

### Features:
- Visual query builder
- Data import/export
- SQL query support
- IntelliShell
- Schema explorer

### Connection:
1. Click "Connect"
2. Create new connection
3. Server: `localhost`
4. Port: `27017`
5. Click "Connect"

---

## Option 5: Web-Based: mongo-express 🌐

**mongo-express** is a web-based MongoDB admin interface.

### Installation:
```bash
npm install -g mongo-express
```

### Run:
```bash
mongo-express
```

### Access:
Open browser and go to: http://localhost:8081

### Features:
- Web-based interface
- View/Edit/Delete documents
- Run queries
- Import/Export data

---

## Option 6: Programmatic Access (API Route) 🔧

Create an API route in your Next.js app to view data.

### Create File: `ticketr-app/src/app/api/admin/database/route.ts`

```typescript
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

export async function GET() {
  await dbConnect();

  try {
    const users = await User.find({}).limit(10);
    const events = await Event.find({}).limit(10);
    const tickets = await Ticket.find({}).populate('userId').populate('eventId').limit(10);

    return NextResponse.json({
      success: true,
      counts: {
        users: await User.countDocuments(),
        events: await Event.countDocuments(),
        tickets: await Ticket.countDocuments(),
      },
      data: {
        users,
        events,
        tickets,
      },
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
```

### Access:
Navigate to: http://localhost:3000/api/admin/database

---

## 🎯 Quick Start Recommendations

### For Beginners:
👉 **Use MongoDB Compass** - Easy visual interface, no coding needed

### For Developers:
👉 **Use MongoDB Shell (mongosh)** - Fast, powerful, scriptable

### For VS Code Users:
👉 **MongoDB for VS Code Extension** - View data without leaving your editor

### For Complex Queries:
👉 **Studio 3T** - Advanced features and SQL support

---

## 📊 Useful Queries for TICKETr

### Check if MongoDB is running:
```bash
# In PowerShell or Command Prompt
mongosh --eval "db.version()"
```

### View all users who signed in:
```javascript
db.users.find({}, { name: 1, email: 1, createdAt: 1 }).pretty()
```

### View all events with available tickets:
```javascript
db.events.find({ availableTickets: { $gt: 0 } }).pretty()
```

### View all active tickets:
```javascript
db.tickets.find({ status: "active" }).pretty()
```

### Count tickets by status:
```javascript
db.tickets.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Find tickets for a specific event:
```javascript
db.tickets.find({ eventId: ObjectId("event_id_here") }).pretty()
```

### View user with their tickets:
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
      ticketCount: { $size: "$tickets" }
    }
  }
])
```

---

## 🔍 Database Structure for TICKETr

### Collections:

#### `users`
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  image: "https://...",
  phoneNumber: "+919876543210",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

#### `events`
```javascript
{
  _id: ObjectId("..."),
  name: "Tech Conference 2025",
  description: "...",
  date: ISODate("..."),
  time: "10:00 AM",
  location: {
    name: "Convention Center",
    address: "...",
    coordinates: { latitude: 19.0760, longitude: 72.8777 }
  },
  imageUrl: "https://...",
  category: "Technology",
  availableTickets: 100,
  price: 999,
  passes: [
    { name: "VIP", price: 1999, available: 20 },
    { name: "Regular", price: 999, available: 80 }
  ],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

#### `tickets`
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  eventId: ObjectId("..."),
  passType: "VIP",
  price: 1999,
  quantity: 2,
  qrCode: "data:image/png;base64,...",
  status: "active", // or "scanned" or "cancelled"
  purchaseDate: ISODate("..."),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## ⚠️ Important Notes

### Security:
- Never expose your database publicly
- Use authentication for MongoDB in production
- Protect admin routes with authentication

### Performance:
- MongoDB Compass can be slow with large datasets
- Use `.limit()` when querying large collections
- Create indexes for frequently queried fields

### Backup:
```bash
# Backup database
mongodump --db ticketr --out ./backup

# Restore database
mongorestore --db ticketr ./backup/ticketr
```

---

## 🚀 Next Steps

1. **Install MongoDB Compass** for easy visualization
2. **Connect to your local MongoDB** (localhost:27017)
3. **View the `ticketr` database** and explore collections
4. **Run sample queries** to understand your data structure

---

## 🆘 Troubleshooting

### "Connection refused"
- MongoDB is not running
- Start MongoDB service:
  ```bash
  # Windows (as Administrator):
  net start MongoDB
  
  # macOS/Linux:
  sudo systemctl start mongod
  ```

### "Database/Collection not found"
- Database is created automatically when you insert first document
- If you haven't created any data yet, the database won't exist

### "Authentication failed"
- If MongoDB requires auth, use:
  ```
  mongodb://username:password@localhost:27017/ticketr
  ```

---

## 📚 Additional Resources

- MongoDB Compass: https://www.mongodb.com/products/compass
- MongoDB Shell: https://www.mongodb.com/docs/mongodb-shell/
- MongoDB University (Free courses): https://university.mongodb.com/
- MongoDB Cheat Sheet: https://www.mongodb.com/developer/products/mongodb/cheat-sheet/

