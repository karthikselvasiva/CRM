from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException

from app.middleware.auth import get_current_user, TokenPayload
from app.models.contacts import ContactCreate, ContactUpdate
from app.models.common import success_response, paginated_response
from app.services.contacts_service import (
    list_contacts as svc_list,
    get_contact as svc_get,
    create_contact as svc_create,
    update_contact as svc_update,
    delete_contact as svc_delete,
    import_contacts_csv,
    contact_to_response,
)

router = APIRouter()


@router.get("")
async def list_contacts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    tag: str | None = None,
    status: str | None = None,
    owner_id: str | None = None,
    user: TokenPayload = Depends(get_current_user),
):
    """List contacts with pagination and filters."""
    items, total = svc_list(
        team_id=user.team_id,
        page=page,
        limit=limit,
        search=search,
        tag=tag,
        status=status,
        owner_id=owner_id,
    )
    return paginated_response(
        data=[contact_to_response(c) for c in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("")
async def create_contact(
    data: ContactCreate,
    user: TokenPayload = Depends(get_current_user),
):
    """Create a new contact."""
    contact = svc_create(data.model_dump(), team_id=user.team_id, owner_id=user.sub)
    return success_response(contact_to_response(contact))


@router.get("/{contact_id}")
async def get_contact(
    contact_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Get full contact details."""
    contact = svc_get(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return success_response(contact_to_response(contact))


@router.patch("/{contact_id}")
async def update_contact(
    contact_id: str,
    data: ContactUpdate,
    user: TokenPayload = Depends(get_current_user),
):
    """Partial update a contact."""
    updated = svc_update(contact_id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Contact not found")
    return success_response(contact_to_response(updated))


@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: str,
    user: TokenPayload = Depends(get_current_user),
):
    """Soft delete a contact."""
    if not svc_delete(contact_id):
        raise HTTPException(status_code=404, detail="Contact not found")
    return success_response({"id": contact_id, "deleted": True})


@router.post("/import")
async def import_contacts(
    file: UploadFile = File(...),
    user: TokenPayload = Depends(get_current_user),
):
    """Bulk CSV import."""
    content = (await file.read()).decode("utf-8")
    created = import_contacts_csv(content, team_id=user.team_id, owner_id=user.sub)
    return success_response({
        "imported": len(created),
        "contacts": [contact_to_response(c) for c in created],
    })
