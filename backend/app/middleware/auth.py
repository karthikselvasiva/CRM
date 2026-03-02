from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.services.auth_service import decode_token, get_user_by_id

security = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str  # user id
    email: str = ""
    role: str = "viewer"
    team_id: str = ""


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenPayload:
    """Verify JWT token and extract the user payload."""
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user to get latest role/team
    user = get_user_by_id(payload.get("sub", ""))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return TokenPayload(
        sub=user["id"],
        email=user["email"],
        role=user["role"],
        team_id=user["team_id"],
    )


def require_role(*allowed_roles: str):
    """Dependency that enforces role-based access control."""

    async def _check_role(
        user: TokenPayload = Depends(get_current_user),
    ) -> TokenPayload:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' is not authorized for this action",
            )
        return user

    return _check_role
