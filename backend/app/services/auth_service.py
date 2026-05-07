from __future__ import annotations

import time
from typing import Any, Dict

from jose import jwt
from passlib.context import CryptContext

from app.config.settings import get_settings
from app.utils.passwords import validate_password_for_bcrypt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    validate_password_for_bcrypt(password)
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        validate_password_for_bcrypt(password)
    except ValueError:
        # Invalid password input should never crash auth flow.
        return False
    return pwd_context.verify(password, password_hash)


def create_access_token(*, subject: str, claims: Dict[str, Any] | None = None) -> str:
    settings = get_settings()
    now = int(time.time())
    payload: Dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + settings.JWT_EXPIRY_SECONDS,
    }
    if claims:
        payload.update(claims)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])

