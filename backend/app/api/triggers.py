from datetime import datetime
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Trigger, Zone, TriggerStatus
from app.schemas import TriggerCreate, TriggerResponse, ZoneStatusResponse
from app.api.auth import get_current_active_user
from app.services.trigger_monitor import check_triggers, predict_zone_risk

router = APIRouter(prefix="/triggers", tags=["triggers"])


@router.post("/", response_model=TriggerResponse, status_code=201)
async def create_trigger(
    trigger_data: TriggerCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Zone).where(Zone.id == trigger_data.zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    trigger = Trigger(
        user_id=current_user.id,
        zone_id=trigger_data.zone_id,
        trigger_type=trigger_data.trigger_type,
        status=TriggerStatus.ACTIVE
    )
    db.add(trigger)
    await db.commit()
    await db.refresh(trigger)
    return trigger


@router.get("/", response_model=List[TriggerResponse])
async def list_triggers(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trigger).where(Trigger.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/active", response_model=List[TriggerResponse])
async def get_active_triggers(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trigger).where(
            Trigger.user_id == current_user.id,
            Trigger.status == TriggerStatus.ACTIVE
        )
    )
    return result.scalars().all()


@router.get("/{trigger_id}", response_model=TriggerResponse)
async def get_trigger(
    trigger_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trigger).where(
            Trigger.id == trigger_id,
            Trigger.user_id == current_user.id
        )
    )
    trigger = result.scalar_one_or_none()
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")
    return trigger


@router.get("/zone/{zone_id}/status", response_model=ZoneStatusResponse)
async def get_zone_status(
    zone_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Zone).where(Zone.zone_id == zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    return ZoneStatusResponse(
        zone_id=zone.zone_id,
        risk_level=zone.risk_level,
        weather_enabled=zone.weather_enabled,
        aqi_enabled=zone.aqi_enabled,
        trigger_threshold=zone.trigger_threshold
    )


@router.get("/history", response_model=List[TriggerResponse])
async def get_trigger_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trigger).where(Trigger.user_id == current_user.id).order_by(Trigger.created_at.desc())
    )
    return result.scalars().all()


@router.get("/zone/{city}/risk")
async def get_zone_risk(city: str) -> Dict:
    weather_sequence = [
        {"precipitation": 10, "temperature": 32, "visibility": 8000, "humidity": 65, "wind_speed": 12, "aqi": 85}
        for _ in range(14)
    ]
    return predict_zone_risk(city, weather_sequence)


@router.post("/backtest")
async def run_trigger_backtest(city: str = "mumbai", n_days: int = 1000) -> Dict:
    try:
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), ".."))
        from models.trigger_model import TriggerBacktester
        
        backtester = TriggerBacktester()
        result = backtester.backtest_all_triggers(city, n_days)
        
        return {
            "city": city,
            "n_days": n_days,
            "summary": result["summary"],
            "triggers": result["trigger_results"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")