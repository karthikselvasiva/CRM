import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict

from app.models.settings import (
    CompanyProfile,
    PipelineStage,
    CustomField,
    Integration,
    ApiKey
)

# In-memory storage for settings (keyed by team_id)
_company_profiles: Dict[str, dict] = {}
_pipeline_stages: Dict[str, List[dict]] = {}
_custom_fields: Dict[str, List[dict]] = {}
_integrations: Dict[str, List[dict]] = {}
_api_keys: Dict[str, List[dict]] = {}

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def seed_settings(team_id: str):
    """Seed default settings if they don't exist for the team."""
    if team_id not in _company_profiles:
        _company_profiles[team_id] = {
            "name": "Acme Corp",
            "timezone": "America/New_York",
            "currency": "USD",
            "language": "en"
        }
    
    if team_id not in _pipeline_stages:
        _pipeline_stages[team_id] = [
            {"id": str(uuid.uuid4()), "name": "Lead", "order": 1, "color": "#9ca3af"},
            {"id": str(uuid.uuid4()), "name": "Contact Made", "order": 2, "color": "#3b82f6"},
            {"id": str(uuid.uuid4()), "name": "Proposal", "order": 3, "color": "#8b5cf6"},
            {"id": str(uuid.uuid4()), "name": "Negotiation", "order": 4, "color": "#f59e0b"},
            {"id": str(uuid.uuid4()), "name": "Closed Won", "order": 5, "color": "#10b981"},
            {"id": str(uuid.uuid4()), "name": "Closed Lost", "order": 6, "color": "#ef4444"},
        ]
        
    if team_id not in _custom_fields:
        _custom_fields[team_id] = [
            {"id": str(uuid.uuid4()), "label": "Industry", "type": "select", "module": "leads"},
            {"id": str(uuid.uuid4()), "label": "Expected Close Date", "type": "date", "module": "deals"}
        ]
        
    if team_id not in _integrations:
        _integrations[team_id] = [
            {"id": "slack", "name": "Slack", "status": "connected", "connected_at": _now_iso()},
            {"id": "gcal", "name": "Google Calendar", "status": "disconnected", "connected_at": None},
            {"id": "mailchimp", "name": "Mailchimp", "status": "disconnected", "connected_at": None}
        ]
        
    if team_id not in _api_keys:
        _api_keys[team_id] = [
            {"id": str(uuid.uuid4()), "name": "Zapier Sync", "key_preview": "sk_live_...a8f4", "created_at": _now_iso(), "last_used": _now_iso()}
        ]

# --- Company Profile ---
def get_company_profile(team_id: str) -> CompanyProfile:
    seed_settings(team_id)
    return CompanyProfile(**_company_profiles[team_id])

def update_company_profile(team_id: str, profile: CompanyProfile) -> CompanyProfile:
    seed_settings(team_id)
    _company_profiles[team_id] = profile.model_dump()
    return profile

# --- Pipeline Stages ---
def list_pipeline_stages(team_id: str) -> List[PipelineStage]:
    seed_settings(team_id)
    return [PipelineStage(**s) for s in _pipeline_stages[team_id]]

# --- Custom Fields ---
def list_custom_fields(team_id: str) -> List[CustomField]:
    seed_settings(team_id)
    return [CustomField(**f) for f in _custom_fields[team_id]]

# --- Integrations ---
def list_integrations(team_id: str) -> List[Integration]:
    seed_settings(team_id)
    return [Integration(**i) for i in _integrations[team_id]]

def toggle_integration(team_id: str, integration_id: str) -> Optional[Integration]:
    seed_settings(team_id)
    for integration in _integrations[team_id]:
        if integration["id"] == integration_id:
            if integration["status"] == "connected":
                integration["status"] = "disconnected"
                integration["connected_at"] = None
            else:
                integration["status"] = "connected"
                integration["connected_at"] = _now_iso()
            return Integration(**integration)
    return None

# --- API Keys ---
def list_api_keys(team_id: str) -> List[ApiKey]:
    seed_settings(team_id)
    return [ApiKey(**k) for k in _api_keys[team_id]]

def create_api_key(team_id: str, name: str) -> ApiKey:
    seed_settings(team_id)
    new_key = {
        "id": str(uuid.uuid4()),
        "name": name,
        "key_preview": f"sk_live_...{str(uuid.uuid4())[:4]}",
        "created_at": _now_iso(),
        "last_used": None
    }
    _api_keys[team_id].append(new_key)
    return ApiKey(**new_key)

def revoke_api_key(team_id: str, key_id: str) -> bool:
    seed_settings(team_id)
    initial_length = len(_api_keys[team_id])
    _api_keys[team_id] = [k for k in _api_keys[team_id] if k["id"] != key_id]
    return len(_api_keys[team_id]) < initial_length
