from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator
from app.utils.passwords import PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, validate_password_for_bcrypt


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description=f"Password must be {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters.",
    )

    @field_validator("password")
    @classmethod
    def validate_password_bytes_for_bcrypt(cls, value: str) -> str:
        return validate_password_for_bcrypt(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description=f"Password must be {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters.",
    )

    @field_validator("password")
    @classmethod
    def validate_password_bytes_for_bcrypt(cls, value: str) -> str:
        return validate_password_for_bcrypt(value)


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr


class TokenResponse(BaseModel):
    token: str
    user: UserPublic


class ErrorResponse(BaseModel):
    message: str
    details: Optional[Any] = None

