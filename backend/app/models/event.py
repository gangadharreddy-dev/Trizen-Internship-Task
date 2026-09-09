from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="created_events")
    members = relationship("EventMember", back_populates="event", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="event", cascade="all, delete-orphan")
    gallery = relationship("Gallery", back_populates="event", uselist=False, cascade="all, delete-orphan")

class EventMember(Base):
    __tablename__ = "event_members"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_member"),
    )

    # Relationships
    event = relationship("Event", back_populates="members")
    user = relationship("User", back_populates="event_memberships")
