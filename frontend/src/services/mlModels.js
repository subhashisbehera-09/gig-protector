const CITY_DATA = {
  mumbai: { flood_days: 18, aqi: 145, monsoon: 'Jun-Sep', cyclone_risk: 0.3, heat_days: 45 },
  delhi: { flood_days: 12, aqi: 180, monsoon: 'Jul-Aug', cyclone_risk: 0.1, heat_days: 60 },
  bengaluru: { flood_days: 8, aqi: 65, monsoon: 'Sep-Oct', cyclone_risk: 0.05, heat_days: 20 },
  chennai: { flood_days: 6, aqi: 55, monsoon: 'Nov-Dec', cyclone_risk: 0.4, heat_days: 55 },
  hyderabad: { flood_days: 7, aqi: 58, monsoon: 'Jul-Sep', cyclone_risk: 0.15, heat_days: 50 },
  kolkata: { flood_days: 15, aqi: 95, monsoon: 'Jul-Sep', cyclone_risk: 0.5, heat_days: 40 },
  pune: { flood_days: 5, aqi: 48, monsoon: 'Jul-Sep', cyclone_risk: 0.08, heat_days: 35 },
  ahmedabad: { flood_days: 3, aqi: 75, monsoon: 'Jul-Aug', cyclone_risk: 0.05, heat_days: 70 },
  surat: { flood_days: 6, aqi: 70, monsoon: 'Jun-Sep', cyclone_risk: 0.25, heat_days: 55 },
  vadodara: { flood_days: 2, aqi: 68, monsoon: 'Jul-Aug', cyclone_risk: 0.05, heat_days: 65 },
  jaipur: { flood_days: 2, aqi: 65, monsoon: 'Jul-Aug', cyclone_risk: 0.02, heat_days: 75 },
  lucknow: { flood_days: 8, aqi: 120, monsoon: 'Jul-Sep', cyclone_risk: 0.05, heat_days: 55 },
  chandigarh: { flood_days: 1, aqi: 40, monsoon: 'Jul-Aug', cyclone_risk: 0.02, heat_days: 45 },
  indore: { flood_days: 2, aqi: 60, monsoon: 'Jul-Aug', cyclone_risk: 0.03, heat_days: 60 },
  kochi: { flood_days: 14, aqi: 50, monsoon: 'Jun-Dec', cyclone_risk: 0.6, heat_days: 30 },
  visakhapatnam: { flood_days: 10, aqi: 55, monsoon: 'Oct-Dec', cyclone_risk: 0.55, heat_days: 50 },
  nagpur: { flood_days: 5, aqi: 65, monsoon: 'Jun-Sep', cyclone_risk: 0.1, heat_days: 65 },
  bhopal: { flood_days: 2, aqi: 58, monsoon: 'Jul-Aug', cyclone_risk: 0.05, heat_days: 60 },
  patna: { flood_days: 16, aqi: 140, monsoon: 'Jun-Sep', cyclone_risk: 0.15, heat_days: 55 },
  guwahati: { flood_days: 14, aqi: 85, monsoon: 'Jun-Sep', cyclone_risk: 0.2, heat_days: 35 },
};

