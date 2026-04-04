import os
import numpy as np
from datetime import datetime
from typing import Optional, Dict, List
from app.services.weather_service import get_weather_data
from app.services.aqi_service import get_aqi_data


MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
_zone_risk_model = None
_scaler = None


def _load_zone_risk_model():
    global _zone_risk_model, _scaler
    if _zone_risk_model is None:
        try:
            import joblib
            model_path = os.path.join(MODEL_DIR, "zone_risk_lstm.joblib")
            if os.path.exists(model_path):
                data = joblib.load(model_path)
                _zone_risk_model = data['weights']
                _scaler = data['scaler']
                print(f"Loaded zone risk model from {model_path}")
            else:
                print(f"Model file not found: {model_path}")
        except Exception as e:
            print(f"Error loading zone risk model: {e}")


def _predict_zone_risk_ml(weather_data: Dict, aqi_data: Dict) -> float:
    if _zone_risk_model is None:
        return None
    
    try:
        precip = weather_data.get("precipitation", 0) if weather_data else 0
        temp = weather_data.get("temperature", 25) if weather_data else 25
        visibility = weather_data.get("visibility", 10000) if weather_data else 10000
        humidity = weather_data.get("humidity", 50) if weather_data else 50
        wind = weather_data.get("wind_speed", 10) if weather_data else 10
        aqi = aqi_data.get("aqi", 50) if aqi_data else 50
        
        features = np.array([[precip, temp, visibility, humidity, wind, aqi]])
        features_scaled = _scaler.transform(features)
        
        W1 = _zone_risk_model['W1']
        b1 = _zone_risk_model['b1']
        W2 = _zone_risk_model['W2']
        b2 = _zone_risk_model['b2']
        W3 = _zone_risk_model['W3']
        b3 = _zone_risk_model['b3']
        
        def relu(x):
            return np.maximum(0, x)
        
        a1 = relu(np.dot(features_scaled, W1) + b1)
        a2 = relu(np.dot(a1, W2) + b2)
        z3 = np.dot(a2, W3) + b3
        
        return float(np.clip(z3.flatten()[0], 0, 1))
    except Exception as e:
        print(f"Zone risk prediction failed: {e}")
        return None


def calculate_risk_score(weather_data: Dict, aqi_data: Dict) -> int:
    score = 0
    
    if weather_data:
        condition = weather_data.get("condition", "").lower()
        if "storm" in condition or "hurricane" in condition:
            score += 4
        elif "rain" in condition or "snow" in condition:
            score += 2
        elif "wind" in condition:
            score += 3
    
    if aqi_data:
        aqi = aqi_data.get("aqi", 0)
        if aqi > 150:
            score += 4
        elif aqi > 100:
            score += 2
        elif aqi > 50:
            score += 1
    
    return min(score, 10)


async def check_triggers(
    zone_id: str,
    trigger_thresholds: Dict
) -> Dict[str, bool]:
    _load_zone_risk_model()
    
    weather_triggered = False
    aqi_triggered = False
    
    weather_data = await get_weather_data(zone_id)
    aqi_data = await get_aqi_data(zone_id)
    
    ml_risk_score = _predict_zone_risk_ml(weather_data, aqi_data)
    
    weather_threshold = trigger_thresholds.get("weather", 4)
    aqi_threshold = trigger_thresholds.get("aqi", 100)
    
    if weather_data and weather_data.get("risk_score", 0) >= weather_threshold:
        weather_triggered = True
    
    if aqi_data and aqi_data.get("aqi", 0) >= aqi_threshold:
        aqi_triggered = True
    
    return {
        "weather_triggered": weather_triggered,
        "aqi_triggered": aqi_triggered,
        "weather_data": weather_data,
        "aqi_data": aqi_data,
        "ml_risk_score": ml_risk_score,
        "checked_at": datetime.utcnow()
    }


def predict_zone_risk(city: str, weather_sequence: List[Dict]) -> Dict:
    _load_zone_risk_model()
    
    if _zone_risk_model is None:
        return {"risk": 0.5, "level": "MEDIUM", "city": city}
    
    try:
        features = np.array([[
            w.get("precipitation", 0) for w in weather_sequence[-14:]
        ]])
        
        risk = _predict_zone_risk_ml(
            {"precipitation": features[0][0], "temperature": 30, "visibility": 5000, "humidity": 60, "wind_speed": 10},
            {"aqi": 80}
        )
        
        if risk is None:
            risk = 0.5
        
        level = "HIGH" if risk > 0.7 else "MEDIUM" if risk > 0.4 else "LOW"
        
        return {"risk": round(risk, 3), "level": level, "city": city}
    except Exception as e:
        print(f"Zone risk prediction error: {e}")
        return {"risk": 0.5, "level": "MEDIUM", "city": city}