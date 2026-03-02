from pydantic import BaseModel
from datetime import datetime


class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    body_html: str
    variables: list[str] = []


class EmailTemplateResponse(BaseModel):
    id: str
    name: str
    subject: str
    body: str


class EmailSendRequest(BaseModel):
    to_email: str
    contact_name: str | None = None
    subject: str
    body: str


class EmailResponse(BaseModel):
    id: str
    team_id: str
    from_email: str
    to_email: str
    contact_name: str | None
    subject: str
    body: str
    status: str
    folder: str
    sent_at: str | None
    created_at: str
