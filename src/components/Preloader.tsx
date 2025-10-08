'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out after 700ms
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 700);

    // Remove preloader completely after fade out completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1000); // Total time: 1 second

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        {/* Animated Logo */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3">
            {/* Orange circular icon with "Ai." */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg animate-pulse-glow">
              <span className="text-2xl font-bold text-white leading-none">
                Ai.
              </span>
            </div>
            
            {/* "consultancy" text */}
            <span className="text-3xl font-semibold text-gray-800">
              consultancy
            </span>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-delay-0"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-delay-1"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-delay-2"></div>
        </div>
      </div>
    </div>
  );
}
