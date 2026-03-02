from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user, TokenPayload
from app.models.common import success_response
from app.services.reports_service import generate_dashboard_metrics

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard(
    user: TokenPayload = Depends(get_current_user),
):
    """Aggregate dashboard metrics (revenue, leads, pipeline, KPIs)."""
    # In a real app we'd pass user.team_id to scope the data
    metrics = generate_dashboard_metrics(team_id=user.team_id)
    return success_response(data=metrics)
