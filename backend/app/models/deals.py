from pydantic import BaseModel
from datetime import datetime


class DealCreate(BaseModel):
    pipeline_id: str | None = None
    stage_id: str
    contact_name: str | None = None
    company_name: str | None = None
    name: str
    value: float = 0
    currency: str = "USD"
    close_date: str | None = None
    probability: int = 0


class DealUpdate(BaseModel):
    name: str | None = None
    value: float | None = None
    currency: str | None = None
    close_date: str | None = None
    probability: int | None = None
    contact_name: str | None = None
    company_name: str | None = None


class DealStageUpdate(BaseModel):
    stage_id: str


class DealCloseRequest(BaseModel):
    status: str  # "won" or "lost"
    lost_reason: str | None = None
