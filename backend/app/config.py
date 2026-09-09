import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhotoShare"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "photoshare-super-secret-jwt-key-2026-production-ready"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    CUSTOMER_SESSION_EXPIRE_MINUTES: int = 60 * 12  # 12 hours for customer gallery session

    # Database
    # Default to SQLite for local development, easily overridden with PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./photoshare.db")

    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # Local uploads fallback directory
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    BACKEND_BASE_URL: str = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()
