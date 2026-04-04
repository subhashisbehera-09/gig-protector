# GigProtector ML Models

This directory contains the machine learning models used in the GigProtector insurance platform.

## Models

### 1. Premium Model (`premium_model.py`)
**Algorithm:** XGBoost (Gradient Boosting)

**Purpose:** Dynamic premium calculation based on worker profile and location risk

**Features:**
- Zone flood history (28%)
- Monsoon season factor (18%)
- Worker tenure (14%)
- Air quality index (12%)
- Heat exposure (10%)
- Cyclone risk (8%)
- Earnings level (5%)

**Training:** 50,000+ synthetic samples
**Output:** Weekly premium in ₹

**Run:**
```bash
python -m models.premium_model
```

---

### 2. Fraud Detection Model (`fraud_model.py`)
**Algorithm:** Isolation Forest (Anomaly Detection)

**Purpose:** Detect fraudulent insurance claims

**Features (18 total):**
- GPS-Cell tower delta
- Activity anomaly score
- Claim frequency
- Zone-trigger match
- Weather correlation
- Device fingerprint score
- Historical claims count
- And more...

**Output Routes:**
- 🟢 GREEN: Auto-approve (< 25% fraud score)
- 🟡 AMBER: Manual review (25-50%)
- 🔴 RED: Reject/Investigate (> 50%)

**Run:**
```bash
python -m models.fraud_model
```

---

### 3. Zone Risk Model (`zone_risk_model.py`)
**Algorithm:** LSTM Neural Network

**Purpose:** Predict 14-day disruption probability for delivery zones

**Features:**
- Precipitation (24h)
- Temperature (max)
- Visibility
- Humidity
- Wind speed
- Air Quality Index

**Training:** 3,650 days of historical weather data
**Output:** Daily disruption probability (0-100%)

**Run:**
```bash
python -m models.zone_risk_model
```

---

### 4. Trigger Backtester (`trigger_model.py`)
**Algorithm:** Statistical Analysis with Precision/Recall metrics

**Purpose:** Backtest parametric triggers against historical disruptions

**Triggers Tested:**
1. Heavy Rainfall > 64.5mm/24h
2. Extreme Heat > 44°C for 2+ days
3. Dense Fog < 200m visibility
4. Severe AQI > 300
5. Civic Disruption < 15% zone activity

**Metrics:**
- Precision (% of triggered claims that were valid)
- Recall (% of actual disruptions caught)
- F1 Score (harmonic mean)
- False Positive Rate

**Run:**
```bash
python -m models.trigger_model
```

---

## Running All Models

```bash
cd backend
pip install -r requirements.txt
python run_models.py
```

## API Integration

Models can be integrated into the FastAPI backend:

```python
from models import PremiumModel, FraudDetectionModel

# Premium calculation
premium_model = PremiumModel()
premium_model.load()
premium = premium_model.predict(features)

# Fraud detection
fraud_model = FraudDetectionModel()
fraud_model.load()
result = fraud_model.analyze_claim(claim_data)
```

## Model Files

After training, models are saved to `backend/models/`:
- `premium_model.joblib`
- `fraud_model.joblib`
- `zone_risk_lstm.joblib`
- `trigger_backtest.joblib`

## Requirements

See `requirements.txt` for dependencies:
- numpy, pandas
- scikit-learn
- xgboost
- joblib

## Version

Current ML Models Version: 1.0.0
Last Updated: 2024
