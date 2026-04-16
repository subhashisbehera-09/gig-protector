import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Float, Integer, DateTime, Enum, Text, JSON
from app.database import Base


class EmergencyState(str, enum.Enum):
    IDLE = "IDLE"
    TRIGGERED = "TRIGGERED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    ABORTED = "ABORTED"


class TriggerType(str, enum.Enum):
    BUTTON = "BUTTON"
    VOICE_COMMAND = "VOICE_COMMAND"
    CRASH_DETECT = "CRASH_DETECT"
    MANUAL_ENTRY = "MANUAL_ENTRY"


class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(String(36), primary_key=True)
    worker_id = Column(String(36), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Location
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    altitude = Column(Float, nullable=True)
    
    # Event details
    trigger_type = Column(Enum(TriggerType), nullable=False)
    ride_or_delivery_id = Column(String(50), nullable=True)
    
    # Customer info
    customer_name = Column(String(100), nullable=True)
    customer_phone_last4 = Column(String(4), nullable=True)
    
    # State machine
    state = Column(Enum(EmergencyState), default=EmergencyState.TRIGGERED)
    
    # Additional
    notes = Column(Text, nullable=True)
    evidence_stream_url = Column(String(500), nullable=True)
    
    # Timestamps for SLA
    acknowledged_at = Column(DateTime, nullable=True)
    escalated_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    aborted_at = Column(DateTime, nullable=True)
    
    # Agent info
    agent_id = Column(String(36), nullable=True)
    agent_notes = Column(Text, nullable=True)
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    event_metadata = Column(JSON, nullable=True)
