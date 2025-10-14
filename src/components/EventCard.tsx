'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, Ticket, Star, X } from 'lucide-react';
import { IEvent } from '@/models/Event';

interface EventCardProps {
  event: IEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleLocationClick = () => {
    const { lat, lng } = event.location.coordinates;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const handlePurchaseClick = () => {
    if (session) {
      router.push(`/events/${event._id}/purchase`);
    } else {
      // Redirect to sign in
      router.push('/auth/signin');
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

  return (
    <div className="group perspective-1000">
      <div
        className={`relative w-full h-[450px] transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow p-0">
            <div className="relative h-52 w-full">
              <Image
                src={event.image}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4 pb-4 h-52 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {event.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{event.availability} tickets left</span>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchaseClick();
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 mt-auto mt-2 min-h-[48px] text-sm sm:text-base relative z-10"
                disabled={event.availability === 0}
              >
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white" />
                <span className="truncate">
                  {event.availability === 0 ? 'Sold Out' : 'Purchase Ticket'}
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                <div>
                  <h4 className="font-medium mb-1 text-sm">Description</h4>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1 text-sm">Event Details</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatPrice(event.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability:</span>
                      <span>{event.availability} / {event.maxCapacity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1 text-sm">Location</h4>
                  <div className="text-xs">
                    <p className="font-medium">{event.location.name}</p>
                    <p className="text-gray-600 mb-2">{event.location.address}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationClick();
                      }}
                      className="h-7 text-xs px-2"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      View Map
                    </Button>
                  </div>
                </div>

                {event.passes && event.passes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Available Passes</h4>
                    <div className="space-y-2">
                      {event.passes.map((pass, index) => (
                        <div key={index} className="border rounded p-2">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-xs">{pass.name}</h5>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {formatPrice(pass.price)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {pass.description}
                          </p>
                          {pass.benefits.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium mb-1">Benefits:</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {pass.benefits.map((benefit, idx) => (
                                  <li key={idx} className="text-gray-600">
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchaseClick();
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 min-h-[48px] text-sm sm:text-base"
                  disabled={event.availability === 0}
                >
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="truncate">
                    {event.availability === 0 ? 'Sold Out' : 'Purchase Ticket'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="w-full"
                >
                  Back to Overview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
