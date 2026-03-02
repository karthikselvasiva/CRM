from pydantic import BaseModel
from typing import Optional

class CompanyProfile(BaseModel):
    name: str
    timezone: str
    currency: str
    language: str

class PipelineStage(BaseModel):
    id: str
    name: str
    order: int
    color: str

class CustomField(BaseModel):
    id: str
    label: str
    type: str  # text, number, date, select
    module: str  # leads, contacts, deals

class Integration(BaseModel):
    id: str
    name: str
    status: str  # connected, disconnected
    connected_at: Optional[str] = None

class ApiKey(BaseModel):
    id: str
    name: str
    key_preview: str
    created_at: str
    last_used: Optional[str] = None
