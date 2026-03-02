from pydantic import BaseModel
from datetime import datetime


class LeadCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None


class LeadUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    score: int | None = None
    status: str | None = None


class LeadResponse(BaseModel):
    id: str
    team_id: str
    owner_id: str
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    source: str | None = None
    score: int = 0
    status: str = "new"
    converted_to_contact_id: str | None = None
    created_at: datetime
