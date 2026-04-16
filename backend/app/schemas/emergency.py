from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, model_validator
from app.models import EmergencyState, TriggerType


class LocationSchema(BaseModel):
    lat: float
    lng: float
    accuracy: Optional[float] = None
    altitude: Optional[float] = None


class CustomerInfoSchema(BaseModel):
    name: Optional[str] = None
    phone_last4: Optional[str] = None


class EmergencyEventCreate(BaseModel):
    worker_id: str
    location: LocationSchema
    trigger_type: TriggerType
    ride_or_delivery_id: Optional[str] = None
    customer_info: Optional[CustomerInfoSchema] = None
    notes: Optional[str] = None


class EmergencyEventResponse(BaseModel):
    id: str
    worker_id: str
    timestamp: datetime
    location: LocationSchema
    trigger_type: TriggerType
    ride_or_delivery_id: Optional[str] = None
    customer_info: Optional[CustomerInfoSchema] = None
    state: EmergencyState
    notes: Optional[str] = None
    evidence_stream_url: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    escalated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    aborted_at: Optional[datetime] = None
    agent_id: Optional[str] = None
    agent_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @model_validator(mode='before')
    @classmethod
    def convert_location(cls, data: Any) -> Any:
        if hasattr(data, '__dict__'):
            return {
                'id': data.id,
                'worker_id': data.worker_id,
                'timestamp': data.timestamp,
                'location': {
                    'lat': data.lat,
                    'lng': data.lng,
                    'accuracy': data.accuracy,
                    'altitude': data.altitude
                },
                'trigger_type': data.trigger_type,
                'ride_or_delivery_id': data.ride_or_delivery_id,
                'customer_info': {
                    'name': data.customer_name,
                    'phone_last4': data.customer_phone_last4
                } if data.customer_name or data.customer_phone_last4 else None,
                'state': data.state,
                'notes': data.notes,
                'evidence_stream_url': data.evidence_stream_url,
                'acknowledged_at': data.acknowledged_at,
                'escalated_at': data.escalated_at,
                'resolved_at': data.resolved_at,
                'aborted_at': data.aborted_at,
                'agent_id': data.agent_id,
                'agent_notes': data.agent_notes,
                'created_at': data.created_at,
                'updated_at': data.updated_at,
            }
        return data


class EmergencyStatusUpdate(BaseModel):
    new_state: EmergencyState
    reason: Optional[str] = None
    agent_id: Optional[str] = None
    agent_notes: Optional[str] = None


class EmergencyStreamStart(BaseModel):
    stream_type: str = Field(default="audio/video")
    stream_url: Optional[str] = None
