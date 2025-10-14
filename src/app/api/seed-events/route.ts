import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

const sampleEvents = [
  {
    name: "Art Modern - Exhibition",
    description: "A curated collection of contemporary art from established and emerging artists. Interactive installations, live performances, and artist meet & greets.",
    price: 3300,
    location: {
      name: "Modern Art Gallery",
      address: "321 Art District, Mumbai, India 400001",
      coordinates: {
        lat: 19.0760,
        lng: 72.8777
      }
    },
    date: new Date("2025-10-25"),
    time: "11:00 AM",
    availability: 200,
    maxCapacity: 200,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    category: "arts",
    organizer: "Art Gallery Collective",
    passes: []
  },
  {
    name: "Startup Pitch Night",
    description: "Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs, industry experts, and investors. Open mic session included.",
    price: 3300,
    location: {
      name: "Innovation Hub",
      address: "789 Startup Boulevard, Mumbai, India 400001",
      coordinates: {
        lat: 19.0760,
        lng: 72.8777
      }
    },
    date: new Date("2025-11-08"),
    time: "07:00 PM",
    availability: 120,
    maxCapacity: 120,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: "business",
    organizer: "Startup Accelerator",
    passes: [
      {
        name: "Investor Pass",
        price: 5000,
        description: "Exclusive access for investors and VCs",
        benefits: [
          "Private networking session",
          "Early access to pitch decks",
          "Investor-only dinner",
          "Priority seating"
        ]
      }
    ]
  },
  {
    name: "Food & Wine Festival",
    description: "Savor exquisite dishes from Mumbai's best restaurants and sample fine wines from around the world. Live cooking demonstrations and chef interactions.",
    price: 1400,
    location: {
      name: "Grand Hotel Ballroom",
      address: "555 Culinary Street, Mumbai, India 400001",
      coordinates: {
        lat: 19.0760,
        lng: 72.8777
      }
    },
    date: new Date("2025-12-02"),
    time: "08:00 PM",
    availability: 300,
    maxCapacity: 300,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    category: "food",
    organizer: "Culinary Events",
    passes: [
      {
        name: "Chef's Table",
        price: 2500,
        description: "Exclusive dining experience with celebrity chefs",
        benefits: [
          "Private chef's table seating",
          "Wine pairing with sommelier",
          "Meet the chefs",
          "Take-home gift basket"
        ]
      }
    ]
  }
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
