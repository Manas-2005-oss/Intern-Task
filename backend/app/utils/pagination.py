from __future__ import annotations

from math import ceil
from typing import Tuple


def paginate(page: int, limit: int, total: int) -> Tuple[int, int]:
    """
    Returns (total_pages, skip) where:
    - total_pages is at least 1
    - skip is 0-based offset
    """
    total_pages = max(1, ceil(total / max(1, limit)))
    # page is 1-based
    skip = max(0, (page - 1) * limit)
    return total_pages, skip

