import numpy as np
import joblib
from pathlib import Path
from typing import Dict, Optional

MODEL_DIR = Path(__file__).parent / "models"

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
        # If we have a model, use it for a more data-driven prediction
        if self.model is not None:
            try:
                features = np.array([
                    weather_data.get("risk_score", 0),
                    aqi_data.get("aqi", 0),
                    {
                        "delivery": 0.7, "rideshare": 0.6, "freelance": 0.4,
                        "construction": 0.9, "retail": 0.5
                    }.get(occupation.lower(), 0.5)
                ]).reshape(1, -1)
                return float(self.model.predict(features)[0])
            except Exception:
                # Fallback to heuristic if model fails
                pass

        # Heuristic fallback logic
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

# Export an instance
risk_model = RiskModel()