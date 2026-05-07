from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.college import (
    College,
    CollegesQueryResponse,
    CompareRequest,
    CompareResponse,
    CollegeDetailResponse,
)
from app.services.colleges_service import compare_colleges, get_college_by_id, get_colleges
from app.config.settings import get_settings


router = APIRouter(prefix="/colleges", tags=["colleges"])


@router.get("", response_model=CollegesQueryResponse)
async def list_colleges(
    search: Optional[str] = Query(default=None, description="Search by college name substring"),
    location: Optional[str] = Query(default=None, description="Filter by city or state substring"),
    course: Optional[str] = Query(default=None, description="Filter by course name substring"),
    fees: Optional[float] = Query(default=None, description="Max annual fee (compares against fees.min)"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=9, ge=1),
    sortBy: Optional[str] = Query(default=None, description="Optional sorting key"),
    sortOrder: Optional[str] = Query(default=None, description="Optional sort order: asc|desc"),
) -> CollegesQueryResponse:
    settings = get_settings()
    limit = min(limit, settings.MAX_PAGE_SIZE)

    items, total, current_page, total_pages = await get_colleges(
        search=search,
        location=location,
        course=course,
        fees_max=fees,
        page=page,
        limit=limit,
        sort_by=sortBy,
        sort_order=sortOrder,
    )

    # Convert Mongo docs to response models. Aliases like placementRate/image are already injected.
    return CollegesQueryResponse(items=[College(**doc) for doc in items], total=total, page=current_page, totalPages=total_pages)


@router.get("/{college_id}", response_model=CollegeDetailResponse)
async def get_college(college_id: str) -> CollegeDetailResponse:
    doc = await get_college_by_id(college_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"message": "College not found"})
    return CollegeDetailResponse(college=College(**doc))


@router.post("/compare", response_model=CompareResponse)
async def compare(payload: CompareRequest) -> CompareResponse:
    # Frontend allows up to 3, but we'll accept any 1..10 and return first 3.
    ids = payload.ids[:3]
    docs = await compare_colleges(ids)
    # Preserve requested order as best-effort.
    by_id = {doc.get("id"): doc for doc in docs}
    ordered = [by_id[i] for i in ids if i in by_id]
    return CompareResponse(items=[College(**doc) for doc in ordered])

