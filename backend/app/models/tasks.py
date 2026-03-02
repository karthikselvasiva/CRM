from pydantic import BaseModel
from datetime import datetime


class TaskCreate(BaseModel):
    type: str = "to-do"  # call | email | meeting | to-do | follow-up
    title: str
    due_at: str | None = None
    priority: str = "medium"  # low | medium | high | urgent
    status: str = "pending"   # pending | in_progress | completed
    contact_name: str | None = None
    deal_name: str | None = None
    assigned_to: str | None = None
    notes: str | None = None
    is_recurring: bool = False
    recurrence_rule: str | None = None


class TaskUpdate(BaseModel):
    type: str | None = None
    title: str | None = None
    due_at: str | None = None
    priority: str | None = None
    status: str | None = None
    contact_name: str | None = None
    deal_name: str | None = None
    assigned_to: str | None = None
    notes: str | None = None
