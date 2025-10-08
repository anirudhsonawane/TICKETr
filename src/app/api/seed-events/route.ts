import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

const sampleEvents = [
  {
    name: "Tech Conference 2025",
    description: "Join industry leaders and innovators for a day of inspiring talks, networking, and hands-on workshops. Explore the latest trends in AI, cloud computing, and software development.",
    date: new Date("2025-11-15"),
    time: "09:00 AM",
    location: {
      name: "Mumbai Convention Center",
      address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      coordinates: {
        lat: 19.0596,
        lng: 72.8295,
      },
    },
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    category: "Technology",
    organizer: "Tech Events India",
    maxCapacity: 500,
    availability: 500,
    price: 1999,
    passes: [
      { name: "Early Bird", price: 1499, description: "Early bird special pricing", benefits: ["Priority seating", "Free lunch", "Event materials"] },
      { name: "Regular", price: 1999, description: "Standard admission", benefits: ["General seating", "Free lunch"] },
      { name: "VIP", price: 4999, description: "VIP experience", benefits: ["Front row seating", "Meet & greet", "Premium lunch", "Swag bag"] },
    ],
  },
  {
    name: "Music Festival 2025",
    description: "Experience an unforgettable night with top artists from around the world. Featuring multiple stages, food stalls, and an electrifying atmosphere.",
    date: new Date("2025-12-20"),
    time: "06:00 PM",
    location: {
      name: "Mahalaxmi Race Course",
      address: "Mahalaxmi, Mumbai, Maharashtra 400034",
      coordinates: {
        lat: 18.9826,
        lng: 72.8226,
      },
    },
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    category: "Music",
    organizer: "Mumbai Music Productions",
    maxCapacity: 1000,
    availability: 1000,
    price: 2999,
    passes: [
      { name: "General Admission", price: 2999, description: "General entry pass", benefits: ["Access to all stages", "Food court access"] },
      { name: "Premium", price: 4999, description: "Premium zone access", benefits: ["Premium viewing area", "Dedicated bar", "Free merchandise"] },
      { name: "Backstage Pass", price: 9999, description: "Exclusive backstage access", benefits: ["Meet artists", "Backstage tour", "VIP lounge", "Premium food & drinks"] },
    ],
  },
  {
    name: "Art Exhibition - Modern Masters",
    description: "A curated collection of contemporary art from emerging and established artists. Interactive installations, live performances, and artist meet & greets.",
    date: new Date("2025-10-25"),
    time: "11:00 AM",
    location: {
      name: "Jehangir Art Gallery",
      address: "Kala Ghoda, Fort, Mumbai, Maharashtra 400001",
      coordinates: {
        lat: 18.9273,
        lng: 72.8312,
      },
    },
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&h=600&fit=crop",
    category: "Art & Culture",
    organizer: "Mumbai Art Council",
    maxCapacity: 200,
    availability: 200,
    price: 499,
    passes: [
      { name: "Single Day Pass", price: 499, description: "One day access", benefits: ["Gallery access", "Artist talks"] },
      { name: "Weekend Pass", price: 799, description: "Two day access", benefits: ["Gallery access", "Artist talks", "Workshop access"] },
    ],
  },
  {
    name: "Startup Pitch Night",
    description: "Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs, investors, and industry experts. Open mic session included.",
    date: new Date("2025-11-08"),
    time: "07:00 PM",
    location: {
      name: "WeWork BKC",
      address: "G Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      coordinates: {
        lat: 19.0625,
        lng: 72.8685,
      },
    },
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
    category: "Business",
    organizer: "Startup Hub Mumbai",
    maxCapacity: 150,
    availability: 150,
    price: 999,
    passes: [
      { name: "Attendee", price: 999, description: "General attendee pass", benefits: ["Networking access", "Light refreshments"] },
      { name: "Investor Pass", price: 2999, description: "Investor exclusive", benefits: ["Priority seating", "Private networking lounge", "Pitch deck access"] },
    ],
  },
  {
    name: "Food & Wine Festival",
    description: "Savor exquisite dishes from Mumbai's best restaurants and sample fine wines from around the world. Live cooking demonstrations and chef interactions.",
    date: new Date("2025-12-05"),
    time: "05:00 PM",
    location: {
      name: "Jio World Garden",
      address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      coordinates: {
        lat: 19.0632,
        lng: 72.8679,
      },
    },
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    category: "Food & Beverage",
    organizer: "Culinary Arts Mumbai",
    maxCapacity: 300,
    availability: 300,
    price: 1499,
    passes: [
      { name: "Tasting Pass", price: 1499, description: "Food & wine tasting", benefits: ["Food samples", "Wine tasting", "Recipe cards"] },
      { name: "Masterclass Pass", price: 2999, description: "Includes masterclass", benefits: ["Cooking masterclass", "Chef meet & greet", "Premium tastings", "Take-home kit"] },
    ],
  },
  {
    name: "Comedy Night Live",
    description: "An evening of laughter with India's top stand-up comedians. Multiple acts, improv sessions, and audience participation.",
    date: new Date("2025-10-30"),
    time: "08:00 PM",
    location: {
      name: "The Canvas Laugh Club",
      address: "Palladium Mall, Lower Parel, Mumbai, Maharashtra 400013",
      coordinates: {
        lat: 19.0011,
        lng: 72.8295,
      },
    },
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
    category: "Entertainment",
    organizer: "Laugh Factory India",
    maxCapacity: 250,
    availability: 250,
    price: 799,
    passes: [
      { name: "General Seating", price: 799, description: "Standard seating", benefits: ["Show access", "Complimentary drink"] },
      { name: "Premium Seating", price: 1299, description: "Front row seats", benefits: ["Front row seating", "2 complimentary drinks", "Meet & greet with comedians"] },
    ],
  },
  {
    name: "Yoga & Wellness Retreat",
    description: "A full-day wellness experience with yoga sessions, meditation workshops, healthy food, and mindfulness activities. All levels welcome.",
    date: new Date("2025-11-12"),
    time: "07:00 AM",
    location: {
      name: "Sanjay Gandhi National Park",
      address: "Borivali East, Mumbai, Maharashtra 400066",
      coordinates: {
        lat: 19.2148,
        lng: 72.9081,
      },
    },
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    category: "Health & Wellness",
    organizer: "Wellness Warriors Mumbai",
    maxCapacity: 100,
    availability: 100,
    price: 1299,
    passes: [
      { name: "Day Pass", price: 1299, description: "Full day access", benefits: ["Yoga sessions", "Meditation", "Healthy meals", "Wellness kit"] },
      { name: "VIP Experience", price: 2499, description: "Premium wellness package", benefits: ["Private yoga session", "Spa treatment", "Premium meals", "Wellness consultation", "Take-home kit"] },
    ],
  },
  {
    name: "Gaming Tournament - Battle Royale",
    description: "Compete in an epic gaming tournament with cash prizes. Multiple game categories, live streaming, and gaming exhibitions.",
    date: new Date("2025-11-22"),
    time: "10:00 AM",
    location: {
      name: "Phoenix Marketcity",
      address: "Kurla West, Mumbai, Maharashtra 400070",
      coordinates: {
        lat: 19.0822,
        lng: 72.8893,
      },
    },
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
    category: "Gaming",
    organizer: "E-Sports Mumbai",
    maxCapacity: 200,
    availability: 200,
    price: 599,
    passes: [
      { name: "Spectator Pass", price: 299, description: "Watch the tournament", benefits: ["Tournament viewing", "Food court access"] },
      { name: "Player Pass", price: 599, description: "Compete in tournament", benefits: ["Tournament entry", "Player lounge", "Gaming merchandise", "Prize eligibility"] },
    ],
  },
];

export async function GET() {
  try {
    await dbConnect();

    // Clear existing events (optional - comment out if you want to keep existing events)
    await Event.deleteMany({});

    // Insert sample events
    const createdEvents = await Event.insertMany(sampleEvents);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdEvents.length} events`,
      events: createdEvents.map(event => ({
        id: event._id,
        name: event.name,
        category: event.category,
        date: event.date,
        availability: event.availability,
      })),
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        message: 'Failed to seed events. Make sure MongoDB is connected.',
      },
      { status: 500 }
    );
  }
}
