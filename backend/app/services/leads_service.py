"""Lead management service — CRUD with in-memory storage, scoring, and conversion.

Follows the same pattern as contacts_service.py.
"""

import uuid
from datetime import datetime, timezone


# ── In-memory leads store ──────────────────────────────────────────────────

_leads: dict[str, dict] = {}

# Lead statuses with workflow order
LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]


def _seed_demo_leads() -> None:
    """Seed 8 realistic demo leads."""
    demos = [
        {"name": "Alex Rivera", "email": "alex.r@startupx.io", "phone": "+1-555-0201", "company": "StartupX", "source": "website", "score": 85, "status": "qualified"},
        {"name": "Priya Sharma", "email": "priya@cloudnine.co", "phone": "+1-555-0202", "company": "CloudNine", "source": "linkedin", "score": 72, "status": "contacted"},
        {"name": "Marcus Johnson", "email": "marcus.j@bigretail.com", "phone": "+1-555-0203", "company": "BigRetail", "source": "referral", "score": 91, "status": "proposal"},
        {"name": "Yuki Tanaka", "email": "yuki@techwave.jp", "phone": "+1-555-0204", "company": "TechWave", "source": "conference", "score": 60, "status": "new"},
        {"name": "Sophie Martin", "email": "sophie.m@greenco.eu", "phone": "+1-555-0205", "company": "GreenCo", "source": "cold-call", "score": 45, "status": "contacted"},
        {"name": "Daniel Kim", "email": "d.kim@finserve.com", "phone": "+1-555-0206", "company": "FinServe", "source": "website", "score": 78, "status": "negotiation"},
        {"name": "Isabella Garcia", "email": "bella@mediapro.co", "phone": "+1-555-0207", "company": "MediaPro", "source": "referral", "score": 55, "status": "new"},
        {"name": "Omar Hassan", "email": "omar.h@buildfast.io", "phone": "+1-555-0208", "company": "BuildFast", "source": "linkedin", "score": 88, "status": "qualified"},
    ]
    team_id = "team-default-001"
    owner_id = "system"
    for d in demos:
        lid = str(uuid.uuid4())
        _leads[lid] = {
            "id": lid,
            "team_id": team_id,
            "owner_id": owner_id,
            "name": d["name"],
            "email": d["email"],
            "phone": d["phone"],
            "company": d["company"],
            "source": d["source"],
            "score": d["score"],
            "status": d["status"],
            "converted_contact_id": None,
            "converted_deal_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "deleted": False,
        }


_seed_demo_leads()


# ── CRUD Operations ────────────────────────────────────────────────────────

def list_leads(
    team_id: str,
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    status: str | None = None,
    source: str | None = None,
    owner_id: str | None = None,
) -> tuple[list[dict], int]:
    """List leads with filters. Returns (items, total)."""
    results = [l for l in _leads.values() if not l["deleted"]]

    if search:
        q = search.lower()
        results = [
            l for l in results
            if q in l["name"].lower()
            or q in (l.get("email") or "").lower()
            or q in (l.get("company") or "").lower()
        ]

    if status:
        results = [l for l in results if l["status"] == status]

    if source:
        results = [l for l in results if l["source"] == source]

    if owner_id:
        results = [l for l in results if l["owner_id"] == owner_id]

    # Sort by score descending (hottest leads first)
    results.sort(key=lambda l: l["score"], reverse=True)

    total = len(results)
    start = (page - 1) * limit
    return results[start:start + limit], total


def get_lead(lead_id: str) -> dict | None:
    l = _leads.get(lead_id)
    if l and not l["deleted"]:
        return l
    return None


def create_lead(data: dict, team_id: str, owner_id: str) -> dict:
    lid = str(uuid.uuid4())
    lead = {
        "id": lid,
        "team_id": team_id,
        "owner_id": owner_id,
        "name": data["name"],
        "email": data.get("email"),
        "phone": data.get("phone"),
        "company": data.get("company"),
        "source": data.get("source"),
        "score": data.get("score", 50),
        "status": data.get("status", "new"),
        "converted_contact_id": None,
        "converted_deal_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "deleted": False,
    }
    _leads[lid] = lead
    return lead


def update_lead(lead_id: str, data: dict) -> dict | None:
    lead = get_lead(lead_id)
    if not lead:
        return None
    for key in ["name", "email", "phone", "company", "source", "score", "status"]:
        if key in data and data[key] is not None:
            lead[key] = data[key]
    return lead


def delete_lead(lead_id: str) -> bool:
    lead = _leads.get(lead_id)
    if not lead or lead["deleted"]:
        return False
    lead["deleted"] = True
    return True


def convert_lead(lead_id: str, owner_id: str) -> dict | None:
    """Convert a lead into a contact + deal. Returns conversion result."""
    from app.services.contacts_service import create_contact

    lead = get_lead(lead_id)
    if not lead:
        return None
    if lead["converted_contact_id"]:
        return None  # already converted

    # Create a contact from the lead
    name_parts = lead["name"].split(" ", 1)
    contact_data = {
        "first_name": name_parts[0],
        "last_name": name_parts[1] if len(name_parts) > 1 else "",
        "email": lead.get("email"),
        "phone": lead.get("phone"),
        "company": lead.get("company"),
        "status": "active",
        "tags": ["converted-lead"],
        "source": lead.get("source"),
    }
    contact = create_contact(contact_data, team_id=lead["team_id"], owner_id=owner_id)

    # Mark lead as converted
    lead["status"] = "won"
    lead["converted_contact_id"] = contact["id"]

    return {
        "lead_id": lead["id"],
        "contact_id": contact["id"],
        "contact_name": f"{contact['first_name']} {contact['last_name']}",
    }


def lead_to_response(lead: dict) -> dict:
    """Strip internal fields."""
    return {k: v for k, v in lead.items() if k != "deleted"}
