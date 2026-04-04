from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    WORKER = "worker"
    ADMIN = "admin"


class PremiumStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class TriggerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIGGERED = "triggered"


class ClaimStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    APPEALED = "appealed"
    PAID = "paid"


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WorkerProfileBase(BaseModel):
    platform: Optional[str] = None
    occupation: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone_id: Optional[str] = None


class WorkerProfileCreate(WorkerProfileBase):
    pass


class WorkerProfileResponse(WorkerProfileBase):
    id: int
    user_id: int
    monthly_earnings: float
    total_earnings: float
    hours_worked: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorkerProfileUpdate(BaseModel):
    platform: Optional[str] = None
    occupation: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone_id: Optional[str] = None
    monthly_earnings: Optional[float] = None


class WorkerEarningsResponse(BaseModel):
    monthly_earnings: float
    total_earnings: float
    hours_worked: int
    average_hourly: Optional[float] = None
    earnings_history: Optional[List[dict]] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PremiumBase(BaseModel):
    plan_type: str
    coverage_amount: float
    monthly_premium: float


class PremiumCreate(PremiumBase):
    pass


class PremiumResponse(PremiumBase):
    id: int
    user_id: int
    status: PremiumStatus
    start_date: datetime
    end_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class QuoteRequest(BaseModel):
    plan_type: str
    coverage_amount: float
    occupation: str
    zone_id: str


class QuoteResponse(BaseModel):
    plan_type: str
    coverage_amount: float
    monthly_premium: float
    suggested_coverage: float


class TriggerBase(BaseModel):
    trigger_type: str


class TriggerResponse(TriggerBase):
    id: int
    user_id: int
    zone_id: int
    status: TriggerStatus
    weather_triggered: bool
    aqi_triggered: bool
    weather_value: Optional[float]
    aqi_value: Optional[float]
    triggered_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class TriggerCreate(TriggerBase):
    zone_id: int


class ZoneStatusResponse(BaseModel):
    zone_id: str
    risk_level: int
    weather_enabled: bool
    aqi_enabled: bool
    current_weather: Optional[dict] = None
    current_aqi: Optional[dict] = None
    trigger_threshold: dict


class ClaimBase(BaseModel):
    claim_amount: float
    description: str
    evidence: Optional[dict] = None


class ClaimCreate(ClaimBase):
    trigger_id: int


class ClaimResponse(ClaimBase):
    id: int
    user_id: int
    premium_id: int
    trigger_id: int
    status: ClaimStatus
    payout_amount: Optional[float]
    appealed: bool
    appeal_note: Optional[str]
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ClaimUpdate(BaseModel):
    status: Optional[ClaimStatus] = None
    payout_amount: Optional[float] = None
    appeal_note: Optional[str] = None


class ClaimReviewRequest(BaseModel):
    status: ClaimStatus
    payout_amount: Optional[float] = None
    notes: Optional[str] = None


class AppealRequest(BaseModel):
    appeal_note: str


class FraudAlertResponse(BaseModel):
    id: int
    claim_id: int
    alert_type: str
    risk_score: float
    details: dict
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WeatherDataResponse(BaseModel):
    zone_id: str
    temperature: float
    condition: str
    wind_speed: float
    humidity: float
    risk_score: int
    recorded_at: datetime

    class Config:
        from_attributes = True


class AQIDataResponse(BaseModel):
    zone_id: str
    aqi: int
    category: str
    pollutant: str
    recorded_at: datetime

    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_users: int
    active_premiums: int
    pending_claims: int
    total_payouts: float
    fraud_alerts: int


class ReviewQueueItem(BaseModel):
    claim_id: int
    user_email: str
    claim_amount: float
    status: ClaimStatus
    created_at: datetime
    trigger_type: str
    risk_score: Optional[float] = None