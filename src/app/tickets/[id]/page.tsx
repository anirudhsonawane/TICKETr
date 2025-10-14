'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Loader2, Printer } from 'lucide-react';
import { ITicket } from '@/models/Ticket';

interface TicketWithEvent {
  _id: string;
  ticketId: string;
  userId: string;
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
    organizer: string;
  };
  passType: string;
  passName: string;
  quantity: number;
  price: number;
  status: string;
  purchaseDate: Date;
}

export default function TicketPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [ticket, setTicket] = useState<TicketWithEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchTicket();
  }, [session, params.id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`);
      if (response.ok) {
        const ticketData = await response.json();
        setTicket(ticketData);
        
        // Use existing QR code (already a data URL)
        if (ticketData.qrCode) {
          setQrCodeUrl(ticketData.qrCode);
        }
      } else {
        router.push('/my-tickets');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      router.push('/my-tickets');
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket not found</h1>
          <Button onClick={() => router.push('/my-tickets')}>
            Back to My Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/my-tickets')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Tickets
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Your Ticket</h1>
        </div>

        {/* Ticket Card */}
        <Card className="overflow-hidden p-0">
          {/* Status Indicator - Warm Sunset Theme */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ${
                  ticket.status === 'scanned' 
                    ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white' 
                    : 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    ticket.status === 'scanned' ? 'bg-gray-200' : 'bg-orange-200'
                  }`}></div>
                  {ticket.status === 'scanned' ? 'Already Used' : 'Valid Ticket'}
                </div>
              </div>
              <div className="text-xs text-orange-600 font-mono bg-orange-100 px-2 py-1 rounded">
                #{ticket.ticketId}
              </div>
            </div>
          </div>
          
          {/* Event Image Header */}
          <div className="relative h-48 w-full">
            <Image
              src={ticket.eventId?.image || '/placeholder-event.svg'}
              alt={ticket.eventId?.name || 'Event'}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{ticket.eventId?.name || 'Event Name TBD'}</h2>
              <p className="text-white/90">{ticket.eventId?.location?.name || 'Location TBD'}</p>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/20 text-white border-white/30">
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Event Details */}
              <div className="space-y-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span>{ticket.eventId?.date ? formatDate(ticket.eventId.date) : 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{ticket.eventId?.time || 'Time TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{ticket.eventId?.location?.name || 'Location TBD'}</p>
                        <p className="text-sm text-gray-600">{ticket.eventId?.location?.address || 'Address TBD'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Ticket Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket ID:</span>
                      <span className="font-mono text-xs">{ticket.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pass Type:</span>
                      <span>{ticket.passName || 'General'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span>{ticket.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatPrice(ticket.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                    {ticket.scannedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scanned At:</span>
                        <span>{formatDate(ticket.scannedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="font-semibold mb-4">QR Code</h4>
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="mx-auto"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Show this QR code at the event entrance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
