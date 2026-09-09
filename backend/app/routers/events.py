from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.event import Event, EventMember
from app.models.photo import Photo
from app.models.gallery import Gallery
from app.schemas.event import EventCreate, EventUpdate, EventMemberAdd, EventMemberOut, EventOut
from app.schemas.auth import UserOut
from app.auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/events", tags=["Events"])

def build_event_out(event: Event, db: Session) -> EventOut:
    photo_count = db.query(func.count(Photo.id)).filter(Photo.event_id == event.id).scalar() or 0
    selected_photo_count = db.query(func.count(Photo.id)).filter(
        Photo.event_id == event.id, Photo.is_selected == True
    ).scalar() or 0
    member_count = db.query(func.count(EventMember.id)).filter(EventMember.event_id == event.id).scalar() or 0
    
    gallery = db.query(Gallery).filter(Gallery.event_id == event.id).first()
    has_gallery = gallery is not None
    gallery_id = gallery.id if gallery else None
    gallery_token = gallery.public_token if gallery else None
    is_published = gallery.published if gallery else False

    creator_name = event.creator.name if event.creator else None

    return EventOut(
        id=event.id,
        name=event.name,
        description=event.description,
        created_by=event.created_by,
        event_date=event.event_date,
        created_at=event.created_at,
        creator_name=creator_name,
        photo_count=photo_count,
        selected_photo_count=selected_photo_count,
        member_count=member_count,
        has_gallery=has_gallery,
        gallery_id=gallery_id,
        gallery_token=gallery_token,
        is_published=is_published
    )

def check_event_access(event_id: int, current_user: User, db: Session) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    if current_user.role == UserRole.ADMIN:
        return event

    # Check team member assignment
    is_assigned = db.query(EventMember).filter(
        EventMember.event_id == event_id,
        EventMember.user_id == current_user.id
    ).first()

    if not is_assigned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this event"
        )
    return event

@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    event = Event(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        event_date=payload.event_date,
        created_by=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return build_event_out(event, db)

@router.get("", response_model=List[EventOut])
def list_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.ADMIN:
        events = db.query(Event).order_by(Event.created_at.desc()).all()
    else:
        # Team member only sees assigned events
        events = (
            db.query(Event)
            .join(EventMember, EventMember.event_id == Event.id)
            .filter(EventMember.user_id == current_user.id)
            .order_by(Event.created_at.desc())
            .all()
        )
    return [build_event_out(e, db) for e in events]

@router.get("/{event_id}", response_model=EventOut)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = check_event_access(event_id, current_user, db)
    return build_event_out(event, db)

@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if payload.name is not None:
        event.name = payload.name.strip()
    if payload.description is not None:
        event.description = payload.description.strip()
    if payload.event_date is not None:
        event.event_date = payload.event_date

    db.commit()
    db.refresh(event)
    return build_event_out(event, db)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    db.delete(event)
    db.commit()
    return None

# Event Members Management
@router.post("/{event_id}/members", response_model=EventMemberOut, status_code=status.HTTP_201_CREATED)
def add_event_member(
    event_id: int,
    payload: EventMemberAdd,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    user = None
    if payload.user_id:
        user = db.query(User).filter(User.id == payload.user_id).first()
    elif payload.email:
        user = db.query(User).filter(User.email == payload.email.lower().strip()).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = db.query(EventMember).filter(
        EventMember.event_id == event_id,
        EventMember.user_id == user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already assigned to this event"
        )

    member = EventMember(event_id=event_id, user_id=user.id)
    db.add(member)
    db.commit()
    db.refresh(member)

    return EventMemberOut(
        id=member.id,
        event_id=member.event_id,
        user_id=member.user_id,
        created_at=member.created_at,
        user=UserOut.model_validate(user)
    )

@router.get("/{event_id}/members", response_model=List[EventMemberOut])
def get_event_members(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_event_access(event_id, current_user, db)
    members = db.query(EventMember).filter(EventMember.event_id == event_id).all()
    result = []
    for m in members:
        result.append(
            EventMemberOut(
                id=m.id,
                event_id=m.event_id,
                user_id=m.user_id,
                created_at=m.created_at,
                user=UserOut.model_validate(m.user)
            )
        )
    return result

@router.delete("/{event_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_event_member(
    event_id: int,
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    member = db.query(EventMember).filter(
        EventMember.event_id == event_id,
        EventMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event member not found")
    db.delete(member)
    db.commit()
    return None
