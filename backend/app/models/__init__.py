from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    WORKER = "worker"
    ADMIN = "admin"


class PremiumStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class TriggerStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIGGERED = "triggered"


class ClaimStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    APPEALED = "appealed"
    PAID = "paid"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.WORKER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False)
    premiums = relationship("Premium", back_populates="user")
    triggers = relationship("Trigger", back_populates="user")
    claims = relationship("Claim", back_populates="user", foreign_keys="Claim.user_id")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    platform = Column(String(100))
    occupation = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    zone_id = Column(String(50))
    monthly_earnings = Column(Float, default=0.0)
    total_earnings = Column(Float, default=0.0)
    hours_worked = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="worker_profile")


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), unique=True, index=True)
    name = Column(String(255))
    risk_level = Column(Integer, default=0)
    weather_enabled = Column(Boolean, default=True)
    aqi_enabled = Column(Boolean, default=True)
    trigger_threshold = Column(JSON, default={"weather": 4, "aqi": 100})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    triggers = relationship("Trigger", back_populates="zone")


class Premium(Base):
    __tablename__ = "premiums"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_type = Column(String(50))
    coverage_amount = Column(Float)
    monthly_premium = Column(Float)
    status = Column(Enum(PremiumStatus), default=PremiumStatus.ACTIVE)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="premiums")
    claims = relationship("Claim", back_populates="premium")


class Trigger(Base):
    __tablename__ = "triggers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    trigger_type = Column(String(50))
    status = Column(Enum(TriggerStatus), default=TriggerStatus.ACTIVE)
    weather_triggered = Column(Boolean, default=False)
    aqi_triggered = Column(Boolean, default=False)
    weather_value = Column(Float)
    aqi_value = Column(Float)
    triggered_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="triggers")
    zone = relationship("Zone", back_populates="triggers")
    claim = relationship("Claim", back_populates="trigger", uselist=False, foreign_keys="Claim.trigger_id")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    premium_id = Column(Integer, ForeignKey("premiums.id"))
    trigger_id = Column(Integer, ForeignKey("triggers.id"))
    claim_amount = Column(Float)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.PENDING)
    description = Column(Text)
    evidence = Column(JSON)
    payout_amount = Column(Float)
    appealed = Column(Boolean, default=False)
    appeal_note = Column(Text)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="claims", foreign_keys=[user_id])
    premium = relationship("Premium", back_populates="claims")
    trigger = relationship("Trigger", back_populates="claim")
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    alert_type = Column(String(100))
    risk_score = Column(Float)
    details = Column(JSON)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    claim = relationship("Claim")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    message = Column(Text)
    notification_type = Column(String(50))
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50))
    temperature = Column(Float)
    condition = Column(String(100))
    wind_speed = Column(Float)
    humidity = Column(Float)
    risk_score = Column(Integer, default=0)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class AQIData(Base):
    __tablename__ = "aqi_data"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50))
    aqi = Column(Integer)
    category = Column(String(50))
    pollutant = Column(String(50))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())