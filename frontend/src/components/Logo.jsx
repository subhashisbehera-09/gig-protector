import React from 'react';

export const Logo = ({ size = 60, className = '', animated = false }) => {
  const gradientId1 = `logo-gradient-1-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId2 = `logo-gradient-2-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-svg ${animated ? 'logo-animated' : ''} ${className}`}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.4)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.3))',
      }}
    >
      <defs>
        {/* Primary Gradient - Blue to Purple */}
        <linearGradient id={gradientId1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1">
            {animated && <animate attributeName="stop-color" values="#6366f1;#8b5cf6;#6366f1" dur="4s" repeatCount="indefinite" />}
          </stop>
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#10b981">
            {animated && <animate attributeName="stop-color" values="#10b981;#6366f1;#10b981" dur="4s" repeatCount="indefinite" />}
          </stop>
        </linearGradient>

        {/* Secondary Gradient - For inner elements */}
        <linearGradient id={gradientId2} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Shield Shape */}
      <path
        d="M60 8
           C60 8, 20 20, 20 55
           C20 85, 45 105, 60 112
           C75 105, 100 85, 100 55
           C100 20, 60 8, 60 8Z"
        fill={`url(#${gradientId1})`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        className="logo-shield"
      />

      {/* Inner Shield (cutout effect) */}
      <path
        d="M60 20
           C60 20, 32 30, 32 56
           C32 80, 50 94, 60 100
           C70 94, 88 80, 88 56
           C88 30, 60 20, 60 20Z"
        fill="rgba(10, 10, 15, 0.9)"
      />

      {/* Delivery Scooter / Bike Icon */}
      <g transform="translate(35, 38)" className="logo-icon">
        {/* Scooter Body */}
        <path
          d="M38 32
             L38 18
             L45 10
             L42 8
             L35 16
             L28 16
             C28 16, 25 16, 25 19
             L25 24
             L18 24
             C16 24, 14 26, 14 28
             L14 30
             L8 32
             L8 36
             L16 36
             C18 36, 20 34, 20 32
             L25 32
             L25 35
             C25 38, 28 40, 32 40
             L42 40
             C46 40, 48 37, 48 34
             L48 32
             Z"
          fill={`url(#${gradientId2})`}
        />

        {/* Front Wheel */}
        <circle
          cx="42"
          cy="38"
          r="6"
          fill="none"
          stroke={`url(#${gradientId2})`}
          strokeWidth="2.5"
        />
        <circle cx="42" cy="38" r="2" fill={`url(#${gradientId2})`} />

        {/* Back Wheel */}
        <circle
          cx="14"
          cy="38"
          r="5"
          fill="none"
          stroke={`url(#${gradientId2})`}
          strokeWidth="2.5"
        />
        <circle cx="14" cy="38" r="1.5" fill={`url(#${gradientId2})`} />

        {/* Handlebar */}
        <path
          d="M38 18 L35 14"
          stroke={`url(#${gradientId2})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Protection Checkmark (subtle, bottom right) */}
      <circle cx="85" cy="85" r="12" fill="rgba(16, 185, 129, 0.2)" className="logo-check-bg" />
      <path
        d="M80 85 L84 89 L90 81"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="logo-check"
      />

      {/* Decorative rings */}
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="rgba(99, 102, 241, 0.2)"
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="4 4"
        className="logo-ring"
      />
    </svg>
  );
};

// Text Logo with Icon
export const LogoWithText = ({ size = 40, showTagline = true, className = '' }) => {
  return (
    <div className={`logo-with-text ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Logo size={size} animated />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: `${size * 0.7}px`,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}
        >
          GigProtector
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: `${size * 0.28}px`,
              color: 'var(--text2)',
              fontWeight: 500,
              letterSpacing: '0.5px',
              marginTop: '2px',
            }}
          >
            Protect Your Income
          </span>
        )}
      </div>
    </div>
  );
};

// Compact Logo for small spaces
export const LogoCompact = ({ size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))',
      }}
    >
      <defs>
        <linearGradient id="compactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Shield */}
      <path
        d="M60 8 C60 8, 20 20, 20 55 C20 85, 45 105, 60 112 C75 105, 100 85, 100 55 C100 20, 60 8, 60 8Z"
        fill="url(#compactGradient)"
      />

      {/* Simple G Letter stylized */}
      <text
        x="60"
        y="75"
        textAnchor="middle"
        fill="white"
        fontFamily="Outfit, sans-serif"
        fontSize="50"
        fontWeight="800"
      >
        G
      </text>
    </svg>
  );
};

// Animated Logo for loading/splash screens
export const LogoAnimated = ({ size = 120 }) => {
  return (
    <div className="logo-animated-container" style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="animGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1">
              <animate attributeName="stop-color" values="#6366f1;#10b981;#8b5cf6;#6366f1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#8b5cf6">
              <animate attributeName="stop-color" values="#8b5cf6;#6366f1;#10b981;#8b5cf6" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#10b981">
              <animate attributeName="stop-color" values="#10b981;#8b5cf6;#6366f1;#10b981" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Pulsing Shield */}
        <path
          d="M60 8 C60 8, 20 20, 20 55 C20 85, 45 105, 60 112 C75 105, 100 85, 100 55 C100 20, 60 8, 60 8Z"
          fill="url(#animGradient)"
        >
          <animate
            attributeName="opacity"
            values="1;0.8;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Inner content */}
        <path
          d="M60 20 C60 20, 32 30, 32 56 C32 80, 50 94, 60 100 C70 94, 88 80, 88 56 C88 30, 60 20, 60 20Z"
          fill="rgba(10, 10, 15, 0.9)"
        />

        {/* Delivery icon */}
        <g transform="translate(35, 38)">
          <path
            d="M38 32 L38 18 L45 10 L42 8 L35 16 L28 16 C28 16, 25 16, 25 19 L25 24 L18 24 C16 24, 14 26, 14 28 L14 30 L8 32 L8 36 L16 36 C18 36, 20 34, 20 32 L25 32 L25 35 C25 38, 28 40, 32 40 L42 40 C46 40, 48 37, 48 34 L48 32 Z"
            fill="white"
          />
          <circle cx="42" cy="38" r="6" fill="none" stroke="white" strokeWidth="2.5" />
          <circle cx="14" cy="38" r="5" fill="none" stroke="white" strokeWidth="2.5" />
        </g>
      </svg>

      {/* Rotating ring effect */}
      <div
        className="logo-ring-effect"
        style={{
          position: 'absolute',
          inset: '-10px',
          border: '2px solid transparent',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'logo-spin 2s linear infinite',
        }}
      />
    </div>
  );
};

export default Logo;
