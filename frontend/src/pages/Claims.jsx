import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fraudDetectionService } from '../services/aiPricing';

const TRIGGER_OPTIONS = [
  { value: 'rain', label: 'Heavy Rainfall — IMD Red Alert (68mm)', city: 'Mumbai', icon: '🌧️' },
  { value: 'aqi', label: 'Severe AQI 456 + GRAP Stage IV', city: 'Delhi', icon: '😷' },
  { value: 'bandh', label: 'Civic Disruption — Zone Orders 8%', city: 'Bengaluru', icon: '🚫' },
  { value: 'heat', label: 'Extreme Heat 46°C for 3 days', city: 'Hyderabad', icon: '🌡️' },
  { value: 'fog', label: 'Dense Fog — Visibility 120m', city: 'Delhi', icon: '🌫️' },
  { value: 'cyclone', label: 'Cyclone Alert — Category 3', city: 'Chennai', icon: '🌀' },
];

const SCENARIOS = [
  { value: 'genuine', label: 'Genuine worker — stranded in zone', color: 'var(--green)', fraudProb: 0.16 },
  { value: 'amber', label: 'Amber case — degraded network data', color: '#fbbf24', fraudProb: 0.52 },
  { value: 'fraud', label: 'Fraud attempt — GPS spoof detected', color: '#f87171', fraudProb: 0.84 },
];

const getScenarioFromML = () => {
  const rand = Math.random();
  if (rand < 0.6) return 'genuine';
  if (rand < 0.85) return 'amber';
  return 'fraud';
};

const CLAIM_HISTORY = [
  { id: 'CLM-0041', trigger: 'Heavy Rain — IMD Red Alert', days: 3, payout: 1575, date: 'Mar 15, 2024', status: 'paid', score: 18, route: 'green' },
  { id: 'CLM-0038', trigger: 'Dense Fog — Visibility 120m', days: 1, payout: 525, date: 'Feb 28, 2024', status: 'paid', score: 12, route: 'green' },
  { id: 'CLM-0035', trigger: 'Unplanned Bandh', days: 2, payout: 1050, date: 'Feb 10, 2024', status: 'paid', score: 22, route: 'green' },
  { id: 'CLM-0031', trigger: 'Extreme Heat 45°C', days: 2, payout: 1050, date: 'May 22, 2023', status: 'paid', score: 31, route: 'green' },
  { id: 'CLM-0028', trigger: 'Heavy Rain — IMD Red Alert', days: 4, payout: 2100, date: 'Jul 4, 2023', status: 'paid', score: 44, route: 'amber' },
];

