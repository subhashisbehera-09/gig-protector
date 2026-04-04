import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiPricingService } from '../services/aiPricing';
import { ZoneMap } from '../components/ZoneMap';
import HeroSection from '../components/HeroSection';

const ACTIVITIES = [
  { icon: '💸', text: '₹1,575 payout credited — Heavy Rain (3 days)', time: 'Today, 9:30 AM', type: 'success' },
  { icon: '⚡', text: 'Trigger fired: IMD Red Alert — Mumbai', time: 'Today, 7:02 AM', type: 'warning' },
  { icon: '📊', text: 'Weekly premium ₹91 debited via UPI AutoPay', time: 'Mon, Apr 1', type: 'info' },
  { icon: '🔄', text: 'Premium recalculated — new zone risk data', time: 'Mar 25', type: 'info' },
  { icon: '💸', text: '₹525 payout — Dense Fog (1 day)', time: 'Feb 28', type: 'success' },
  { icon: '✅', text: 'Policy renewed — Standard Shield active', time: 'Feb 19', type: 'success' },
];

const ZONE_RISKS = {
  mumbai: [
    { name: 'Andheri W', risk: 'HIGH', top: '30%', left: '25%', color: 'rgba(234,88,12,.75)' },
    { name: 'Kurla', risk: 'HIGH', top: '50%', left: '42%', color: 'rgba(234,88,12,.75)' },
    { name: 'Bandra', risk: 'MED', top: '25%', left: '55%', color: 'rgba(217,119,6,.75)' },
    { name: 'Dadar', risk: 'MED', top: '60%', left: '60%', color: 'rgba(217,119,6,.75)' },
    { name: 'Colaba', risk: 'LOW', top: '75%', left: '35%', color: 'rgba(22,163,74,.75)' },
  ],
  delhi: [
    { name: 'Connaught Place', risk: 'LOW', top: '40%', left: '45%', color: 'rgba(22,163,74,.75)' },
    { name: 'Dwarka', risk: 'MED', top: '60%', left: '30%', color: 'rgba(217,119,6,.75)' },
    { name: 'Rohini', risk: 'MED', top: '35%', left: '55%', color: 'rgba(217,119,6,.75)' },
    { name: 'Lajpat Nagar', risk: 'HIGH', top: '55%', left: '65%', color: 'rgba(234,88,12,.75)' },
  ],
  bengaluru: [
    { name: 'MG Road', risk: 'LOW', top: '40%', left: '50%', color: 'rgba(22,163,74,.75)' },
    { name: 'Whitefield', risk: 'MED', top: '60%', left: '70%', color: 'rgba(217,119,6,.75)' },
    { name: 'Koramangala', risk: 'LOW', top: '55%', left: '40%', color: 'rgba(22,163,74,.75)' },
    { name: 'Electronic City', risk: 'HIGH', top: '75%', left: '55%', color: 'rgba(234,88,12,.75)' },
  ],
  cuttack: [
    { name: 'Mahanadi Vihar', risk: 'HIGH', top: '30%', left: '40%', color: 'rgba(234,88,12,.75)' },
    { name: 'Choudhary Bazar', risk: 'HIGH', top: '50%', left: '50%', color: 'rgba(234,88,12,.75)' },
    { name: 'Buxi Bazaar', risk: 'HIGH', top: '40%', left: '55%', color: 'rgba(234,88,12,.75)' },
    { name: 'Nayabazar', risk: 'HIGH', top: '45%', left: '45%', color: 'rgba(234,88,12,.75)' },
    { name: 'Sikharpur', risk: 'MED', top: '60%', left: '35%', color: 'rgba(217,119,6,.75)' },
  ],
  kolkata: [
    { name: 'Park Street', risk: 'EXTREME', top: '40%', left: '50%', color: 'rgba(220,38,38,.75)' },
    { name: 'Salt Lake', risk: 'HIGH', top: '60%', left: '70%', color: 'rgba(234,88,12,.75)' },
    { name: 'Howrah', risk: 'HIGH', top: '50%', left: '30%', color: 'rgba(234,88,12,.75)' },
  ],
  bhubaneswar: [
    { name: 'Bapuji Nagar', risk: 'MED', top: '40%', left: '50%', color: 'rgba(217,119,6,.75)' },
    { name: 'Saheed Nagar', risk: 'MED', top: '55%', left: '55%', color: 'rgba(217,119,6,.75)' },
    { name: 'Jaydev Vihar', risk: 'LOW', top: '35%', left: '45%', color: 'rgba(22,163,74,.75)' },
  ],
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [forecast, setForecast] = useState(null);
  const [riskScore, setRiskScore] = useState(0);

  const isAuthenticated = state.kycDone || state.token;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const selectedTier = state.selectedTier === 'basic'
    ? { premium: 72, coverage: 60, name: 'Basic Shield' }
    : state.selectedTier === 'premium'
      ? { premium: 108, coverage: 90, name: 'Premium Shield' }
      : { premium: 91, coverage: 75, name: 'Standard Shield' };

  useEffect(() => {
    loadDashboardData();
  }, [state.city, state.zone]);

  const loadDashboardData = async () => {
    const data = await aiPricingService.predict14DayDisruption(state.city || 'mumbai', state.zone || 'andheri_west');
    setForecast(data);
    const avgRisk = data.summary?.avgRisk || 0.5;
    setRiskScore(Math.round(avgRisk * 100));
  };

  const totalPaidOut = 8450;
  const claimsThisYear = 6;
  const activeTriggers = state.alertCount || 0;

  const zones = ZONE_RISKS[state.city] || ZONE_RISKS.mumbai;
  const currentZoneData = zones.find(z => z.name.toLowerCase().includes(state.zone?.replace('_', ' ').toLowerCase()) || state.zone === 'andheri_west');

  const getRiskColor = (score) => {
    if (score > 70) return 'var(--orange)';
    if (score > 40) return '#fbbf24';
    return 'var(--green)';
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
              <span>Live Dashboard</span>
            </div>
            
            <h1 className="premium-headline">
              Your <span className="premium-gradient">Protection</span> at a Glance
            </h1>
            
            <p className="premium-subtitle">
              {state.workerName} — {state.platform?.toUpperCase()} Partner, {state.zone?.replace('_', ' ')}, {state.city?.toUpperCase()}
            </p>
            
            <div className="premium-trust">
              <div className="trust-item">
                <span>🛡️</span>
                <span>Coverage Active</span>
              </div>
              <div className="trust-item">
                <span>⚡</span>
                <span>Real-time</span>
              </div>
              <div className="trust-item">
                <span>🤖</span>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
          
          <div className="premium-card-wrapper">
            <div className="premium-glass-card">
              <div className="card-shimmer" />
              <div className="card-header-mini">
                <span className="card-icon-mini">📊</span>
                <span>Quick Stats</span>
              </div>
              <div className="card-stats-grid">
                <div className="stat-mini-card">
                  <span className="stat-num-mini">₹{totalPaidOut.toLocaleString()}</span>
                  <span className="stat-label-mini">Total Paid</span>
                </div>
                <div className="stat-mini-card">
                  <span className="stat-num-mini">{claimsThisYear}</span>
                  <span className="stat-label-mini">Claims</span>
                </div>
              </div>
              <div className="card-features-mini">
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Active Coverage</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Auto-protected zone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-value c-green">Active</div>
          <div className="stat-label">Coverage Status</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-value c-blue">₹{totalPaidOut.toLocaleString()}</div>
          <div className="stat-label">Total Paid Out</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{claimsThisYear}</div>
          <div className="stat-label">Claims This Year</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value" style={{ color: activeTriggers > 0 ? 'var(--orange-l)' : 'var(--green)' }}>
            {activeTriggers}
          </div>
          <div className="stat-label">Active Triggers</div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <h2>Current Coverage</h2>
          <div className="premium-meter mb-16">
            <div className="label">Weekly Premium</div>
            <div className="premium-amount">₹{selectedTier.premium}</div>
            <div className="premium-per">{selectedTier.name} · {selectedTier.coverage}% income replacement</div>
          </div>
          <div className="risk-factor">
            <span className="fs-13 c-text2">Next Auto-Debit</span>
            <span className="fs-13 fw-600">Monday — ₹{selectedTier.premium}</span>
          </div>
          <div className="risk-factor">
            <span className="fs-13 c-text2">Policy #</span>
            <span className="fs-13 fw-600 c-blue">{state.workerId}</span>
          </div>
          <div className="risk-factor">
            <span className="fs-13 c-text2">Daily Baseline</span>
            <span className="fs-13 fw-600">₹{state.dailyBaseline}</span>
          </div>
          <div className="risk-factor">
            <span className="fs-13 c-text2">UPI AutoPay</span>
            <span className="badge badge-teal">✓ Active</span>
          </div>
          <div className="alert alert-success mt-16">
            ✅ Coverage active. {activeTriggers} trigger{activeTriggers !== 1 ? 's' : ''} monitoring in your zone.
          </div>
        </div>

        <div className="card">
          <h2>14-Day Risk Forecast</h2>
          {forecast && (
            <>
              <div className="risk-gauge">
                <div className="gauge-circle" style={{ '--risk-color': getRiskColor(riskScore) }}>
                  <span className="gauge-value">{riskScore}%</span>
                  <span className="gauge-label">Risk Score</span>
                </div>
              </div>
              <div className="forecast-summary">
                <div className="summary-item">
                  <span className="badge badge-orange">{forecast.summary.highRiskDays} days</span>
                  <span className="fs-12 c-text2">High disruption risk</span>
                </div>
                <div className="summary-item">
                  <span className="fs-12 c-text2">Recommendation:</span>
                  <span className="fs-12 fw-600">{forecast.summary.recommendation}</span>
                </div>
              </div>
              <div className="forecast-chart-mini">
                {forecast.predictions?.slice(0, 7).map((day, idx) => (
                  <div key={idx} className="mini-bar">
                    <div
                      className="mini-bar-fill"
                      style={{
                        height: `${day.disruptionProbability * 40}px`,
                        background: getRiskColor(day.disruptionProbability * 100)
                      }}
                    />
                    <span className="mini-day">{day.dayName}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <h2>Recent Activity</h2>
          <div className="timeline">
            {ACTIVITIES.map((activity, idx) => (
              <div key={idx} className="tl-item">
                <div className={`tl-dot ${idx === 0 ? 'active' : 'done'}`}>
                  {activity.icon}
                </div>
                <div>
                  <div className="fs-13 fw-600">{activity.text}</div>
                  <div className="fs-12 c-text2 mt-4">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Zone Risk Overview — {state.city?.toUpperCase()}</h2>
          <ZoneMap
            zones={zones}
            currentZone={currentZoneData}
            city={state.city}
            height="300px"
            compact={false}
          />
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn btn-outline" onClick={() => navigate('/register')}>
          📝 Update Profile
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/policy')}>
          🛡️ Manage Policy
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/premium')}>
          📊 View Premium
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/triggers')}>
          ⚡ View Triggers
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/claims')}>
          💸 File Claim
        </button>
      </div>
    </div>
  );
};
