import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const tickets = await Ticket.find({ userId: session.user.id })
      .populate('eventId')
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Fetched ${tickets.length} tickets for user:`, session.user.email);
    
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { eventId, passType, price, quantity } = await request.json();
    
    // Validate input
    if (!eventId || !passType || !price || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get user details
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate unique QR code data
    const qrCodeData = JSON.stringify({
      ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: session.user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phoneNumber,
      eventId: event._id,
      eventName: event.name,
      passType,
      quantity,
      price,
      totalAmount: price * quantity,
      purchaseDate: new Date().toISOString(),
      timestamp: Date.now(),
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    // Create ticket
    const ticket = await Ticket.create({
      userId: session.user.id,
      eventId: event._id,
      passType,
      price,
      quantity,
      qrCode: qrCodeImage,
      status: 'active',
      purchaseDate: new Date(),
    });

    console.log('✅ Ticket purchased successfully:', {
      ticketId: ticket._id,
      user: user.email,
      event: event.name,
      passType,
      quantity,
      totalAmount: price * quantity,
    });
    
    // Update event available tickets
    const pass = event.passes.find(p => p.name === passType);
    if (pass && pass.available >= quantity) {
      pass.available -= quantity;
      event.availableTickets -= quantity;
      await event.save();
    }
    
    // Populate the ticket data before returning
    await ticket.populate('eventId');
    await ticket.populate('userId', 'name email phoneNumber');
    
    return NextResponse.json({ 
      success: true, 
      ticket,
      message: 'Ticket purchased successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
