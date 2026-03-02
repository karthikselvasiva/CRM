from fastapi import APIRouter, Depends, Query, HTTPException

from app.middleware.auth import get_current_user, TokenPayload
from app.models.emails import EmailTemplateResponse, EmailSendRequest, EmailResponse
from app.models.common import success_response, paginated_response
from app.services.emails_service import (
    list_emails as svc_list_emails,
    get_email as svc_get_email,
    send_email as svc_send_email,
    list_templates as svc_list_templates,
)

router = APIRouter()


@router.get("", response_model=dict)
async def list_emails(
    folder: str = Query("inbox"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user: TokenPayload = Depends(get_current_user),
):
    """List emails for the current user's team, optionally filtered by folder."""
    items, total = svc_list_emails(team_id=user.team_id, folder=folder, page=page, limit=limit)
    return paginated_response(data=items, total=total, page=page, limit=limit)


@router.get("/templates", response_model=dict)
async def list_templates(user: TokenPayload = Depends(get_current_user)):
    """List available email templates."""
    templates = svc_list_templates()
    return success_response(data=templates)


@router.post("/send", response_model=dict)
async def send_email(
    data: EmailSendRequest,
    user: TokenPayload = Depends(get_current_user),
):
    """Simulate sending an email to a contact."""
    # Assuming the current user's email is stored in TokenPayload or we mock it
    # In a real app we'd fetch the user's email from the DB via user.sub
    sender_email = "admin@crm.com" 
    email = svc_send_email(data.model_dump(), team_id=user.team_id, sender_email=sender_email)
    return success_response(data=email)


@router.get("/{email_id}", response_model=dict)
async def get_email(
    email_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Get a specific email's details."""
    email = svc_get_email(email_id)
    if not email or email["team_id"] != user.team_id:
        raise HTTPException(status_code=404, detail="Email not found")
    return success_response(data=email)
