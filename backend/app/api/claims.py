from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Claim, Premium, Trigger, ClaimStatus
from app.schemas import (
    ClaimCreate, ClaimResponse, ClaimUpdate, ClaimReviewRequest,
    AppealRequest
)
from app.api.auth import get_current_active_user, get_current_user
from app.services.fraud_engine import analyze_claim_fraud

router = APIRouter(prefix="/claims", tags=["claims"])


@router.post("/", response_model=ClaimResponse, status_code=201)
async def create_claim(
    claim_data: ClaimCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Trigger).where(Trigger.id == claim_data.trigger_id, Trigger.user_id == current_user.id)
    )
    trigger = result.scalar_one_or_none()
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")
    
    result = await db.execute(
        select(Premium).where(
            Premium.user_id == current_user.id,
            Premium.status == "active"
        )
    )
    premium = result.scalar_one_or_none()
    if not premium:
        raise HTTPException(status_code=400, detail="No active premium found")
    
    claim = Claim(
        user_id=current_user.id,
        premium_id=premium.id,
        trigger_id=trigger.id,
        claim_amount=claim_data.claim_amount,
        description=claim_data.description,
        evidence=claim_data.evidence,
        status=ClaimStatus.PENDING
    )
    db.add(claim)
    await db.commit()
    await db.refresh(claim)
    return claim


@router.get("/", response_model=List[ClaimResponse])
async def list_claims(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(Claim.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(
    claim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(
            Claim.id == claim_id,
            Claim.user_id == current_user.id
        )
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.get("/status/{status}", response_model=List[ClaimResponse])
async def get_claims_by_status(
    status: ClaimStatus,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(
            Claim.user_id == current_user.id,
            Claim.status == status
        )
    )
    return result.scalars().all()


@router.post("/{claim_id}/appeal")
async def appeal_claim(
    claim_id: int,
    appeal_data: AppealRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(
            Claim.id == claim_id,
            Claim.user_id == current_user.id
        )
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.status != ClaimStatus.REJECTED:
        raise HTTPException(status_code=400, detail="Can only appeal rejected claims")
    
    claim.appealed = True
    claim.appeal_note = appeal_data.appeal_note
    claim.status = ClaimStatus.APPEALED
    await db.commit()
    return {"message": "Appeal submitted"}


@router.get("/payouts/history", response_model=List[ClaimResponse])
async def get_payout_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(
            Claim.user_id == current_user.id,
            Claim.status == ClaimStatus.PAID
        )
    )
    return result.scalars().all()


@router.get("/{claim_id}/fraud-analysis")
async def get_claim_fraud_analysis(
    claim_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    result = await db.execute(
        select(Claim).where(
            Claim.id == claim_id,
            Claim.user_id == current_user.id
        )
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    fraud_analysis = await analyze_claim_fraud(claim_id, db)
    return fraud_analysis