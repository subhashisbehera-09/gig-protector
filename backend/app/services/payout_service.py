from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Claim, ClaimStatus


async def process_payout(
    claim_id: int,
    db: AsyncSession,
    payout_amount: Optional[float] = None
) -> Claim:
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    
    if not claim:
        raise ValueError("Claim not found")
    
    if claim.status != ClaimStatus.APPROVED:
        raise ValueError("Claim must be approved before payout")
    
    if payout_amount is None:
        payout_amount = claim.claim_amount
    
    claim.status = ClaimStatus.PAID
    claim.payout_amount = payout_amount
    
    await db.commit()
    await db.refresh(claim)
    
    return claim


async def calculate_payout_amount(
    claim_amount: float,
    premium_coverage: float,
    trigger_type: str
) -> float:
    coverage_percentage = min(claim_amount / premium_coverage, 1.0)
    
    if trigger_type == "weather":
        multiplier = 0.9
    elif trigger_type == "aqi":
        multiplier = 0.85
    else:
        multiplier = 0.8
    
    payout = claim_amount * coverage_percentage * multiplier
    
    return round(payout, 2)


async def get_pending_payouts(db: AsyncSession) -> list:
    result = await db.execute(
        select(Claim).where(Claim.status == ClaimStatus.APPROVED)
    )
    return result.scalars().all()