from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Premium, PremiumStatus, Trigger, WorkerProfile
from app.schemas import (
    PremiumCreate, PremiumResponse, QuoteRequest, QuoteResponse
)
from app.api.auth import get_current_active_user
from app.services.premium_engine import calculate_premium

router = APIRouter(prefix="/premiums", tags=["premiums"])


@router.post("/quote", response_model=QuoteResponse)
async def get_quote(
    quote_data: QuoteRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    monthly_premium = calculate_premium(
        plan_type=quote_data.plan_type,
        coverage_amount=quote_data.coverage_amount,
        occupation=quote_data.occupation,
        zone_id=quote_data.zone_id
    )
    
    return QuoteResponse(
        plan_type=quote_data.plan_type,
        coverage_amount=quote_data.coverage_amount,
        monthly_premium=monthly_premium,
        suggested_coverage=quote_data.coverage_amount * 1.2
    )


@router.post("/subscribe", response_model=PremiumResponse, status_code=201)
async def subscribe(
    premium_data: PremiumCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Premium).where(
            Premium.user_id == current_user.id,
            Premium.status == PremiumStatus.ACTIVE
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Active premium already exists")
    
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=30)
    
    premium = Premium(
        user_id=current_user.id,
        plan_type=premium_data.plan_type,
        coverage_amount=premium_data.coverage_amount,
        monthly_premium=premium_data.monthly_premium,
        status=PremiumStatus.ACTIVE,
        start_date=start_date,
        end_date=end_date
    )
    db.add(premium)
    await db.commit()
    await db.refresh(premium)
    return premium


@router.get("/", response_model=List[PremiumResponse])
async def list_premiums(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Premium).where(Premium.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{premium_id}", response_model=PremiumResponse)
async def get_premium(
    premium_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Premium).where(
            Premium.id == premium_id,
            Premium.user_id == current_user.id
        )
    )
    premium = result.scalar_one_or_none()
    if not premium:
        raise HTTPException(status_code=404, detail="Premium not found")
    return premium


@router.delete("/{premium_id}")
async def cancel_premium(
    premium_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Premium).where(
            Premium.id == premium_id,
            Premium.user_id == current_user.id
        )
    )
    premium = result.scalar_one_or_none()
    if not premium:
        raise HTTPException(status_code=404, detail="Premium not found")
    
    premium.status = PremiumStatus.CANCELLED
    await db.commit()
    return {"message": "Premium cancelled"}


@router.get("/history", response_model=List[PremiumResponse])
async def get_premium_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Premium).where(Premium.user_id == current_user.id)
    )
    return result.scalars().all()