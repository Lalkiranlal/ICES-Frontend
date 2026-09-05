import React from "react";

interface CloudNetLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const CloudNetLogo: React.FC<CloudNetLogoProps> = ({ 
  className = "w-8 h-8", 
  size = 32,
  glow = false 
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#172238" />
            <stop offset="100%" stopColor="#0A0F1A" />
          </linearGradient>
        </defs>

        {/* Outer Hexagonal Shield */}
        <polygon
          points="24,3 43,10 43,26 24,45 5,26 5,10"
          fill="url(#shieldBg)"
          stroke="url(#shieldGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Inner Radar Range Ring */}
        <circle
          cx="24"
          cy="22"
          r="12"
          stroke="url(#shieldGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          opacity="0.6"
        />

        {/* Inner Core */}
        <circle
          cx="24"
          cy="22"
          r="6"
          stroke="#60A5FA"
          strokeWidth="1.5"
          fill="#0A0F1A"
        />

        {/* Crosshairs */}
        <line x1="24" y1="7" x2="24" y2="37" stroke="url(#shieldGrad)" strokeWidth="1.2" opacity="0.5" />
        <line x1="9" y1="22" x2="39" y2="22" stroke="url(#shieldGrad)" strokeWidth="1.2" opacity="0.5" />

        {/* Node Beacons */}
        <circle cx="24" cy="22" r="2.5" fill="#60A5FA" />
        <circle cx="24" cy="7" r="1.5" fill="#3B82F6" />
        <circle cx="43" cy="26" r="1.5" fill="#3B82F6" />
        <circle cx="5" cy="26" r="1.5" fill="#3B82F6" />
        <circle cx="24" cy="45" r="1.5" fill="#3B82F6" />
      </svg>
    </div>
  );
};