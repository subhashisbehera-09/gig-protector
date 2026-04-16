import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Trigger, Zone, Premium, User, TriggerStatus, PremiumStatus, Claim, ClaimStatus
from app.services.weather_service import get_weather_data
from app.services.aqi_service import get_aqi_data
from app.services.notification_service import send_trigger_alert_notification

logger = logging.getLogger(__name__)


class TriggerAutomationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cooldown_hours = 24
    
    async def get_active_triggers(self) -> List[Trigger]:
        result = await self.db.execute(
            select(Trigger).where(Trigger.status == TriggerStatus.ACTIVE)
        )
        return result.scalars().all()
    
    async def check_trigger_conditions(self, trigger: Trigger) -> Dict:
        zone = await self.db.execute(
            select(Zone).where(Zone.id == trigger.zone_id)
        )
        zone = zone.scalar_one_or_none()
        
        if not zone:
            return {"should_trigger": False, "reason": "Zone not found"}
        
        weather_data = await get_weather_data(zone.zone_id)
        aqi_data = await get_aqi_data(zone.zone_id)
        
        thresholds = zone.trigger_threshold or {"weather": 4, "aqi": 100}
        weather_threshold = thresholds.get("weather", 4)
        aqi_threshold = thresholds.get("aqi", 100)
        
        weather_risk = weather_data.get("risk_score", 0) if weather_data else 0
        aqi_value = aqi_data.get("aqi", 0) if aqi_data else 0
        
        weather_triggered = weather_risk >= weather_threshold
        aqi_triggered = aqi_value >= aqi_threshold
        
        return {
            "should_trigger": weather_triggered or aqi_triggered,
            "weather_triggered": weather_triggered,
            "aqi_triggered": aqi_triggered,
            "weather_risk": weather_risk,
            "aqi_value": aqi_value,
            "weather_threshold": weather_threshold,
            "aqi_threshold": aqi_threshold,
            "weather_data": weather_data,
            "aqi_data": aqi_data
        }
    
    async def is_in_cooldown(self, trigger: Trigger) -> bool:
        if not trigger.triggered_at:
            return False
        
        cooldown_end = trigger.triggered_at + timedelta(hours=self.cooldown_hours)
        return datetime.utcnow() < cooldown_end
    
    async def has_recent_claim(self, trigger: Trigger) -> bool:
        result = await self.db.execute(
            select(Claim).where(
                Claim.trigger_id == trigger.id,
                Claim.created_at >= datetime.utcnow() - timedelta(hours=self.cooldown_hours)
            )
        )
        return result.scalar_one_or_none() is not None
    
    async def check_all_triggers(self) -> Dict:
        triggers = await self.get_active_triggers()
        results = {
            "checked": len(triggers),
            "triggered": 0,
            "cooldown": 0,
            "errors": 0,
            "trigger_details": []
        }
        
        for trigger in triggers:
            try:
                if await self.is_in_cooldown(trigger):
                    results["cooldown"] += 1
                    continue
                
                if await self.has_recent_claim(trigger):
                    results["cooldown"] += 1
                    continue
                
                conditions = await self.check_trigger_conditions(trigger)
                
                if conditions["should_trigger"]:
                    await self._activate_trigger(trigger, conditions)
                    results["triggered"] += 1
                    results["trigger_details"].append({
                        "trigger_id": trigger.id,
                        "user_id": trigger.user_id,
                        "type": trigger.trigger_type,
                        "conditions": conditions
                    })
                    
            except Exception as e:
                logger.error(f"Error checking trigger {trigger.id}: {e}")
                results["errors"] += 1
        
        await self.db.commit()
        return results
    
    async def _activate_trigger(self, trigger: Trigger, conditions: Dict):
        trigger.status = TriggerStatus.TRIGGERED
        trigger.weather_triggered = conditions["weather_triggered"]
        trigger.aqi_triggered = conditions["aqi_triggered"]
        trigger.weather_value = conditions["weather_risk"]
        trigger.aqi_value = conditions["aqi_value"]
        trigger.triggered_at = datetime.utcnow()
        
        await send_trigger_alert_notification(
            user_id=trigger.user_id,
            trigger_type=trigger.trigger_type,
            db=self.db
        )
        
        logger.info(f"Trigger {trigger.id} activated for user {trigger.user_id}")
    
    async def reset_trigger(self, trigger_id: int) -> bool:
        result = await self.db.execute(
            select(Trigger).where(Trigger.id == trigger_id)
        )
        trigger = result.scalar_one_or_none()
        
        if not trigger:
            return False
        
        trigger.status = TriggerStatus.ACTIVE
        trigger.weather_triggered = False
        trigger.aqi_triggered = False
        trigger.triggered_at = None
        
        await self.db.commit()
        return True


async def run_trigger_check(db: AsyncSession):
    service = TriggerAutomationService(db)
    logger.info("Running scheduled trigger check...")
    results = await service.check_all_triggers()
    logger.info(f"Trigger check complete: {results['triggered']} triggered, {results['cooldown']} in cooldown")
    return results
