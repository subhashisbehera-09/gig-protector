from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import User, Claim, Premium, FraudAlert, UserRole, ClaimStatus, PremiumStatus, Trigger
from app.schemas import (
    ClaimResponse, ClaimReviewRequest, FraudAlertResponse, AdminStatsResponse, ReviewQueueItem
)
from app.api.auth import get_current_active_user

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = await db.scalar(select(func.count(User.id)))
    active_premiums = await db.scalar(
        select(func.count(Premium.id)).where(Premium.status == PremiumStatus.ACTIVE)
    )
    pending_claims = await db.scalar(
        select(func.count(Claim.id)).where(Claim.status == ClaimStatus.PENDING)
    )
    total_payouts = await db.scalar(
        select(func.sum(Claim.payout_amount)).where(Claim.status == ClaimStatus.PAID)
    ) or 0.0
    fraud_alerts = await db.scalar(
        select(func.count(FraudAlert.id)).where(FraudAlert.resolved == False)
    )
    
    return AdminStatsResponse(
        total_users=total_users or 0,
        active_premiums=active_premiums or 0,
        pending_claims=pending_claims or 0,
        total_payouts=float(total_payouts),
        fraud_alerts=fraud_alerts or 0
    )


@router.get("/claims/review-queue", response_model=List[ReviewQueueItem])
async def get_review_queue(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Claim)
        .where(Claim.status == ClaimStatus.PENDING)
        .order_by(Claim.created_at)
    )
    claims = result.scalars().all()
    
    queue_items = []
    for claim in claims:
        user_result = await db.execute(select(User).where(User.id == claim.user_id))
        user = user_result.scalar_one()
        
        trigger_result = await db.execute(select(Trigger).where(Trigger.id == claim.trigger_id))
        trigger = trigger_result.scalar_one_or_none()
        
        fraud_result = await db.execute(
            select(FraudAlert).where(FraudAlert.claim_id == claim.id, FraudAlert.resolved == False)
        )
        fraud = fraud_result.scalar_one_or_none()
        
        queue_items.append(ReviewQueueItem(
            claim_id=claim.id,
            user_email=user.email,
            claim_amount=claim.claim_amount,
            status=claim.status,
            created_at=claim.created_at,
            trigger_type=trigger.trigger_type if trigger else "unknown",
            risk_score=fraud.risk_score if fraud else None
        ))
    
    return queue_items


@router.post("/claims/{claim_id}/review")
async def review_claim(
    claim_id: int,
    review: ClaimReviewRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim.status = review.status
    claim.reviewed_by = admin.id
    claim.reviewed_at = func.now()
    
    if review.payout_amount:
        claim.payout_amount = review.payout_amount
    
    await db.commit()
    return {"message": "Claim reviewed", "claim_id": claim.id}


@router.get("/fraud-alerts", response_model=List[FraudAlertResponse])
async def get_fraud_alerts(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FraudAlert).where(FraudAlert.resolved == False).order_by(FraudAlert.created_at.desc())
    )
    return result.scalars().all()


@router.post("/fraud-alerts/{alert_id}/resolve")
async def resolve_fraud_alert(
    alert_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FraudAlert).where(FraudAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Fraud alert not found")
    
    alert.resolved = True
    await db.commit()
    return {"message": "Fraud alert resolved"}


@router.get("/users", response_model=List[dict])
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email, "role": u.role.value, "is_active": u.is_active} for u in users]


@router.post("/users/{user_id}/make-admin")
async def make_admin(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = UserRole.ADMIN
    await db.commit()
    return {"message": f"User {user.email} is now an admin"}