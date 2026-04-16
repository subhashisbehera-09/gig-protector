from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Claim, ClaimStatus, Premium
from app.api.auth import get_current_active_user
from app.services.instant_payout import payout_service, PaymentGateway, PayoutStatus

router = APIRouter(prefix="/payouts", tags=["payouts"])


class InstantPayoutRequest(BaseModel):
    claim_id: int
    gateway: Optional[str] = "upi"
    recipient_name: Optional[str] = ""


class PayoutResponse(BaseModel):
    success: bool
    payout_id: str
    amount: float
    gateway: str
    status: str
    transaction_id: str
    processing_time: str
    recipient: dict
    verification: dict
    message: str


class PaymentOptionsResponse(BaseModel):
    gateways: List[dict]
    demo_mode: bool
    message: str


@router.post("/instant", response_model=PayoutResponse)
async def initiate_instant_payout(
    request: InstantPayoutRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(
            Claim.id == request.claim_id,
            Claim.user_id == current_user.id
        )
    )
    claim = result.scalar_one_or_none()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.status not in [ClaimStatus.APPROVED, ClaimStatus.PENDING]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot process payout for claim with status: {claim.status.value}"
        )
    
    payout_amount = claim.payout_amount or claim.claim_amount
    
    try:
        gateway = PaymentGateway(request.gateway) if request.gateway else PaymentGateway.UPI
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid payment gateway. Choose from: {[g.value for g in PaymentGateway]}"
        )
    
    payout_result = await payout_service.initiate_instant_payout(
        claim_id=claim.id,
        recipient_id=str(current_user.id),
        amount=payout_amount,
        gateway=gateway,
        recipient_name=request.recipient_name or current_user.full_name or current_user.email
    )
    
    if claim.status == ClaimStatus.PENDING:
        claim.status = ClaimStatus.APPROVED
    claim.payout_amount = payout_amount
    claim.status = ClaimStatus.PAID
    
    await db.commit()
    
    return payout_result


@router.get("/options", response_model=PaymentOptionsResponse)
async def get_payment_options(
    # No auth required for demo
):
    options = await payout_service.get_payment_options()
    return PaymentOptionsResponse(**options)


@router.get("/status/{payout_id}")
async def get_payout_status(
    payout_id: str,
    current_user: User = Depends(get_current_active_user)
):
    status = await payout_service.get_payout_status(payout_id)
    if not status:
        raise HTTPException(status_code=404, detail="Payout not found")
    return status


@router.get("/history", response_model=List[dict])
async def get_payout_history(
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim).where(
            Claim.user_id == current_user.id,
            Claim.status == ClaimStatus.PAID
        ).order_by(Claim.updated_at.desc())
        .limit(limit)
    )
    claims = result.scalars().all()
    
    history = []
    for claim in claims:
        history.append({
            "payout_id": f"payout_{claim.id}",
            "claim_id": claim.id,
            "amount": claim.payout_amount,
            "claim_amount": claim.claim_amount,
            "status": claim.status.value,
            "trigger_id": claim.trigger_id,
            "created_at": claim.created_at.isoformat() if claim.created_at else None,
            "payout_date": claim.updated_at.isoformat() if claim.updated_at else None
        })
    
    return history


@router.post("/simulate-failure")
async def simulate_payout_failure(
    claim_id: int,
    reason: str,
    admin: User = Depends(get_current_active_user)
):
    if admin.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return await payout_service.simulate_failed_payout(claim_id, reason)
