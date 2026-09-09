from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    storage_location = Column(String(1000), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_selected = Column(Boolean, default=False, nullable=False)

    # Relationships
    event = relationship("Event", back_populates="photos")
    uploader = relationship("User", back_populates="uploaded_photos")
    gallery_associations = relationship("GalleryPhoto", back_populates="photo", cascade="all, delete-orphan")
