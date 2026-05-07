from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import get_settings

logger = logging.getLogger(__name__)


COLLECTION_COLLEGES = "colleges"
COLLECTION_USERS = "users"
COLLECTION_SAVED_COLLEGES = "saved_colleges"


@dataclass(frozen=True)
class MongoResources:
    client: AsyncIOMotorClient
    db: AsyncIOMotorDatabase


_mongo: Optional[MongoResources] = None


def _infer_db_name(mongo_url: str) -> str:
    """
    Infer database name from connection string path (/dbname).
    If absent, fall back to Settings.MONGO_DB_NAME (must be set).
    """
    parsed = urlparse(mongo_url)
    # path is like "/campusiq" (leading slash included)
    db_from_url = (parsed.path or "").lstrip("/")
    if db_from_url:
        return db_from_url

    settings = get_settings()
    if settings.MONGO_DB_NAME:
        return settings.MONGO_DB_NAME

    raise RuntimeError(
        "MongoDB database name missing. Provide MONGO_DB_NAME or include /<db> in MONGO_URL."
    )


async def init_mongo() -> MongoResources:
    global _mongo
    if _mongo:
        return _mongo

    settings = get_settings()
    db_name = _infer_db_name(settings.MONGO_URL)

    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[db_name]

    # Best-effort connectivity check (doesn't require admin privileges).
    await db.command("ping")

    _mongo = MongoResources(client=client, db=db)
    logger.info("MongoDB connected (db=%s)", db_name)

    await ensure_indexes(db)
    return _mongo


async def close_mongo() -> None:
    global _mongo
    if not _mongo:
        return
    _mongo.client.close()
    _mongo = None


def get_db() -> AsyncIOMotorDatabase:
    if not _mongo:
        raise RuntimeError("MongoDB not initialized. Call init_mongo() on app startup.")
    return _mongo.db


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    # Colleges: `id` is a stable identifier used by the frontend.
    await db[COLLECTION_COLLEGES].create_index("id", unique=True, background=True)

    # Users: enforce unique email.
    await db[COLLECTION_USERS].create_index("email", unique=True, background=True)

    # Saved colleges: prevent duplicates per user.
    await db[COLLECTION_SAVED_COLLEGES].create_index(
        [("user_id", 1), ("college_id", 1)], unique=True, background=True
    )

