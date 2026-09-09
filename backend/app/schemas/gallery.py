from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class GalleryCreate(BaseModel):
    pin: str = Field(..., min_length=4, max_length=12, description="4-12 alphanumeric characters or digits")

class GalleryPublish(BaseModel):
    published: bool

class GalleryOut(BaseModel):
    id: int
    event_id: int
    event_name: Optional[str] = None
    event_description: Optional[str] = None
    event_date: Optional[datetime] = None
    public_token: str
    published: bool
    photo_count: int = 0
    created_at: datetime
    shareable_url: Optional[str] = None

    model_config = {"from_attributes": True}

class GalleryPinVerify(BaseModel):
    pin: str = Field(..., min_length=1)

class GalleryVerifyResponse(BaseModel):
    success: bool
    session_token: str
    gallery: GalleryOut

class CustomerPhotoOut(BaseModel):
    id: int
    filename: str
    storage_location: str
    file_size: int
    created_at: datetime

    model_config = {"from_attributes": True}
