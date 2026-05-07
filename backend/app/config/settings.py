from __future__ import annotations

from functools import lru_cache
from typing import Literal, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # MongoDB
    MONGO_URL: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: Literal["HS256"] = "HS256"
    JWT_EXPIRY_SECONDS: int = 60 * 60 * 24 * 7  # 7 days

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # API
    API_PREFIX: str = "/api"

    # Operational
    ENV: str = "production"
    LOG_LEVEL: str = "INFO"

    # Limits / safety
    MAX_PAGE_SIZE: int = 50

    # Optional: allow overriding the DB name if the connection string doesn't specify one.
    MONGO_DB_NAME: Optional[str] = None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

