from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.middleware.auth import get_current_user, require_role, TokenPayload
from app.models.common import success_response, error_response
from app.models.settings import CompanyProfile
from app.services import settings_service

router = APIRouter()


@router.get("/profile")
async def get_company_profile(user: TokenPayload = Depends(get_current_user)):
    """Get company profile settings."""
    profile = settings_service.get_company_profile(team_id=user.team_id)
    return success_response(data=profile)


@router.patch("/profile")
async def update_company_profile(
    profile_in: CompanyProfile,
    user: TokenPayload = Depends(require_role("admin")),
):
    """Update company profile (admin only)."""
    profile = settings_service.update_company_profile(team_id=user.team_id, profile=profile_in)
    return success_response(data=profile)


@router.get("/pipeline-stages")
async def list_pipeline_stages(user: TokenPayload = Depends(get_current_user)):
    """List pipeline stages."""
    stages = settings_service.list_pipeline_stages(team_id=user.team_id)
    return success_response(data=stages)


@router.get("/custom-fields")
async def list_custom_fields(user: TokenPayload = Depends(get_current_user)):
    """List custom fields."""
    fields = settings_service.list_custom_fields(team_id=user.team_id)
    return success_response(data=fields)


@router.get("/users")
async def list_users(
    user: TokenPayload = Depends(require_role("admin", "sales_manager")),
):
    """List team users (admin/manager only)."""
    # Just returning a static list of the demo users for UI rendering
    return success_response(data=[
        {"id": "user1", "name": "Alex Admin", "email": "admin@crm.com", "role": "admin"},
        {"id": "user2", "name": "Sam Sales", "email": "sales@crm.com", "role": "sales_manager"}
    ])


@router.get("/integrations")
async def list_integrations(user: TokenPayload = Depends(get_current_user)):
    """List configured integrations."""
    integrations = settings_service.list_integrations(team_id=user.team_id)
    return success_response(data=integrations)


@router.post("/integrations/{integration_id}/toggle")
async def toggle_integration(integration_id: str, user: TokenPayload = Depends(require_role("admin"))):
    """Toggle integration connection status."""
    integration = settings_service.toggle_integration(team_id=user.team_id, integration_id=integration_id)
    if not integration:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return success_response(data=integration)


class CreateKeyRequest(BaseModel):
    name: str

@router.get("/api-keys")
async def list_api_keys(user: TokenPayload = Depends(require_role("admin"))):
    """List active API keys."""
    keys = settings_service.list_api_keys(team_id=user.team_id)
    return success_response(data=keys)


@router.post("/api-keys", status_code=status.HTTP_201_CREATED)
async def create_api_key(req: CreateKeyRequest, user: TokenPayload = Depends(require_role("admin"))):
    """Create a new API key."""
    key = settings_service.create_api_key(team_id=user.team_id, name=req.name)
    return success_response(data=key)


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(key_id: str, user: TokenPayload = Depends(require_role("admin"))):
    """Revoke an API key."""
    success = settings_service.revoke_api_key(team_id=user.team_id, key_id=key_id)
    if not success:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    return success_response(message="API key revoked")
