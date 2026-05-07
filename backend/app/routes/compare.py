from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query

from app.schemas.college import College, CompareResponse
from app.services.colleges_service import compare_colleges


router = APIRouter(prefix="/compare", tags=["compare"])


@router.get("", response_model=CompareResponse)
async def compare_get(ids: str = Query(..., description="Comma-separated college ids")) -> CompareResponse:
    id_list: List[str] = [x.strip() for x in ids.split(",") if x.strip()]
    docs = await compare_colleges(id_list[:3])
    by_id = {doc.get("id"): doc for doc in docs}
    ordered = [by_id[i] for i in id_list if i in by_id]
    return CompareResponse(items=[College(**doc) for doc in ordered])

