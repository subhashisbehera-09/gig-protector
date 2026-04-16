import os
import math
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models import Claim, FraudAlert, Trigger, WeatherData, AQIData, User, WorkerProfile


MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
_fraud_model = None
_scaler = None

EARTH_RADIUS_KM = 6371.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad, lat2_rad = math.radians(lat1), math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def _load_fraud_model():
    global _fraud_model, _scaler
    if _fraud_model is None:
        try:
            import joblib
            model_path = os.path.join(MODEL_DIR, "fraud_model.joblib")
            if os.path.exists(model_path):
                data = joblib.load(model_path)
                _fraud_model = data['model']
                _scaler = data['scaler']
                print(f"Loaded fraud model from {model_path}")
            else:
                print(f"Model file not found: {model_path}")
        except Exception as e:
            print(f"Error loading fraud model: {e}")


def _fallback_fraud_score(
    claim_amount: float,
    claim_age_days: int,
    has_evidence: bool,
    trigger_confirmed: bool,
    user_claim_count: int
) -> float:
    score = 0.0
    if claim_amount > 10000:
        score += 0.3
    if claim_age_days > 30:
        score += 0.2
    if not has_evidence:
        score += 0.25
    if not trigger_confirmed:
        score += 0.4
    if user_claim_count > 3:
        score += 0.2
    return min(score, 1.0)


async def detect_gps_spoofing(
    evidence: Optional[Dict],
    worker_lat: Optional[float],
    worker_lon: Optional[float],
    claim_time: datetime,
    db: AsyncSession
) -> Dict:
    spoofing_result = {
        "detected": False,
        "risk_score": 0.0,
        "alerts": [],
        "confidence": "low"
    }
    
    if not evidence:
        return spoofing_result
    
    location_data = evidence.get("location", {})
    reported_lat = location_data.get("latitude")
    reported_lon = location_data.get("longitude")
    accuracy = location_data.get("accuracy", 50)
    source = location_data.get("source", "unknown")
    
    if reported_lat is None or reported_lon is None:
        return spoofing_result
    
    if worker_lat is not None and worker_lon is not None:
        distance_km = haversine_distance(worker_lat, worker_lon, reported_lat, reported_lon)
        
        if distance_km > 100:
            spoofing_result["alerts"].append({
                "type": "gps_impossible_travel",
                "detail": f"Reported location is {distance_km:.1f}km from registered work zone",
                "severity": "high"
            })
            spoofing_result["risk_score"] += 0.5
            spoofing_result["confidence"] = "high"
        elif distance_km > 50:
            spoofing_result["alerts"].append({
                "type": "gps_distance_anomaly",
                "detail": f"Reported location is {distance_km:.1f}km from registered work zone",
                "severity": "medium"
            })
            spoofing_result["risk_score"] += 0.25
            spoofing_result["confidence"] = "medium"
    
    if accuracy > 500:
        spoofing_result["alerts"].append({
            "type": "gps_low_accuracy",
            "detail": f"GPS accuracy is {accuracy}m - unusually low precision",
            "severity": "low"
        })
        spoofing_result["risk_score"] += 0.1
    
    if source in ["manual", "simulated", "mock"]:
        spoofing_result["alerts"].append({
            "type": "gps_source_suspicious",
            "detail": f"Location reported from non-device source: {source}",
            "severity": "medium"
        })
        spoofing_result["risk_score"] += 0.2
    
    timestamp_data = location_data.get("timestamp")
    if timestamp_data:
        try:
            if isinstance(timestamp_data, str):
                loc_time = datetime.fromisoformat(timestamp_data.replace("Z", "+00:00"))
            else:
                loc_time = timestamp_data
            
            time_diff = abs((claim_time - loc_time).total_seconds())
            if time_diff > 7200:
                spoofing_result["alerts"].append({
                    "type": "gps_timestamp_mismatch",
                    "detail": f"Location timestamp differs from claim time by {time_diff/3600:.1f} hours",
                    "severity": "medium"
                })
                spoofing_result["risk_score"] += 0.15
        except Exception:
            pass
    
    spoofing_result["detected"] = spoofing_result["risk_score"] >= 0.3
    spoofing_result["risk_score"] = min(spoofing_result["risk_score"], 1.0)
    
    return spoofing_result


