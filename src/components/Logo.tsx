'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-7 h-7',
      aiText: 'text-sm',
      consultancy: 'text-sm',
    },
    md: {
      container: 'w-9 h-9',
      aiText: 'text-base',
      consultancy: 'text-lg',
    },
    lg: {
      container: 'w-12 h-12',
      aiText: 'text-xl',
      consultancy: 'text-2xl',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2 group ${className}`}
    >
      {/* Orange circular icon with "Ai." */}
      <div className={`${classes.container} rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105`}>
        <span className={`${classes.aiText} font-bold text-white leading-none mb-0.5`}>
          Ai.
        </span>
      </div>
      
      {/* "consultancy" text */}
      <span className={`${classes.consultancy} font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300`}>
        consultancy
      </span>
    </Link>
  );
}
