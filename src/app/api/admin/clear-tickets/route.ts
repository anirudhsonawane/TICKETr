import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function DELETE() {
  try {
    await dbConnect();
    
    // Clear all existing tickets
    const result = await Ticket.deleteMany({});
    
    console.log(`🗑️ Cleared ${result.deletedCount} tickets from database`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} tickets`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear tickets' },
      { status: 500 }
    );
  }
}
