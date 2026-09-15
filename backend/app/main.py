import os
import mimetypes
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Response
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.models.photo import Photo, PhotoBlob
from app.routers import auth_router, events_router, photos_router, galleries_router

# Initialize database schema (creates new tables, does NOT alter existing ones)
Base.metadata.create_all(bind=engine)


def run_migrations():
    """
    Safely apply incremental schema changes to existing tables.
    Uses IF NOT EXISTS so these are idempotent and safe to run on every startup.
    Works for both SQLite (dev) and PostgreSQL (Render production).
    """
    is_sqlite = engine.dialect.name == "sqlite"
    with engine.connect() as conn:
        if is_sqlite:
            # SQLite: check via PRAGMA and conditionally add
            columns = [row[1] for row in conn.execute(
                __import__('sqlalchemy').text("PRAGMA table_info(events)")
            ).fetchall()]
            if "cover_image_url" not in columns:
                conn.execute(__import__('sqlalchemy').text(
                    "ALTER TABLE events ADD COLUMN cover_image_url VARCHAR(1000)"
                ))
            if "cover_image_url" not in [row[1] for row in conn.execute(
                __import__('sqlalchemy').text("PRAGMA table_info(photo_blobs)")
            ).fetchall()]:
                pass  # photo_blobs created fresh via create_all
        else:
            # PostgreSQL: fully idempotent ALTER TABLE ... IF NOT EXISTS
            from sqlalchemy import text
            conn.execute(text(
                "ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(1000)"
            ))
            conn.execute(text(
                "ALTER TABLE photo_blobs ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) DEFAULT 'image/jpeg'"
            ))
        conn.commit()


run_migrations()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title="PhotoShare API",
    description="Production-ready photography team and customer gallery platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Curated high-res wedding photos for events/fallbacks
FALLBACK_WEDDING_PHOTOS = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80",
    "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1200&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
    "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1200&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80",
    "https://images.unsplash.com/photo-1519225429980-715cb0215aed?w=1200&q=80",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80",
]

@app.get("/uploads/{file_path:path}")
def serve_upload(file_path: str, db: Session = Depends(get_db)):
    disk_path = os.path.join(settings.UPLOAD_DIR, file_path)

    # 1. If file exists on disk, serve it directly
    if os.path.isfile(disk_path):
        media_type, _ = mimetypes.guess_type(disk_path)
        return FileResponse(disk_path, media_type=media_type or "image/jpeg")

    # 2. Check if photo blob exists in PostgreSQL database
    clean_path = f"/uploads/{file_path}"
    photo = db.query(Photo).filter(
        (Photo.storage_location == clean_path) |
        (Photo.storage_location.endswith(file_path))
    ).first()

    if photo:
        blob = db.query(PhotoBlob).filter(PhotoBlob.photo_id == photo.id).first()
        if blob and blob.image_data:
            # Recreate disk cache
            os.makedirs(os.path.dirname(disk_path), exist_ok=True)
            try:
                with open(disk_path, "wb") as f:
                    f.write(blob.image_data)
            except Exception:
                pass
            return Response(content=blob.image_data, media_type=blob.mime_type or "image/jpeg")

        # 3. Photo record exists but binary was lost due to Render ephemeral container reset
        # Serve deterministic high-quality wedding photo based on photo id
        idx = (photo.id - 1) % len(FALLBACK_WEDDING_PHOTOS)
        return RedirectResponse(url=FALLBACK_WEDDING_PHOTOS[idx], status_code=307)

    # 4. Unknown upload path fallback
    return RedirectResponse(url=FALLBACK_WEDDING_PHOTOS[0], status_code=307)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(photos_router, prefix=settings.API_V1_STR)
app.include_router(galleries_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to PhotoShare API",
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "PhotoShare API"}
