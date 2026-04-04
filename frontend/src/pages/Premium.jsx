import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { aiPricingService } from '../services/aiPricing';
import { mlModelService } from '../services/mlModels';
import UPIPayment from '../components/UPIPayment';

const CITIES = [
  { value: 'mumbai', label: 'Mumbai', tier: 1, base: 70, risk: 'HIGH', floodDays: 18, aqi: 145, monsoon: 'Jun-Sep' },
  { value: 'delhi', label: 'Delhi NCR', tier: 1, base: 70, risk: 'HIGH', floodDays: 12, aqi: 180, monsoon: 'Jul-Aug' },
  { value: 'bengaluru', label: 'Bengaluru', tier: 1, base: 70, risk: 'MEDIUM', floodDays: 8, aqi: 65, monsoon: 'Sep-Oct' },
  { value: 'chennai', label: 'Chennai', tier: 1, base: 70, risk: 'MEDIUM', floodDays: 6, aqi: 55, monsoon: 'Nov-Dec' },
  { value: 'hyderabad', label: 'Hyderabad', tier: 1, base: 70, risk: 'MEDIUM', floodDays: 7, aqi: 58, monsoon: 'Jul-Sep' },
  { value: 'kolkata', label: 'Kolkata', tier: 1, base: 70, risk: 'HIGH', floodDays: 15, aqi: 95, monsoon: 'Jul-Sep' },
  { value: 'pune', label: 'Pune', tier: 2, base: 50, risk: 'MEDIUM', floodDays: 5, aqi: 48, monsoon: 'Jul-Sep' },
  { value: 'ahmedabad', label: 'Ahmedabad', tier: 2, base: 50, risk: 'LOW', floodDays: 3, aqi: 75, monsoon: 'Jul-Aug' },
  { value: 'surat', label: 'Surat', tier: 2, base: 50, risk: 'MEDIUM', floodDays: 6, aqi: 70, monsoon: 'Jun-Sep' },
  { value: 'vadodara', label: 'Vadodara', tier: 2, base: 50, risk: 'LOW', floodDays: 2, aqi: 68, monsoon: 'Jul-Aug' },
  { value: 'jaipur', label: 'Jaipur', tier: 2, base: 50, risk: 'LOW', floodDays: 2, aqi: 65, monsoon: 'Jul-Aug' },
  { value: 'lucknow', label: 'Lucknow', tier: 2, base: 50, risk: 'MEDIUM', floodDays: 8, aqi: 120, monsoon: 'Jul-Sep' },
  { value: 'chandigarh', label: 'Chandigarh', tier: 2, base: 50, risk: 'LOW', floodDays: 1, aqi: 40, monsoon: 'Jul-Aug' },
  { value: 'indore', label: 'Indore', tier: 2, base: 50, risk: 'LOW', floodDays: 2, aqi: 60, monsoon: 'Jul-Aug' },
  { value: 'kochi', label: 'Kochi', tier: 2, base: 50, risk: 'HIGH', floodDays: 14, aqi: 50, monsoon: 'Jun-Dec' },
  { value: 'visakhapatnam', label: 'Visakhapatnam', tier: 2, base: 50, risk: 'HIGH', floodDays: 10, aqi: 55, monsoon: 'Oct-Dec' },
  { value: 'nagpur', label: 'Nagpur', tier: 2, base: 50, risk: 'MEDIUM', floodDays: 5, aqi: 65, monsoon: 'Jun-Sep' },
  { value: 'mohali', label: 'Mohali', tier: 2, base: 50, risk: 'LOW', floodDays: 1, aqi: 42, monsoon: 'Jul-Aug' },
  { value: 'dehradun', label: 'Dehradun', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 55, monsoon: 'Jul-Sep' },
  { value: 'bhopal', label: 'Bhopal', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 58, monsoon: 'Jul-Aug' },
  { value: 'mangalore', label: 'Mangalore', tier: 3, base: 38, risk: 'MEDIUM', floodDays: 6, aqi: 45, monsoon: 'Jun-Sep' },
  { value: 'coimbatore', label: 'Coimbatore', tier: 3, base: 38, risk: 'LOW', floodDays: 3, aqi: 48, monsoon: 'Oct-Dec' },
  { value: 'patna', label: 'Patna', tier: 3, base: 38, risk: 'HIGH', floodDays: 16, aqi: 140, monsoon: 'Jun-Sep' },
  { value: 'guwahati', label: 'Guwahati', tier: 3, base: 38, risk: 'HIGH', floodDays: 14, aqi: 85, monsoon: 'Jun-Sep' },
  { value: 'thiruvananthapuram', label: 'Thiruvananthapuram', tier: 3, base: 38, risk: 'HIGH', floodDays: 12, aqi: 52, monsoon: 'Jun-Dec' },
  { value: 'ludhiana', label: 'Ludhiana', tier: 3, base: 38, risk: 'LOW', floodDays: 1, aqi: 45, monsoon: 'Jul-Aug' },
  { value: 'jalandhar', label: 'Jalandhar', tier: 3, base: 38, risk: 'LOW', floodDays: 1, aqi: 48, monsoon: 'Jul-Aug' },
  { value: 'amritsar', label: 'Amritsar', tier: 3, base: 38, risk: 'LOW', floodDays: 1, aqi: 50, monsoon: 'Jul-Aug' },
  { value: 'varanasi', label: 'Varanasi', tier: 3, base: 38, risk: 'MEDIUM', floodDays: 6, aqi: 115, monsoon: 'Jul-Sep' },
  { value: 'prayagraj', label: 'Prayagraj', tier: 3, base: 38, risk: 'MEDIUM', floodDays: 7, aqi: 100, monsoon: 'Jul-Sep' },
  { value: 'ranchi', label: 'Ranchi', tier: 3, base: 38, risk: 'MEDIUM', floodDays: 5, aqi: 75, monsoon: 'Jun-Sep' },
  { value: 'bhubaneswar', label: 'Bhubaneswar', tier: 3, base: 38, risk: 'HIGH', floodDays: 12, aqi: 70, monsoon: 'Jul-Oct' },
  { value: 'cuttack', label: 'Cuttack', tier: 3, base: 38, risk: 'HIGH', floodDays: 11, aqi: 72, monsoon: 'Jul-Oct' },
  { value: 'madurai', label: 'Madurai', tier: 3, base: 38, risk: 'LOW', floodDays: 3, aqi: 50, monsoon: 'Oct-Dec' },
  { value: 'tiruchirappalli', label: 'Tiruchirappalli', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 52, monsoon: 'Oct-Dec' },
  { value: 'mysore', label: 'Mysore', tier: 3, base: 38, risk: 'LOW', floodDays: 3, aqi: 55, monsoon: 'Sep-Nov' },
  { value: 'hubli', label: 'Hubli', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 52, monsoon: 'Jun-Sep' },
  { value: 'belgaum', label: 'Belgaum', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 50, monsoon: 'Jun-Sep' },
  { value: 'aurangabad', label: 'Aurangabad', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 58, monsoon: 'Jul-Sep' },
  { value: 'nashik', label: 'Nashik', tier: 3, base: 38, risk: 'MEDIUM', floodDays: 4, aqi: 55, monsoon: 'Jul-Sep' },
  { value: 'kota', label: 'Kota', tier: 3, base: 38, risk: 'LOW', floodDays: 2, aqi: 62, monsoon: 'Jul-Aug' },
  { value: 'udaipur', label: 'Udaipur', tier: 3, base: 38, risk: 'LOW', floodDays: 1, aqi: 48, monsoon: 'Jul-Sep' },
  { value: 'jodhpur', label: 'Jodhpur', tier: 3, base: 38, risk: 'LOW', floodDays: 1, aqi: 55, monsoon: 'Jul-Aug' },
  { value: 'trivandrum', label: 'Trivandrum', tier: 3, base: 38, risk: 'HIGH', floodDays: 12, aqi: 52, monsoon: 'Jun-Dec' },
  { value: 'other', label: 'Other City', tier: 3, base: 38, risk: 'MEDIUM', floodDays: 5, aqi: 70, monsoon: 'Jul-Sep' },
];

