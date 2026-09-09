from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Gallery(Base):
    __tablename__ = "galleries"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    public_token = Column(String(64), unique=True, index=True, nullable=False)
    pin_hash = Column(String(255), nullable=False)
    published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    event = relationship("Event", back_populates="gallery")
    gallery_photos = relationship("GalleryPhoto", back_populates="gallery", cascade="all, delete-orphan")

class GalleryPhoto(Base):
    __tablename__ = "gallery_photos"

    gallery_id = Column(Integer, ForeignKey("galleries.id", ondelete="CASCADE"), primary_key=True)
    photo_id = Column(Integer, ForeignKey("photos.id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    gallery = relationship("Gallery", back_populates="gallery_photos")
    photo = relationship("Photo", back_populates="gallery_associations")
