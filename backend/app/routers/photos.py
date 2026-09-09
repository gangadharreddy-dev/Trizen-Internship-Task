from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.event import Event, EventMember
from app.models.photo import Photo
from app.schemas.photo import PhotoOut, PhotoSelectionUpdate, BulkUploadResponse
from app.auth.dependencies import get_current_user, require_admin
from app.services.storage import upload_image_file
from app.routers.events import check_event_access

router = APIRouter(tags=["Photos"])

def photo_to_out(photo: Photo) -> PhotoOut:
    uploader_name = photo.uploader.name if photo.uploader else None
    return PhotoOut(
        id=photo.id,
        event_id=photo.event_id,
        uploaded_by=photo.uploaded_by,
        uploader_name=uploader_name,
        filename=photo.filename,
        storage_location=photo.storage_location,
        file_size=photo.file_size,
        created_at=photo.created_at,
        is_selected=photo.is_selected
    )

@router.post("/events/{event_id}/photos", response_model=BulkUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_event_photos(
    event_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Batch uploads photos for an event.
    Only assigned team members or admins can upload.
    """
    check_event_access(event_id, current_user, db)

    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided for upload"
        )

    uploaded_photos = []
    failed_uploads = []

    for file in files:
        try:
            storage_url, file_size = await upload_image_file(file, event_id)
            photo = Photo(
                event_id=event_id,
                uploaded_by=current_user.id,
                filename=file.filename or "photo.jpg",
                storage_location=storage_url,
                file_size=file_size,
                is_selected=False
            )
            db.add(photo)
            db.flush()
            uploaded_photos.append(photo)
        except Exception as e:
            failed_uploads.append(f"{file.filename or 'file'}: {str(e)}")

    db.commit()
    for p in uploaded_photos:
        db.refresh(p)

    return BulkUploadResponse(
        uploaded=[photo_to_out(p) for p in uploaded_photos],
        failed=failed_uploads
    )

@router.get("/events/{event_id}/photos", response_model=List[PhotoOut])
def get_event_photos(
    event_id: int,
    selected_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_event_access(event_id, current_user, db)
    query = db.query(Photo).filter(Photo.event_id == event_id)
    if selected_only:
        query = query.filter(Photo.is_selected == True)
    photos = query.order_by(Photo.created_at.desc()).all()
    return [photo_to_out(p) for p in photos]

@router.get("/photos/my", response_model=List[PhotoOut])
def get_my_photos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns photos uploaded by the logged-in user."""
    photos = (
        db.query(Photo)
        .filter(Photo.uploaded_by == current_user.id)
        .order_by(Photo.created_at.desc())
        .all()
    )
    return [photo_to_out(p) for p in photos]

@router.put("/events/{event_id}/photos/selection", response_model=List[PhotoOut])
def update_photo_selection(
    event_id: int,
    payload: PhotoSelectionUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin curates and selects/unselects photos for customer gallery publishing."""
    photos = (
        db.query(Photo)
        .filter(Photo.event_id == event_id, Photo.id.in_(payload.photo_ids))
        .all()
    )
    for p in photos:
        p.is_selected = payload.is_selected
    db.commit()
    for p in photos:
        db.refresh(p)
    return [photo_to_out(p) for p in photos]

@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    # Admin can delete any photo; Team member can delete only their own
    if current_user.role != UserRole.ADMIN and photo.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own photos"
        )

    db.delete(photo)
    db.commit()
    return None
