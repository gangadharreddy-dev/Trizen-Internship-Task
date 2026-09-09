import os
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
import cloudinary
import cloudinary.uploader
from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

# Configure Cloudinary if credentials are provided
cloudinary_configured = False
if (
    settings.CLOUDINARY_CLOUD_NAME
    and settings.CLOUDINARY_API_KEY
    and settings.CLOUDINARY_API_SECRET
):
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    cloudinary_configured = True

async def upload_image_file(file: UploadFile, event_id: int) -> Tuple[str, int]:
    """
    Validates and uploads an image file.
    Returns a tuple of: (storage_location_url, file_size_in_bytes)
    """
    # 1. Validate file extension
    original_filename = file.filename or "unknown"
    _, ext = os.path.splitext(original_filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Read file content and check size
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File {original_filename} exceeds max allowed size of 25MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File {original_filename} is empty."
        )

    # 3. Check MIME type if available
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{file.content_type}' for {original_filename}."
        )

    # 4. Upload to Cloudinary if configured
    if cloudinary_configured:
        try:
            folder_name = f"photoshare/events/{event_id}"
            response = cloudinary.uploader.upload(
                contents,
                folder=folder_name,
                resource_type="image"
            )
            secure_url = response.get("secure_url") or response.get("url")
            return secure_url, file_size
        except Exception as e:
            # If Cloudinary fails, raise appropriate error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image to cloud storage: {str(e)}"
            )

    # 5. Local storage fallback (for local development & offline test runs)
    upload_dir = os.path.join(settings.UPLOAD_DIR, f"event_{event_id}")
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = os.path.join(upload_dir, unique_filename)

    with open(target_path, "wb") as f:
        f.write(contents)

    # Serve through backend /uploads URL
    relative_url = f"/uploads/event_{event_id}/{unique_filename}"
    return relative_url, file_size
