import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

const ADMIN_EMAILS = ['anirudhsonawane111@gmail.com'];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all events
    const events = await Event.find({});
    const totalEvents = events.length;
    const activeEvents = events.filter(event => event.availability > 0).length;

    // Get all tickets
    const tickets = await Ticket.find({});
    const totalTickets = tickets.length;

    // Calculate total revenue
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);

    const stats = {
      totalEvents,
      totalTickets,
      totalRevenue,
      activeEvents
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
