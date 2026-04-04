import numpy as np
import joblib
from pathlib import Path
from typing import Dict, Optional

MODEL_DIR = Path(__file__).parent / "models"


class PremiumModel:
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        model_path = MODEL_DIR / "premium_model.joblib"
        if model_path.exists():
            self.model = joblib.load(model_path)
    
    def predict(self, features: Dict) -> float:
        if self.model is None:
            return self._fallback_predict(features)
        
        feature_array = np.array([
            features.get("coverage_amount", 0),
            features.get("occupation_risk", 1.0),
            features.get("zone_risk", 1.0),
            features.get("hours_worked", 0),
            features.get("monthly_earnings", 0)
        ]).reshape(1, -1)
        
        return float(self.model.predict(feature_array)[0])
    
    def _fallback_predict(self, features: Dict) -> float:
        base_rate = 0.07
        risk_factor = features.get("occupation_risk", 1.0) * features.get("zone_risk", 1.0)
        coverage = features.get("coverage_amount", 0)
        return round(coverage * base_rate * risk_factor, 2)


class FraudModel:
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        model_path = MODEL_DIR / "fraud_model.joblib"
        if model_path.exists():
            self.model = joblib.load(model_path)
    
    def predict_fraud_risk(self, features: Dict) -> float:
        if self.model is None:
            return self._fallback_score(features)
        
        feature_array = np.array([
            features.get("claim_amount", 0),
            features.get("claim_age_days", 0),
            features.get("has_evidence", 0),
            features.get("trigger_confirmed", 0),
            features.get("user_claim_count", 0)
        ]).reshape(1, -1)
        
        return float(self.model.predict_proba(feature_array)[0][1])
    
    def _fallback_score(self, features: Dict) -> float:
        score = 0.0
        if features.get("claim_amount", 0) > 10000:
            score += 0.3
        if features.get("claim_age_days", 0) > 30:
            score += 0.2
        if not features.get("has_evidence", False):
            score += 0.25
        if not features.get("trigger_confirmed", False):
            score += 0.4
        return min(score, 1.0)


class RiskModel:
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        model_path = MODEL_DIR / "risk_model.joblib"
        if model_path.exists():
            self.model = joblib.load(model_path)
    
    def calculate_risk_score(
        self,
        weather_data: Dict,
        aqi_data: Dict,
        occupation: str
    ) -> float:
        weather_risk = weather_data.get("risk_score", 0) / 10
        aqi_risk = min(aqi_data.get("aqi", 0) / 300, 1.0)
        
        occupation_risk = {
            "delivery": 0.7,
            "rideshare": 0.6,
            "freelance": 0.4,
            "construction": 0.9,
            "retail": 0.5
        }.get(occupation.lower(), 0.5)
        
        combined_risk = (weather_risk * 0.3) + (aqi_risk * 0.3) + (occupation_risk * 0.4)
        return round(combined_risk, 3)
    
    def predict_zone_risk(self, zone_features: Dict) -> int:
        score = self.calculate_risk_score(
            zone_features.get("weather", {}),
            zone_features.get("aqi", {}),
            zone_features.get("occupation", "freelance")
        )
        
        if score >= 0.7:
            return 4
        elif score >= 0.5:
            return 3
        elif score >= 0.3:
            return 2
        else:
            return 1


premium_model = PremiumModel()
fraud_model = FraudModel()
risk_model = RiskModel()