async def verify_weather_claim(
    trigger: Optional[Trigger],
    zone_id: str,
    claim_time: datetime,
    db: AsyncSession
) -> Dict:
    verification = {
        "verified": True,
        "risk_score": 0.0,
        "alerts": [],
        "historical_weather": None,
        "claim_correlation": 1.0
    }
    
    if not trigger:
        verification["alerts"].append({
            "type": "no_trigger_record",
            "detail": "No trigger record found for this claim",
            "severity": "high"
        })
        verification["risk_score"] += 0.4
        verification["verified"] = False
        return verification
    
    weather_result = await db.execute(
        select(WeatherData)
        .where(
            WeatherData.zone_id == zone_id,
            WeatherData.recorded_at >= claim_time - timedelta(hours=24),
            WeatherData.recorded_at <= claim_time + timedelta(hours=24)
        )
        .order_by(WeatherData.recorded_at.desc())
        .limit(10)
    )
    weather_records = weather_result.scalars().all()
    
    if weather_records:
        severe_weather = any(r.risk_score >= 3 for r in weather_records)
        if not severe_weather:
            verification["alerts"].append({
                "type": "weather_not_severe",
                "detail": "No severe weather recorded in zone during claim period",
                "severity": "medium"
            })
            verification["risk_score"] += 0.25
            verification["claim_correlation"] = 0.5
        
        avg_temp = sum(r.temperature for r in weather_records) / len(weather_records)
        if avg_temp > 45:
            verification["historical_weather"] = "extreme_heat"
        elif avg_temp > 35:
            verification["historical_weather"] = "high_temp"
        else:
            verification["historical_weather"] = "normal"
    else:
        verification["alerts"].append({
            "type": "no_historical_data",
            "detail": "No historical weather data available for verification",
            "severity": "low"
        })
        verification["risk_score"] += 0.1
        verification["claim_correlation"] = 0.7
    
    aqi_result = await db.execute(
        select(AQIData)
        .where(
            AQIData.zone_id == zone_id,
            AQIData.recorded_at >= claim_time - timedelta(hours=48),
            AQIData.recorded_at <= claim_time + timedelta(hours=48)
        )
        .order_by(AQIData.recorded_at.desc())
        .limit(5)
    )
    aqi_records = aqi_result.scalars().all()
    
    if aqi_records:
        max_aqi = max(r.aqi for r in aqi_records)
        if max_aqi < 150 and trigger.aqi_triggered:
            verification["alerts"].append({
                "type": "aqi_inconsistency",
                "detail": f"Trigger claims AQI alert but max recorded AQI was {max_aqi}",
                "severity": "high"
            })
            verification["risk_score"] += 0.4
            verification["verified"] = False
    
    if trigger.trigger_type == "weather" and not trigger.weather_triggered:
        verification["alerts"].append({
            "type": "trigger_weather_not_confirmed",
            "detail": "Weather trigger claimed but not confirmed by system",
            "severity": "medium"
        })
        verification["risk_score"] += 0.2
    
    if claim_time < datetime.utcnow() - timedelta(days=30):
        verification["alerts"].append({
            "type": "stale_claim",
            "detail": "Claim filed more than 30 days after event",
            "severity": "low"
        })
        verification["risk_score"] += 0.1
    
    verification["risk_score"] = min(verification["risk_score"], 1.0)
    return verification


async def analyze_pattern_fraud(
    user_id: int,
    claim_amount: float,
    trigger_id: int,
    db: AsyncSession
) -> Dict:
    pattern_result = {
        "anomalous_pattern": False,
        "risk_score": 0.0,
        "alerts": [],
        "claim_velocity": 0
    }
    
    result = await db.execute(
        select(Claim)
        .where(
            Claim.user_id == user_id,
            Claim.created_at >= datetime.utcnow() - timedelta(days=30)
        )
    )
    recent_claims = result.scalars().all()
    pattern_result["claim_velocity"] = len(recent_claims)
    
    if len(recent_claims) > 5:
        pattern_result["alerts"].append({
            "type": "high_claim_frequency",
            "detail": f"{len(recent_claims)} claims in last 30 days - unusually high",
            "severity": "high"
        })
        pattern_result["risk_score"] += 0.35
        pattern_result["anomalous_pattern"] = True
    
    total_recent = sum(c.claim_amount for c in recent_claims)
    if total_recent > 50000:
        pattern_result["alerts"].append({
            "type": "high_total_claims",
            "detail": f"₹{total_recent:.0f} claimed in last 30 days",
            "severity": "medium"
        })
        pattern_result["risk_score"] += 0.2
    
    duplicate_result = await db.execute(
        select(Claim).where(
            Claim.user_id == user_id,
            Claim.trigger_id == trigger_id,
            Claim.id != claim_id if 'claim_id' in dir() else True
        )
    )
    duplicates = duplicate_result.scalars().all()
    if len(duplicates) > 0:
        pattern_result["alerts"].append({
            "type": "duplicate_claim",
            "detail": f"Previous claim found for same trigger event",
            "severity": "high"
        })
        pattern_result["risk_score"] += 0.5
        pattern_result["anomalous_pattern"] = True
    
    amounts = [c.claim_amount for c in recent_claims]
    if len(amounts) >= 3:
        avg_amount = sum(amounts) / len(amounts)
        if claim_amount > avg_amount * 2:
            pattern_result["alerts"].append({
                "type": "amount_outlier",
                "detail": f"Claim amount {claim_amount} is {claim_amount/avg_amount:.1f}x the user's average",
                "severity": "medium"
            })
            pattern_result["risk_score"] += 0.25
    
    pattern_result["risk_score"] = min(pattern_result["risk_score"], 1.0)
    return pattern_result


