from pydantic import BaseModel
from typing import Any


class APIResponse(BaseModel):
    """Standard API response envelope."""
    data: Any = None
    error: str | None = None
    meta: dict[str, Any] | None = None


class PaginationParams(BaseModel):
    """Pagination query parameters."""
    page: int = 1
    limit: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def paginated_response(data: Any, total: int, page: int, limit: int) -> dict:
    """Create a standard paginated response."""
    return {
        "data": data,
        "error": None,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        },
    }


def success_response(data: Any = None) -> dict:
    """Create a standard success response."""
    return {"data": data, "error": None, "meta": None}


def error_response(error: str, status_code: int = 400) -> dict:
    """Create a standard error response."""
    return {"data": None, "error": error, "meta": None}