const getZoneRisksForCity = (cityRisk, floodDays) => {
  const risks = [];
  
  if (cityRisk === 'HIGH' || floodDays >= 10) {
    risks.push({ value: 0.8, label: 'Low Risk — Safe zone, minimal flood history', color: 'var(--green)', adjustment: -14 });
    risks.push({ value: 1.0, label: 'Medium Risk — Occasional disruptions', color: '#fbbf24', adjustment: 0 });
    risks.push({ value: 1.3, label: 'High Risk — Flood-prone area', color: 'var(--orange)', adjustment: +21 });
    risks.push({ value: 1.5, label: 'Extreme Risk — Cyclone coast, severe flooding', color: '#f87171', adjustment: +35 });
  } else if (cityRisk === 'MEDIUM' || floodDays >= 5) {
    risks.push({ value: 0.8, label: 'Low Risk — Safe zone, no flood history', color: 'var(--green)', adjustment: -14 });
    risks.push({ value: 1.0, label: 'Medium Risk — Occasional disruptions', color: '#fbbf24', adjustment: 0 });
    risks.push({ value: 1.3, label: 'High Risk — Flood-prone zone', color: 'var(--orange)', adjustment: +21 });
  } else {
    risks.push({ value: 0.8, label: 'Low Risk — Safe zone, no flood history', color: 'var(--green)', adjustment: -14 });
    risks.push({ value: 1.0, label: 'Medium Risk — Occasional disruptions', color: '#fbbf24', adjustment: 0 });
  }
  
  return risks;
};

