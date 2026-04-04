import os
import sys
import numpy as np
from typing import Dict, Optional

OCCUPATION_RISK = {
    "delivery": 1.3,
    "rideshare": 1.2,
    "freelance": 1.0,
    "construction": 1.5,
    "retail": 1.1,
    "default": 1.0
}

ZONE_RISK = {
    "high_risk": 1.5,
    "medium_risk": 1.2,
    "low_risk": 1.0
}

PLAN_RATES = {
    "basic": 0.05,
    "standard": 0.07,
    "premium": 0.10
}

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
_premium_model = None
_scaler = None


def _load_premium_model():
    global _premium_model, _scaler
    if _premium_model is None:
        try:
            import joblib
            model_path = os.path.join(MODEL_DIR, "premium_model.joblib")
            if os.path.exists(model_path):
                data = joblib.load(model_path)
                _premium_model = data['model']
                _scaler = data['scaler']
                print(f"Loaded premium model from {model_path}")
            else:
                print(f"Model file not found: {model_path}")
        except Exception as e:
            print(f"Error loading premium model: {e}")


def _fallback_premium(
    plan_type: str,
    coverage_amount: float,
    occupation: str,
    zone_id: str
) -> float:
    base_rate = PLAN_RATES.get(plan_type, 0.07)
    occupation_factor = OCCUPATION_RISK.get(occupation.lower(), OCCUPATION_RISK["default"])
    
    zone_category = "low_risk"
    if "downtown" in zone_id.lower() or "urban" in zone_id.lower():
        zone_category = "high_risk"
    elif "suburb" in zone_id.lower():
        zone_category = "medium_risk"
    
    zone_factor = ZONE_RISK.get(zone_category, 1.0)
    monthly_premium = coverage_amount * base_rate * occupation_factor * zone_factor
    return round(monthly_premium, 2)


def calculate_premium(
    plan_type: str,
    coverage_amount: float,
    occupation: str,
    zone_id: str
) -> float:
    _load_premium_model()
    
    if _premium_model is None:
        return _fallback_premium(plan_type, coverage_amount, occupation, zone_id)
    
    zone_category = "low_risk"
    if "downtown" in zone_id.lower() or "urban" in zone_id.lower():
        zone_category = "high_risk"
    elif "suburb" in zone_id.lower():
        zone_category = "medium_risk"
    
    zone_risk_score = {"high_risk": 0.8, "medium_risk": 0.5, "low_risk": 0.2}.get(zone_category, 0.2)
    occupation_risk_score = OCCUPATION_RISK.get(occupation.lower(), 1.0) - 1.0
    
    features = np.array([[
        zone_risk_score,
        occupation_risk_score,
        {"basic": 0.3, "standard": 0.6, "premium": 0.9}.get(plan_type, 0.6),
        coverage_amount / 50000,
        0.5
    ]])
    
    try:
        features_scaled = _scaler.transform(features)
        prediction = _premium_model.predict(features_scaled)[0]
        return round(max(prediction, 25), 2)
    except Exception as e:
        print(f"ML prediction failed: {e}")
        return _fallback_premium(plan_type, coverage_amount, occupation, zone_id)


def calculate_coverage_recommendation(monthly_earnings: float, hours_worked: int) -> float:
    if hours_worked == 0:
        return 0
    
    avg_hourly = monthly_earnings / hours_worked
    recommended_coverage = monthly_earnings * 3
    
    return round(recommended_coverage, 2)


def calculate_deductible(premium: float, coverage_amount: float) -> float:
    deductible = (premium / coverage_amount) * 100
    return round(min(deductible, 500), 2)