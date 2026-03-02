from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.middleware.auth import get_current_user, TokenPayload
from app.models.common import success_response, error_response
from app.models.automations import AutomationRuleCreate, AutomationRuleResponse, AutomationLogEntry
from app.services import automations_service

router = APIRouter()

@router.get("/rules", response_model=dict)
async def list_rules(user: TokenPayload = Depends(get_current_user)):
    """List all automation rules."""
    rules = automations_service.list_rules(team_id=user.team_id)
    return success_response(data=rules)

@router.get("/rules/{rule_id}", response_model=dict)
async def get_rule(rule_id: str, user: TokenPayload = Depends(get_current_user)):
    """Get a specific automation rule."""
    rule = automations_service.get_rule(team_id=user.team_id, rule_id=rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    return success_response(data=rule)

@router.post("/rules", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_rule(
    rule_in: AutomationRuleCreate,
    user: TokenPayload = Depends(get_current_user),
):
    """Create a new automation rule."""
    rule = automations_service.create_rule(team_id=user.team_id, rule_in=rule_in)
    return success_response(data=rule)

@router.put("/rules/{rule_id}", response_model=dict)
async def update_rule(
    rule_id: str,
    rule_in: AutomationRuleCreate,
    user: TokenPayload = Depends(get_current_user),
):
    """Update an existing automation rule."""
    rule = automations_service.update_rule(team_id=user.team_id, rule_id=rule_id, rule_in=rule_in)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    return success_response(data=rule)

@router.delete("/rules/{rule_id}", response_model=dict)
async def delete_rule(rule_id: str, user: TokenPayload = Depends(get_current_user)):
    """Delete an automation rule."""
    success = automations_service.delete_rule(team_id=user.team_id, rule_id=rule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    return success_response(message="Rule deleted successfully")

@router.get("/logs", response_model=dict)
async def list_logs(user: TokenPayload = Depends(get_current_user)):
    """List automation execution logs."""
    logs = automations_service.list_logs(team_id=user.team_id)
    return success_response(data=logs)
