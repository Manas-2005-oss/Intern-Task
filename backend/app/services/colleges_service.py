from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from app.database.mongo import COLLECTION_COLLEGES, get_db
from app.utils.pagination import paginate


def _regex_or_none(value: Optional[str]) -> Optional[Dict[str, Any]]:
    if not value:
        return None
    return {"$regex": value, "$options": "i"}


def _sanitize_college_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize Mongo document for API serialization:
    - remove raw ObjectId `_id` (Pydantic can't serialize it by default)
    - ensure `id` is present and string
    - keep frontend alias fields (`placementRate`, `image`)
    """
    out = dict(doc)
    mongo_id = out.pop("_id", None)

    if not out.get("id"):
        if mongo_id is not None:
            out["id"] = str(mongo_id)
    else:
        out["id"] = str(out["id"])

    placements = out.get("placements") or {}
    if "placementRate" not in out and "placementRate" in placements:
        out["placementRate"] = placements.get("placementRate")
    if "image" not in out and out.get("coverImage"):
        out["image"] = out.get("coverImage")

    return out


async def get_colleges(
    *,
    search: Optional[str],
    location: Optional[str],
    course: Optional[str],
    fees_max: Optional[float],
    page: int,
    limit: int,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
) -> Tuple[List[Dict[str, Any]], int, int, int]:
    """
    Returns: (items, total, page, totalPages)
    """
    page = max(1, page)
    limit = max(1, limit)

    query: Dict[str, Any] = {}

    if search:
        query["name"] = _regex_or_none(search)

    if location:
        loc_regex = _regex_or_none(location)
        query["$or"] = [{"location.city": loc_regex}, {"location.state": loc_regex}]

    if course:
        course_regex = _regex_or_none(course)
        query["courses.name"] = course_regex

    if fees_max is not None:
        query["fees.min"] = {"$lte": fees_max}

    sort_order_value = -1
    if sort_order and sort_order.lower() == "asc":
        sort_order_value = 1

    # Keep sorting optional; default to placement rate then rating.
    if not sort_by:
        sort_by = "placements.placementRate"
        sort = [(sort_by, sort_order_value), ("rating", -1)]
    else:
        mapping = {
            "rating": "rating",
            "placementRate": "placements.placementRate",
            "feesMin": "fees.min",
            "feesMax": "fees.max",
            "name": "name",
        }
        sort_field = mapping.get(sort_by, sort_by)
        sort = [(sort_field, sort_order_value)]

    total = await get_db()[COLLECTION_COLLEGES].count_documents(query)
    total_pages, skip = paginate(page=page, limit=limit, total=total)

    cursor = (
        get_db()[COLLECTION_COLLEGES]
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
    )
    items = await cursor.to_list(length=limit)

    sanitized = [_sanitize_college_doc(doc) for doc in items]
    return sanitized, total, page, total_pages


async def get_college_by_id(college_id: str) -> Optional[Dict[str, Any]]:
    doc = await get_db()[COLLECTION_COLLEGES].find_one({"id": college_id})
    if not doc:
        return None
    return _sanitize_college_doc(doc)


async def compare_colleges(ids: List[str]) -> List[Dict[str, Any]]:
    # Keep input size sane for Mongo query.
    unique_ids = [x for x in dict.fromkeys(ids) if x]
    if not unique_ids:
        return []

    docs = await get_db()[COLLECTION_COLLEGES].find({"id": {"$in": unique_ids}}).to_list(length=len(unique_ids))

    return [_sanitize_college_doc(doc) for doc in docs]

