from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Notification


async def send_notification(
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    db: AsyncSession
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def get_user_notifications(
    user_id: int,
    db: AsyncSession,
    unread_only: bool = False
) -> List[Notification]:
    query = select(Notification).where(Notification.user_id == user_id)
    
    if unread_only:
        query = query.where(Notification.read == False)
    
    result = await db.execute(query.order_by(Notification.created_at.desc()))
    return result.scalars().all()


async def mark_as_read(
    notification_id: int,
    db: AsyncSession
) -> Optional[Notification]:
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    
    if notification:
        notification.read = True
        await db.commit()
        await db.refresh(notification)
    
    return notification


async def mark_all_as_read(
    user_id: int,
    db: AsyncSession
) -> int:
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.read == False
        )
    )
    notifications = result.scalars().all()
    
    count = 0
    for notification in notifications:
        notification.read = True
        count += 1
    
    await db.commit()
    return count


async def send_claim_update_notification(
    claim_id: int,
    status: str,
    db: AsyncSession
) -> Optional[Notification]:
    from sqlalchemy import select
    from app.models import Claim, User
    
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    claim = result.scalar_one_or_none()
    
    if not claim:
        return None
    
    user_result = await db.execute(select(User).where(User.id == claim.user_id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        return None
    
    title = f"Claim #{claim_id} Status Update"
    message = f"Your claim status has been updated to: {status}"
    
    return await send_notification(
        user.id,
        title,
        message,
        "claim_update",
        db
    )


async def send_trigger_alert_notification(
    user_id: int,
    trigger_type: str,
    db: AsyncSession
) -> Notification:
    title = "Trigger Alert"
    message = f"Your {trigger_type} protection has been triggered"
    
    return await send_notification(
        user_id,
        title,
        message,
        "trigger_alert",
        db
    )