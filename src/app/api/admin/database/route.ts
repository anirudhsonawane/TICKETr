import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

export async function GET() {
  try {
    await dbConnect();

    // Get counts
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const ticketCount = await Ticket.countDocuments();

    // Get sample data (limited to 10 records each)
    const users = await User.find({}).limit(10).select('-otp -otpExpires');
    const events = await Event.find({}).limit(10);
    const tickets = await Ticket.find({}).limit(10).populate('userId', 'name email').populate('eventId', 'name date');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount,
        events: eventCount,
        tickets: ticketCount,
      },
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
        })),
        events: events.map(event => ({
          id: event._id,
          name: event.name,
          category: event.category,
          date: event.date,
          location: event.location.name,
          availableTickets: event.availableTickets,
          price: event.price,
        })),
        tickets: tickets.map(ticket => ({
          id: ticket._id,
          user: (ticket as unknown as { userId?: { name?: string } }).userId?.name || 'Unknown',
          event: (ticket as unknown as { eventId?: { name?: string } }).eventId?.name || 'Unknown',
          passType: ticket.passType,
          quantity: ticket.quantity,
          price: ticket.price,
          status: ticket.status,
          purchaseDate: ticket.purchaseDate,
        })),
      },
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message,
        message: 'Failed to fetch database data. Make sure MongoDB is running.',
      }, 
      { status: 500 }
    );
  }
}

