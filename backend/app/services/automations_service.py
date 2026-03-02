import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.models.automations import (
    AutomationRuleCreate,
    AutomationRuleResponse,
    AutomationLogEntry,
)

# In-memory storage for rules and logs
_rules: Dict[str, dict] = {}
_logs: List[dict] = []

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def seed_automations(team_id: str):
    """Seed demo automations if empty."""
    if not _rules:
        # 1. Welcome Email
        rule1_id = str(uuid.uuid4())
        _rules[rule1_id] = {
            "id": rule1_id,
            "team_id": team_id,
            "name": "Send Welcome Email to New Leads",
            "description": "Automatically dispatch an introductory email when a lead is created.",
            "trigger_type": "lead_created",
            "conditions": [],
            "actions": [
                {
                    "type": "send_email",
                    "config": {"template_name": "Welcome to the Platform!", "to": "{{lead.email}}"}
                }
            ],
            "is_active": True,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }

        # 2. High Value Deal Alert
        rule2_id = str(uuid.uuid4())
        _rules[rule2_id] = {
            "id": rule2_id,
            "team_id": team_id,
            "name": "High Value Deal Alert",
            "description": "Create a task for the manager when a deal > $50k enters Negotiation.",
            "trigger_type": "deal_stage_changed",
            "conditions": [
                {"field": "stage", "operator": "equals", "value": "Negotiation"},
                {"field": "value", "operator": "greater_than", "value": 50000}
            ],
            "actions": [
                {
                    "type": "create_task",
                    "config": {"title": "Review High Value Deal", "priority": "high", "assignee": "manager"}
                }
            ],
            "is_active": True,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }

    if not _logs:
         # Seed some mock execution logs
         _logs.extend([
             {
                 "id": str(uuid.uuid4()),
                 "rule_id": rule1_id,
                 "rule_name": "Send Welcome Email to New Leads",
                 "trigger_event": "lead_created",
                 "status": "success",
                 "executed_at": _now_iso(),
                 "details": "Sent to newuser@example.com"
             },
             {
                 "id": str(uuid.uuid4()),
                 "rule_id": rule1_id,
                 "rule_name": "Send Welcome Email to New Leads",
                 "trigger_event": "lead_created",
                 "status": "success",
                 "executed_at": _now_iso(),
                 "details": "Sent to demo@example.com"
             },
             {
                 "id": str(uuid.uuid4()),
                 "rule_id": rule2_id,
                 "rule_name": "High Value Deal Alert",
                 "trigger_event": "deal_stage_changed",
                 "status": "failed",
                 "executed_at": _now_iso(),
                 "details": "Failed to create task: Assignee not found"
             }
         ])


def list_rules(team_id: str) -> List[AutomationRuleResponse]:
    seed_automations(team_id)
    return [AutomationRuleResponse(**r) for r in _rules.values() if r.get("team_id") == team_id]

def get_rule(team_id: str, rule_id: str) -> Optional[AutomationRuleResponse]:
    rule = _rules.get(rule_id)
    if rule and rule.get("team_id") == team_id:
        return AutomationRuleResponse(**rule)
    return None

def create_rule(team_id: str, rule_in: AutomationRuleCreate) -> AutomationRuleResponse:
    rule_id = str(uuid.uuid4())
    now = _now_iso()
    rule_dict = rule_in.model_dump()
    rule_dict.update({
        "id": rule_id,
        "team_id": team_id,
        "created_at": now,
        "updated_at": now
    })
    _rules[rule_id] = rule_dict
    return AutomationRuleResponse(**rule_dict)

def update_rule(team_id: str, rule_id: str, rule_in: AutomationRuleCreate) -> Optional[AutomationRuleResponse]:
    if rule_id not in _rules or _rules[rule_id].get("team_id") != team_id:
        return None
    
    rule_dict = _rules[rule_id]
    update_data = rule_in.model_dump()
    update_data["updated_at"] = _now_iso()
    
    for k, v in update_data.items():
        rule_dict[k] = v
        
    _rules[rule_id] = rule_dict
    return AutomationRuleResponse(**rule_dict)

def delete_rule(team_id: str, rule_id: str) -> bool:
    if rule_id in _rules and _rules[rule_id].get("team_id") == team_id:
        del _rules[rule_id]
        return True
    return False

def list_logs(team_id: str) -> List[AutomationLogEntry]:
    seed_automations(team_id)
    # Return sorted by executed_at desc
    sorted_logs = sorted(_logs, key=lambda x: x["executed_at"], reverse=True)
    return [AutomationLogEntry(**l) for l in sorted_logs]

def simulate_trigger_event(team_id: str, trigger_type: str, payload: dict):
    """
    Simulates the backend evaluating active rules against an incoming event.
    In reality, this would be an async background worker.
    """
    for rule in _rules.values():
        if rule.get("team_id") == team_id and rule.get("is_active") and rule.get("trigger_type") == trigger_type:
            # We would evaluate conditions here.
            # Mocking execution for demo purposes:
            
            _logs.append({
                "id": str(uuid.uuid4()),
                "rule_id": rule["id"],
                "rule_name": rule["name"],
                "trigger_event": trigger_type,
                "status": "success",
                "executed_at": _now_iso(),
                "details": f"Simulated execution. Evaluated {len(rule.get('conditions', []))} conditions."
            })
