from fastapi import APIRouter, Depends, Query, HTTPException

from app.middleware.auth import get_current_user, TokenPayload
from app.models.deals import DealCreate, DealUpdate, DealStageUpdate, DealCloseRequest
from app.models.common import success_response, paginated_response
from app.services.deals_service import (
    list_deals as svc_list,
    get_deal as svc_get,
    create_deal as svc_create,
    update_deal as svc_update,
    update_deal_stage as svc_update_stage,
    close_deal as svc_close,
    get_pipelines,
    get_stages,
    deal_to_response,
)

router = APIRouter()


@router.get("/config")
async def get_pipeline_config(user: TokenPayload = Depends(get_current_user)):
    """Get available pipelines and their stages."""
    pipelines = get_pipelines()
    
    # Bundle stages with pipelines for ease of use
    result = []
    for p in pipelines:
        p_copy = dict(p)
        p_copy["stages"] = get_stages(p["id"])
        result.append(p_copy)
        
    return success_response(result)


@router.get("")
async def list_deals(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500), # Higher limit for board
    pipeline_id: str | None = None,
    stage_id: str | None = None,
    status: str | None = None,
    owner_id: str | None = None,
    user: TokenPayload = Depends(get_current_user),
):
    """List deals with filters."""
    items, total = svc_list(
        team_id=user.team_id,
        page=page,
        limit=limit,
        pipeline_id=pipeline_id,
        stage_id=stage_id,
        status=status,
        owner_id=owner_id,
    )
    return paginated_response(
        data=[deal_to_response(d) for d in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("")
async def create_deal(
    data: DealCreate,
    user: TokenPayload = Depends(get_current_user),
):
    """Create a new deal."""
    deal = svc_create(data.model_dump(), team_id=user.team_id, owner_id=user.sub)
    return success_response(deal_to_response(deal))


@router.get("/{deal_id}")
async def get_deal(
    deal_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Get deal details."""
    deal = svc_get(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return success_response(deal_to_response(deal))


@router.patch("/{deal_id}")
async def update_deal(
    deal_id: str,
    data: DealUpdate,
    user: TokenPayload = Depends(get_current_user),
):
    """Update deal basic details."""
    updated = svc_update(deal_id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Deal not found")
    return success_response(deal_to_response(updated))


@router.patch("/{deal_id}/stage")
async def update_deal_stage(
    deal_id: str,
    data: DealStageUpdate,
    user: TokenPayload = Depends(get_current_user),
):
    """Move deal to a new stage."""
    updated = svc_update_stage(deal_id, data.stage_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Deal not found")
    return success_response(deal_to_response(updated))


@router.patch("/{deal_id}/close")
async def close_deal(
    deal_id: str,
    data: DealCloseRequest,
    user: TokenPayload = Depends(get_current_user),
):
    """Mark deal as won or lost."""
    updated = svc_close(deal_id, data.status, data.lost_reason)
    if not updated:
        raise HTTPException(status_code=404, detail="Deal not found")
    return success_response(deal_to_response(updated))
