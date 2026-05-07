from __future__ import annotations

from typing import Any, Dict, Optional

from bson import ObjectId

from app.database.mongo import COLLECTION_USERS, get_db


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return await get_db()[COLLECTION_USERS].find_one({"email": email})


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    # Users might be stored with string ids; support both.
    # If the stored document uses ObjectId in `_id`, this converts.
    try:
        object_id = ObjectId(user_id)
        doc = await get_db()[COLLECTION_USERS].find_one({"_id": object_id})
        if doc:
            return doc
    except Exception:
        pass

    return await get_db()[COLLECTION_USERS].find_one({"id": user_id})


async def create_user(*, name: str, email: str, password_hash: str) -> Dict[str, Any]:
    object_id = ObjectId()
    doc = {
        "_id": object_id,
        "id": str(object_id),
        "name": name,
        "email": email,
        "password_hash": password_hash,
    }
    # Persist both `_id` and string `id` so login/signup/token flows are stable.
    await get_db()[COLLECTION_USERS].insert_one(doc)
    return doc

