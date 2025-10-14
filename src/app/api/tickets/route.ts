import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const tickets = await Ticket.find({ userId: (session.user as { id: string }).id })
      .populate({
        path: 'eventId',
        model: 'Event'
      })
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Fetched ${tickets.length} tickets for user:`, session.user.email);
    
    // Debug: Log first ticket structure if tickets exist
    if (tickets.length > 0) {
      console.log('🔍 First ticket structure:', {
        ticketId: tickets[0].ticketId,
        eventId: tickets[0].eventId,
        eventIdType: typeof tickets[0].eventId,
        eventIdConstructor: tickets[0].eventId?.constructor?.name,
        eventName: tickets[0].eventId?.name,
        eventImage: tickets[0].eventId?.image,
        eventLocation: tickets[0].eventId?.location?.name,
        isEventPopulated: !!tickets[0].eventId?.name
      });
    }
    
    return NextResponse.json(tickets);
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
    
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { eventId, passName, quantity, paymentId } = await request.json();
    
    // Validate input
    if (!eventId || !quantity || !paymentId) {
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
    const user = await User.findById((session.user as { id: string }).id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate price based on pass type
    const pass = passName ? event.passes?.find((p: { name: string; price: number }) => p.name === passName) : null;
    const unitPrice = pass ? pass.price : event.price;
    const totalAmount = unitPrice * quantity;
    
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate unique QR code data
    const qrCodeData = JSON.stringify({
      ticketId,
      userId: (session.user as { id: string }).id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phoneNumber,
      eventId: event._id,
      eventName: event.name,
      passName: passName || 'General',
      quantity,
      unitPrice,
      totalAmount,
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
      userId: (session.user as { id: string }).id,
      eventId: new Types.ObjectId(event._id),
      ticketId,
      passName: passName || 'General',
      unitPrice,
      quantity,
      totalAmount,
      qrCode: qrCodeImage,
      status: 'active',
      paymentId,
      createdAt: new Date(),
    });

    console.log('✅ Ticket purchased successfully:', {
      ticketId: ticket._id,
      user: user.email,
      event: event.name,
      passName: passName || 'General',
      quantity,
      totalAmount,
    });
    
    // Update event available tickets
    if (pass && pass.available >= quantity) {
      pass.available -= quantity;
      event.availability -= quantity;
      await event.save();
    } else if (!pass) {
      // For general tickets, update the main availability
      event.availability -= quantity;
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