export const Claims = () => {
  const { state, showToast } = useApp();
  const [trigger, setTrigger] = useState('rain');
  const [days, setDays] = useState(3);
  const [mlDetectedScenario, setMlDetectedScenario] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const runMLDetection = () => {
    const scenario = getScenarioFromML();
    setMlDetectedScenario(scenario);
    return scenario;
  };

  const coveragePct = state.selectedTier === 'basic' ? 0.6 : state.selectedTier === 'premium' ? 0.9 : 0.75;
  const calculatedPayout = Math.round(state.dailyBaseline * coveragePct * days);

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const processClaim = async () => {
    setProcessing(true);
    setLogs([]);
    setResult(null);
    setMlDetectedScenario(null);

    await delay(500);
    const scenario = runMLDetection();

    const steps = [
      { delay: 400, icon: '📡', text: `Connecting to ${trigger.toUpperCase()} trigger API...`, status: 'checking' },
      { delay: 900, icon: '✅', text: 'Trigger confirmed. IMD/OpenWeatherMap threshold crossed.', status: 'ok' },
      { delay: 1400, icon: '📍', text: 'Validating GPS location — Worker in Andheri West zone...', status: 'checking' },
      { delay: 1900, icon: scenario === 'fraud' ? '🚨' : '✅', text: scenario === 'fraud' ? 'ALERT: GPS SPOOF DETECTED! Cell tower delta: 18km (Thane).' : 'Location confirmed. Cell tower delta: 0.8km ✓', status: scenario === 'fraud' ? 'fraud' : 'ok' },
      { delay: 2400, icon: '📊', text: scenario === 'fraud' ? 'Platform anomaly: Earnings logged during claimed disruption' : 'Platform activity: 0 trips in 4hrs ✓', status: scenario === 'fraud' ? 'fraud' : 'ok' },
      { delay: 2900, icon: '🤖', text: 'Running Isolation Forest fraud model (18 features, 50K training samples)...', status: 'checking' },
      { delay: 3500, icon: scenario === 'genuine' ? '🟢' : scenario === 'amber' ? '🟡' : '🔴', text: scenario === 'genuine' ? 'Fraud score: 16/100 → GREEN PATH — Auto-approve' : scenario === 'amber' ? 'Fraud score: 52/100 → AMBER PATH — Network degradation detected' : 'Fraud score: 84/100 → RED PATH — GPS spoof confirmed. Claim DENIED.', status: scenario === 'genuine' ? 'ok' : scenario === 'amber' ? 'warn' : 'fraud' },
    ];

    if (scenario === 'amber') {
      steps.push({ delay: 4500, icon: '🔄', text: 'Peer zone validation: 14/17 workers show same pattern.', status: 'checking' });
      steps.push({ delay: 5200, icon: '✅', text: 'Weather Network Discount applied. Fraud score adjusted: 52→28. AUTO-APPROVED.', status: 'ok' });
    }

    if (scenario !== 'fraud') {
      steps.push({ delay: scenario === 'amber' ? 5700 : 4000, icon: '💸', text: `Calculating payout: ${coveragePct * 100}% × ₹${state.dailyBaseline} × ${days} days = ₹${calculatedPayout}`, status: 'ok' });
      steps.push({ delay: scenario === 'amber' ? 6400 : 4600, icon: '🏦', text: `Initiating UPI transfer to ${state.upiId}...`, status: 'ok' });
      steps.push({ delay: scenario === 'amber' ? 7200 : 5200, icon: '✅', text: `₹${calculatedPayout} credited! SMS + Push notification sent.`, status: 'done' });
    }

    let prevDelay = 0;
    for (const step of steps) {
      await delay(step.delay - prevDelay);
      prevDelay = step.delay;
      setLogs(prev => [...prev, step]);
    }

    if (scenario !== 'fraud') {
      setResult({
        success: true,
        payout: calculatedPayout,
        processingTime: scenario === 'amber' ? '7.2s' : '5.2s',
        fraudScore: scenario === 'genuine' ? 16 : 28,
        route: scenario === 'genuine' ? 'green' : 'amber'
      });
      showToast(`₹${calculatedPayout.toLocaleString()} credited to UPI!`, 'success');
    } else {
      setResult({ success: false, reason: 'GPS spoof detected. Claim denied.' });
      showToast('Fraud attempt blocked. Claim denied.', 'error');
    }

    setProcessing(false);
  };

  const getLogColor = (status) => {
    const colors = { checking: 'var(--text2)', ok: 'var(--green-l)', warn: '#fbbf24', fraud: '#f87171', done: 'var(--green-l)' };
    return colors[status] || 'var(--text)';
  };

  const totalPaidOut = CLAIM_HISTORY.reduce((sum, c) => sum + c.payout, 0);

  return (
    <div className="page">
      <div className="premium-hero">
        <div className="premium-hero-glow" />
        <div className="premium-hero-separator" />
        
        <div className="premium-hero-split">
          <div className="premium-hero-content">
            <div className="premium-badge">
              <span className="premium-badge-icon">✦</span>
              <span>Zero-Touch Claims</span>
            </div>
            
            <h1 className="premium-headline">
              Instant <span className="premium-gradient">Payouts</span>
            </h1>
            
            <p className="premium-subtitle">
              Fully automated claims powered by AI fraud detection. 
              No forms, no calls, no waiting. Payout in under 5 seconds.
            </p>
            
            <div className="premium-trust">
              <div className="trust-item">
                <span>⚡</span>
                <span>5s Avg Payout</span>
              </div>
              <div className="trust-item">
                <span>🤖</span>
                <span>AI Verified</span>
              </div>
              <div className="trust-item">
                <span>💳</span>
                <span>UPI Instant</span>
              </div>
            </div>
          </div>
          
          <div className="premium-card-wrapper">
            <div className="premium-glass-card">
              <div className="card-shimmer" />
              <div className="card-header-mini">
                <span className="card-icon-mini">✅</span>
                <span>Latest Claim</span>
              </div>
              <div className="card-price-mini">
                <span className="price-amount">₹2,500</span>
                <span className="price-period">settled</span>
              </div>
              <div className="card-features-mini">
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Trigger detected</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Auto-verified</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>UPI credited</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>SMS confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="claim-flow-card">
        <h2>Zero-Touch Claim Process</h2>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-icon">📡</div>
            <div className="step-num">1</div>
            <div className="step-label">Trigger Detection</div>
            <div className="step-desc">API monitors weather, AQI, traffic</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">🔍</div>
            <div className="step-num">2</div>
            <div className="step-label">Silent Validation</div>
            <div className="step-desc">GPS, cell tower, activity checked</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">🤖</div>
            <div className="step-num">3</div>
            <div className="step-label">ML Fraud Check</div>
            <div className="step-desc">Isolation Forest scores 0-100</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">💸</div>
            <div className="step-num">4</div>
            <div className="step-label">UPI Payout</div>
            <div className="step-desc">Instant credit to your UPI ID</div>
          </div>
        </div>
      </div>

      <div className="grid-2 mt-24">
        <div className="card">
          <h2>Simulate Claim Processing</h2>
          <div className="form-group">
            <label>Select Disruption Event</label>
            <select value={trigger} onChange={e => setTrigger(e.target.value)}>
              {TRIGGER_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Days Affected</label>
            <select value={days} onChange={e => setDays(parseInt(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Worker Scenario (ML Detected)</label>
            {mlDetectedScenario ? (
              <div className="scenario-options">
                {SCENARIOS.map(s => (
                  <div
                    key={s.value}
                    className={`scenario-option ${mlDetectedScenario === s.value ? 'selected' : ''}`}
                    style={{ '--scenario-color': s.color, pointerEvents: 'none' }}
                  >
                    <span className="scenario-indicator" style={{ background: s.color }} />
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scenario-placeholder">
                <span className="scenario-icon">🤖</span>
                <span>ML model will auto-detect scenario when you click "Process Claim"</span>
              </div>
            )}
          </div>

          <div className="payout-preview">
            <span className="label">Estimated Payout</span>
            <span className="payout-amount">₹{calculatedPayout}</span>
            <span className="payout-breakdown">
              {coveragePct * 100}% × ₹{state.dailyBaseline} × {days} days
            </span>
          </div>

          <button className="btn btn-primary btn-full mt-16" onClick={processClaim} disabled={processing}>
            {processing ? <><span className="spinner" /> Processing...</> : '▶ Process Claim (Auto)'}
          </button>
        </div>

        <div className="card">
          <h2>Claim Processing Log</h2>
          <div className="claim-log">
            {logs.length === 0 ? (
              <div className="log-empty">
                <div className="empty-icon">📋</div>
                <div className="fs-13 c-text2">Select a scenario and click "Process Claim" to see the automated flow</div>
              </div>
            ) : (
              <>
                {logs.map((log, idx) => (
                  <div key={idx} className="log-item" style={{ borderLeftColor: getLogColor(log.status) }}>
                    <span className="log-icon">{log.icon}</span>
                    <span className="log-text" style={{ color: getLogColor(log.status) }}>{log.text}</span>
                  </div>
                ))}
                {result && (
                  <div className={`result-panel ${result.success ? 'success' : 'denied'}`}>
                    {result.success ? (
                      <>
                        <div className="result-icon">💸</div>
                        <div className="result-amount">₹{result.payout.toLocaleString()}</div>
                        <div className="result-label">Credited to UPI</div>
                        <div className="result-meta">
                          <span className="badge badge-green">✓ {result.route.toUpperCase()} PATH</span>
                          <span className="fs-12 c-text2">Fraud score: {result.fraudScore}/100</span>
                        </div>
                        <div className="result-time">Processing time: {result.processingTime}</div>
                      </>
                    ) : (
                      <>
                        <div className="result-icon">🚫</div>
                        <div className="result-label denied">CLAIM DENIED</div>
                        <div className="result-reason">{result.reason}</div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-24">
        <div className="flex justify-between items-center mb-16">
          <h2 style={{ marginBottom: 0 }}>Claim History</h2>
          <span className="badge badge-teal">Total Paid Out: ₹{totalPaidOut.toLocaleString()}</span>
        </div>
        {CLAIM_HISTORY.map(claim => (
          <div key={claim.id} className="claim-card">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-8 mb-8">
                  <span className="fs-13 fw-600">{claim.id}</span>
                  <span className="badge badge-green">✓ PAID</span>
                  <span className={`badge ${claim.route === 'green' ? 'badge-green' : 'badge-yellow'}`}>
                    {claim.route === 'green' ? '🟢 Green' : '🟡 Amber'}
                  </span>
                </div>
                <div className="fs-13 c-text2">{claim.trigger} · {claim.days} day{claim.days > 1 ? 's' : ''}</div>
                <div className="fs-12 c-text2 mt-4">{claim.date} · Fraud score: {claim.score}/100</div>
              </div>
              <div className="text-right">
                <div className="value c-green" style={{ fontSize: '20px' }}>₹{claim.payout.toLocaleString()}</div>
                <div className="fs-12 c-text2">to UPI</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
