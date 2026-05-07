from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    password_hash: str

    # Mongo timestamp field could be stored here; kept optional.
    created_at: Optional[object] = None

    model_config = {"populate_by_name": True}


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr

