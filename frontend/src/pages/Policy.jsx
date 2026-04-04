import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const COVERAGE_ITEMS = [
  { id: 'rain', icon: 'heavy_rain', name: 'Heavy Rainfall / Flood', threshold: '>64.5mm/24h (IMD Red Alert)', sources: ['OpenWeatherMap', 'IMD'], tier: 'all' },
  { id: 'aqi', icon: 'air_pollution', name: 'Severe Air Pollution', threshold: 'AQI >400 + GRAP Stage IV', sources: ['CPCB Safar', 'OpenAQ'], tier: 'standard' },
  { id: 'bandh', icon: 'civic', name: 'Civic Disruption / Bandh', threshold: 'Zone orders <15% for 4+ hrs', sources: ['Traffic API', 'News NLP'], tier: 'standard' },
  { id: 'heat', icon: 'extreme_heat', name: 'Extreme Heat Wave', threshold: '>44°C for 2+ consecutive days', sources: ['OpenWeatherMap', 'IMD Heat Wave'], tier: 'standard' },
  { id: 'fog', icon: 'dense_fog', name: 'Dense Fog / Zero Visibility', threshold: 'Visibility <200m for 4+ hrs', sources: ['OpenWeatherMap', 'METAR'], tier: 'basic' },
  { id: 'cyclone', icon: 'cyclone', name: 'Cyclone / Storm', threshold: 'Category 2+ within 150km', sources: ['IMD Cyclone API', 'NDRF'], tier: 'premium' },
  { id: 'earthquake', icon: 'earthquake', name: 'Earthquake Aftermath', threshold: 'NDRF zone closure declared', sources: ['NDMA API'], tier: 'premium' },
];

const TIERS = [
  { 
    id: 'basic', 
    emoji: '🥉', 
    name: 'BASIC', 
    premium: 72, 
    coverage: 60, 
    maxWeekly: 2400,
    color: 'var(--text2)',
    features: ['Rain & Flood', 'Dense Fog', 'Basic Alerts'],
    notIncluded: ['Air Pollution', 'Bandh', 'Heat Wave', 'Cyclone', 'Priority Support']
  },
  { 
    id: 'standard', 
    emoji: '🥈', 
    name: 'STANDARD', 
    premium: 91, 
    coverage: 75, 
    maxWeekly: 3000,
    color: 'var(--blue-l)',
    popular: true,
    features: ['Rain & Flood', 'Air Pollution', 'Bandh', 'Heat Wave', 'Dense Fog', 'SMS Alerts'],
    notIncluded: ['Cyclone', 'Priority Support']
  },
  { 
    id: 'premium', 
    emoji: '🥇', 
    name: 'PREMIUM', 
    premium: 108, 
    coverage: 90, 
    maxWeekly: 3600,
    color: '#fbbf24',
    features: ['All 7 Triggers', 'Cyclone Cover', 'Priority Support', 'Extended Hours', 'Multi-Zone', 'Push + SMS + WhatsApp'],
    notIncluded: []
  },
];

export const Policy = () => {
  const navigate = useNavigate();
  const { state, updateState, showToast } = useApp();
  const [selectedTier, setSelectedTier] = useState('standard');
  const [policy, setPolicy] = useState({
    startDate: '2024-01-01',
    nextDebit: getNextMonday(),
    autoPay: true,
    renewal: true,
  });

  function getNextMonday() {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7) || 7);
    return nextMonday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  const tier = TIERS.find(t => t.id === selectedTier) || TIERS[1];
  const maxPayout = Math.round(state.dailyBaseline * (tier.coverage / 100) * 7);

  const selectTier = (tierId) => {
    setSelectedTier(tierId);
    updateState({ selectedTier: tierId });
    showToast(`Switched to ${TIERS.find(t => t.id === tierId)?.name} Shield`, 'success');
  };

  const getCoverageIcon = (item) => {
    const icons = {
      heavy_rain: '🌧️',
      air_pollution: '😷',
      civic: '🚫',
      extreme_heat: '🌡️',
      dense_fog: '🌫️',
      cyclone: '🌀',
      earthquake: '🏔️',
    };
    return icons[item.icon] || '⚡';
  };

  const isItemCovered = (item) => {
    if (item.tier === 'all') return true;
    if (item.tier === 'basic') return ['basic', 'standard', 'premium'].includes(selectedTier);
    if (item.tier === 'standard') return ['standard', 'premium'].includes(selectedTier);
    if (item.tier === 'premium') return selectedTier === 'premium';
    return false;
  };

  return (
    <div className="page">
      <div className="premium-hero">
        <div className="premium-hero-glow" />
        <div className="premium-hero-separator" />
        
        <div className="premium-hero-split">
          <div className="premium-hero-content">
            <div className="premium-badge">
              <span className="premium-badge-icon">✦</span>
              <span>Choose Your Coverage</span>
            </div>
            
            <h1 className="premium-headline">
              <span className="premium-gradient">Insurance</span> Policy
            </h1>
            
            <p className="premium-subtitle">
              Select your coverage tier with auto-renewal via UPI. 
              Cancel anytime. Fair pricing based on your actual risk profile.
            </p>
            
            <div className="premium-trust">
              <div className="trust-item">
                <span>🛡️</span>
                <span>3 Tiers</span>
              </div>
              <div className="trust-item">
                <span>🔄</span>
                <span>Auto-Renew</span>
              </div>
              <div className="trust-item">
                <span>❌</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
          
          <div className="premium-card-wrapper">
            <div className="premium-glass-card">
              <div className="card-shimmer" />
              <div className="card-header-mini">
                <span className="card-icon-mini">💎</span>
                <span>Recommended</span>
              </div>
              <div className="card-price-mini">
                <span className="price-amount">₹249</span>
                <span className="price-period">/month</span>
              </div>
              <div className="card-features-mini">
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>₹25,000 coverage</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>24hr claims</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Accident cover</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Income protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2>Select Coverage Tier</h2>
      <div className="grid-3">
        {TIERS.map(t => (
          <div
            key={t.id}
            className={`card tier-card ${selectedTier === t.id ? 'selected' : ''}`}
            style={{ '--tier-color': t.color }}
          >
            {t.popular && <div className="popular-badge">MOST POPULAR</div>}
            <div className="tier-header">
              <span className="tier-emoji">{t.emoji}</span>
              <span className="tier-name" style={{ color: t.color }}>{t.name}</span>
            </div>
            <div className="tier-premium">
              <span className="rupee">₹</span>
              <span className="amount">{t.premium}</span>
              <span className="period">/week</span>
            </div>
            <div className="tier-coverage">{t.coverage}% income replacement</div>
            <div className="tier-max">Max: ₹{t.maxWeekly}/week</div>
            
            <div className="tier-features">
              {t.features.map((f, idx) => (
                <div key={idx} className="tier-feature">
                  <span className="check">✓</span> {f}
                </div>
              ))}
            </div>

            {t.notIncluded.length > 0 && (
              <div className="tier-not-included">
                {t.notIncluded.map((n, idx) => (
                  <div key={idx} className="tier-feature excluded">
                    <span className="cross">✗</span> {n}
                  </div>
                ))}
              </div>
            )}

            <button 
              className={`btn ${selectedTier === t.id ? 'btn-primary' : 'btn-outline'} btn-full mt-16`}
              onClick={() => selectTier(t.id)}
            >
              {selectedTier === t.id ? '✓ Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <h2>Policy Details</h2>
        <div className="grid-2">
          <div className="card">
            <div className="flex justify-between items-center mb-16">
              <h3>Policy #{state.workerId || 'GIG-POL-7842-2024'}</h3>
              <span className="badge badge-green">● ACTIVE</span>
            </div>
            
            <div className="risk-factor">
              <span className="fs-13 c-text2">Worker</span>
              <span className="fs-13 fw-600">{state.workerName}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Platform</span>
              <span className="fs-13 fw-600">{state.platform?.toUpperCase()}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Zone</span>
              <span className="fs-13 fw-600">{state.zone?.replace('_', ' ').toUpperCase()}, {state.city?.toUpperCase()}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Coverage Tier</span>
              <span className="badge badge-blue">{tier.name.charAt(0) + tier.name.slice(1).toLowerCase()} Shield</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Weekly Premium</span>
              <span className="fs-13 fw-600 c-blue">₹{tier.premium}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Next Auto-Debit</span>
              <span className="fs-13 fw-600">{policy.nextDebit}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">Policy Start</span>
              <span className="fs-13 fw-600">{policy.startDate}</span>
            </div>
            <div className="risk-factor">
              <span className="fs-13 c-text2">UPI AutoPay</span>
              <span className="badge badge-teal">✓ Active</span>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-16">Coverage Summary</h3>
            <div className="premium-meter mb-16">
              <div className="label">Maximum Weekly Payout</div>
              <div className="premium-amount">₹{maxPayout}</div>
              <div className="premium-per">at {tier.coverage}% of ₹{state.dailyBaseline} daily</div>
            </div>
            <div className="coverage-bar mb-16">
              <div className="coverage-bar-label">
                <span>Coverage Ratio</span>
                <span className="c-green">{tier.coverage}%</span>
              </div>
              <div className="progress-bar" style={{ height: '10px' }}>
                <div className="progress-fill" style={{ width: `${tier.coverage}%`, background: tier.color }} />
              </div>
            </div>
            <div className="coverage-breakdown">
              <div className="breakdown-item">
                <span>Daily Baseline</span>
                <span>₹{state.dailyBaseline}</span>
              </div>
              <div className="breakdown-item">
                <span>Coverage %</span>
                <span>{tier.coverage}%</span>
              </div>
              <div className="breakdown-item">
                <span>Daily Payout</span>
                <span>₹{Math.round(state.dailyBaseline * tier.coverage / 100)}</span>
              </div>
              <div className="breakdown-item highlight">
                <span>Weekly Maximum</span>
                <span className="c-green">₹{maxPayout}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <h2>Disruptions Covered Under Your Policy</h2>
        <div className="coverage-grid">
          {COVERAGE_ITEMS.map(item => (
            <div key={item.id} className={`coverage-card ${isItemCovered(item) ? 'covered' : 'not-covered'}`}>
              <div className="coverage-icon">{getCoverageIcon(item)}</div>
              <div className="coverage-info">
                <div className="coverage-name">{item.name}</div>
                <div className="coverage-threshold">{item.threshold}</div>
                <div className="coverage-sources">
                  {item.sources.map(s => (
                    <span key={s} className="source-tag">{s}</span>
                  ))}
                </div>
              </div>
              <div className="coverage-status">
                {isItemCovered(item) ? (
                  <span className="badge badge-green">✓ Covered</span>
                ) : (
                  <span className="badge badge-yellow">Upgrade</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 flex justify-between">
        <button className="btn btn-outline" onClick={() => navigate('/register')}>← Back to Registration</button>
        <button className="btn btn-primary" onClick={() => navigate('/premium')}>View Premium Calculator →</button>
      </div>
    </div>
  );
};
