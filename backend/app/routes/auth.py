from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.services.auth_service import create_access_token, hash_password, verify_password
from app.services.users_service import create_user, get_user_by_email


router = APIRouter(prefix="/auth", tags=["auth"])


def resolve_user_id(user: dict) -> str:
    user_id = user.get("id") or user.get("_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"message": "User ID missing"})
    return str(user_id)


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest) -> TokenResponse:
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"message": "Email already registered"})

    try:
        password_hash = hash_password(payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail={"message": str(exc)})

    user = await create_user(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        password_hash=password_hash,
    )

    user_id = resolve_user_id(user)
    token = create_access_token(subject=user_id)
    return TokenResponse(
        token=token,
        user={"id": user_id, "name": user["name"], "email": user["email"]},
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    user = await get_user_by_email(str(payload.email).lower())
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"message": "Invalid email or password"})

    user_id = resolve_user_id(user)
    token = create_access_token(subject=user_id)
    return TokenResponse(
        token=token,
        user={"id": user_id, "name": user["name"], "email": user["email"]},
    )

