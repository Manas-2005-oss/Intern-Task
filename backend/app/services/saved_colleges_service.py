from __future__ import annotations

from typing import Any, Dict, List, Optional

from pymongo.errors import DuplicateKeyError

from app.database.mongo import COLLECTION_SAVED_COLLEGES, get_db
from app.services.colleges_service import get_college_by_id


async def get_saved_college_ids(user_id: str) -> List[str]:
    cursor = get_db()[COLLECTION_SAVED_COLLEGES].find({"user_id": user_id}, {"college_id": 1, "_id": 0})
    docs = await cursor.to_list(length=2000)
    return [d["college_id"] for d in docs]


async def save_college(user_id: str, college_id: str) -> None:
    # Ensure college exists (fail fast for better UX).
    college = await get_college_by_id(college_id)
    if not college:
        raise KeyError("COLLEGE_NOT_FOUND")

    doc = {"user_id": user_id, "college_id": college_id}
    try:
        await get_db()[COLLECTION_SAVED_COLLEGES].insert_one(doc)
    except DuplicateKeyError:
        # Duplicate saves are handled idempotently.
        return


async def delete_saved_college(user_id: str, college_id: str) -> bool:
    result = await get_db()[COLLECTION_SAVED_COLLEGES].delete_one({"user_id": user_id, "college_id": college_id})
    return result.deleted_count > 0


async def get_saved_colleges(user_id: str) -> List[Dict[str, Any]]:
    ids = await get_saved_college_ids(user_id)
    # Batch fetch details.
    if not ids:
        return []
    from app.services.colleges_service import compare_colleges

    # compare_colleges preserves nested fields and adds placementRate alias.
    return await compare_colleges(ids)

