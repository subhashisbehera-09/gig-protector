import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_ALERTS = [
  { id: 1, claimId: 'CLM-0043', type: 'gps_distance_anomaly', detail: 'Reported location 18km from registered zone', riskScore: 0.78, user: 'amit@example.com', time: '2 hours ago' },
  { id: 2, claimId: 'CLM-0040', type: 'weather_not_severe', detail: 'No severe weather recorded during claim period', riskScore: 0.65, user: 'raj@example.com', time: '5 hours ago' },
  { id: 3, claimId: 'CLM-0038', type: 'high_claim_frequency', detail: '5 claims filed in last 30 days', riskScore: 0.72, user: 'priya@example.com', time: '1 day ago' },
  { id: 4, claimId: 'CLM-0036', type: 'gps_timestamp_mismatch', detail: 'Location timestamp differs by 3 hours', riskScore: 0.55, user: 'vikram@example.com', time: '2 days ago' },
  { id: 5, claimId: 'CLM-0034', type: 'aqi_inconsistency', detail: 'Trigger claims AQI alert but max recorded was 85', riskScore: 0.48, user: 'sneha@example.com', time: '3 days ago' },
  { id: 6, claimId: 'CLM-0032', type: 'amount_outlier', detail: 'Claim is 3.2x higher than user average', riskScore: 0.42, user: 'amit@example.com', time: '4 days ago' },
];

export const AdminFraud = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState('all');

  const handleResolve = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type.includes(filter));

  const getTypeIcon = (type) => {
    if (type.includes('gps')) return '📍';
    if (type.includes('weather') || type.includes('aqi')) return '🌤️';
    if (type.includes('frequency') || type.includes('amount')) return '📊';
    return '⚠️';
  };

  const getRiskColor = (score) => {
    if (score < 0.4) return 'var(--green)';
    if (score < 0.6) return '#fbbf24';
    return 'var(--orange)';
  };

  return (
    <div className="page">
      <div className="premium-hero">
        <div className="premium-hero-glow admin-glow" />
        <div className="premium-hero-separator" />
        <div className="premium-hero-content">
          <h1 className="premium-headline">
            Fraud <span className="premium-gradient">Alerts</span>
          </h1>
          <p className="premium-subtitle">{alerts.length} unresolved alerts</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Alert Queue</h2>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({alerts.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'gps' ? 'active' : ''}`}
              onClick={() => setFilter('gps')}
            >
              GPS ({alerts.filter(a => a.type.includes('gps')).length})
            </button>
            <button 
              className={`filter-tab ${filter === 'weather' ? 'active' : ''}`}
              onClick={() => setFilter('weather')}
            >
              Weather ({alerts.filter(a => a.type.includes('weather')).length})
            </button>
          </div>
        </div>

        <div className="alerts-list">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className="alert-card">
              <div className="alert-header">
                <span className="alert-icon">{getTypeIcon(alert.type)}</span>
                <div className="alert-info">
                  <span className="alert-type">{alert.type.replace(/_/g, ' ')}</span>
                  <span className="alert-claim">Claim: {alert.claimId}</span>
                </div>
                <div className="alert-risk" style={{ color: getRiskColor(alert.riskScore) }}>
                  <span className="risk-value">{(alert.riskScore * 100).toFixed(0)}%</span>
                  <span className="risk-label">Risk</span>
                </div>
              </div>
              <p className="alert-detail">{alert.detail}</p>
              <div className="alert-footer">
                <span className="alert-user">{alert.user}</span>
                <span className="alert-time">{alert.time}</span>
                <div className="alert-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Resolve
                  </button>
                  <button className="btn btn-sm btn-primary">
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <p>No alerts in this category</p>
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-outline mt-16" onClick={() => navigate('/admin')}>
        ← Back to Admin Dashboard
      </button>

      <style>{`
        .admin-glow {
          background: radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15), transparent 50%);
        }
        .filter-tabs {
          display: flex;
          gap: 8px;
        }
        .filter-tab {
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border: 1px solid transparent;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
        }
        .filter-tab.active {
          border-color: var(--primary);
          color: var(--primary);
        }
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }
        .alert-card {
          background: var(--bg-tertiary);
          border-radius: 12px;
          padding: 16px;
        }
        .alert-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .alert-icon {
          font-size: 24px;
        }
        .alert-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .alert-type {
          font-weight: 600;
          text-transform: capitalize;
        }
        .alert-claim {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .alert-risk {
          text-align: center;
        }
        .risk-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
        }
        .risk-label {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .alert-detail {
          margin: 0 0 12px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .alert-footer {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--bg-secondary);
        }
        .alert-user {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .alert-time {
          font-size: 12px;
          color: var(--text-secondary);
          flex: 1;
        }
        .alert-actions {
          display: flex;
          gap: 8px;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-secondary);
        }
        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};