const ZONE_RISKS = [
  { value: 0.8, label: 'Low Risk — No flood history', color: 'var(--green)', adjustment: -14 },
  { value: 1.0, label: 'Medium Risk — Occasional disruptions', color: '#fbbf24', adjustment: 0 },
  { value: 1.3, label: 'High Risk — Flood-prone zone', color: 'var(--orange)', adjustment: +21 },
  { value: 1.5, label: 'Extreme Risk — Cyclone coast', color: '#f87171', adjustment: +35 },
];

const COVERAGE_TIERS = [
  { value: 'basic', label: 'Basic Shield', coverage: 60, multiplier: 0.85 },
  { value: 'standard', label: 'Standard Shield', coverage: 75, multiplier: 1.0, popular: true },
  { value: 'premium', label: 'Premium Shield', coverage: 90, multiplier: 1.25 },
];

const TENURES = [
  { value: 0, label: 'New (0-3 months)', discount: 0 },
  { value: 6, label: 'Regular (3-12 months)', discount: 0.03 },
  { value: 14, label: 'Established (12-24 months)', discount: 0.08 },
  { value: 24, label: 'Loyal (24+ months)', discount: 0.15 },
];

export const Premium = () => {
  const { state } = useApp();
  const [inputs, setInputs] = useState({
    city: 'mumbai',
    coverageTier: 'standard',
    earnings: 4500,
    tenure: 14,
  });

  const getCityData = (cityValue) => {
    return CITIES.find(c => c.value === cityValue) || CITIES[0];
  };

  const getZoneRiskMultiplier = (cityData) => {
    if (cityData.floodDays >= 12) return { value: 1.5, label: 'EXTREME', risk: 'EXTREME' };
    if (cityData.floodDays >= 8) return { value: 1.3, label: 'HIGH', risk: 'HIGH' };
    if (cityData.floodDays >= 4) return { value: 1.0, label: 'MEDIUM', risk: 'MEDIUM' };
    return { value: 0.8, label: 'LOW', risk: 'LOW' };
  };

  const selectedCity = getCityData(inputs.city);
  const zoneRiskData = getZoneRiskMultiplier(selectedCity);
  const [premiumData, setPremiumData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpiPayment, setShowUpiPayment] = useState(false);

  useEffect(() => {
    calculatePremium();
    loadForecast();
  }, [inputs]);

  const calculatePremium = async () => {
    setLoading(true);
    const base = selectedCity.base;
    const zoneMultiplier = zoneRiskData.value;
    const coverage = COVERAGE_TIERS.find(c => c.value === inputs.coverageTier);
    const tenureDiscount = TENURES.find(t => t.value <= inputs.tenure)?.discount || 0;

    const weatherAdjustment = zoneMultiplier > 1.2 ? 0.08 : 0;
    const mlAdjustments = getMLAdjustments();

    const finalPremium = Math.round(
      base * zoneMultiplier * coverage.multiplier * (1 - tenureDiscount) * (1 + weatherAdjustment)
    ) + mlAdjustments.net;

    setPremiumData({
      base,
      zoneMultiplier,
      coverageMultiplier: coverage.multiplier,
      coveragePercent: coverage.coverage,
      tenureDiscount,
      weatherAdjustment,
      mlAdjustments,
      finalPremium,
      monthlyEquivalent: finalPremium * 4,
      breakdown: [
        { label: 'City Base Rate', value: `₹${base}`, note: `${selectedCity.label} (Tier ${selectedCity.tier})` },
        { label: 'Zone Risk Multiplier', value: `${zoneMultiplier}×`, note: zoneMultiplier > 1 ? `+₹${Math.round(base * (zoneMultiplier - 1))}` : `-₹${Math.round(base * (1 - zoneMultiplier))}` },
        { label: 'Coverage Tier', value: `${coverage.coverage}%`, note: coverage.label },
        { label: 'Tenure Discount', value: `-${Math.round(tenureDiscount * 100)}%`, note: tenureDiscount > 0 ? 'Loyalty reward' : 'New customer' },
        { label: 'Weather Adjustment', value: weatherAdjustment > 0 ? '+8%' : '0%', note: weatherAdjustment > 0 ? 'High-risk season' : 'Normal' },
        { label: 'ML Hyper-Local', value: mlAdjustments.net > 0 ? `+₹${mlAdjustments.net}` : `₹${mlAdjustments.net}`, note: 'AI pricing model' },
      ]
    });
    setLoading(false);
  };

  const getMLAdjustments = () => {
    const adjustments = [];
    let net = 0;

    if (zoneRiskData.value > 1.2) {
      adjustments.push({ desc: `${selectedCity.label} zone historically waterlogged ${selectedCity.floodDays}+ days/year`, adj: +8, color: 'var(--orange)' });
      net += 8;
    } else if (zoneRiskData.value <= 0.9) {
      adjustments.push({ desc: `Safe zone in ${selectedCity.label} - no flood history`, adj: -14, color: 'var(--green-l)' });
      net -= 14;
    }

    if (selectedCity.floodDays >= 12) {
      adjustments.push({ desc: `${selectedCity.label} - High flood risk zone (${selectedCity.floodDays} days/year)`, adj: +6, color: 'var(--orange)' });
      net += 6;
    } else if (selectedCity.floodDays >= 6) {
      adjustments.push({ desc: `${selectedCity.label} - Moderate flood risk (${selectedCity.floodDays} days/year)`, adj: +3, color: 'var(--yellow)' });
      net += 3;
    }

    if (selectedCity.aqi > 100) {
      adjustments.push({ desc: `${selectedCity.label} AQI ${selectedCity.aqi} - Severe air pollution`, adj: +4, color: 'var(--red)' });
      net += 4;
    } else if (selectedCity.aqi > 60) {
      adjustments.push({ desc: `${selectedCity.label} AQI ${selectedCity.aqi} - Moderate pollution`, adj: +2, color: 'var(--yellow)' });
      net += 2;
    }

    if (inputs.tenure >= 24) {
      adjustments.push({ desc: '24+ months consistent history', adj: -4, color: 'var(--green-l)' });
      net -= 4;
    } else if (inputs.tenure >= 14) {
      adjustments.push({ desc: '12-24 months experience', adj: -2, color: 'var(--green-l)' });
      net -= 2;
    }

    adjustments.push({ desc: `Monsoon season (${selectedCity.monsoon})`, adj: +6, color: 'var(--orange)' });
    net += 6;

    return { items: adjustments, net };
  };

  const loadForecast = async () => {
    const data = await aiPricingService.predict14DayDisruption(state.city || 'mumbai', state.zone || 'andheri_west');
    setForecast(data);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getRiskColor = (prob) => {
    if (prob > 0.7) return 'var(--orange)';
    if (prob > 0.4) return '#fbbf24';
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
              <span>Premium</span>
            </div>
            
            <h1 className="premium-headline">
              Smart <span className="premium-gradient">Premium Pricing</span> That Adapts to You
            </h1>
            
            <p className="premium-subtitle">
              AI-driven dynamic pricing based on real-time weather, zone risk, and your delivery patterns. 
              Pay only for the coverage you need, when you need it.
            </p>
            
            <div className="premium-ctas">
              <button className="premium-btn-primary">
                View Plans
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button className="premium-btn-secondary">
                How It Works
              </button>
            </div>
            
            <div className="premium-trust">
              <div className="trust-item">
                <span>🛡️</span>
                <span>10K+ Protected</span>
              </div>
              <div className="trust-item">
                <span>⚡</span>
                <span>5s Claims</span>
              </div>
              <div className="trust-item">
                <span>💰</span>
                <span>₹2Cr+ Paid</span>
              </div>
            </div>
          </div>
          
          <div className="premium-card-wrapper">
            <div className="premium-glass-card">
              <div className="card-shimmer" />
              <div className="card-header-mini">
                <span className="card-icon-mini">💎</span>
                <span>Premium Tier</span>
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
                  <span>24hr claim processing</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Accident protection</span>
                </div>
                <div className="feature-mini">
                  <span className="check-mini">✓</span>
                  <span>Income loss cover</span>
                </div>
              </div>
              <button className="card-btn-mini">Get Started</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card mb-16">
            <h2>Worker Profile</h2>
            <div className="form-group">
              <label>Select City</label>
              <select value={inputs.city} onChange={e => handleInputChange('city', e.target.value)}>
                <optgroup label="Tier 1 Cities">
                  {CITIES.filter(c => c.tier === 1).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Tier 2 Cities">
                  {CITIES.filter(c => c.tier === 2).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Tier 3 Cities">
                  {CITIES.filter(c => c.tier === 3).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </optgroup>
              </select>
              {(() => {
                const city = CITIES.find(c => c.value === inputs.city);
                return city && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text2)' }}>
                    <span className={`badge ${city.risk === 'HIGH' ? 'badge-orange' : city.risk === 'MEDIUM' ? 'badge-yellow' : 'badge-green'}`}>
                      {city.risk} RISK CITY
                    </span>
                    <span style={{ marginLeft: '8px' }}>
                      Flood: {city.floodDays} days/yr | AQI: {city.aqi} | Monsoon: {city.monsoon}
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="form-group">
              <label>Zone Risk (ML Calculated)</label>
              {(() => {
                const riskColor = zoneRiskData.value >= 1.3 ? 'var(--orange)' : zoneRiskData.value < 1 ? 'var(--green)' : '#fbbf24';
                const riskDesc = zoneRiskData.value >= 1.3 ? 'Flood-prone zone - higher risk' : zoneRiskData.value < 1 ? 'Safe zone - lower premium' : 'Moderate risk zone';
                return (
                  <div className="alert" style={{ 
                    background: zoneRiskData.value >= 1.3 ? 'rgba(234, 88, 12, 0.1)' : zoneRiskData.value < 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                    borderColor: riskColor,
                    color: 'var(--text)'
                  }}>
                    <div className="flex items-center gap-8">
                      <span className="tag" style={{ background: riskColor, color: 'white' }}>{zoneRiskData.label}</span>
                      <span className="fs-13">{riskDesc}</span>
                      <span className="fs-13 c-text2" style={{ marginLeft: 'auto' }}>{zoneRiskData.value}×</span>
                    </div>
                    <div className="fs-12 c-text2 mt-8">
                      Based on {selectedCity.label}: {selectedCity.floodDays} flood days/yr, AQI {selectedCity.aqi}, historical data
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="form-group">
              <label>Coverage Tier</label>
              <div className="coverage-tier-grid">
                {COVERAGE_TIERS.map(t => (
                  <div
                    key={t.value}
                    className={`coverage-tier-option ${inputs.coverageTier === t.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('coverageTier', t.value)}
                  >
                    <span className="tier-label">{t.label}</span>
                    <span className="tier-pct">{t.coverage}%</span>
                    {t.popular && <span className="popular-tag">POPULAR</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Weekly Earnings (₹) — Affects baseline calculation</label>
              <input type="range" min="1500" max="12000" step="100" value={inputs.earnings} onChange={e => handleInputChange('earnings', parseInt(e.target.value))} />
              <div className="flex justify-between fs-12 c-text2 mt-8">
                <span>₹1,500</span>
                <span className="fw-600 c-blue">₹{inputs.earnings.toLocaleString()}</span>
                <span>₹12,000</span>
              </div>
            </div>
            <div className="form-group">
              <label>Platform Tenure</label>
              <select value={inputs.tenure} onChange={e => handleInputChange('tenure', parseInt(e.target.value))}>
                {TENURES.map(t => (
                  <option key={t.value} value={t.value}>{t.label} {t.discount > 0 ? `(-${Math.round(t.discount * 100)}%)` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-8 mb-16">
              <h2 style={{ marginBottom: 0 }}>ML Feature Importance</h2>
            </div>
            <div className="feature-list">
              {(() => {
                const mlResult = mlModelService.predictPremium({
                  city: inputs.city,
                  zoneRisk: zoneRiskData.value,
                  coverageTier: inputs.coverageTier,
                  tenureMonths: inputs.tenure,
                  weeklyEarnings: inputs.earnings,
                });
                return mlResult.featureImportance.map((f, idx) => {
                  const colors = ['var(--orange)', 'var(--blue-l)', 'var(--teal-l)', '#a78bfa', 'var(--green-l)', '#f472b6', '#fbbf24'];
                  return (
                    <div key={idx} className="feature-bar">
                      <div className="feature-header">
                        <span className="fs-12 c-text2">{f.name}</span>
                        <span className="fs-12 fw-600">{f.importance}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${f.importance}%`, background: colors[idx % colors.length] }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <h2>Premium Breakdown</h2>
            <div className="premium-display">
              <div className="premium-main">
                <span className="premium-label">Weekly Premium</span>
                <div className="premium-amount-lg">
                  {loading ? <span className="spinner" /> : `₹${premiumData?.finalPremium || 0}`}
                </div>
                <span className="premium-monthly">≈ ₹{premiumData?.monthlyEquivalent || 0}/month</span>
              </div>
              <div className="premium-savings">
                <span className="savings-label">vs Base Rate</span>
                <span className="savings-value">-{Math.round((1 - zoneRiskData.value) * 100 + inputs.tenure * 0.5)}%</span>
              </div>
            </div>

            {premiumData?.breakdown.map((item, idx) => (
              <div key={idx} className="breakdown-row">
                <div className="breakdown-info">
                  <span className="breakdown-label">{item.label}</span>
                  <span className="breakdown-note">{item.note}</span>
                </div>
                <span className="breakdown-value">{item.value}</span>
              </div>
            ))}

            <div className="divider" />
            <div className="final-row">
              <span>Final Weekly Premium</span>
              <span className="fw-700 c-blue fs-16">₹{premiumData?.finalPremium || 0}</span>
            </div>
            
            <button 
              className="btn btn-primary btn-full btn-lg" 
              style={{ marginTop: '20px' }}
              onClick={() => setShowUpiPayment(true)}
            >
              💰 Pay via UPI
            </button>
          </div>

          <div className="card mb-16">
            <div className="flex items-center gap-8 mb-16">
              <h2 style={{ marginBottom: 0 }}>ML Hyper-Local Adjustments</h2>
              <span className="tag tag-ml">AI PRICING</span>
            </div>
            <div className="alert alert-info">
              Micro-adjustments based on hyper-local historical data and real-time weather:
            </div>
            {premiumData?.mlAdjustments.items.map((adj, idx) => (
              <div key={idx} className="adj-row">
                <span className="adj-icon">{adj.adj > 0 ? '↑' : '↓'}</span>
                <span className="adj-desc">{adj.desc}</span>
                <span className="adj-value" style={{ color: adj.color }}>
                  {adj.adj > 0 ? `+₹${adj.adj}` : `₹${adj.adj}`}/week
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center gap-8 mb-16">
              <h2 style={{ marginBottom: 0 }}>14-Day Disruption Forecast</h2>
              <span className="tag tag-api">Weather API</span>
            </div>
            {forecast && (
              <>
                <div className="forecast-chart">
                  {forecast.predictions.map((day, idx) => (
                    <div key={idx} className="forecast-bar">
                      <div
                        className="bar"
                        style={{
                          height: `${Math.round(day.disruptionProbability * 60)}px`,
                          background: getRiskColor(day.disruptionProbability)
                        }}
                      />
                      <span className="day-label">{day.dayName}</span>
                    </div>
                  ))}
                </div>
                <div className="forecast-legend">
                  <span className="legend-item"><span className="dot" style={{ background: 'var(--orange)' }} /> High (70%+)</span>
                  <span className="legend-item"><span className="dot" style={{ background: '#fbbf24' }} /> Medium</span>
                  <span className="legend-item"><span className="dot" style={{ background: 'var(--green)' }} /> Low</span>
                </div>
                <div className="alert alert-warning mt-16">
                  <strong>{forecast.summary.highRiskDays}</strong> high-risk days in forecast. Consider extended coverage.
                </div>
                <div className="forecast-insight mt-8 c-text2 fs-12">
                  {forecast.summary.seasonAlert}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showUpiPayment && (
        <UPIPayment
          amount={premiumData?.finalPremium || 91}
          purpose="premium"
          onSuccess={(data) => {
            setShowUpiPayment(false);
            alert(`Payment successful! Transaction: ${data.transactionId}`);
          }}
          onCancel={() => setShowUpiPayment(false)}
        />
      )}
    </div>
  );
};
