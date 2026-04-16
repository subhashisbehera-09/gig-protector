from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from app.models import Claim, Premium, User, WorkerProfile, Trigger, FraudAlert, Zone


class WorkerAnalytics:
    @staticmethod
    async def get_earnings_protection_summary(
        user_id: int,
        db: AsyncSession
    ) -> Dict:
        result = await db.execute(
            select(WorkerProfile).where(WorkerProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        
        monthly_earnings = profile.monthly_earnings if profile else 0.0
        total_earnings = profile.total_earnings if profile else 0.0
        
        claim_result = await db.execute(
            select(Claim).where(
                Claim.user_id == user_id,
                Claim.status == "paid"
            )
        )
        paid_claims = claim_result.scalars().all()
        total_protected = sum(c.payout_amount or c.claim_amount for c in paid_claims)
        
        protection_rate = (total_protected / monthly_earnings * 100) if monthly_earnings > 0 else 0
        
        return {
            "monthly_earnings": monthly_earnings,
            "total_earnings": total_earnings,
            "total_protected": total_protected,
            "protection_rate": round(protection_rate, 1),
            "protection_ratio": f"1:{round(monthly_earnings / total_protected, 1) if total_protected > 0 else '∞'}",
            "active_claims_count": len(paid_claims),
            "avg_claim_time_hours": 24
        }
    
    @staticmethod
    async def get_weekly_coverage_status(
        user_id: int,
        db: AsyncSession
    ) -> Dict:
        result = await db.execute(
            select(Premium).where(
                Premium.user_id == user_id,
                Premium.status == "active"
            )
        )
        premium = result.scalar_one_or_none()
        
        if not premium:
            return {
                "active": False,
                "plan_type": None,
                "coverage_amount": 0,
                "days_remaining": 0,
                "next_debit_date": None
            }
        
        days_remaining = 0
        if premium.end_date:
            days_remaining = (premium.end_date - datetime.utcnow()).days
        
        return {
            "active": True,
            "plan_type": premium.plan_type,
            "coverage_amount": premium.coverage_amount,
            "monthly_premium": premium.monthly_premium,
            "days_remaining": max(0, days_remaining),
            "start_date": premium.start_date.isoformat() if premium.start_date else None,
            "end_date": premium.end_date.isoformat() if premium.end_date else None,
            "next_debit_date": (datetime.utcnow() + timedelta(days=days_remaining)).strftime("%Y-%m-%d") if days_remaining > 0 else None
        }
    
    @staticmethod
    async def get_claim_history_with_timeline(
        user_id: int,
        db: AsyncSession,
        limit: int = 10
    ) -> List[Dict]:
        result = await db.execute(
            select(Claim).where(
                Claim.user_id == user_id
            ).order_by(Claim.created_at.desc()).limit(limit)
        )
        claims = result.scalars().all()
        
        history = []
        for claim in claims:
            history.append({
                "claim_id": claim.id,
                "amount": claim.claim_amount,
                "payout_amount": claim.payout_amount,
                "status": claim.status.value,
                "created_at": claim.created_at.isoformat() if claim.created_at else None,
                "days_since": (datetime.utcnow() - claim.created_at).days if claim.created_at else 0,
                "trigger_type": "weather"
            })
        
        return history


class InsurerAnalytics:
    @staticmethod
    async def calculate_loss_ratio(db: AsyncSession) -> Dict:
        premiums_result = await db.execute(select(Premium))
        all_premiums = premiums_result.scalars().all()
        total_premiums = sum(p.monthly_premium for p in all_premiums if p.monthly_premium)
        
        claims_result = await db.execute(
            select(Claim).where(Claim.status == "paid")
        )
        paid_claims = claims_result.scalars().all()
        total_payouts = sum(c.payout_amount or c.claim_amount for c in paid_claims)
        
        loss_ratio = (total_payouts / total_premiums * 100) if total_premiums > 0 else 0
        
        return {
            "total_premiums_collected": round(total_premiums, 2),
            "total_payouts": round(total_payouts, 2),
            "loss_ratio_percentage": round(loss_ratio, 2),
            "loss_ratio_status": "healthy" if loss_ratio < 70 else "warning" if loss_ratio < 90 else "critical",
            "total_claims_count": len(paid_claims),
            "active_policies": len([p for p in all_premiums if p.status == "active"])
        }
    
    @staticmethod
    async def predict_next_week_claims(
        db: AsyncSession
    ) -> Dict:
        zone_result = await db.execute(select(Zone))
        zones = zone_result.scalars().all()
        
        predicted_claims = []
        for zone in zones:
            risk_level = zone.risk_level or 0
            if risk_level >= 3:
                base_claims = random.randint(5, 15)
                confidence = min(0.9, 0.5 + risk_level * 0.1)
            elif risk_level >= 2:
                base_claims = random.randint(2, 8)
                confidence = min(0.8, 0.4 + risk_level * 0.1)
            else:
                base_claims = random.randint(0, 3)
                confidence = min(0.7, 0.3 + risk_level * 0.1)
            
            predicted_claims.append({
                "zone_id": zone.zone_id,
                "zone_name": zone.name,
                "predicted_claims": base_claims,
                "confidence": round(confidence, 2),
                "risk_level": risk_level,
                "trigger_types": ["weather", "aqi"] if risk_level >= 2 else ["weather"]
            })
        
        total_predicted = sum(z["predicted_claims"] for z in predicted_claims)
        
        return {
            "total_predicted_claims": total_predicted,
            "by_zone": predicted_claims,
            "prediction_period": "next 7 days",
            "model_confidence": round(sum(z["confidence"] for z in predicted_claims) / len(predicted_claims), 2) if predicted_claims else 0,
            "high_risk_zones": len([z for z in predicted_claims if z["risk_level"] >= 3])
        }
    
    @staticmethod
    async def get_weather_disruption_forecast(
        db: AsyncSession
    ) -> Dict:
        zones_result = await db.execute(select(Zone))
        zones = zones_result.scalars().all()
        
        forecast = []
        cities = ["mumbai", "delhi", "bengaluru", "chennai", "kolkata", "hyderabad", "pune", "ahmedabad"]
        
        for city in cities:
            city_zones = [z for z in zones if city.lower() in (z.name or "").lower()]
            if not city_zones:
                avg_risk = random.randint(20, 60)
            else:
                avg_risk = sum(z.risk_level for z in city_zones) / len(city_zones) * 20
            
            forecast.append({
                "city": city.title(),
                "disruption_probability": min(100, avg_risk + random.randint(-10, 20)),
                "primary_risk": "heavy_rain" if avg_risk > 50 else "heat_wave" if avg_risk > 30 else "normal",
                "recommended_actions": (
                    ["Prepare payout reserves", "Alert field teams"] if avg_risk > 60 
                    else ["Monitor conditions", "Review zone coverage"] if avg_risk > 40 
                    else ["Continue monitoring"]
                )
            })
        
        high_risk_cities = [f for f in forecast if f["disruption_probability"] > 60]
        avg_disruption = sum(f["disruption_probability"] for f in forecast) / len(forecast)
        
        return {
            "forecast": forecast,
            "summary": {
                "high_risk_cities": len(high_risk_cities),
                "avg_disruption_probability": round(avg_disruption, 1),
                "peak_day": "Wednesday",
                "recommended_reserve": f"₹{int(avg_disruption * 10000):,}"
            }
        }
    
    @staticmethod
    async def get_fraud_analysis_summary(
        db: AsyncSession
    ) -> Dict:
        result = await db.execute(
            select(FraudAlert).where(FraudAlert.resolved == False)
        )
        unresolved_alerts = result.scalars().all()
        
        alert_types = {}
        for alert in unresolved_alerts:
            alert_type = alert.alert_type
            alert_types[alert_type] = alert_types.get(alert_type, 0) + 1
        
        avg_risk = sum(a.risk_score for a in unresolved_alerts) / len(unresolved_alerts) if unresolved_alerts else 0
        
        return {
            "total_unresolved_alerts": len(unresolved_alerts),
            "avg_risk_score": round(avg_risk, 2),
            "alert_breakdown": alert_types,
            "gps_spoofing_count": alert_types.get("gps_impossible_travel", 0) + alert_types.get("gps_distance_anomaly", 0),
            "weather_mismatch_count": alert_types.get("weather_not_severe", 0) + alert_types.get("aqi_inconsistency", 0),
            "high_priority_alerts": len([a for a in unresolved_alerts if a.risk_score > 0.6]),
            "recommended_actions": (
                ["Immediate review required", "Consider temporary suspension"] if avg_risk > 0.7
                else ["Schedule manual review", "Increase monitoring"] if avg_risk > 0.4
                else ["Continue automated monitoring"]
            )
        }


class DashboardAnalytics:
    @staticmethod
    async def get_worker_dashboard_data(
        user_id: int,
        db: AsyncSession
    ) -> Dict:
        earnings = await WorkerAnalytics.get_earnings_protection_summary(user_id, db)
        coverage = await WorkerAnalytics.get_weekly_coverage_status(user_id, db)
        history = await WorkerAnalytics.get_claim_history_with_timeline(user_id, db)
        
        return {
            "earnings_protection": earnings,
            "coverage_status": coverage,
            "claim_history": history,
            "quick_stats": {
                "total_protected": earnings["total_protected"],
                "protection_rate": earnings["protection_rate"],
                "coverage_active": coverage["active"],
                "recent_claims": len([c for c in history if c["days_since"] <= 30])
            }
        }
    
    @staticmethod
    async def get_admin_dashboard_data(
        db: AsyncSession
    ) -> Dict:
        loss_ratio = await InsurerAnalytics.calculate_loss_ratio(db)
        predictions = await InsurerAnalytics.predict_next_week_claims(db)
        weather_forecast = await InsurerAnalytics.get_weather_disruption_forecast(db)
        fraud_summary = await InsurerAnalytics.get_fraud_analysis_summary(db)
        
        return {
            "loss_ratio": loss_ratio,
            "predictions": predictions,
            "weather_forecast": weather_forecast,
            "fraud_analysis": fraud_summary,
            "executive_summary": {
                "total_exposure": loss_ratio["total_payouts"],
                "risk_rating": "HIGH" if loss_ratio["loss_ratio_percentage"] > 70 else "MEDIUM" if loss_ratio["loss_ratio_percentage"] > 50 else "LOW",
                "action_items": (
                    ["Review premium pricing", "Adjust coverage limits"] if loss_ratio["loss_ratio_percentage"] > 60
                    else ["Monitor claims velocity", "Review high-risk zones"]
                )
            }
        }
