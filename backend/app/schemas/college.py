from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class Location(BaseModel):
    city: str = Field(min_length=1, max_length=120)
    state: str = Field(min_length=0, max_length=120)


class FeesRange(BaseModel):
    min: int = Field(ge=0)
    max: int = Field(ge=0)
    currency: str = Field(min_length=1, max_length=10)


class PlacementStats(BaseModel):
    averagePackage: int = Field(ge=0)
    highestPackage: int = Field(ge=0)
    placementRate: float = Field(ge=0, le=100)
    topRecruiters: List[str] = Field(default_factory=list)


class Course(BaseModel):
    id: str
    name: str = Field(min_length=1, max_length=200)
    duration: Optional[str] = Field(default=None, max_length=120)
    degree: Optional[str] = Field(default=None, max_length=120)
    fees: Optional[int] = Field(default=None, ge=0)
    seats: Optional[int] = Field(default=None, ge=0)
    eligibility: Optional[str] = Field(default=None, max_length=200)


class College(BaseModel):
    id: str
    name: str
    slug: Optional[str] = None

    logo: Optional[str] = None
    coverImage: Optional[str] = None

    # Nested fields are optional at schema level to prevent serialization-time crashes
    # in edge cases where DB documents are incomplete. Frontend will still expect them.
    location: Optional[Location] = None
    fees: Optional[FeesRange] = None
    placements: Optional[PlacementStats] = None

    rating: Optional[float] = None
    reviewCount: Optional[int] = None
    type: Optional[str] = None
    establishedYear: Optional[int] = None

    accreditation: Optional[List[str]] = None
    courses: List[Course] = Field(default_factory=list)

    # Text fields
    description: Optional[str] = None
    overview: Optional[str] = None

    # A few optional fields used by the existing frontend data model.
    facilities: Optional[List[str]] = None
    highlights: Optional[List[str]] = None
    gallery: Optional[List[Dict[str, Any]]] = None
    contact: Optional[Dict[str, Any]] = None
    reviews: Optional[List[Dict[str, Any]]] = None
    ranking: Optional[Dict[str, Any]] = None

    # Frontend convenience aliases (non-breaking).
    placementRate: Optional[float] = None

    image: Optional[str] = None

    model_config = ConfigDict(extra="allow")


class CollegesQueryResponse(BaseModel):
    items: List[College]
    total: int
    page: int
    totalPages: int


class CollegeDetailResponse(BaseModel):
    college: College


class CompareResponse(BaseModel):
    items: List[College]


class CompareRequest(BaseModel):
    ids: List[str] = Field(min_length=1, max_length=10)

