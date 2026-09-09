import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.event import Event
from app.models.photo import Photo
from app.models.gallery import Gallery, GalleryPhoto
from app.schemas.gallery import (
    GalleryCreate,
    GalleryPublish,
    GalleryOut,
    GalleryPinVerify,
    GalleryVerifyResponse,
    CustomerPhotoOut
)
from app.auth.security import hash_pin, verify_pin, create_gallery_session_token
from app.auth.dependencies import require_admin, verify_customer_gallery_access

router = APIRouter(tags=["Galleries"])

def gallery_to_out(gallery: Gallery, db: Session) -> GalleryOut:
    photo_count = db.query(func.count(GalleryPhoto.photo_id)).filter(
        GalleryPhoto.gallery_id == gallery.id
    ).scalar() or 0

    event_name = gallery.event.name if gallery.event else None
    event_description = gallery.event.description if gallery.event else None
    event_date = gallery.event.event_date if gallery.event else None

    shareable_url = f"/gallery/{gallery.public_token}"

    return GalleryOut(
        id=gallery.id,
        event_id=gallery.event_id,
        event_name=event_name,
        event_description=event_description,
        event_date=event_date,
        public_token=gallery.public_token,
        published=gallery.published,
        photo_count=photo_count,
        created_at=gallery.created_at,
        shareable_url=shareable_url
    )

# --- Admin Gallery Endpoints ---

@router.post("/events/{event_id}/gallery", response_model=GalleryOut)
def create_or_update_gallery(
    event_id: int,
    payload: GalleryCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin creates or updates the gallery for an event, setting the secure PIN.
    The PIN is hashed using bcrypt and never stored in plain text.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    gallery = db.query(Gallery).filter(Gallery.event_id == event_id).first()
    hashed_pin = hash_pin(payload.pin.strip())

    if not gallery:
        # Generate clean, unique token
        while True:
            candidate_token = secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8].lower()
            if not db.query(Gallery).filter(Gallery.public_token == candidate_token).first():
                break

        gallery = Gallery(
            event_id=event_id,
            public_token=candidate_token,
            pin_hash=hashed_pin,
            published=False
        )
        db.add(gallery)
    else:
        gallery.pin_hash = hashed_pin

    db.commit()
    db.refresh(gallery)
    return gallery_to_out(gallery, db)

@router.post("/galleries/{gallery_id}/publish", response_model=GalleryOut)
def toggle_publish_gallery(
    gallery_id: int,
    payload: GalleryPublish,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin publishes/unpublishes a gallery.
    When publishing, syncs all currently selected photos from the event into gallery_photos.
    """
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery not found")

    gallery.published = payload.published

    if payload.published:
        # Refresh gallery photos with all selected photos from this event
        selected_photos = (
            db.query(Photo)
            .filter(Photo.event_id == gallery.event_id, Photo.is_selected == True)
            .all()
        )
        # Clear existing gallery associations
        db.query(GalleryPhoto).filter(GalleryPhoto.gallery_id == gallery.id).delete()

        # Add newly selected
        for photo in selected_photos:
            gp = GalleryPhoto(gallery_id=gallery.id, photo_id=photo.id)
            db.add(gp)

    db.commit()
    db.refresh(gallery)
    return gallery_to_out(gallery, db)

@router.get("/galleries/{gallery_id}", response_model=GalleryOut)
def get_gallery_details(
    gallery_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery not found")
    return gallery_to_out(gallery, db)

@router.get("/events/{event_id}/gallery", response_model=Optional[GalleryOut])
def get_event_gallery(
    event_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    gallery = db.query(Gallery).filter(Gallery.event_id == event_id).first()
    if not gallery:
        return None
    return gallery_to_out(gallery, db)

# --- Customer Endpoints (No account required) ---

@router.get("/gallery/{public_token}/info")
def get_public_gallery_info(public_token: str, db: Session = Depends(get_db)):
    """
    Public metadata check before entering PIN.
    Returns basic title and whether the gallery exists & is published.
    Does NOT reveal photos or PIN.
    """
    gallery = db.query(Gallery).filter(Gallery.public_token == public_token).first()
    if not gallery or not gallery.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found or not published"
        )
    return {
        "event_name": gallery.event.name,
        "event_description": gallery.event.description,
        "event_date": gallery.event.event_date,
        "public_token": gallery.public_token,
        "published": gallery.published
    }

@router.post("/gallery/{public_token}/verify", response_model=GalleryVerifyResponse)
def verify_gallery_pin(
    public_token: str,
    payload: GalleryPinVerify,
    db: Session = Depends(get_db)
):
    """
    Customer enters PIN to access the gallery.
    Verifies the PIN against the bcrypt hash in the database.
    If valid, returns a signed temporary session token to fetch photos.
    """
    gallery = db.query(Gallery).filter(Gallery.public_token == public_token).first()
    if not gallery or not gallery.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found or is currently private/unpublished"
        )

    if not verify_pin(payload.pin.strip(), gallery.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect PIN. Access denied."
        )

    # Issue scoped customer session token
    session_token = create_gallery_session_token(public_token=public_token, gallery_id=gallery.id)

    return GalleryVerifyResponse(
        success=True,
        session_token=session_token,
        gallery=gallery_to_out(gallery, db)
    )

@router.get("/gallery/{public_token}/photos", response_model=List[CustomerPhotoOut])
def get_published_gallery_photos(
    public_token: str,
    token_payload: dict = Depends(verify_customer_gallery_access),
    db: Session = Depends(get_db)
):
    """
    Customer retrieves published photos for the verified gallery.
    Requires valid PIN verification session.
    Strictly filters to published photos in gallery_photos only.
    """
    gallery = db.query(Gallery).filter(Gallery.public_token == public_token).first()
    if not gallery or not gallery.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found or not published"
        )

    # Fetch only photos mapped through gallery_photos
    photos = (
        db.query(Photo)
        .join(GalleryPhoto, GalleryPhoto.photo_id == Photo.id)
        .filter(GalleryPhoto.gallery_id == gallery.id)
        .order_by(GalleryPhoto.added_at.desc())
        .all()
    )

    return [
        CustomerPhotoOut(
            id=p.id,
            filename=p.filename,
            storage_location=p.storage_location,
            file_size=p.file_size,
            created_at=p.created_at
        )
        for p in photos
    ]
