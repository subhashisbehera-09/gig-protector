import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REPORT_TYPES = [
  { id: 'loss-ratio', name: 'Loss Ratio Report', icon: '📉', desc: 'Premium vs payout analysis by period' },
  { id: 'claims', name: 'Claims Analysis', icon: '📋', desc: 'Claims volume, approval rates, fraud stats' },
  { id: 'weather', name: 'Weather Impact', icon: '🌤️', desc: 'Weather-triggered disruptions by zone' },
  { id: 'worker', name: 'Worker Demographics', icon: '👥', desc: 'Worker distribution, earnings, coverage' },
];

export const AdminReports = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (reportType) => {
    setSelectedReport(reportType);
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    alert(`${reportType.name} generated successfully!`);
  };

  return (
    <div className="page">
      <div className="premium-hero">
        <div className="premium-hero-glow admin-glow" />
        <div className="premium-hero-separator" />
        <div className="premium-hero-content">
          <h1 className="premium-headline">
            Generate <span className="premium-gradient">Reports</span>
          </h1>
          <p className="premium-subtitle">Download analytics and operational reports</p>
        </div>
      </div>

      <div className="grid-2 mb-24">
        {REPORT_TYPES.map(report => (
          <div 
            key={report.id} 
            className={`card report-card ${selectedReport === report.id ? 'selected' : ''}`}
            onClick={() => !generating && handleGenerate(report)}
          >
            <div className="report-icon">{report.icon}</div>
            <h3>{report.name}</h3>
            <p>{report.desc}</p>
            {selectedReport === report.id && generating && (
              <div className="generating">
                <span className="spinner"></span>
                Generating...
              </div>
            )}
            {selectedReport === report.id && !generating && (
              <span className="badge badge-green">✓ Generated</span>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Recent Downloads</h2>
        <div className="downloads-list">
          <div className="download-item">
            <span className="download-icon">📄</span>
            <div className="download-info">
              <span className="download-name">Loss Ratio Report - March 2024</span>
              <span className="download-meta">Generated: Mar 31, 2024 • PDF • 245 KB</span>
            </div>
            <button className="btn btn-sm btn-outline">Download</button>
          </div>
          <div className="download-item">
            <span className="download-icon">📄</span>
            <div className="download-info">
              <span className="download-name">Claims Analysis - Q1 2024</span>
              <span className="download-meta">Generated: Mar 28, 2024 • Excel • 1.2 MB</span>
            </div>
            <button className="btn btn-sm btn-outline">Download</button>
          </div>
          <div className="download-item">
            <span className="download-icon">📄</span>
            <div className="download-info">
              <span className="download-name">Weather Impact Summary - Feb 2024</span>
              <span className="download-meta">Generated: Feb 29, 2024 • PDF • 180 KB</span>
            </div>
            <button className="btn btn-sm btn-outline">Download</button>
          </div>
        </div>
      </div>

      <button className="btn btn-outline mt-16" onClick={() => navigate('/admin')}>
        ← Back to Admin Dashboard
      </button>

      <style>{`
        .admin-glow {
          background: radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15), transparent 50%);
        }
        .report-card {
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          padding: 32px;
        }
        .report-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .report-card.selected {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }
        .report-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .report-card h3 {
          margin: 0 0 8px;
        }
        .report-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .generating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          color: var(--primary);
        }
        .downloads-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .download-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }
        .download-icon {
          font-size: 32px;
        }
        .download-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .download-name {
          font-weight: 500;
        }
        .download-meta {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};
