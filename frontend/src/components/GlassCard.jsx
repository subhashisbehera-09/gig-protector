import { useRef } from 'react';

export const GlassCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  padding = '24px',
  onClick
}) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const baseStyles = {
    position: 'relative',
    background: gradient
      ? 'linear-gradient(145deg, rgba(15, 15, 20, 0.95), rgba(10, 10, 15, 0.9))'
      : 'rgba(15, 15, 20, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: onClick ? 'pointer' : 'default',
  };

  const hoverStyles = hover ? {
    ':hover': {
      transform: 'translateY(-8px)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(99, 102, 241, 0.1)',
    }
  } : {};

  const glowStyles = glow ? {
    boxShadow: '0 0 30px rgba(99, 102, 241, 0.2), 0 0 60px rgba(16, 185, 129, 0.1)',
  } : {};

  return (
    <div
      ref={cardRef}
      className={`glass-card ${className}`}
      style={{
        ...baseStyles,
        ...glowStyles,
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {hover && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.15), transparent 50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
          className="glass-card-shine"
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export const GlassBadge = ({ children, color = 'blue', size = 'md' }) => {
  const sizeStyles = {
    sm: { padding: '4px 10px', fontSize: '0.7rem' },
    md: { padding: '6px 14px', fontSize: '0.8rem' },
    lg: { padding: '8px 18px', fontSize: '0.9rem' },
  };

  const colorStyles = {
    green: { background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' },
    blue: { background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' },
    purple: { background: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' },
    orange: { background: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.3)', color: '#fb923c' },
    red: { background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '100px',
        border: `1px solid ${colorStyles[color].borderColor}`,
        background: colorStyles[color].background,
        color: colorStyles[color].color,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        ...sizeStyles[size],
      }}
    >
      {children}
    </span>
  );
};

export const GradientText = ({ children, className = '' }) => {
  return (
    <span
      className={className}
      style={{
        background: 'linear-gradient(135deg, #34d399 0%, #818cf8 50%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        backgroundSize: '200% 200%',
      }}
    >
      {children}
    </span>
  );
};

export const AnimatedCounter = ({ value, suffix = '', duration = 2000 }) => {
  // Simple animated counter implementation
  // In a real app, you'd use a useEffect with requestAnimationFrame
  return (
    <span className="animated-counter">
      {value}{suffix}
    </span>
  );
};

export default GlassCard;
