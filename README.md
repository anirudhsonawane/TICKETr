# TICKETr - Event Ticket Booking Platform
https://www.ticketr-yoloclub.in/

A modern, full-stack event ticket booking platform built with Next.js, featuring OAuth authentication, Razorpay payments, and QR code ticketing.

## Features

- 🎫 **Event Management**: Browse and search events with detailed information
- 🔐 **Authentication**: Google OAuth and Mobile OTP sign-in
- 💳 **Payment Integration**: Secure payments with Razorpay
- 📱 **QR Code Tickets**: Unique QR codes for each ticket
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS and shadcn/ui
- 📍 **Location Integration**: Interactive maps for event locations
- 🎭 **Event Categories**: Filter events by category
- 📊 **Ticket Management**: View and manage purchased tickets

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **NextAuth.js** - Authentication library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Razorpay** - Payment gateway
- **QRCode** - QR code generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google OAuth credentials
- Razorpay account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticketr-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ticketr

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Razorpay
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

   # Twilio (for SMS OTP)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   ```

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

5. **Set up Razorpay**
   - Create account at [Razorpay](https://razorpay.com/)
   - Get your API keys from the dashboard
   - Add them to your environment variables

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Seed sample data** (optional)
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

## Project Structure

```
ticketr-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── events/            # Event pages
│   │   ├── my-tickets/        # User tickets page
│   │   └── tickets/           # Individual ticket pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Header.tsx        # Navigation header
│   │   └── EventCard.tsx     # Event card component
│   ├── lib/                  # Utility functions
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── mongodb.ts        # Database connection
│   │   └── seed-events.ts    # Sample data
│   └── models/               # MongoDB models
│       ├── User.ts           # User model
│       ├── Event.ts          # Event model
│       └── Ticket.ts         # Ticket model
```

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/[id]` - Get event by ID
- `POST /api/events` - Create new event

### Tickets
- `GET /api/tickets` - Get user's tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/[id]` - Get ticket by ID

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Utility
- `POST /api/seed` - Seed sample events

## Features Overview

### Event Cards with Flip Animation
- Interactive event cards that flip to show detailed information
- Responsive design with hover effects
- Location integration with Google Maps

### Authentication
- Google OAuth integration
- Mobile OTP authentication (framework ready)
- Session management with NextAuth.js

### Payment Flow
- Razorpay integration for secure payments
- Quantity selection for tickets
- Pass-based pricing (General, VIP, Student, etc.)

### Ticket Management
- Unique QR codes for each ticket
- Ticket status tracking (Active, Scanned, Cancelled)
- Download and print functionality

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- Ensure MongoDB Atlas for database
- Set up environment variables
- Configure domain for OAuth redirects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@ai-consultancy.com or create an issue in the repository.

---

**TICKETr** - Produced by ai. consultancy
