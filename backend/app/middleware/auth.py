from __future__ import annotations

from typing import Any, Dict

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.services.auth_service import decode_access_token
from app.services.users_service import get_user_by_id
from app.schemas.auth import UserPublic


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> UserPublic:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"message": "Unauthorized"})

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"message": "Invalid or expired token"})

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"message": "Invalid token payload"})

    user_doc = await get_user_by_id(str(user_id))
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"message": "User not found"})

    return UserPublic(id=str(user_doc.get("id") or user_doc.get("_id")), name=user_doc["name"], email=user_doc["email"])

