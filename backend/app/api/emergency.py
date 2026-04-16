import logging
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import EmergencyEvent, EmergencyState, TriggerType
from app.schemas.emergency import (
    EmergencyEventCreate,
    EmergencyEventResponse,
    EmergencyStatusUpdate,
)
from app.services.emergency_service import send_sos_alert

router = APIRouter(prefix="/emergency", tags=["emergency"])
logger = logging.getLogger(__name__)

VALID_TRANSITIONS = {
    EmergencyState.TRIGGERED: [EmergencyState.ACKNOWLEDGED, EmergencyState.ESCALATED, EmergencyState.ABORTED],
    EmergencyState.ACKNOWLEDGED: [EmergencyState.ESCALATED, EmergencyState.RESOLVED],
    EmergencyState.ESCALATED: [EmergencyState.RESOLVED],
    EmergencyState.IDLE: [EmergencyState.TRIGGERED],
}


def validate_transition(current: EmergencyState, new: EmergencyState) -> bool:
    if current == EmergencyState.IDLE and new == EmergencyState.TRIGGERED:
        return True
    if current == EmergencyState.TRIGGERED and new in [EmergencyState.ACKNOWLEDGED, EmergencyState.ESCALATED, EmergencyState.ABORTED, EmergencyState.RESOLVED]:
        return True
    if current == EmergencyState.ACKNOWLEDGED and new in [EmergencyState.ESCALATED, EmergencyState.RESOLVED]:
        return True
    if current == EmergencyState.ESCALATED and new == EmergencyState.RESOLVED:
        return True
    if current in [EmergencyState.TRIGGERED, EmergencyState.ACKNOWLEDGED] and new == EmergencyState.ABORTED:
        return True
    return False


@router.post("/trigger", response_model=EmergencyEventResponse, status_code=202)
async def trigger_emergency(
    event: EmergencyEventCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Worker initiates emergency - Section 5: /emergency/trigger
    """
    try:
        incident_id = str(uuid.uuid4())

        db_event = EmergencyEvent(
            id=incident_id,
            worker_id=event.worker_id,
            lat=event.location.lat,
            lng=event.location.lng,
            accuracy=event.location.accuracy,
            altitude=event.location.altitude,
            trigger_type=event.trigger_type,
            ride_or_delivery_id=event.ride_or_delivery_id,
            customer_name=event.customer_info.name if event.customer_info else None,
            customer_phone_last4=event.customer_info.phone_last4 if event.customer_info else None,
            notes=event.notes,
            state=EmergencyState.TRIGGERED,
            timestamp=datetime.utcnow(),
        )

        db.add(db_event)
        await db.commit()
        await db.refresh(db_event)

        logger.info(
            f"EMERGENCY_TRIGGERED: incident_id={incident_id}, worker_id={event.worker_id}, "
            f"trigger_type={event.trigger_type}, location=({event.location.lat}, {event.location.lng})"
        )

        background_tasks.add_task(send_sos_alert, incident_id, event.worker_id)

        return db_event
    except Exception as e:
        logger.error(f"EMERGENCY_TRIGGER_ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{incident_id}", response_model=EmergencyEventResponse)
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get emergency incident by ID
    """
    result = await db.execute(select(EmergencyEvent).where(EmergencyEvent.id == incident_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return event


@router.get("/", response_model=list[EmergencyEventResponse])
async def list_incidents(
    worker_id: Optional[str] = None,
    state: Optional[EmergencyState] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    List emergency incidents with optional filters
    """
    query = select(EmergencyEvent).order_by(EmergencyEvent.created_at.desc()).limit(limit)
    
    if worker_id:
        query = query.where(EmergencyEvent.worker_id == worker_id)
    if state:
        query = query.where(EmergencyEvent.state == state)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{incident_id}/status", response_model=EmergencyEventResponse)
async def update_emergency_status(
    incident_id: str,
    update: EmergencyStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update emergency state - Section 5: /emergency/{incidentId}/status
    """
    result = await db.execute(select(EmergencyEvent).where(EmergencyEvent.id == incident_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if not validate_transition(event.state, update.new_state):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {event.state} to {update.new_state}"
        )
    
    old_state = event.state
    event.state = update.new_state
    event.updated_at = datetime.utcnow()
    
    if update.new_state == EmergencyState.ACKNOWLEDGED:
        event.acknowledged_at = datetime.utcnow()
        event.agent_id = update.agent_id
    elif update.new_state == EmergencyState.ESCALATED:
        event.escalated_at = datetime.utcnow()
        event.agent_id = update.agent_id
        event.agent_notes = update.agent_notes
    elif update.new_state == EmergencyState.RESOLVED:
        event.resolved_at = datetime.utcnow()
    elif update.new_state == EmergencyState.ABORTED:
        event.aborted_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(event)
    
    logger.info(
        f"STATE_TRANSITION: incident_id={incident_id}, {old_state} -> {update.new_state}, "
        f"agent_id={update.agent_id}"
    )
    
    return event


@router.post("/{incident_id}/stream", response_model=EmergencyEventResponse)
async def start_live_stream(
    incident_id: str,
    stream_url: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Start live audio/video stream - Section 5: /emergency/{incidentId}/stream
    """
    result = await db.execute(select(EmergencyEvent).where(EmergencyEvent.id == incident_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    event.evidence_stream_url = stream_url
    event.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(event)
    
    logger.info(f"STREAM_STARTED: incident_id={incident_id}, stream_url={stream_url}")
    
    return event


@router.post("/{incident_id}/cancel", response_model=EmergencyEventResponse)
async def cancel_emergency(
    incident_id: str,
    worker_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Worker cancels emergency within 10s window - ABORTED state
    """
    result = await db.execute(select(EmergencyEvent).where(EmergencyEvent.id == incident_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if event.worker_id != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this incident")
    
    if event.state not in [EmergencyState.TRIGGERED, EmergencyState.ACKNOWLEDGED]:
        raise HTTPException(status_code=400, detail="Cannot cancel in current state")
    
    event.state = EmergencyState.ABORTED
    event.aborted_at = datetime.utcnow()
    event.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(event)
    
    logger.info(f"EMERGENCY_ABORTED: incident_id={incident_id}, worker_id={worker_id}")
    
    return event
