import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import HeroSection from '../components/HeroSection';
import { LogoWithText } from '../components/Logo';

export const Home = () => {
  const navigate = useNavigate();
  const { state, toggleTheme } = useApp();
  const isAuthenticated = state.kycDone || state.token;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: '🛡️',
      title: 'Parametric Protection',
      description: 'AI-powered insurance that pays automatically when triggers like floods, heat waves, or pollution events occur in your zone.',
      color: 'green'
    },
    {
      icon: '📍',
      title: 'Smart Zone Detection',
      description: 'ML-based risk analysis using historical data, elevation maps, and real-time weather patterns specific to your delivery area.',
      color: 'blue'
    },
    {
      icon: '⚡',
      title: 'Zero-Touch Claims',
      description: 'Fully automated claim processing with AI fraud detection. Get paid within minutes, not days.',
      color: 'purple'
    },
    {
      icon: '💰',
      title: 'Dynamic Pricing',
      description: 'Fair premiums calculated based on your actual risk profile. Pay only for the protection you need.',
      color: 'orange'
    },
    {
      icon: '🔔',
      title: 'Real-time Alerts',
      title: 'Smart Notifications',
      description: 'Get warned before disruptions hit your zone. Stay safe and plan your work accordingly.',
      color: 'pink'
    },
    {
      icon: '📊',
      title: 'Earnings Protection',
      description: 'Track income, losses from weather disruptions, and claim history with detailed analytics.',
      color: 'cyan'
    }
  ];

  const stats = [
    { value: '50+', label: 'Cities Covered' },
    { value: '10K+', label: 'Workers Protected' },
    { value: '₹2Cr+', label: 'Claims Processed' },
    { value: '4hrs', label: 'Avg. Payout Time' }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Swiggy Delivery Partner',
      city: 'Mumbai',
      text: 'During the Mumbai floods last monsoon, my claim was approved and paid in just 2 hours. This app is a lifesaver for gig workers like us!',
      rating: 5
    },
    {
      name: 'Priya Singh',
      role: 'Zomato Rider',
      city: 'Delhi',
      text: 'The zone risk feature helped me choose safer routes during heavy pollution days. The premium is affordable and the coverage is excellent.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Amazon Flex Driver',
      city: 'Ahmedabad',
      text: 'Simple KYC, instant coverage, and automatic payouts. Best insurance plan designed specifically for delivery partners like me.',
      rating: 5
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Quick Registration',
      description: 'Sign up with your basic details and UPI ID. No lengthy paperwork or complex forms required.',
      icon: '📱'
    },
    {
      number: '2',
      title: 'AI Risk Assessment',
      description: 'Our ML model analyzes your delivery zone using flood history, weather data, and risk patterns.',
      icon: '🤖'
    },
    {
      number: '3',
      title: 'Get Protected',
      description: 'Receive instant coverage with fair premiums based on your actual risk profile and work patterns.',
      icon: '🛡️'
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '99',
      period: '/month',
      description: 'Perfect for occasional delivery partners',
      features: [
        'Zone risk assessment',
        'Weather alerts',
        '₹5,000 coverage per event',
        'Email support',
        'Weekly premium payments'
      ],
      featured: false,
      buttonText: 'Get Started'
    },
    {
      name: 'Premium',
      price: '249',
      period: '/month',
      description: 'Most popular for full-time gig workers',
      features: [
        'All Basic features',
        'Priority claims (24hr)',
        '₹25,000 coverage per event',
        'Accident protection',
        '24/7 phone support',
        'Income loss protection'
      ],
      featured: true,
      buttonText: 'Get Premium'
    },
    {
      name: 'Pro',
      price: '499',
      period: '/month',
      description: 'Complete protection for power users',
      features: [
        'All Premium features',
        'Instant claims (4hr)',
        '₹50,000 coverage per event',
        'Full income protection',
        'Dedicated support agent',
        'Family coverage option'
      ],
      featured: false,
      buttonText: 'Get Pro'
    }
  ];

  return (
    <div className="home-page">
      {/* Fixed Header */}
      <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="home-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="GigProtector" style={{ width: 45, height: 45, borderRadius: 12, filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, #10b981)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>GigProtector</span>
        </div>
        <nav className="home-nav">
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }}>Reviews</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
        </nav>
        <div className="home-auth">
          <button 
            className="theme-toggle-home" 
            onClick={toggleTheme}
            title={state.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {state.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn-glow" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="home-hero">
        <div className="hero-grid-bg" />

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="float-card float-card-1">
            <div className="float-icon green">🛡️</div>
            <div className="float-content">
              <span className="float-label">Active Policies</span>
              <span className="float-value">10,000+</span>
            </div>
          </div>
          <div className="float-card float-card-2">
            <div className="float-icon blue">⚡</div>
            <div className="float-content">
              <span className="float-label">Avg. Payout</span>
              <span className="float-value">4 Hours</span>
            </div>
          </div>
          <div className="float-card float-card-3">
            <div className="float-icon purple">💰</div>
            <div className="float-content">
              <span className="float-label">Claims Paid</span>
              <span className="float-value">₹2Cr+</span>
            </div>
          </div>
        </div>

        {/* Animated Phone Mockup */}
        <div className="hero-visual">
          <div className="phone-mockup-animated">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="phone-screen-content">
                <div className="app-header">
                  <span className="app-logo">🛡️</span>
                  <span className="app-title">GigProtector</span>
                </div>
                <div className="app-card active">
                  <div className="app-card-header">
                    <span className="status-dot green" />
                    <span>Coverage Active</span>
                  </div>
                  <div className="app-location">Andheri West, Mumbai</div>
                  <div className="app-risk">
                    <span>Flood Risk</span>
                    <span className="risk-badge low">LOW</span>
                  </div>
                </div>
                <div className="app-alert">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-text">
                    <strong>Weather Alert</strong>
                    <p>Heavy rain expected tomorrow</p>
                  </div>
                </div>
                <div className="app-claim">
                  <span className="claim-check">✓</span>
                  <div className="claim-text">
                    <strong>Claim Settled</strong>
                    <p>₹2,500 credited</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="phone-glow" />
            <div className="phone-shine" />
          </div>
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <span className="pulse-dot" />
            Now in 50+ Cities Across India
          </div>

          <h1 className="hero-title">
            Protect Your{' '}
            <span className="gradient-text">Gig Income</span>
          </h1>

          <p className="hero-description">
            AI-powered parametric insurance for India's gig workers. Get instant coverage,
            automated claims, and protection against weather disruptions, pollution, and civic events.
          </p>

          <div className="hero-cta">
            <button className="btn-glow" onClick={() => navigate('/register')}>
              Get Started Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline-glow" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>

          <div className="hero-stats-enhanced">
            {stats.map((stat, i) => (
              <div key={i} className="stat-block animate-fade-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <span className="stat-number">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2>Everything You Need to Stay Protected</h2>
          <p>Comprehensive insurance designed specifically for India's gig economy workers</p>
        </div>

        <div className="features-grid-enhanced">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card-enhanced"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
              }}
            >
              <div className={`feature-icon-wrap ${feature.color}`}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2>Get Protected in 3 Simple Steps</h2>
          <p>From signup to coverage in under 2 minutes</p>
        </div>

        <div className="steps-container">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="step-card">
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-header">
          <span className="section-tag">Testimonials</span>
          <h2>What Our Users Say</h2>
          <p>Real stories from gig workers across India</p>
        </div>

        <div className="testimonials-grid-enhanced">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="testimonial-card-enhanced">
              <div className="rating">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <span key={j} className="rating-star">★</span>
                ))}
              </div>
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role} • {testimonial.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2>Affordable Protection for Every Worker</h2>
          <p>No hidden fees. Pay only for your actual risk.</p>
        </div>

        <div className="pricing-cards-enhanced">
          {pricingPlans.map((plan, i) => (
            <div key={i} className={`pricing-card-enhanced ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="popular-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-description">{plan.description}</div>
              <div className="plan-price">
                <span className="currency">₹</span>
                <span className="amount">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <ul className="plan-features-enhanced">
                {plan.features.map((feature, j) => (
                  <li key={j}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`btn-pricing ${plan.featured ? 'btn-pricing-primary' : 'btn-pricing-outline'}`}
                onClick={() => navigate('/register')}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-content">
          <h2>Ready to Protect Your Income?</h2>
          <p>Join thousands of gig workers who trust GigProtector. Get started in minutes with instant coverage.</p>
          <div className="hero-cta">
            <button className="btn-glow" onClick={() => navigate('/register')}>
              Start Your Free Coverage
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="home-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/logo.png" alt="GigProtector" style={{ width: 40, height: 40, borderRadius: 10, filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, #10b981)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>GigProtector</span>
            </div>
            <p>AI-powered parametric insurance protecting gig workers from weather disruptions across India.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
              <a href="#" onClick={(e) => e.preventDefault()}>API</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#" onClick={(e) => e.preventDefault()}>About</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Blog</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="#" onClick={(e) => e.preventDefault()}>Help Center</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 GigProtector. All rights reserved.</p>
          <div className="social-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Twitter</a>
            <a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
