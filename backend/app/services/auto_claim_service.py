import logging
from datetime import datetime
from typing import Optional, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Trigger, Premium, Claim, User, TriggerStatus, PremiumStatus, ClaimStatus
from app.services.notification_service import send_notification

logger = logging.getLogger(__name__)


class AutoClaimService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_active_premium(self, user_id: int) -> Optional[Premium]:
        result = await self.db.execute(
            select(Premium).where(
                Premium.user_id == user_id,
                Premium.status == PremiumStatus.ACTIVE
            )
        )
        return result.scalar_one_or_none()
    
    async def get_triggered_triggers_without_claims(self):
        result = await self.db.execute(
            select(Trigger).where(
                Trigger.status == TriggerStatus.TRIGGERED
            )
        )
        triggers = result.scalars().all()
        
        claims_by_trigger = await self.db.execute(
            select(Claim.trigger_id)
        )
        triggered_ids = set(claims_by_trigger.scalars().all())
        
        return [t for t in triggers if t.id not in triggered_ids]
    
    def calculate_claim_amount(self, premium: Premium, trigger: Trigger) -> float:
        base_coverage = premium.coverage_amount
        
        weather_factor = 1.0
        if trigger.weather_triggered:
            weather_factor = 1.0
            if trigger.weather_value and trigger.weather_value > 4:
                weather_factor = 1.5
        
        aqi_factor = 1.0
        if trigger.aqi_triggered:
            aqi_factor = 1.2
            if trigger.aqi_value and trigger.aqi_value > 150:
                aqi_factor = 1.5
        
        claim_amount = base_coverage * weather_factor * aqi_factor * 0.1
        return min(claim_amount, base_coverage * 0.5)
    
    async def create_auto_claim(self, trigger: Trigger) -> Optional[Claim]:
        premium = await self.get_active_premium(trigger.user_id)
        if not premium:
            logger.warning(f"No active premium for user {trigger.user_id}")
            return None
        
        claim_amount = self.calculate_claim_amount(premium, trigger)
        
        trigger_type_desc = []
        if trigger.weather_triggered:
            trigger_type_desc.append(f"weather (risk: {trigger.weather_value})")
        if trigger.aqi_triggered:
            trigger_type_desc.append(f"AQI (value: {trigger.aqi_value})")
        
        claim = Claim(
            user_id=trigger.user_id,
            premium_id=premium.id,
            trigger_id=trigger.id,
            claim_amount=claim_amount,
            description=f"Auto-initiated claim from {', '.join(trigger_type_desc)} trigger",
            status=ClaimStatus.PENDING,
            evidence={
                "trigger_id": trigger.id,
                "triggered_at": trigger.triggered_at.isoformat() if trigger.triggered_at else None,
                "weather_triggered": trigger.weather_triggered,
                "aqi_triggered": trigger.aqi_triggered,
                "weather_value": trigger.weather_value,
                "aqi_value": trigger.aqi_value,
                "source": "automated_trigger_monitoring"
            }
        )
        
        self.db.add(claim)
        await self.db.commit()
        await self.db.refresh(claim)
        
        await send_notification(
            user_id=trigger.user_id,
            title="Auto-Claim Created",
            message=f"Weather/AQI conditions triggered your protection. Claim #{claim.id} for ₹{claim_amount:.2f} has been auto-created.",
            notification_type="auto_claim",
            db=self.db
        )
        
        logger.info(f"Auto-claim {claim.id} created for trigger {trigger.id}, user {trigger.user_id}")
        return claim
    
    async def process_all_triggered_triggers(self) -> Dict:
        triggers = await self.get_triggered_triggers_without_claims()
        
        results = {
            "processed": 0,
            "claims_created": 0,
            "no_premium": 0,
            "errors": 0,
            "details": []
        }
        
        for trigger in triggers:
            try:
                results["processed"] += 1
                claim = await self.create_auto_claim(trigger)
                
                if claim:
                    results["claims_created"] += 1
                    results["details"].append({
                        "trigger_id": trigger.id,
                        "user_id": trigger.user_id,
                        "claim_id": claim.id,
                        "amount": claim.claim_amount
                    })
                else:
                    results["no_premium"] += 1
                    
            except Exception as e:
                logger.error(f"Error creating claim for trigger {trigger.id}: {e}")
                results["errors"] += 1
        
        await self.db.commit()
        return results


async def run_auto_claim_process(db: AsyncSession):
    service = AutoClaimService(db)
    logger.info("Running auto-claim process...")
    results = await service.process_all_triggered_triggers()
    logger.info(f"Auto-claim complete: {results['claims_created']} claims created")
    return results
