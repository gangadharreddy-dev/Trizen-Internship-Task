from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.auth import UserOut

class EventCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    event_date: Optional[datetime] = None

class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    event_date: Optional[datetime] = None

class EventMemberAdd(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

class EventMemberOut(BaseModel):
    id: int
    event_id: int
    user_id: int
    created_at: datetime
    user: UserOut

    model_config = {"from_attributes": True}

class EventOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by: int
    event_date: Optional[datetime] = None
    created_at: datetime
    creator_name: Optional[str] = None
    photo_count: int = 0
    selected_photo_count: int = 0
    member_count: int = 0
    has_gallery: bool = False
    gallery_id: Optional[int] = None
    gallery_token: Optional[str] = None
    is_published: bool = False

    model_config = {"from_attributes": True}
