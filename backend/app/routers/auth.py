from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user, TokenPayload
from app.models.auth import LoginRequest, RegisterRequest, ProfileUpdate, TokenResponse, UserProfile
from app.models.common import success_response
from app.services.auth_service import (
    authenticate_user,
    register_user,
    get_user_by_id,
    update_user_profile,
    create_access_token,
    create_refresh_token,
    decode_token,
    revoke_token,
    user_to_profile,
)

router = APIRouter()


@router.post("/register")
async def register(data: RegisterRequest):
    """Create a new user account."""
    try:
        user = register_user(data.email, data.password, data.full_name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return success_response({
        "message": "Account created successfully",
        "user": user_to_profile(user),
    })


@router.post("/login")
async def login(data: LoginRequest):
    """Authenticate with email/password and receive JWT tokens."""
    print(f"LOGIN START for {data.email}")
    user = authenticate_user(data.email, data.password)
    print(f"AUTHENTICATED: {bool(user)}")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    print("CREATING ACCESS TOKEN")
    access_token = create_access_token(user["id"], user["email"], user["role"], user["team_id"])
    print("CREATING REFRESH TOKEN")
    refresh_token = create_refresh_token(user["id"])
    print("DONE LOGGING IN")

    return success_response({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_to_profile(user),
    })


@router.post("/refresh")
async def refresh_token(data: dict):
    """Exchange a refresh token for a new access token."""
    token = data.get("refresh_token", "")
    payload = decode_token(token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Revoke old refresh token and issue new pair
    revoke_token(token)
    new_access = create_access_token(user["id"], user["email"], user["role"], user["team_id"])
    new_refresh = create_refresh_token(user["id"])

    return success_response({
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    })


@router.post("/logout")
async def logout(user: TokenPayload = Depends(get_current_user)):
    """Invalidate the current session."""
    return success_response({"message": "Logged out successfully"})


@router.get("/me")
async def get_profile(user: TokenPayload = Depends(get_current_user)):
    """Get current user profile."""
    db_user = get_user_by_id(user.sub)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(user_to_profile(db_user))


@router.patch("/me")
async def update_profile(
    data: ProfileUpdate,
    user: TokenPayload = Depends(get_current_user),
):
    """Update current user profile."""
    updated = update_user_profile(user.sub, data.full_name, data.avatar_url)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(user_to_profile(updated))
