from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, WorkerProfile, UserRole
from app.schemas import (
    WorkerProfileCreate, WorkerProfileResponse, WorkerProfileUpdate,
    WorkerEarningsResponse
)
from app.api.auth import get_current_active_user

router = APIRouter(prefix="/workers", tags=["workers"])


@router.post("/profile", response_model=WorkerProfileResponse, status_code=201)
async def create_profile(
    profile_data: WorkerProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile = WorkerProfile(user_id=current_user.id, **profile_data.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/profile", response_model=WorkerProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profile", response_model=WorkerProfileResponse)
async def update_profile(
    profile_data: WorkerProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/earnings", response_model=WorkerEarningsResponse)
async def get_earnings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    avg_hourly = None
    if profile.hours_worked > 0:
        avg_hourly = profile.monthly_earnings / profile.hours_worked
    
    return WorkerEarningsResponse(
        monthly_earnings=profile.monthly_earnings,
        total_earnings=profile.total_earnings,
        hours_worked=profile.hours_worked,
        average_hourly=avg_hourly
    )


@router.get("/zone/{zone_id}", response_model=dict)
async def get_zone_info(
    zone_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return {
        "zone_id": zone_id,
        "status": "active",
        "risk_level": 2,
        "enabled_triggers": ["weather", "aqi"]
    }