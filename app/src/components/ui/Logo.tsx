'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Geometric Vector Emblem */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-brand via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand/25 flex-shrink-0 relative overflow-hidden group`}>
        {/* Subtle geometric light accent */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[60%] h-[60%] text-white transform -rotate-3"
        >
          {/* Stylized geometric Learning Beacon / Delta symbol */}
          <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M3 13L12 18L21 13" />
          <path d="M3 17L12 22L21 17" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tight font-outfit select-none`} style={{ color: 'var(--text-primary)' }}>
          Mathalama<span className="text-brand">Edu</span>
        </span>
      )}
    </div>
  );
};
