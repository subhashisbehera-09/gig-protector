from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import User, UserRole
from app.api.auth import get_current_active_user
from app.services.analytics_service import DashboardAnalytics, InsurerAnalytics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


MOCK_WORKER_DATA = {
    "earnings_protection": {
        "monthly_earnings": 45000,
        "total_earnings": 540000,
        "total_protected": 12450,
        "protection_rate": 27.7,
        "protection_ratio": "1:43.4",
        "active_claims_count": 6,
        "avg_claim_time_hours": 24
    },
    "coverage_status": {
        "active": True,
        "plan_type": "Standard Shield",
        "coverage_amount": 33750,
        "monthly_premium": 91,
        "days_remaining": 5,
        "start_date": "2024-03-25T00:00:00",
        "end_date": "2024-04-25T00:00:00",
        "next_debit_date": "2024-04-29"
    },
    "claim_history": [],
    "quick_stats": {
        "total_protected": 12450,
        "protection_rate": 27.7,
        "coverage_active": True,
        "recent_claims": 2
    }
}

MOCK_ADMIN_DATA = {
    "loss_ratio": {
        "total_premiums_collected": 2450000,
        "total_payouts": 892500,
        "loss_ratio_percentage": 36.4,
        "loss_ratio_status": "healthy",
        "total_claims_count": 847,
        "active_policies": 12450
    },
    "predictions": {
        "total_predicted_claims": 156,
        "prediction_period": "next 7 days",
        "model_confidence": 0.78,
        "high_risk_zones": 12
    },
    "weather_forecast": {
        "summary": {
            "high_risk_cities": 2,
            "avg_disruption_probability": 55,
            "peak_day": "Wednesday",
            "recommended_reserve": "₹5,50,000"
        }
    },
    "fraud_analysis": {
        "total_unresolved_alerts": 23,
        "avg_risk_score": 0.42,
        "gps_spoofing_count": 8,
        "weather_mismatch_count": 10,
        "high_priority_alerts": 5
    },
    "executive_summary": {
        "total_exposure": 892500,
        "risk_rating": "MEDIUM",
        "action_items": ["Monitor claims velocity", "Review high-risk zones"]
    }
}


@router.get("/worker")
async def get_worker_dashboard(
    db: AsyncSession = Depends(get_db)
) -> Dict:
    return MOCK_WORKER_DATA


@router.get("/admin")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db)
) -> Dict:
    return MOCK_ADMIN_DATA


@router.get("/earnings-protection")
async def get_earnings_protection(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    from app.services.analytics_service import WorkerAnalytics
    return await WorkerAnalytics.get_earnings_protection_summary(current_user.id, db)


@router.get("/coverage-status")
async def get_coverage_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    from app.services.analytics_service import WorkerAnalytics
    return await WorkerAnalytics.get_weekly_coverage_status(current_user.id, db)


@router.get("/admin/loss-ratio")
async def get_loss_ratio(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    from app.services.analytics_service import InsurerAnalytics
    return await InsurerAnalytics.calculate_loss_ratio(db)


@router.get("/admin/predictions")
async def get_predictions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    from app.services.analytics_service import InsurerAnalytics
    return await InsurerAnalytics.predict_next_week_claims(db)


@router.get("/admin/weather-forecast")
async def get_weather_forecast(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    from app.services.analytics_service import InsurerAnalytics
    return await InsurerAnalytics.get_weather_disruption_forecast(db)


@router.get("/admin/fraud-summary")
async def get_fraud_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    from app.services.analytics_service import InsurerAnalytics
    return await InsurerAnalytics.get_fraud_analysis_summary(db)
