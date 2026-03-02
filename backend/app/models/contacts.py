from pydantic import BaseModel
from datetime import datetime


class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    status: str = "active"
    tags: list[str] = []
    source: str | None = None


class ContactUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    status: str | None = None
    tags: list[str] | None = None
    source: str | None = None
