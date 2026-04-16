import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const MOCK_ADMIN_DATA = {
  loss_ratio: {
    total_premiums_collected: 2450000,
    total_payouts: 892500,
    loss_ratio_percentage: 36.4,
    loss_ratio_status: "healthy",
    total_claims_count: 847,
    active_policies: 12450
  },
  predictions: {
    total_predicted_claims: 156,
    prediction_period: "next 7 days",
    model_confidence: 0.78,
    high_risk_zones: 12,
    by_zone: [
      { zone_id: "mum_andheri", zone_name: "Andheri West", predicted_claims: 18, confidence: 0.82, risk_level: 4 },
      { zone_id: "del_lajpat", zone_name: "Lajpat Nagar", predicted_claims: 15, confidence: 0.75, risk_level: 3 },
      { zone_id: "blr_ecity", zone_name: "Electronic City", predicted_claims: 12, confidence: 0.79, risk_level: 3 },
      { zone_id: "kol_parkst", zone_name: "Park Street", predicted_claims: 14, confidence: 0.81, risk_level: 4 },
      { zone_id: "pun_kothrud", zone_name: "Kothrud", predicted_claims: 9, confidence: 0.71, risk_level: 2 }
    ]
  },
  weather_forecast: {
    forecast: [
      { city: "Mumbai", disruption_probability: 72, primary_risk: "heavy_rain", recommended_actions: ["Prepare payout reserves", "Alert field teams"] },
      { city: "Delhi", disruption_probability: 45, primary_risk: "heat_wave", recommended_actions: ["Monitor conditions", "Review zone coverage"] },
      { city: "Kolkata", disruption_probability: 68, primary_risk: "heavy_rain", recommended_actions: ["Prepare payout reserves", "Alert field teams"] },
      { city: "Bengaluru", disruption_probability: 38, primary_risk: "normal", recommended_actions: ["Continue monitoring"] },
      { city: "Chennai", disruption_probability: 52, primary_risk: "heavy_rain", recommended_actions: ["Monitor conditions", "Review zone coverage"] }
    ],
    summary: {
      high_risk_cities: 2,
      avg_disruption_probability: 55,
      peak_day: "Wednesday",
      recommended_reserve: "₹5,50,000"
    }
  },
  fraud_analysis: {
    total_unresolved_alerts: 23,
    avg_risk_score: 0.42,
    alert_breakdown: {
      gps_distance_anomaly: 8,
      weather_not_severe: 6,
      aqi_inconsistency: 4,
      high_claim_frequency: 3,
      amount_outlier: 2
    },
    gps_spoofing_count: 8,
    weather_mismatch_count: 10,
    high_priority_alerts: 5,
    recommended_actions: ["Schedule manual review", "Increase monitoring"]
  }
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [data, setData] = useState(MOCK_ADMIN_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(MOCK_ADMIN_DATA);
    setLoading(false);
  };

  const getLossRatioColor = (status) => {
    switch (status) {
      case 'healthy': return 'var(--green)';
      case 'warning': return '#fbbf24';
      case 'critical': return 'var(--orange)';
      default: return 'var(--text-secondary)';
    }
  };

  const getRiskBadgeClass = (level) => {
    if (level >= 4) return 'badge badge-red';
    if (level >= 3) return 'badge badge-orange';
    if (level >= 2) return 'badge badge-yellow';
    return 'badge badge-green';
  };

  const getDisruptionColor = (prob) => {
    if (prob > 65) return 'var(--orange)';
    if (prob > 45) return '#fbbf24';
    return 'var(--green)';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="premium-hero">
        <div className="premium-hero-glow admin-glow" />
        <div className="premium-hero-separator" />
        
        <div className="premium-hero-split">
          <div className="premium-hero-content">
            <div className="premium-badge admin-badge">
              <span className="premium-badge-icon">⚙️</span>
              <span>Insurer Dashboard</span>
            </div>
            
            <h1 className="premium-headline">
              Portfolio <span className="premium-gradient">Intelligence</span>
            </h1>
            
            <p className="premium-subtitle">
              Real-time analytics, loss ratios, and predictive insights
            </p>
            
            <div className="premium-trust">
              <div className="trust-item">
                <span>📊</span>
                <span>Live Data</span>
              </div>
              <div className="trust-item">
                <span>🔮</span>
                <span>AI Predictions</span>
              </div>
              <div className="trust-item">
                <span>🛡️</span>
                <span>Risk Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value c-green">₹{data.loss_ratio.total_premiums_collected.toLocaleString()}</div>
          <div className="stat-label">Total Premiums</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-value c-blue">₹{data.loss_ratio.total_payouts.toLocaleString()}</div>
          <div className="stat-label">Total Payouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📉</div>
          <div className="stat-value" style={{ color: getLossRatioColor(data.loss_ratio.loss_ratio_status) }}>
            {data.loss_ratio.loss_ratio_percentage}%
          </div>
          <div className="stat-label">Loss Ratio</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-value">{data.loss_ratio.active_policies.toLocaleString()}</div>
          <div className="stat-label">Active Policies</div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h2>Loss Ratio Analysis</h2>
            <span className={`badge ${data.loss_ratio.loss_ratio_status === 'healthy' ? 'badge-green' : 'badge-orange'}`}>
              {data.loss_ratio.loss_ratio_status.toUpperCase()}
            </span>
          </div>
          
          <div className="loss-ratio-visual">
            <div className="ratio-bar">
              <div 
                className="ratio-fill" 
                style={{ 
                  width: `${data.loss_ratio.loss_ratio_percentage}%`,
                  background: getLossRatioColor(data.loss_ratio.loss_ratio_status)
                }}
              />
              <div className="ratio-threshold" style={{ left: '70%' }} title="Warning threshold" />
              <div className="ratio-threshold critical" style={{ left: '90%' }} title="Critical threshold" />
            </div>
            <div className="ratio-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="metrics-grid mt-16">
            <div className="metric-item">
              <span className="metric-label">Total Claims</span>
              <span className="metric-value">{data.loss_ratio.total_claims_count}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Active Policies</span>
              <span className="metric-value">{data.loss_ratio.active_policies.toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Avg Claim Value</span>
              <span className="metric-value">₹{Math.round(data.loss_ratio.total_payouts / data.loss_ratio.total_claims_count).toLocaleString()}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Claims Ratio</span>
              <span className="metric-value">{(data.loss_ratio.total_claims_count / data.loss_ratio.active_policies * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>7-Day Claim Predictions</h2>
            <span className="badge badge-blue">AI Model</span>
          </div>
          
          <div className="prediction-summary mb-16">
            <div className="pred-stat">
              <span className="pred-number">{data.predictions.total_predicted_claims}</span>
              <span className="pred-label">Expected Claims</span>
            </div>
            <div className="pred-stat">
              <span className="pred-number">{(data.predictions.model_confidence * 100).toFixed(0)}%</span>
              <span className="pred-label">Confidence</span>
            </div>
            <div className="pred-stat">
              <span className="pred-number">{data.predictions.high_risk_zones}</span>
              <span className="pred-label">High Risk Zones</span>
            </div>
          </div>

          <div className="zone-predictions">
            <h4>Top Predicted Zones</h4>
            {data.predictions.by_zone.map((zone, idx) => (
              <div key={idx} className="zone-pred-item">
                <div className="zone-info">
                  <span className="zone-name">{zone.zone_name}</span>
                  <span className={getRiskBadgeClass(zone.risk_level)}>Risk {zone.risk_level}</span>
                </div>
                <div className="zone-bar-container">
                  <div className="zone-bar" style={{ width: `${(zone.predicted_claims / 20) * 100}%` }} />
                  <span className="zone-count">{zone.predicted_claims} claims</span>
                </div>
                <span className="zone-confidence">{(zone.confidence * 100).toFixed(0)}% conf</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h2>Weather Disruption Forecast</h2>
            <span className="badge badge-purple">Next 7 Days</span>
          </div>
          
          <div className="forecast-summary mb-16">
            <div className="for-stat">
              <span className="for-number">{data.weather_forecast.summary.high_risk_cities}</span>
              <span className="for-label">High Risk Cities</span>
            </div>
            <div className="for-stat">
              <span className="for-number">{data.weather_forecast.summary.avg_disruption_probability}%</span>
              <span className="for-label">Avg Disruption</span>
            </div>
            <div className="for-stat">
              <span className="for-number">{data.weather_forecast.summary.peak_day}</span>
              <span className="for-label">Peak Day</span>
            </div>
          </div>

          <div className="city-forecast">
            {data.weather_forecast.forecast.map((city, idx) => (
              <div key={idx} className="city-item">
                <div className="city-header">
                  <span className="city-name">{city.city}</span>
                  <span 
                    className="city-prob"
                    style={{ color: getDisruptionColor(city.disruption_probability) }}
                  >
                    {city.disruption_probability}%
                  </span>
                </div>
                <div className="city-bar-container">
                  <div 
                    className="city-bar" 
                    style={{ 
                      width: `${city.disruption_probability}%`,
                      background: getDisruptionColor(city.disruption_probability)
                    }} 
                  />
                </div>
                <span className="city-risk">{city.primary_risk.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          <div className="reserve-alert mt-16">
            <span className="reserve-icon">⚠️</span>
            <span>Recommended Reserve: <strong>{data.weather_forecast.summary.recommended_reserve}</strong></span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Fraud Detection Summary</h2>
            <span className="badge badge-red">{data.fraud_analysis.total_unresolved_alerts} Alerts</span>
          </div>

          <div className="fraud-stats mb-16">
            <div className="fraud-stat">
              <span className="fraud-number">{data.fraud_analysis.avg_risk_score.toFixed(2)}</span>
              <span className="fraud-label">Avg Risk Score</span>
            </div>
            <div className="fraud-stat">
              <span className="fraud-number">{data.fraud_analysis.high_priority_alerts}</span>
              <span className="fraud-label">High Priority</span>
            </div>
            <div className="fraud-stat">
              <span className="fraud-number">{data.fraud_analysis.gps_spoofing_count}</span>
              <span className="fraud-label">GPS Anomalies</span>
            </div>
          </div>

          <div className="fraud-breakdown">
            <h4>Alert Breakdown</h4>
            {Object.entries(data.fraud_analysis.alert_breakdown).map(([type, count], idx) => (
              <div key={idx} className="fraud-type-item">
                <span className="fraud-type-name">{type.replace(/_/g, ' ')}</span>
                <span className="fraud-type-count">{count}</span>
              </div>
            ))}
          </div>

          <div className="fraud-actions mt-16">
            <h4>Recommended Actions</h4>
            <ul className="action-list">
              {data.fraud_analysis.recommended_actions.map((action, idx) => (
                <li key={idx} className="action-item">
                  <span className="action-icon">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn btn-outline" onClick={() => navigate('/admin/claims')}>
          📋 Review Claims
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/admin/fraud')}>
          🔍 Fraud Alerts
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/admin/reports')}>
          📊 Generate Report
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <style>{`
        .admin-glow {
          background: radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15), transparent 50%);
        }
        .admin-badge {
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .loss-ratio-visual {
          margin-top: 16px;
        }
        .ratio-bar {
          height: 24px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        .ratio-fill {
          height: 100%;
          border-radius: 12px;
          transition: width 0.5s ease;
        }
        .ratio-threshold {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #fbbf24;
        }
        .ratio-threshold.critical {
          background: var(--orange);
        }
        .ratio-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .metric-item {
          background: var(--bg-tertiary);
          padding: 12px;
          border-radius: 8px;
        }
        .metric-label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 18px;
          font-weight: 600;
        }
        .prediction-summary {
          display: flex;
          gap: 24px;
          justify-content: space-around;
        }
        .pred-stat {
          text-align: center;
        }
        .pred-number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: var(--primary);
        }
        .pred-label {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .zone-predictions h4 {
          margin: 16px 0 12px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .zone-pred-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--bg-tertiary);
        }
        .zone-info {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }
        .zone-name {
          font-weight: 500;
        }
        .zone-bar-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .zone-bar {
          height: 8px;
          background: var(--primary);
          border-radius: 4px;
          max-width: 100px;
        }
        .zone-count {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .zone-confidence {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .forecast-summary, .fraud-stats {
          display: flex;
          gap: 24px;
          justify-content: space-around;
        }
        .for-stat, .fraud-stat {
          text-align: center;
        }
        .for-number, .fraud-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }
        .for-label, .fraud-label {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .city-forecast {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .city-item {
          padding: 8px;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }
        .city-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .city-name {
          font-weight: 500;
        }
        .city-prob {
          font-weight: 600;
        }
        .city-bar-container {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          margin-bottom: 4px;
        }
        .city-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        .city-risk {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: capitalize;
        }
        .reserve-alert {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .reserve-icon {
          font-size: 18px;
        }
        .fraud-breakdown h4, .fraud-actions h4 {
          margin: 12px 0 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .fraud-type-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid var(--bg-tertiary);
        }
        .fraud-type-name {
          text-transform: capitalize;
          font-size: 13px;
        }
        .fraud-type-count {
          font-weight: 600;
        }
        .action-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .action-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
        }
        .action-icon {
          color: var(--primary);
        }
        .badge-red {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .badge-blue {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        .badge-purple {
          background: rgba(168, 85, 247, 0.2);
          color: #a855f7;
        }
        .badge-yellow {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
};
