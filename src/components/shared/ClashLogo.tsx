import React from 'react';

interface ClashLogoProps {
  className?: string;
  size?: number;
}

export const ClashLogo: React.FC<ClashLogoProps> = ({ className = 'w-8 h-8', size = 32 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(242,86,35,0.4)]"
      >
        {/* Outer Hexagonal Shield / Emblem */}
        <path
          d="M24 4L42 12V25C42 34.5 34.2 42.8 24 45C13.8 42.8 6 34.5 6 25V12L24 4Z"
          fill="#1E1E1E"
          stroke="#4D4D4D"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner Orange Accent Rim */}
        <path
          d="M24 8L38 14.5V24C38 31.8 31.8 38.8 24 40.8C16.2 38.8 10 31.8 10 24V14.5L24 8Z"
          stroke="#F25623"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* Clashing Swords / Cross Blades in Flame Orange */}
        {/* Blade 1 (Left to Right downward) */}
        <path
          d="M15 15L33 33M33 33L30 34L34 34L34 30L33 33Z"
          stroke="#F25623"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Blade 2 (Right to Left downward) */}
        <path
          d="M33 15L15 33M15 33L18 34L14 34L14 30L15 33Z"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Clash Spark */}
        <circle cx="24" cy="24" r="4.5" fill="#F25623" />
        <circle cx="24" cy="24" r="2" fill="#FFFFFF" />

        {/* Controller D-pad & action dots subtle hints */}
        <rect x="23" y="10" width="2" height="4" rx="1" fill="#DEDEDE" />
        <circle cx="17" cy="20" r="1.5" fill="#F25623" />
        <circle cx="31" cy="20" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
