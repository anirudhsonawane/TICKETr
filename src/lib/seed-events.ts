import connectDB from './mongodb';
import Event from '@/models/Event';

const sampleEvents = [
  {
    name: "Tech Conference 2024",
    description: "Join us for the biggest technology conference of the year featuring the latest innovations in AI, blockchain, and cloud computing. Network with industry leaders and discover cutting-edge solutions.",
    price: 2500,
    location: {
      name: "Convention Center",
      address: "123 Tech Street, Silicon Valley, CA 94000",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    },
    date: new Date("2024-12-15"),
    time: "9:00 AM - 6:00 PM",
    availability: 150,
    maxCapacity: 200,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    category: "technology",
    organizer: "Tech Events Inc.",
    passes: [
      {
        name: "VIP Pass",
        price: 5000,
        description: "Exclusive access to VIP lounge and networking dinner",
        benefits: [
          "VIP lounge access",
          "Networking dinner with speakers",
          "Premium seating",
          "Exclusive swag bag"
        ]
      },
      {
        name: "Student Pass",
        price: 1000,
        description: "Special pricing for students with valid ID",
        benefits: [
          "Access to all sessions",
          "Student networking lunch",
          "Digital resources"
        ]
      }
    ]
  },
  {
    name: "Music Festival 2024",
    description: "Experience the ultimate music festival with top artists from around the world. Three days of non-stop music, food, and fun in the heart of the city.",
    price: 1800,
    location: {
      name: "Central Park",
      address: "456 Music Avenue, New York, NY 10001",
      coordinates: {
        lat: 40.7829,
        lng: -73.9654
      }
    },
    date: new Date("2024-11-20"),
    time: "2:00 PM - 11:00 PM",
    availability: 75,
    maxCapacity: 100,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    category: "music",
    organizer: "Music Events Co.",
    passes: [
      {
        name: "VIP Experience",
        price: 3500,
        description: "Premium experience with backstage access",
        benefits: [
          "Backstage access",
          "Meet and greet with artists",
          "VIP viewing area",
          "Complimentary drinks"
        ]
      }
    ]
  },
  {
    name: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to a panel of expert investors. Network with entrepreneurs and discover the next big thing in business.",
    price: 500,
    location: {
      name: "Innovation Hub",
      address: "789 Startup Boulevard, San Francisco, CA 94105",
      coordinates: {
        lat: 37.7849,
        lng: -122.4094
      }
    },
    date: new Date("2024-10-25"),
    time: "6:00 PM - 9:00 PM",
    availability: 200,
    maxCapacity: 250,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: "business",
    organizer: "Startup Accelerator",
    passes: [
      {
        name: "Investor Pass",
        price: 1000,
        description: "Exclusive access for investors and VCs",
        benefits: [
          "Private networking session",
          "Early access to pitch decks",
          "Investor-only lunch",
          "Priority seating"
        ]
      }
    ]
  },
  {
    name: "Art Exhibition Opening",
    description: "Discover contemporary art from emerging and established artists. Enjoy wine and hors d'oeuvres while exploring stunning visual masterpieces.",
    price: 300,
    location: {
      name: "Modern Art Gallery",
      address: "321 Art District, Los Angeles, CA 90210",
      coordinates: {
        lat: 34.0522,
        lng: -118.2437
      }
    },
    date: new Date("2024-09-30"),
    time: "7:00 PM - 10:00 PM",
    availability: 50,
    maxCapacity: 80,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    category: "arts",
    organizer: "Art Gallery Collective",
    passes: []
  },
  {
    name: "Food & Wine Festival",
    description: "Indulge in exquisite cuisine and fine wines from renowned chefs and wineries. A culinary journey you won't forget.",
    price: 1200,
    location: {
      name: "Grand Hotel Ballroom",
      address: "555 Culinary Street, Napa Valley, CA 94558",
      coordinates: {
        lat: 38.2975,
        lng: -122.2869
      }
    },
    date: new Date("2024-11-10"),
    time: "6:00 PM - 11:00 PM",
    availability: 120,
    maxCapacity: 150,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    category: "food",
    organizer: "Culinary Events",
    passes: [
      {
        name: "Chef's Table",
        price: 2000,
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

export async function seedEvents() {
  try {
    await connectDB();
    
    // Clear existing events
    await Event.deleteMany({});
    
    // Insert sample events
    await Event.insertMany(sampleEvents);
    
    console.log('Sample events seeded successfully!');
  } catch (error) {
    console.error('Error seeding events:', error);
  }
}
