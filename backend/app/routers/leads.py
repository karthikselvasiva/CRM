from fastapi import APIRouter, Depends, Query, HTTPException

from app.middleware.auth import get_current_user, TokenPayload
from app.models.leads import LeadCreate, LeadUpdate
from app.models.common import success_response, paginated_response
from app.services.leads_service import (
    list_leads as svc_list,
    get_lead as svc_get,
    create_lead as svc_create,
    update_lead as svc_update,
    delete_lead as svc_delete,
    convert_lead as svc_convert,
    lead_to_response,
)

router = APIRouter()


@router.get("")
async def list_leads(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    source: str | None = None,
    owner_id: str | None = None,
    user: TokenPayload = Depends(get_current_user),
):
    """List leads with filters."""
    items, total = svc_list(
        team_id=user.team_id,
        page=page,
        limit=limit,
        search=search,
        status=status,
        source=source,
        owner_id=owner_id,
    )
    return paginated_response(
        data=[lead_to_response(l) for l in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("")
async def create_lead(
    data: LeadCreate,
    user: TokenPayload = Depends(get_current_user),
):
    """Create a new lead."""
    lead = svc_create(data.model_dump(), team_id=user.team_id, owner_id=user.sub)
    return success_response(lead_to_response(lead))


@router.get("/{lead_id}")
async def get_lead(
    lead_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Get lead details."""
    lead = svc_get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return success_response(lead_to_response(lead))


@router.patch("/{lead_id}")
async def update_lead(
    lead_id: str,
    data: LeadUpdate,
    user: TokenPayload = Depends(get_current_user),
):
    """Update a lead."""
    updated = svc_update(lead_id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return success_response(lead_to_response(updated))


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Delete a lead."""
    if not svc_delete(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
    return success_response({"id": lead_id, "deleted": True})


@router.post("/{lead_id}/convert")
async def convert_lead(
    lead_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Convert lead to contact + deal."""
    result = svc_convert(lead_id, owner_id=user.sub)
    if not result:
        raise HTTPException(status_code=400, detail="Lead not found or already converted")
    return success_response(result)