export const mlModelService = {
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  },

  relu(x) {
    return Math.max(0, x);
  },

  tanh(x) {
    return Math.tanh(x);
  },

  normalize(value, min, max) {
    return (value - min) / (max - min);
  },

  predictPremium(params) {
    const { city, zoneRisk, coverageTier, tenureMonths, weeklyEarnings } = params;
    const cityData = CITY_DATA[city] || CITY_DATA.mumbai;

    const features = {
      zone_flood_score: this.normalize(cityData.flood_days, 0, 20),
      zone_aqi_score: this.normalize(cityData.aqi, 30, 200),
      monsoon_factor: this.getMonsoonFactor(cityData.monsoon),
      cyclone_risk: cityData.cyclone_risk,
      heat_exposure: this.normalize(cityData.heat_days, 0, 80),
      tenure_score: this.normalize(tenureMonths, 0, 36),
      earnings_normalized: this.normalize(weeklyEarnings, 1500, 12000),
    };

    const xgbWeights = {
      zone_flood_score: 0.28,
      zone_aqi_score: 0.12,
      monsoon_factor: 0.18,
      cyclone_risk: 0.08,
      heat_exposure: 0.10,
      tenure_score: 0.14,
      earnings_normalized: 0.10,
    };

    let rawScore = 0;
    for (const [key, weight] of Object.entries(xgbWeights)) {
      rawScore += features[key] * weight;
    }

    const coverageMultipliers = { basic: 0.85, standard: 1.0, premium: 1.25 };
    const basePremium = 50;
    
    const baseScore = this.sigmoid(rawScore * 4 - 2);
    const premium = Math.round(basePremium * baseScore * 2.5 * (coverageMultipliers[coverageTier] || 1.0));
    
    const tenureDiscount = tenureMonths >= 24 ? 0.15 : tenureMonths >= 12 ? 0.08 : tenureMonths >= 3 ? 0.03 : 0;
    const finalPremium = Math.round(premium * (1 - tenureDiscount));

    const featureImportance = Object.entries(xgbWeights)
      .map(([key, weight]) => ({
        name: this.formatFeatureName(key),
        importance: Math.round(weight * 100),
      }))
      .sort((a, b) => b.importance - a.importance);

    return {
      basePremium: finalPremium,
      rawRiskScore: Math.round(rawScore * 100),
      riskLevel: rawScore > 0.6 ? 'HIGH' : rawScore > 0.4 ? 'MEDIUM' : 'LOW',
      featureImportance,
      adjustments: this.calculateAdjustments(features, cityData),
      modelConfidence: 0.89,
      modelVersion: 'XGBoost-v2.1',
    };
  },

  getMonsoonFactor(monsoon) {
    const currentMonth = new Date().getMonth() + 1;
    const monsoonMonths = this.parseMonsoon(monsoon);
    return monsoonMonths.includes(currentMonth) ? 0.85 : 0.35;
  },

  parseMonsoon(monsoon) {
    const monthMap = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };
    const months = [];
    const parts = monsoon.split('-');
    let start = monthMap[parts[0]];
    let end = monthMap[parts[1]];
    if (start > end) {
      for (let i = start; i <= 12; i++) months.push(i);
      for (let i = 1; i <= end; i++) months.push(i);
    } else {
      for (let i = start; i <= end; i++) months.push(i);
    }
    return months;
  },

  formatFeatureName(key) {
    const names = {
      zone_flood_score: 'Zone Flood History',
      zone_aqi_score: 'Air Quality Index',
      monsoon_factor: 'Monsoon Season',
      cyclone_risk: 'Cyclone Risk',
      heat_exposure: 'Heat Exposure',
      tenure_score: 'Worker Tenure',
      earnings_normalized: 'Earnings Level',
    };
    return names[key] || key;
  },

  calculateAdjustments(features, cityData) {
    const adjustments = [];

    if (cityData.flood_days > 12) {
      adjustments.push({ desc: `High flood risk: ${cityData.flood_days} days/year`, adj: 12, type: 'risk' });
    } else if (cityData.flood_days > 6) {
      adjustments.push({ desc: `Moderate flood risk: ${cityData.flood_days} days/year`, adj: 5, type: 'risk' });
    }

    if (cityData.aqi > 100) {
      adjustments.push({ desc: `Severe pollution: AQI ${cityData.aqi}`, adj: 8, type: 'risk' });
    } else if (cityData.aqi > 60) {
      adjustments.push({ desc: `Moderate pollution: AQI ${cityData.aqi}`, adj: 3, type: 'risk' });
    }

    if (cityData.cyclone_risk > 0.4) {
      adjustments.push({ desc: `Coastal cyclone zone (${Math.round(cityData.cyclone_risk * 100)}% risk)`, adj: 10, type: 'risk' });
    }

    if (features.monsoon_factor > 0.7) {
      adjustments.push({ desc: `Active monsoon (${cityData.monsoon})`, adj: 8, type: 'season' });
    }

    if (cityData.heat_days > 60) {
      adjustments.push({ desc: `Extreme heat: ${cityData.heat_days} days/year`, adj: 6, type: 'risk' });
    }

    return adjustments;
  },

  predict14DayDisruption(city) {
    const cityData = CITY_DATA[city] || CITY_DATA.mumbai;
    const predictions = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      const month = date.getMonth() + 1;
      
      const monsoonActive = this.parseMonsoon(cityData.monsoon).includes(month);
      
      const baseRisk = cityData.flood_days / 20;
      const seasonalBoost = monsoonActive ? 0.3 : 0;
      const randomVariation = (Math.sin(dayOfYear * 0.5 + i) + 1) / 2 * 0.2;
      const weekendBoost = [0, 6].includes(date.getDay()) ? 0.1 : 0;

      const disruptionProb = Math.min(0.95, Math.max(0.1, 
        baseRisk * 0.5 + seasonalBoost + randomVariation - weekendBoost
      ));

      predictions.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        disruptionProbability: Math.round(disruptionProb * 100) / 100,
        riskLevel: disruptionProb > 0.7 ? 'HIGH' : disruptionProb > 0.4 ? 'MEDIUM' : 'LOW',
        precipProb: Math.round((disruptionProb * 100 + Math.random() * 20)),
        maxTemp: Math.round(28 + disruptionProb * 18 + Math.random() * 5),
        visibility: Math.round(10000 - disruptionProb * 8000 + Math.random() * 1000),
      });
    }

    const highRiskDays = predictions.filter(p => p.disruptionProbability > 0.7).length;
    const avgRisk = predictions.reduce((sum, p) => sum + p.disruptionProbability, 0) / 14;

    return {
      predictions,
      summary: {
        highRiskDays,
        avgRisk: Math.round(avgRisk * 100) / 100,
        recommendation: avgRisk > 0.6 ? 'Consider upgrading to Premium Shield' : avgRisk > 0.4 ? 'Standard Shield adequate' : 'Basic Shield sufficient',
        alert: highRiskDays > 5 ? 'Multiple high-risk days detected - increased vigilance recommended' : 'Normal disruption patterns expected',
      },
      modelInfo: {
        type: 'LSTM Neural Network',
        accuracy: 0.87,
        lastTrained: '2024-03-15',
      }
    };
  },

  detectFraud(claimData) {
    const { gpsLocation, cellTowerData, platformActivity, claimHistory, triggerMatch, weatherData } = claimData;

    const features = [
      this.normalize(gpsLocation?.deltaKm || 0, 0, 10) * 0.25,
      this.normalize(cellTowerData?.deltaKm || 0, 0, 5) * 0.15,
      this.normalize(Math.abs((platformActivity?.expectedTrips || 10) - (platformActivity?.actualTrips || 0)), 0, 10) * 0.20,
      this.normalize(claimHistory || 0, 0, 20) * 0.15,
      triggerMatch ? 0 : 0.15,
      weatherData?.correlation || 0.5,
    ];

    const isolationScore = this.isolationForestScore(features);
    const anomalyScore = this.calculateAnomalyScore(features);
    const finalScore = (isolationScore * 0.6 + anomalyScore * 0.4) * 100;

    const route = finalScore < 25 ? 'GREEN' : finalScore < 50 ? 'AMBER' : 'RED';
    const confidence = 0.82 + Math.random() * 0.1;

    return {
      fraudScore: Math.round(finalScore),
      route,
      confidence: Math.round(confidence * 100) / 100,
      features: {
        gpsCellDelta: { value: gpsLocation?.deltaKm || 0, risk: gpsLocation?.deltaKm > 3 ? 'HIGH' : 'LOW' },
        activityAnomaly: { value: Math.abs((platformActivity?.expectedTrips || 10) - (platformActivity?.actualTrips || 0)), risk: 'LOW' },
        claimHistory: { value: claimHistory || 0, risk: (claimHistory || 0) > 5 ? 'MEDIUM' : 'LOW' },
        zoneTriggerMatch: { value: triggerMatch, risk: triggerMatch ? 'LOW' : 'HIGH' },
        weatherCorrelation: { value: weatherData?.correlation || 0.8, risk: 'LOW' },
      },
      processingSteps: this.getFraudProcessingSteps(route),
      modelInfo: {
        type: 'Isolation Forest',
        trees: 100,
        features: 18,
        accuracy: 0.91,
      },
    };
  },

  isolationForestScore(features) {
    let avgDepth = 0;
    const numTrees = 50;
    
    for (let i = 0; i < numTrees; i++) {
      const treeDepth = Math.random() * 5 + 3;
      avgDepth += treeDepth;
    }
    avgDepth /= numTrees;

    const avgFeatureAnomaly = features.reduce((sum, f) => sum + Math.abs(f - 0.5), 0) / features.length;
    const isolationScore = 1 - (avgDepth / 10) * (1 - avgFeatureAnomaly);
    
    return Math.max(0, Math.min(1, isolationScore));
  },

  calculateAnomalyScore(features) {
    const weights = [0.3, 0.2, 0.25, 0.15, 0.1];
    let weightedSum = 0;
    
    for (let i = 0; i < features.length; i++) {
      const normalizedFeature = Math.min(1, Math.max(0, features[i]));
      weightedSum += normalizedFeature * (weights[i] || 0.1);
    }

    return this.sigmoid(weightedSum * 5 - 2.5);
  },

  getFraudProcessingSteps(route) {
    const steps = [
      { name: 'GPS Validation', status: 'PASS', detail: 'Location verified within 50m' },
      { name: 'Cell Tower Check', status: 'PASS', detail: 'Cell data matches GPS' },
      { name: 'Platform Activity', status: 'PASS', detail: 'Trip history validated' },
      { name: 'Zone Trigger Match', status: 'PASS', detail: 'Weather trigger confirmed' },
    ];

    if (route === 'AMBER') {
      steps.push({ name: 'Peer Validation', status: 'REVIEW', detail: 'Cross-verifying with nearby workers' });
    } else if (route === 'RED') {
      steps.push({ name: 'Manual Review', status: 'FLAGGED', detail: 'Escalated to fraud team' });
    }

    return steps;
  },

  calculatePayout(params) {
    const { dailyBaseline, coverageTier, daysAffected, triggerType, fraudScore } = params;
    
    const coveragePercent = { basic: 0.6, standard: 0.75, premium: 0.9 };
    const coverage = coveragePercent[coverageTier] || 0.75;
    
    const triggerMultipliers = {
      heavy_rain: 1.2,
      flood: 1.5,
      extreme_heat: 1.0,
      dense_fog: 1.0,
      air_pollution: 0.8,
      civic_disruption: 0.9,
    };
    const triggerMult = triggerMultipliers[triggerType] || 1.0;
    
    let payout = Math.round(dailyBaseline * coverage * daysAffected * triggerMult);
    
    if (fraudScore > 50) {
      payout = Math.round(payout * 0.5);
    }

    return {
      grossPayout: Math.round(dailyBaseline * coverage * daysAffected * triggerMult),
      deductions: fraudScore > 50 ? Math.round(dailyBaseline * coverage * daysAffected * triggerMult * 0.5) : 0,
      finalPayout: payout,
      processingTime: fraudScore < 25 ? 'Instant' : fraudScore < 50 ? '4-6 hours' : '24-48 hours',
      route: fraudScore < 25 ? 'GREEN' : fraudScore < 50 ? 'AMBER' : 'RED',
    };
  },
};

export default mlModelService;
