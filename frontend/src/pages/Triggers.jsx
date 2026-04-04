import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { triggerMonitorService } from '../services/aiPricing';
import { GlassBadge } from '../components/GlassCard';

const TRIGGER_ICONS = {
  heavy_rain: '🌧️',
  air_pollution: '😷',
  civic: '🚫',
  extreme_heat: '🌡️',
  dense_fog: '🌫️',
  cyclone: '🌀',
  earthquake: '🏔️',
};

const TRIGGER_COLORS = {
  heavy_rain: 'blue',
  air_pollution: 'orange',
  civic: 'purple',
  extreme_heat: 'red',
  dense_fog: 'purple',
  cyclone: 'orange',
  earthquake: 'red',
};

const CITY_COORDS = {
  current_location: { lat: 0, lon: 0 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  delhi: { lat: 28.7041, lon: 77.1025 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  hyderabad: { lat: 17.385, lon: 78.4867 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  pune: { lat: 18.5204, lon: 73.8567 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  indore: { lat: 22.7196, lon: 75.8577 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  visakhapatnam: { lat: 17.6868, lon: 83.2185 },
  bhopal: { lat: 23.2585, lon: 77.4016 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  mangalore: { lat: 12.9141, lon: 74.856 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  patna: { lat: 25.5941, lon: 85.1376 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
  surat: { lat: 21.1702, lon: 72.8311 },
  vadodara: { lat: 22.2969, lon: 73.1726 },
  mohali: { lat: 30.7046, lon: 76.7179 },
  dehradun: { lat: 30.3165, lon: 78.0322 },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  ludhiana: { lat: 30.9009, lon: 75.8573 },
  jalandhar: { lat: 31.326, lon: 75.5762 },
  amritsar: { lat: 31.634, lon: 74.8723 },
  varanasi: { lat: 25.3176, lon: 82.9739 },
  prayagraj: { lat: 25.4358, lon: 81.9113 },
  ranchi: { lat: 23.3441, lon: 85.3095 },
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  cuttack: { lat: 20.4625, lon: 85.8829 },
  madurai: { lat: 9.9252, lon: 78.1198 },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  mysore: { lat: 12.2958, lon: 76.6394 },
  hubli: { lat: 15.3647, lon: 75.124 },
  belgaum: { lat: 15.8497, lon: 74.4977 },
  aurangabad: { lat: 19.8762, lon: 75.3433 },
  nashik: { lat: 19.9975, lon: 73.7898 },
  kota: { lat: 25.2138, lon: 75.8648 },
  udaipur: { lat: 24.5854, lon: 73.7125 },
  jodhpur: { lat: 26.2389, lon: 73.0243 },
  trivandrum: { lat: 8.5241, lon: 76.9366 },
  other: { lat: 0, lon: 0 },
};

export const Triggers = () => {
  const { state, updateState, addNotification } = useApp();
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [weatherData, setWeatherData] = useState(null);
  const [prevTriggerStates, setPrevTriggerStates] = useState({});

  useEffect(() => {
    loadTriggers();
  }, [state.city]);

  useEffect(() => {
    triggers.forEach(trigger => {
      const prevState = prevTriggerStates[trigger.id];
      if (!prevState) return;
      
      if (trigger.fired && !prevState.fired) {
        addNotification({
          type: 'alert',
          title: `🚨 Trigger Fired: ${trigger.name}`,
          message: `Current: ${trigger.current.value}${trigger.current.unit} (Threshold: ${trigger.threshold})`,
        });
      } else if (trigger.current.status === 'MONITORING' && prevState.status !== 'MONITORING') {
        addNotification({
          type: 'alert',
          title: `👁️ Monitoring: ${trigger.name}`,
          message: `Conditions approaching threshold. Current: ${trigger.current.value}${trigger.current.unit}`,
        });
      }
    });
    
    const newStates = {};
    triggers.forEach(t => {
      newStates[t.id] = { fired: t.fired, status: t.current.status };
    });
    setPrevTriggerStates(newStates);
  }, [triggers]);

  const loadTriggers = async () => {
    setLoading(true);
    
    try {
      const triggerData = await triggerMonitorService.getActiveTriggers(state.city || 'mumbai');
      setTriggers(triggerData);

      const city = state.city || 'mumbai';
      const coords = CITY_COORDS[city] || CITY_COORDS.mumbai;
      
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,rain,visibility,humidity&timezone=auto`
        );
        const data = await res.json();
        setWeatherData(data.current);
      } catch (e) {
        setWeatherData({ temperature_2m: 32, rain: 0, visibility: 10000, humidity: 60 });
      }

      setLastRefresh(new Date());
      const firedCount = triggerData.filter(t => t.fired).length;
      updateState({ alertCount: firedCount });
    } catch (error) {
      console.log('Failed to load triggers');
    }
    
    setLoading(false);
  };

  const getTagBadge = (trigger) => {
    if (trigger.fired) return <span className="badge badge-orange">⚡ FIRED</span>;
    if (trigger.current.status === 'MONITORING') return <span className="badge badge-yellow">👁️ MONITORING</span>;
    return <span className="badge badge-green">✓ CLEAR</span>;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 70) return 'var(--orange)';
    if (confidence > 40) return '#fbbf24';
    return 'var(--green)';
  };

  const firedCount = triggers.filter(t => t.fired).length;
  const monitoringCount = triggers.filter(t => t.current.status === 'MONITORING').length;
  const clearCount = triggers.filter(t => !t.fired && t.current.status !== 'MONITORING').length;

  return (
    <div className="page">
      {/* Enhanced Hero Section */}
      <div className="premium-hero">
        <div className="premium-hero-glow" />
        <div className="premium-hero-separator" />

        <div className="premium-hero-split">
          <div className="premium-hero-content">
            <div className="premium-badge">
              <span className="premium-badge-icon">✦</span>
              <span>Live Monitoring</span>
            </div>

            <h1 className="premium-headline">
              <span className="premium-gradient">Trigger</span> Monitor
            </h1>

            <p className="premium-subtitle">
              Real-time disruption detection powered by public APIs.
              All thresholds verified against weather, AQI, and traffic data.
            </p>

            <div className="premium-trust">
              <div className="trust-item">
                <span>⚡</span>
                <span>{firedCount} Active</span>
              </div>
              <div className="trust-item">
                <span>📡</span>
                <span>{monitoringCount} Monitoring</span>
              </div>
              <div className="trust-item">
                <span>🔗</span>
                <span>API Verified</span>
              </div>
            </div>
          </div>

          <div className="premium-card-wrapper">
            <div className="trigger-summary-card">
              <div className="card-shimmer" />
              <div className="trigger-summary-header">
                <span className="trigger-summary-icon">🎯</span>
                <span>Trigger Status</span>
              </div>
              <div className="trigger-summary-grid">
                <div className={`summary-stat ${firedCount > 0 ? 'danger' : ''}`}>
                  <span className="summary-number">{firedCount}</span>
                  <span className="summary-label">Fired</span>
                </div>
                <div className="summary-stat warning">
                  <span className="summary-number">{monitoringCount}</span>
                  <span className="summary-label">Watching</span>
                </div>
                <div className="summary-stat success">
                  <span className="summary-number">{clearCount}</span>
                  <span className="summary-label">Clear</span>
                </div>
              </div>
              <div className="trigger-progress-bar">
                <div
                  className="trigger-progress-fill"
                  style={{
                    width: `${triggers.length ? (firedCount / triggers.length) * 100 : 0}%`,
                    background: firedCount > 0 ? 'var(--orange)' : 'var(--green)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Weather Data Card */}
      {weatherData && (
        <div className="weather-card-v2">
          <div className="weather-card-header">
            <div className="weather-title-group">
              <span className="weather-pulse-dot" />
              <span className="weather-title">Live Weather Data</span>
              <GlassBadge color="green" size="sm">● Live</GlassBadge>
            </div>
            <span className="weather-location">{state.city?.toUpperCase() || 'MUMBAI'} — {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="weather-metrics-v2">
            <div className="weather-metric-v2">
              <div className="weather-metric-icon">🌡️</div>
              <div className="weather-metric-value">{weatherData.temperature_2m}°C</div>
              <div className="weather-metric-label">Temperature</div>
            </div>
            <div className="weather-metric-v2">
              <div className="weather-metric-icon">🌧️</div>
              <div className="weather-metric-value">{weatherData.rain || 0}mm</div>
              <div className="weather-metric-label">Rainfall</div>
            </div>
            <div className="weather-metric-v2">
              <div className="weather-metric-icon">👁️</div>
              <div className="weather-metric-value">{((weatherData.visibility || 10000) / 1000).toFixed(1)}km</div>
              <div className="weather-metric-label">Visibility</div>
            </div>
            <div className="weather-metric-v2">
              <div className="weather-metric-icon">💧</div>
              <div className="weather-metric-value">{weatherData.humidity || 60}%</div>
              <div className="weather-metric-label">Humidity</div>
            </div>
          </div>
        </div>
      )}

      {/* Triggers Grid Header */}
      <div className="triggers-section-header">
        <div className="triggers-title-group">
          <h2 className="triggers-section-title">Active Triggers</h2>
          <span className="triggers-count">{triggers.length} total</span>
        </div>
        <div className="triggers-actions">
          <span className="monitoring-badge">📍 {state.zone?.replace('_', ' ').toUpperCase() || 'ANDHERI WEST'}</span>
          <button className="btn btn-teal btn-sm" onClick={loadTriggers} disabled={loading}>
            {loading ? <><span className="spinner" /> Refreshing... </> : '↺ Refresh APIs'}
          </button>
        </div>
      </div>

      {/* Enhanced Trigger Cards Grid */}
      <div className="triggers-grid">
        {triggers.map((trigger, index) => (
          <div
            key={trigger.id}
            className={`trigger-card-v2 ${trigger.fired ? 'fired' : ''} ${trigger.current.status === 'MONITORING' ? 'monitoring' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
              e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
            }}
          >
            <div className="trigger-card-glow" />
            <div className="trigger-card-accent" />

            <div className="trigger-card-header">
              <div className="trigger-card-icon">
                {TRIGGER_ICONS[trigger.icon] || '⚡'}
              </div>
              <div className="trigger-card-title-group">
                <h3 className="trigger-card-title">{trigger.name}</h3>
                <div className="trigger-card-badges">
                  {trigger.fired ? (
                    <span className="trigger-status-badge fired">
                      <span className="status-pulse" /> FIRED
                    </span>
                  ) : trigger.current.status === 'MONITORING' ? (
                    <span className="trigger-status-badge monitoring">
                      <span className="status-dot" /> MONITORING
                    </span>
                  ) : (
                    <span className="trigger-status-badge clear">✓ CLEAR</span>
                  )}
                </div>
              </div>
            </div>

            <div className="trigger-card-body">
              <div className="trigger-metric-row">
                <div className="trigger-metric">
                  <span className="trigger-metric-label">Threshold</span>
                  <span className="trigger-metric-value">{trigger.threshold}</span>
                </div>
                <div className="trigger-metric">
                  <span className="trigger-metric-label">Current</span>
                  <span className={`trigger-metric-value ${trigger.fired ? 'danger' : 'success'}`}>
                    {trigger.current.value}{trigger.current.unit}
                  </span>
                </div>
              </div>

              <div className="trigger-confidence-section">
                <div className="confidence-header">
                  <span className="confidence-label">Confidence Score</span>
                  <span className="confidence-score">{trigger.confidence}%</span>
                </div>
                <div className="confidence-track">
                  <div
                    className="confidence-fill-v2"
                    style={{
                      width: `${trigger.confidence}%`,
                      background: getConfidenceColor(trigger.confidence)
                    }}
                  />
                </div>
              </div>

              <div className="trigger-sources">
                {trigger.source.split(' + ').map((s, i) => (
                  <span key={i} className="source-chip">{s}</span>
                ))}
              </div>

              <p className="trigger-description-v2">{trigger.description}</p>
            </div>

            {trigger.fired && (
              <div className="trigger-alert-banner">
                <span className="alert-icon">⚡</span>
                <span className="alert-text">Auto-claims initiating for {state.zone?.replace('_', ' ').toUpperCase() || 'YOUR ZONE'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confidence Scoring Section */}
      <div className="confidence-section">
        <div className="confidence-section-header">
          <h2 className="confidence-title">Confidence Scoring Algorithm</h2>
          <p className="confidence-subtitle">How we determine claim eligibility</p>
        </div>

        <div className="confidence-grid">
          {/* Factor Cards */}
          <div className="confidence-factors-card">
            <div className="confidence-factor-item">
              <div className="factor-info">
                <div className="factor-icon blue">📡</div>
                <div className="factor-text">
                  <span className="factor-name">API Data Quality</span>
                  <span className="factor-desc">Freshness, reliability, cross-validation</span>
                </div>
              </div>
              <div className="factor-stats">
                <span className="factor-percent">40%</span>
                <div className="factor-bar">
                  <div className="factor-fill blue" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            <div className="confidence-factor-item">
              <div className="factor-info">
                <div className="factor-icon teal">📍</div>
                <div className="factor-text">
                  <span className="factor-name">Zone Match Precision</span>
                  <span className="factor-desc">GPS location, cell tower corroboration</span>
                </div>
              </div>
              <div className="factor-stats">
                <span className="factor-percent">30%</span>
                <div className="factor-bar">
                  <div className="factor-fill teal" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            <div className="confidence-factor-item">
              <div className="factor-info">
                <div className="factor-icon green">👤</div>
                <div className="factor-text">
                  <span className="factor-name">Worker Activity Signal</span>
                  <span className="factor-desc">App status, trip history, availability</span>
                </div>
              </div>
              <div className="factor-stats">
                <span className="factor-percent">30%</span>
                <div className="factor-bar">
                  <div className="factor-fill green" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Threshold Guide */}
          <div className="threshold-guide-card">
            <h3 className="threshold-title">Payout Thresholds</h3>
            <div className="threshold-levels">
              <div className="threshold-level success">
                <div className="threshold-badge">
                  <span className="threshold-range">≥ 70</span>
                  <span className="threshold-outcome">Auto-Payout</span>
                </div>
                <div className="threshold-bar">
                  <div className="threshold-fill" style={{ width: '100%' }} />
                </div>
                <p className="threshold-desc">Green path — instant approval</p>
              </div>

              <div className="threshold-level warning">
                <div className="threshold-badge">
                  <span className="threshold-range">50-69</span>
                  <span className="threshold-outcome">Hold</span>
                </div>
                <div className="threshold-bar">
                  <div className="threshold-fill" style={{ width: '66%' }} />
                </div>
                <p className="threshold-desc">Amber path — peer validation</p>
              </div>

              <div className="threshold-level danger">
                <div className="threshold-badge">
                  <span className="threshold-range">&lt; 50</span>
                  <span className="threshold-outcome">Denied</span>
                </div>
                <div className="threshold-bar">
                  <div className="threshold-fill" style={{ width: '33%' }} />
                </div>
                <p className="threshold-desc">Red path — manual review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
