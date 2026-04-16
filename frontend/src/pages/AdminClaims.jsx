import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_CLAIMS = [
  { id: 'CLM-0045', user: 'ramesh@example.com', amount: 2100, trigger: 'Heavy Rain', status: 'pending', riskScore: 0.18, submittedAt: '2 hours ago' },
  { id: 'CLM-0044', user: 'priya@example.com', amount: 1575, trigger: 'AQI Severe', status: 'pending', riskScore: 0.42, submittedAt: '5 hours ago' },
  { id: 'CLM-0043', user: 'amit@example.com', amount: 3150, trigger: 'Cyclone', status: 'pending', riskScore: 0.65, submittedAt: '8 hours ago' },
  { id: 'CLM-0042', user: 'sneha@example.com', amount: 1050, trigger: 'Dense Fog', status: 'pending', riskScore: 0.28, submittedAt: '1 day ago' },
  { id: 'CLM-0041', user: 'vikram@example.com', amount: 2625, trigger: 'Heavy Rain', status: 'pending', riskScore: 0.55, submittedAt: '1 day ago' },
];

export const AdminClaims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const handleApprove = (claimId) => {
    setClaims(claims.filter(c => c.id !== claimId));
    alert(`Claim ${claimId} approved! Payout initiated.`);
  };

  const handleReject = (claimId) => {
    setClaims(claims.filter(c => c.id !== claimId));
    alert(`Claim ${claimId} rejected.`);
  };

  const getRiskColor = (score) => {
    if (score < 0.35) return 'var(--green)';
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
            Review <span className="premium-gradient">Claims</span>
          </h1>
          <p className="premium-subtitle">{claims.length} claims pending review</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Pending Claims Queue</h2>
          <span className="badge badge-orange">{claims.length} Pending</span>
        </div>
        
        <table className="claims-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Trigger</th>
              <th>Risk Score</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim.id}>
                <td><strong>{claim.id}</strong></td>
                <td>{claim.user}</td>
                <td>₹{claim.amount.toLocaleString()}</td>
                <td>{claim.trigger}</td>
                <td>
                  <span style={{ color: getRiskColor(claim.riskScore), fontWeight: 600 }}>
                    {(claim.riskScore * 100).toFixed(0)}%
                  </span>
                </td>
                <td>{claim.submittedAt}</td>
                <td>
                  <div className="action-btns">
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(claim.id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleReject(claim.id)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {claims.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✓</span>
            <p>All claims reviewed!</p>
          </div>
        )}
      </div>

      <button className="btn btn-outline mt-16" onClick={() => navigate('/admin')}>
        ← Back to Admin Dashboard
      </button>

      <style>{`
        .admin-glow {
          background: radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15), transparent 50%);
        }
        .claims-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        .claims-table th, .claims-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--bg-tertiary);
        }
        .claims-table th {
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
        }
        .action-btns {
          display: flex;
          gap: 8px;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        .btn-success {
          background: var(--green);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-danger {
          background: var(--orange);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
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
        .badge-orange {
          background: rgba(234, 88, 12, 0.2);
          color: var(--orange);
        }
      `}</style>
    </div>
  );
};
