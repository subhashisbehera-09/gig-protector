import os
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Claim, FraudAlert, Trigger


MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
_fraud_model = None
_scaler = None


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


async def analyze_claim_fraud(claim_id: int, db: AsyncSession) -> Dict:
    _load_fraud_model()
    
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    
    if not claim:
        return {"risk_score": 0, "alerts": []}
    
    trigger_result = await db.execute(select(Trigger).where(Trigger.id == claim.trigger_id))
    trigger = trigger_result.scalar_one_or_none()
    
    has_evidence = claim.evidence is not None and len(claim.evidence) > 0
    trigger_confirmed = trigger.weather_triggered if trigger else False
    claim_age = (datetime.utcnow() - claim.created_at).days
    
    ml_risk_score = None
    if _fraud_model is not None:
        try:
            features = np.array([[
                claim.claim_amount / 20000,
                claim_age / 60,
                1 if has_evidence else 0,
                1 if trigger_confirmed else 0,
                min(claim.user.claims.count() if claim.user else 0, 10) / 10
            ]])
            features_scaled = _scaler.transform(features)
            ml_risk_score = float(_fraud_model.predict_proba(features_scaled)[0][1])
        except Exception as e:
            print(f"ML fraud prediction failed: {e}")
    
    alerts = []
    risk_score = 0.0
    
    if claim_age > 30:
        alerts.append({"type": "late_claim", "detail": "Claim submitted > 30 days after event"})
        risk_score += 0.2
    
    if claim.claim_amount > 10000:
        alerts.append({"type": "high_amount", "detail": "Claim amount exceeds $10,000"})
        risk_score += 0.3
    
    if trigger and not trigger.weather_triggered and not trigger.aqi_triggered:
        alerts.append({"type": "no_trigger", "detail": "No environmental trigger detected"})
        risk_score += 0.4
    
    if not has_evidence:
        alerts.append({"type": "no_evidence", "detail": "No evidence provided"})
        risk_score += 0.25
    
    if ml_risk_score is not None:
        risk_score = (risk_score + ml_risk_score) / 2
    
    return {
        "claim_id": claim_id,
        "risk_score": min(risk_score, 1.0),
        "ml_risk_score": ml_risk_score,
        "alerts": alerts,
        "recommendation": "review" if risk_score > 0.5 else "approve"
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