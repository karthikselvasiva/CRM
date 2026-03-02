from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class AutomationCondition(BaseModel):
    field: str # e.g., 'status', 'score', 'value'
    operator: str # e.g., 'equals', 'greater_than', 'less_than'
    value: Any

class AutomationAction(BaseModel):
    type: str # e.g., 'send_email', 'create_task', 'update_field'
    config: Dict[str, Any] # e.g., {"template_id": "welcome", "to": "{{lead.email}}"}

class AutomationRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str # e.g., 'lead_created', 'deal_won', 'task_overdue'
    conditions: List[AutomationCondition] = []
    actions: List[AutomationAction]
    is_active: bool = True

class AutomationRuleResponse(AutomationRuleCreate):
    id: str
    created_at: str
    updated_at: str

class AutomationLogEntry(BaseModel):
    id: str
    rule_id: str
    rule_name: str
    trigger_event: str
    status: str # 'success', 'failed', 'pending'
    executed_at: str
    details: Optional[str] = None
