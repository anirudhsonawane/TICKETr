'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import Logo from '@/components/Logo';
import ContactDialog from '@/components/ContactDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ticket, Loader2, Calendar } from 'lucide-react';
import { IEvent } from '@/models/Event';

export default function HomePage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Set a minimum loading time of 500ms
    const minLoadingTime = 500;
    const startTime = Date.now();
    
    fetchEvents().then(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
        // Trigger fade-in after loading is complete
        setTimeout(() => {
          setFadeIn(true);
        }, 50);
      }, remainingTime);
    });
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=3');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterEvents();
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-white">
        <Header 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
        />
        <div className="flex items-center justify-center h-96">
          {/* Ai. consultancy loader */}
          <div className="flex items-center gap-3 animate-pulse">
            
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearch}
      />

      {/* Events Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Upcoming Events
              </h2>
              <p className="text-gray-600">
                Discover & book tickets for amazing events
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                3 Events
              </span>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg border p-16 text-center">
              <div className="text-gray-300 mb-4">
                <Ticket className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-6">
                Check back later for new events
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={String(event._id)} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section - Logo and Social/Contact */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b">
            <div className="mb-4 md:mb-0">
              <Logo size="md" />
            </div>
            
            <div className="flex items-center gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-orange-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              
              {/* Contact Button */}
              <ContactDialog />
            </div>
          </div>
          
          {/* Middle Section - Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
              About Us
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-orange-600 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-orange-600 transition-colors">
              Pricing Policy
            </Link>
            <Link href="/cancellation" className="text-gray-600 hover:text-orange-600 transition-colors">
              Cancellation & Refund Policy
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
          </div>
          
          {/* Bottom Section - Copyright */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 <span className="font-semibold bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">ai.</span> <span className="font-medium bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">consultancy</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}