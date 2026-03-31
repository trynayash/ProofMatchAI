"""
ProofMatch AI — Application Configuration
Loads all settings from environment variables with sensible defaults for local development.
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "proofmatch-ai")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "proofmatch-uploads")
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    # Firebase
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "proofmatch-ai")

    # Application
    APP_ENV: str = os.getenv("APP_ENV", "development")
    AUTH_DISABLED: bool = os.getenv("AUTH_DISABLED", "true").lower() == "true"
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "10/hour")

    # CORS
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://localhost:8080"
    ).split(",")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8080"))

    # Local storage fallback (when GCS is not configured)
    LOCAL_UPLOAD_DIR: str = os.getenv("LOCAL_UPLOAD_DIR", "./uploads")

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def use_local_storage(self) -> bool:
        return not self.GEMINI_API_KEY or self.APP_ENV == "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
