from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class PhotoOut(BaseModel):
    id: int
    event_id: int
    uploaded_by: int
    uploader_name: Optional[str] = None
    filename: str
    storage_location: str
    file_size: int
    created_at: datetime
    is_selected: bool

    model_config = {"from_attributes": True}

class PhotoSelectionUpdate(BaseModel):
    photo_ids: List[int]
    is_selected: bool

class BulkUploadResponse(BaseModel):
    uploaded: List[PhotoOut]
    failed: List[str] = []
