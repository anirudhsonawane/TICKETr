'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, Clock, MapPin, QrCode, Eye } from 'lucide-react';
import { ITicket } from '@/models/Ticket';

interface TicketWithEvent extends Omit<ITicket, 'eventId'> {
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

interface TicketCardProps {
  ticket: TicketWithEvent;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const [qrError, setQrError] = useState(false);

  // Debug: Log ticket data to help troubleshoot image issues
  console.log('🎫 TicketCard rendering:', {
    ticketId: ticket.ticketId,
    eventName: ticket.eventId?.name,
    eventImage: ticket.eventId?.image,
    hasEventData: !!ticket.eventId
  });

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


  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="md:flex">
        {/* Event Image */}
        <div className="md:w-1/3">
          <div className="relative h-48 md:h-full">
            <Image
              src={ticket.eventId?.image || '/placeholder-event.svg'}
              alt={ticket.eventId?.name || 'Event'}
              fill
              className="object-cover"
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* Ticket Details */}
        <div className="md:w-2/3">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">
                  {ticket.eventId?.name || 'Event Name TBD'}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{ticket.eventId?.date ? formatDate(ticket.eventId.date) : 'Date TBD'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{ticket.eventId?.time || 'Time TBD'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{ticket.eventId?.location?.name || 'Location TBD'}</span>
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
                    {!qrError && ticket.qrCode ? (
                      <div className="flex justify-center">
                        <Image
                          src={ticket.qrCode}
                          alt="Ticket QR Code"
                          width={128}
                          height={128}
                          className="mx-auto mb-2"
                          onError={() => setQrError(true)}
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">
                          QR Code not available
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Show this QR code at the event entrance
                    </p>
                  </div>
                </div>

                <div>
                  <Link href={`/tickets/${ticket.ticketId}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Ticket
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
