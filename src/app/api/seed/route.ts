import { NextResponse } from 'next/server';
import { seedEvents } from '@/lib/seed-events';

export async function POST() {
  try {
    await seedEvents();
    return NextResponse.json({ message: 'Events seeded successfully!' });
  } catch (error) {
    console.error('Error seeding events:', error);
    return NextResponse.json(
      { error: 'Failed to seed events' },
      { status: 500 }
    );
  }
}
