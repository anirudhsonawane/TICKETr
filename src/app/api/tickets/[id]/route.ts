import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id } = await params;
    const ticket = await Ticket.findOne({
      ticketId: id,
      userId: (session.user as { id: string }).id,
    }).populate({
      path: 'eventId',
      model: 'Event'
    });
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Debug: Log ticket structure
    console.log('🎫 Individual ticket fetched:', {
      ticketId: ticket.ticketId,
      eventId: ticket.eventId,
      eventIdType: typeof ticket.eventId,
      eventName: ticket.eventId?.name,
      eventImage: ticket.eventId?.image,
      eventLocation: ticket.eventId?.location?.name,
      isEventPopulated: !!ticket.eventId?.name
    });
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}
