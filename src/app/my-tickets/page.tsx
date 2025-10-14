'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Loader2, ArrowLeft, Eye } from 'lucide-react';
import { ITicket } from '@/models/Ticket';

interface TicketWithEvent extends ITicket {
  eventId: {
    _id: string;
    name: string;
    date: Date;
    time: string;
    location: {
      name: string;
      address: string;
    };
    image: string;
  };
}

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchTickets();
  }, [session, status]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        // Handle both array response and wrapped response
        const ticketsArray = Array.isArray(data) ? data : (data.tickets || []);
        
        // Debug: Log the received data
        console.log('🎫 MyTicketsPage received data:', {
          rawData: data,
          ticketsArray,
          firstTicket: ticketsArray[0],
          firstTicketEventId: ticketsArray[0]?.eventId,
          firstTicketEventName: ticketsArray[0]?.eventId?.name
        });
        
        setTickets(ticketsArray);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };


  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">
            Manage and view all your event tickets
          </p>
        </div>

        {(!tickets || tickets.length === 0) ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Ticket className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't purchased any tickets yet
            </p>
            <Link href="/">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets && tickets.map((ticket) => (
              <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.eventId?.name || 'Event Name TBD'}
                        </h3>
                        <Badge 
                          variant={ticket.status === 'scanned' ? 'destructive' : 'default'}
                          className={ticket.status === 'scanned' ? 'bg-red-500 hover:bg-red-600' : ''}
                        >
                          {ticket.status === 'scanned' ? 'Scanned' : 'Active'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>
                          <strong>Pass:</strong> {ticket.passName || 'General'}
                        </span>
                        <span>
                          <strong>Count:</strong> {ticket.quantity}
                        </span>
                        <span>
                          <strong>Ticket ID:</strong> {ticket.ticketId}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link href={`/tickets/${ticket.ticketId}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-orange-500 text-orange-500 hover:bg-orange-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
