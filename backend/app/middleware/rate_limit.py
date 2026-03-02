import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

# In-memory rate limit store (use Redis in production)
_request_counts: dict[str, list[float]] = defaultdict(list)

PUBLIC_LIMIT = 100  # per minute
AUTH_LIMIT = 500    # per minute
WINDOW = 60         # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        is_authenticated = "authorization" in request.headers
        limit = AUTH_LIMIT if is_authenticated else PUBLIC_LIMIT
        key = f"{client_ip}:{'auth' if is_authenticated else 'pub'}"

        now = time.time()
        # Clean old entries
        _request_counts[key] = [t for t in _request_counts[key] if now - t < WINDOW]

        if len(_request_counts[key]) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
            )

        _request_counts[key].append(now)
        response = await call_next(request)
        return response
