"""Authentication service — handles user registration, login, and JWT tokens.

Uses in-memory storage for development. Swap with Supabase queries for production.
"""

import uuid
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

from app.config import settings


# ── Password hashing (using built-in hashlib — no C deps) ─────────────────

def _hash_password(password: str) -> str:
    """Hash a password with a random salt using SHA-256."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return f"{salt}${hashed}"


def _verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored hash."""
    salt, hashed = stored_hash.split("$", 1)
    return hashlib.sha256(f"{salt}:{password}".encode()).hexdigest() == hashed


# ── In-memory user store (replace with Supabase in production) ─────────────

_users: dict[str, dict] = {}
_refresh_tokens: set[str] = set()  # valid refresh tokens
_revoked_tokens: set[str] = set()  # revoked access tokens

# Default team
DEFAULT_TEAM_ID = "team-default-001"


def _seed_demo_users() -> None:
    """Seed demo users on first import."""
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@crm.com",
            "password_hash": _hash_password("admin123"),
            "full_name": "Alex Admin",
            "avatar_url": None,
            "role": "admin",
            "team_id": DEFAULT_TEAM_ID,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "manager@crm.com",
            "password_hash": _hash_password("manager123"),
            "full_name": "Morgan Manager",
            "avatar_url": None,
            "role": "sales_manager",
            "team_id": DEFAULT_TEAM_ID,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "rep@crm.com",
            "password_hash": _hash_password("rep123"),
            "full_name": "Riley Rep",
            "avatar_url": None,
            "role": "sales_rep",
            "team_id": DEFAULT_TEAM_ID,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    for user in demo_users:
        _users[user["email"]] = user


# Seed on module load
_seed_demo_users()


# ── Token helpers ──────────────────────────────────────────────────────────

def _create_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    payload["iat"] = datetime.now(timezone.utc)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, email: str, role: str, team_id: str) -> str:
    return _create_token(
        {"sub": user_id, "email": email, "role": role, "team_id": team_id, "type": "access"},
        timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str) -> str:
    token = _create_token(
        {"sub": user_id, "type": "refresh"},
        timedelta(minutes=settings.JWT_REFRESH_EXPIRE_MINUTES),
    )
    _refresh_tokens.add(token)
    return token


def decode_token(token: str) -> dict | None:
    """Decode and verify a JWT. Returns payload or None."""
    if token in _revoked_tokens:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def revoke_token(token: str) -> None:
    _revoked_tokens.add(token)
    _refresh_tokens.discard(token)


# ── User operations ───────────────────────────────────────────────────────

def get_user_by_email(email: str) -> dict | None:
    return _users.get(email)


def get_user_by_id(user_id: str) -> dict | None:
    for user in _users.values():
        if user["id"] == user_id:
            return user
    return None


def register_user(email: str, password: str, full_name: str) -> dict:
    """Register a new user. Raises ValueError if email exists."""
    if email in _users:
        raise ValueError("Email already registered")

    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": _hash_password(password),
        "full_name": full_name,
        "avatar_url": None,
        "role": "sales_rep",  # default role for new users
        "team_id": DEFAULT_TEAM_ID,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _users[email] = user
    return user


def authenticate_user(email: str, password: str) -> dict | None:
    """Verify credentials. Returns user dict or None."""
    user = _users.get(email)
    if not user:
        return None
    if not _verify_password(password, user["password_hash"]):
        return None
    return user


def update_user_profile(user_id: str, full_name: str | None = None, avatar_url: str | None = None) -> dict | None:
    """Update a user's profile fields."""
    user = get_user_by_id(user_id)
    if not user:
        return None
    if full_name is not None:
        user["full_name"] = full_name
    if avatar_url is not None:
        user["avatar_url"] = avatar_url
    return user


def user_to_profile(user: dict) -> dict:
    """Strip sensitive fields from user dict."""
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "avatar_url": user["avatar_url"],
        "role": user["role"],
        "team_id": user["team_id"],
    }
