from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.schemas.auth import UserPublic
from app.services.saved_colleges_service import delete_saved_college, get_saved_colleges, save_college
from app.config.settings import get_settings
from app.schemas.college import College


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/saved")
async def get_saved(current_user: UserPublic = Depends(get_current_user)):
    colleges = await get_saved_colleges(current_user.id)
    # Frontend not currently wired to this, but keep a stable response shape.
    return {"items": [College(**doc) for doc in colleges]}


@router.post("/save/{college_id}", status_code=status.HTTP_201_CREATED)
async def save_college_endpoint(
    college_id: str,
    current_user: UserPublic = Depends(get_current_user),
):
    try:
        await save_college(current_user.id, college_id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"message": "College not found"})
    return {"message": "College saved"}


@router.delete("/save/{college_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved(
    college_id: str,
    current_user: UserPublic = Depends(get_current_user),
):
    deleted = await delete_saved_college(current_user.id, college_id)
    if not deleted:
        # Keep idempotent UX: deleting a non-existing save returns 204.
        return
    return

