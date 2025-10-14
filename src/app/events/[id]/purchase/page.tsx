'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, Users, Ticket, Loader2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { IEvent } from '@/models/Event';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PurchasePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<string>('general');
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchEvent();
  }, [session, params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
      } else {
        toast.error('Event not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= event!.availability) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    
    const pass = selectedPass === 'general' 
      ? null 
      : event.passes?.find(p => p.name === selectedPass);
    
    const unitPrice = pass ? pass.price : event.price;
    return unitPrice * quantity;
  };

  const handlePayment = async () => {
    if (!event || !session) return;

    setProcessing(true);
    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          eventId: event._id,
          passName: selectedPass === 'general' ? null : selectedPass,
          quantity,
        }),
      });

      const order = await orderResponse.json();

      if (!order.id) {
        throw new Error('Failed to create payment order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'TICKETr',
          description: `Ticket for ${event.name}`,
          order_id: order.id,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verification = await verifyResponse.json();

              if (verification.verified) {
                // Create ticket
                const ticketResponse = await fetch('/api/tickets', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    eventId: event._id,
                    passName: selectedPass === 'general' ? null : selectedPass,
                    quantity,
                    paymentId: verification.paymentId,
                  }),
                });

                if (ticketResponse.ok) {
                  toast.success('Payment successful! Your tickets have been booked.');
                  router.push('/my-tickets');
                } else {
                  throw new Error('Failed to create ticket');
                }
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment processing error:', error);
              toast.error('Payment processing failed. Please try again.');
            }
          },
          prefill: {
            name: session.user?.name,
            email: session.user?.email,
          },
          theme: {
            color: '#3B82F6',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Tickets</h1>
          <p className="text-gray-600">
            Complete your ticket purchase for {event.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <Card>
              <div className="relative h-64 w-full">
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{event.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{event.location.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{event.maxCapacity} total capacity</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-red-500" />
                  <span>Purchase Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pass Selection */}
                <div className="space-y-2">
                  <Label htmlFor="pass">Select Pass</Label>
                  <Select value={selectedPass} onValueChange={setSelectedPass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pass" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        General - {formatPrice(event.price)}
                      </SelectItem>
                      {event.passes?.map((pass, index) => (
                        <SelectItem key={index} value={pass.name}>
                          {pass.name} - {formatPrice(pass.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Selection */}
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= event.availability}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Maximum {event.availability} tickets available
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <Separator />
                  <div className="flex justify-between">
                    <span>Price per ticket:</span>
                    <span>
                      {formatPrice(
                        selectedPass === 'general'
                          ? event.price
                          : event.passes?.find(p => p.name === selectedPass)?.price || event.price
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || event.availability === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4 mr-2" />
                      {event.availability === 0 ? 'Sold Out' : 'Purchase Tickets'}
                    </>
                  )}
                </Button>

                {event.availability === 0 && (
                  <p className="text-sm text-red-600 text-center">
                    This event is sold out
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
