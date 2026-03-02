from fastapi import APIRouter, Depends, Query, HTTPException

from app.middleware.auth import get_current_user, TokenPayload
from app.models.tasks import TaskCreate, TaskUpdate
from app.models.common import success_response, paginated_response
from app.services.tasks_service import (
    list_tasks as svc_list,
    get_task as svc_get,
    create_task as svc_create,
    update_task as svc_update,
    delete_task as svc_delete,
    task_to_response,
)

router = APIRouter()


@router.get("")
async def list_tasks(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: str | None = None,
    priority: str | None = None,
    type: str | None = None,
    assigned_to: str | None = None,
    user: TokenPayload = Depends(get_current_user),
):
    """List tasks with filters."""
    items, total = svc_list(
        team_id=user.team_id,
        page=page,
        limit=limit,
        status=status,
        priority=priority,
        task_type=type,
        assigned_to=assigned_to,
    )
    return paginated_response(
        data=[task_to_response(t) for t in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("")
async def create_task(
    data: TaskCreate,
    user: TokenPayload = Depends(get_current_user),
):
    """Create a new task."""
    task = svc_create(data.model_dump(), team_id=user.team_id, user_id=user.sub)
    return success_response(task_to_response(task))


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Get task details."""
    task = svc_get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return success_response(task_to_response(task))


@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    data: TaskUpdate,
    user: TokenPayload = Depends(get_current_user),
):
    """Update a task."""
    updated = svc_update(task_id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return success_response(task_to_response(updated))


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Delete a task."""
    deleted = svc_delete(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return success_response({"id": task_id, "deleted": True})
