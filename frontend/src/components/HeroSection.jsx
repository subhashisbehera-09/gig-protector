import React, { useRef, useState, useEffect } from 'react';
import '../styles/hero.css';

const HeroSection = ({ 
  tags, 
  title, 
  titleHighlight, 
  subtitle, 
  subtitleHighlight, 
  children, 
  className = '' 
}) => {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [floatingCards, setFloatingCards] = useState([]);

  useEffect(() => {
    const cards = [
      { id: 1, delay: 0 },
      { id: 2, delay: 1000 },
      { id: 3, delay: 2000 },
    ];
    setFloatingCards(cards);
  }, []);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <div 
      className={`hero-section ${className}`}
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
      }}
    >
      <div className={`hero-spotlight ${isHovered ? 'active' : ''}`} />
      
      <div className="hero-orbs">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      <div className="hero-grid-pattern" />
      
      {floatingCards.map((card, idx) => (
        <div 
          key={card.id} 
          className={`hero-floating-card card-${idx + 1}`}
          style={{ animationDelay: `${card.delay}ms` }}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="card-content">
            <span className="card-label">AI Analysis</span>
            <span className="card-value">98.5%</span>
          </div>
        </div>
      ))}

      <div className="hero-noise-overlay" />
      
      <div className="hero-content">
        {tags && tags.length > 0 && (
          <div className="hero-tags">
            {tags.map((tag, idx) => (
              <span key={idx} className={`tag ${tag.className || ''}`}>
                {tag.icon && <span className="tag-icon">{tag.icon}</span>}
                {tag.text}
              </span>
            ))}
          </div>
        )}
        
        {title && (
          <h1 className="hero-title">
            {title} {titleHighlight && <span className="hero-highlight">{titleHighlight}</span>}
          </h1>
        )}
        
        {subtitle && (
          <p className="hero-subtitle">
            {subtitle} {subtitleHighlight && <span>// <strong>{subtitleHighlight}</strong></span>}
          </p>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default HeroSection;