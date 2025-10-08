'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ticket, Calendar, Clock, MapPin, QrCode, Loader2, Eye } from 'lucide-react';
import { ITicket } from '@/models/Ticket';

interface TicketWithEvent extends ITicket {
  eventId: {
    _id: string;
    name: string;
    date: Date;
    time: string;
    location: {
      name: string;
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
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scanned':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">
            Manage and view all your event tickets
          </p>
        </div>

        {tickets.length === 0 ? (
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
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <Card key={ticket._id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Event Image */}
                  <div className="md:w-1/3">
                    <div className="relative h-48 md:h-full">
                      <Image
                        src={ticket.eventId.image}
                        alt={ticket.eventId.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">
                            {ticket.eventId.name}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(ticket.eventId.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{ticket.eventId.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{ticket.eventId.location.name}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ticket Information */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Ticket Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Ticket ID:</span>
                                <span className="font-mono text-xs">
                                  {ticket.ticketId}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pass Type:</span>
                                <span>
                                  {ticket.passName || 'General'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span>{ticket.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-medium">
                                  {formatPrice(ticket.totalAmount)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Purchase Date:</span>
                                <span>
                                  {formatDate(ticket.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code and Actions */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              QR Code
                            </h4>
                            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500">
                                Show this QR code at the event entrance
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Link href={`/tickets/${ticket.ticketId}`}>
                              <Button variant="outline" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Ticket
                              </Button>
                            </Link>
                            
                            {ticket.status === 'active' && (
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  // TODO: Implement download ticket functionality
                                  console.log('Download ticket');
                                }}
                              >
                                Download Ticket
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
