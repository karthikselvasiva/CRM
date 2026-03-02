"""Deals service — Kanban pipeline with in-memory storage."""

import uuid
from datetime import datetime, timezone

# ── Global Pipeline Definitions ────────────────────────────────────────────

PIPELINE_ID = "pipe-standard-001"
STAGES = [
    {"id": "stage-lead", "name": "Lead", "order": 1, "color": "blue"},
    {"id": "stage-contact", "name": "Contact Made", "order": 2, "color": "indigo"},
    {"id": "stage-proposal", "name": "Proposal Sent", "order": 3, "color": "purple"},
    {"id": "stage-negotiation", "name": "Negotiation", "order": 4, "color": "orange"},
    {"id": "stage-won", "name": "Closed Won", "order": 5, "color": "green"},
    {"id": "stage-lost", "name": "Closed Lost", "order": 6, "color": "red"},
]

# ── In-memory deals store ──────────────────────────────────────────────────

_deals: dict[str, dict] = {}


def _seed_demo_deals() -> None:
    """Seed realistic demo deals across pipeline stages."""
    demos = [
        {"name": "TechStart Enterprise License", "value": 25000, "stage": "stage-lead", "prob": 10, "company": "TechStart", "contact": "Sarah Johnson"},
        {"name": "Acme Corp Q3 Renewal", "value": 15000, "stage": "stage-lead", "prob": 20, "company": "Acme Corp", "contact": "John Smith"},
        {"name": "DesignHub Standard Tier", "value": 5000, "stage": "stage-contact", "prob": 30, "company": "DesignHub", "contact": "Lisa Anderson"},
        {"name": "Global Fin Custom Integration", "value": 120000, "stage": "stage-proposal", "prob": 50, "company": "Global Finance", "contact": "Michael Chen"},
        {"name": "RetailMax Multi-site Rollout", "value": 45000, "stage": "stage-negotiation", "prob": 75, "company": "RetailMax", "contact": "James Wilson"},
        {"name": "StartupX Pro Plan", "value": 8000, "stage": "stage-won", "prob": 100, "company": "StartupX", "contact": "Alex Rivera"},
        {"name": "HealthPlus Compliance Module", "value": 35000, "stage": "stage-lost", "prob": 0, "company": "HealthPlus", "contact": "Robert Taylor"},
        {"name": "CloudNine SaaS Migration", "value": 60000, "stage": "stage-proposal", "prob": 60, "company": "CloudNine", "contact": "Priya Sharma"},
        {"name": "BuildFast Partner Program", "value": 12000, "stage": "stage-contact", "prob": 40, "company": "BuildFast", "contact": "Omar Hassan"},
        {"name": "TechWave APAC License", "value": 85000, "stage": "stage-negotiation", "prob": 80, "company": "TechWave", "contact": "Yuki Tanaka"},
    ]
    
    team_id = "team-default-001"
    owner_id = "system"
    
    for d in demos:
        did = str(uuid.uuid4())
        _deals[did] = {
            "id": did,
            "team_id": team_id,
            "pipeline_id": PIPELINE_ID,
            "stage_id": d["stage"],
            "owner_id": owner_id,
            "contact_name": d["contact"],
            "company_name": d["company"],
            "name": d["name"],
            "value": d["value"],
            "currency": "USD",
            "close_date": None,
            "probability": d["prob"],
            "status": "won" if d["stage"] == "stage-won" else "lost" if d["stage"] == "stage-lost" else "open",
            "lost_reason": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "deleted": False,
        }

_seed_demo_deals()


# ── Config Operations ──────────────────────────────────────────────────────

def get_pipelines() -> list[dict]:
    return [{"id": PIPELINE_ID, "name": "Standard Sales Pipeline", "is_default": True}]


def get_stages(pipeline_id: str) -> list[dict]:
    return STAGES if pipeline_id == PIPELINE_ID else []


# ── CRUD Operations ────────────────────────────────────────────────────────

def list_deals(
    team_id: str,
    page: int = 1,
    limit: int = 100,  # Deals usually need higher limits for board view
    pipeline_id: str | None = None,
    stage_id: str | None = None,
    status: str | None = None,
    owner_id: str | None = None,
) -> tuple[list[dict], int]:
    """List deals with filters. Returns (items, total)."""
    results = [d for d in _deals.values() if not d["deleted"]]

    if pipeline_id:
        results = [d for d in results if d["pipeline_id"] == pipeline_id]
    if stage_id:
        results = [d for d in results if d["stage_id"] == stage_id]
    if status:
        results = [d for d in results if d["status"] == status]
    if owner_id:
        results = [d for d in results if d["owner_id"] == owner_id]

    results.sort(key=lambda d: d["created_at"], reverse=True)

    total = len(results)
    start = (page - 1) * limit
    return results[start:start + limit], total


def get_deal(deal_id: str) -> dict | None:
    d = _deals.get(deal_id)
    if d and not d["deleted"]:
        return d
    return None


def create_deal(data: dict, team_id: str, owner_id: str) -> dict:
    did = str(uuid.uuid4())
    
    # Auto-set status based on stage
    stage_id = data.get("stage_id")
    status = "open"
    if stage_id == "stage-won":
        status = "won"
    elif stage_id == "stage-lost":
        status = "lost"

    deal = {
        "id": did,
        "team_id": team_id,
        "pipeline_id": data.get("pipeline_id", PIPELINE_ID),
        "stage_id": stage_id,
        "owner_id": owner_id,
        "contact_name": data.get("contact_name"),
        "company_name": data.get("company_name"),
        "name": data["name"],
        "value": data.get("value", 0),
        "currency": data.get("currency", "USD"),
        "close_date": data.get("close_date"),
        "probability": data.get("probability", 0),
        "status": status,
        "lost_reason": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "deleted": False,
    }
    _deals[did] = deal
    return deal


def update_deal(deal_id: str, data: dict) -> dict | None:
    deal = get_deal(deal_id)
    if not deal:
        return None
        
    for key in ["name", "value", "currency", "close_date", "probability", "contact_name", "company_name"]:
        if key in data and data[key] is not None:
            deal[key] = data[key]
            
    return deal


def update_deal_stage(deal_id: str, stage_id: str) -> dict | None:
    deal = get_deal(deal_id)
    if not deal:
        return None
        
    deal["stage_id"] = stage_id
    
    # Auto-update status and probability for terminal stages
    if stage_id == "stage-won":
        deal["status"] = "won"
        deal["probability"] = 100
    elif stage_id == "stage-lost":
        deal["status"] = "lost"
        deal["probability"] = 0
    else:
        deal["status"] = "open"
        
    return deal


def close_deal(deal_id: str, status: str, lost_reason: str | None = None) -> dict | None:
    deal = get_deal(deal_id)
    if not deal:
        return None
        
    deal["status"] = status
    if status == "won":
        deal["stage_id"] = "stage-won"
        deal["probability"] = 100
        deal["lost_reason"] = None
    elif status == "lost":
        deal["stage_id"] = "stage-lost"
        deal["probability"] = 0
        deal["lost_reason"] = lost_reason
        
    return deal


def deal_to_response(deal: dict) -> dict:
    """Strip internal fields."""
    return {k: v for k, v in deal.items() if k != "deleted"}