async def analyze_claim_fraud(claim_id: int, db: AsyncSession) -> Dict:
    _load_fraud_model()
    
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    
    if not claim:
        return {"risk_score": 0, "alerts": [], "gps_analysis": {}, "weather_verification": {}, "pattern_analysis": {}}
    
    trigger_result = await db.execute(select(Trigger).where(Trigger.id == claim.trigger_id))
    trigger = trigger_result.scalar_one_or_none()
    
    user_result = await db.execute(select(User).where(User.id == claim.user_id))
    user = user_result.scalar_one_or_none()
    
    worker_profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == claim.user_id)
    )
    worker_profile = worker_profile_result.scalar_one_or_none()
    
    has_evidence = claim.evidence is not None and len(claim.evidence) > 0
    trigger_confirmed = trigger.weather_triggered if trigger else False
    claim_age = (datetime.utcnow() - claim.created_at).days
    
    gps_analysis = await detect_gps_spoofing(
        evidence=claim.evidence,
        worker_lat=worker_profile.latitude if worker_profile else None,
        worker_lon=worker_profile.longitude if worker_profile else None,
        claim_time=claim.created_at,
        db=db
    )
    
    zone_id = trigger.zone.zone_id if trigger and trigger.zone else "unknown"
    weather_verification = await verify_weather_claim(
        trigger=trigger,
        zone_id=zone_id,
        claim_time=claim.created_at,
        db=db
    )
    
    pattern_analysis = await analyze_pattern_fraud(
        user_id=claim.user_id,
        claim_amount=claim.claim_amount,
        trigger_id=claim.trigger_id,
        db=db
    )
    
    ml_risk_score = None
    if _fraud_model is not None:
        try:
            user_claims_count = len([c for c in user.claims]) if user else 0
            features = np.array([[
                claim.claim_amount / 20000,
                claim_age / 60,
                1 if has_evidence else 0,
                1 if trigger_confirmed else 0,
                min(user_claims_count, 10) / 10
            ]])
            features_scaled = _scaler.transform(features)
            ml_risk_score = float(_fraud_model.predict_proba(features_scaled)[0][1])
        except Exception as e:
            print(f"ML fraud prediction failed: {e}")
    
    alerts = []
    risk_score = 0.0
    
    risk_score += gps_analysis["risk_score"] * 0.3
    risk_score += weather_verification["risk_score"] * 0.35
    risk_score += pattern_analysis["risk_score"] * 0.25
    
    if claim_age > 30:
        alerts.append({"type": "late_claim", "detail": "Claim submitted > 30 days after event"})
        risk_score += 0.1
    
    if claim.claim_amount > 10000:
        alerts.append({"type": "high_amount", "detail": "Claim amount exceeds ₹10,000"})
        risk_score += 0.15
    
    if trigger and not trigger.weather_triggered and not trigger.aqi_triggered:
        alerts.append({"type": "no_trigger", "detail": "No environmental trigger detected"})
        risk_score += 0.1
    
    if not has_evidence:
        alerts.append({"type": "no_evidence", "detail": "No evidence provided"})
        risk_score += 0.1
    
    if ml_risk_score is not None:
        risk_score = (risk_score * 0.6 + ml_risk_score * 0.4)
    
    fraud_detected = (
        gps_analysis["detected"] or 
        not weather_verification["verified"] or 
        pattern_analysis["anomalous_pattern"]
    )
    
    risk_score = min(risk_score, 1.0)
    
    if risk_score >= 0.7 or fraud_detected:
        recommendation = "reject"
    elif risk_score >= 0.4:
        recommendation = "review"
    else:
        recommendation = "approve"
    
    return {
        "claim_id": claim_id,
        "risk_score": risk_score,
        "ml_risk_score": ml_risk_score,
        "alerts": alerts,
        "recommendation": recommendation,
        "gps_analysis": gps_analysis,
        "weather_verification": weather_verification,
        "pattern_analysis": pattern_analysis,
        "fraud_indicators": {
            "gps_spoofing_detected": gps_analysis["detected"],
            "weather_claim_valid": weather_verification["verified"],
            "pattern_anomaly": pattern_analysis["anomalous_pattern"]
        }
    }


async def create_fraud_alert(
    claim_id: int,
    alert_type: str,
    risk_score: float,
    details: Dict,
    db: AsyncSession
) -> FraudAlert:
    alert = FraudAlert(
        claim_id=claim_id,
        alert_type=alert_type,
        risk_score=risk_score,
        details=details
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


async def batch_analyze_claims(claim_ids: List[int], db: AsyncSession) -> List[Dict]:
    results = []
    for claim_id in claim_ids:
        analysis = await analyze_claim_fraud(claim_id, db)
        results.append(analysis)
    return results


async def check_duplicate_claims(user_id: int, trigger_id: int, db: AsyncSession) -> bool:
    result = await db.execute(
        select(Claim).where(
            Claim.user_id == user_id,
            Claim.trigger_id == trigger_id
        )
    )
    existing = result.scalars().all()
    return len(existing) > 1