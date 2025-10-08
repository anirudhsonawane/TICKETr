'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function ContactDialog() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-300"
        >
          Contact Us
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h3>
          
          {/* Email */}
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm mb-0.5">Email</h4>
              <a 
                href="mailto:support@aiconsultancy.com" 
                className="text-gray-600 hover:text-orange-600 transition-colors text-xs block truncate"
              >
                support@aiconsultancy.com
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm mb-0.5">Phone</h4>
              <a 
                href="tel:+919876543210" 
                className="text-gray-600 hover:text-orange-600 transition-colors text-xs"
              >
                +91 98765 43210
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm mb-0.5">Address</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                123 Tech Street, Innovation Hub<br />
                Mumbai, Maharashtra 400001
              </p>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm mb-0.5">Website</h4>
              <a 
                href="https://aiconsultancy.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors text-xs block truncate"
              >
                www.aiconsultancy.com
              </a>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
