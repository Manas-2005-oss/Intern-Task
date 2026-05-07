from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional


@dataclass(frozen=True)
class APIError:
    message: str
    status_code: int = 400
    details: Optional[dict[str, Any]] = None

