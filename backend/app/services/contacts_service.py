"""Contact management service — CRUD with in-memory storage.

Provides create, read, update, delete, search, and CSV import for contacts.
"""

import uuid
import csv
import io
from datetime import datetime, timezone


# ── In-memory contacts store ───────────────────────────────────────────────

_contacts: dict[str, dict] = {}


def _seed_demo_contacts() -> None:
    """Seed 10 realistic demo contacts."""
    demos = [
        {"first_name": "John", "last_name": "Smith", "email": "john.smith@acme.com", "phone": "+1-555-0101", "company": "Acme Corp", "status": "active", "tags": ["enterprise", "hot-lead"], "source": "website"},
        {"first_name": "Sarah", "last_name": "Johnson", "email": "sarah.j@techstart.io", "phone": "+1-555-0102", "company": "TechStart", "status": "active", "tags": ["startup", "demo-scheduled"], "source": "referral"},
        {"first_name": "Michael", "last_name": "Chen", "email": "m.chen@globalfin.com", "phone": "+1-555-0103", "company": "Global Finance", "status": "active", "tags": ["enterprise", "decision-maker"], "source": "linkedin"},
        {"first_name": "Emily", "last_name": "Davis", "email": "emily.d@brightedu.org", "phone": "+1-555-0104", "company": "Bright Education", "status": "inactive", "tags": ["education", "follow-up"], "source": "conference"},
        {"first_name": "James", "last_name": "Wilson", "email": "jwilson@retailmax.com", "phone": "+1-555-0105", "company": "RetailMax", "status": "active", "tags": ["retail", "hot-lead"], "source": "cold-call"},
        {"first_name": "Lisa", "last_name": "Anderson", "email": "lisa@designhub.co", "phone": "+1-555-0106", "company": "DesignHub", "status": "active", "tags": ["agency", "proposal-sent"], "source": "website"},
        {"first_name": "Robert", "last_name": "Taylor", "email": "r.taylor@healthplus.com", "phone": "+1-555-0107", "company": "HealthPlus", "status": "active", "tags": ["healthcare", "enterprise"], "source": "referral"},
        {"first_name": "Amanda", "last_name": "Martinez", "email": "amanda.m@foodchain.io", "phone": "+1-555-0108", "company": "FoodChain", "status": "lead", "tags": ["food-tech", "new"], "source": "website"},
        {"first_name": "David", "last_name": "Lee", "email": "david.lee@automate.ai", "phone": "+1-555-0109", "company": "Automate AI", "status": "active", "tags": ["ai", "startup", "hot-lead"], "source": "linkedin"},
        {"first_name": "Jennifer", "last_name": "Brown", "email": "j.brown@lawgroup.com", "phone": "+1-555-0110", "company": "Brown Law Group", "status": "inactive", "tags": ["legal", "churned"], "source": "referral"},
    ]
    team_id = "team-default-001"
    owner_id = "system"
    for d in demos:
        cid = str(uuid.uuid4())
        _contacts[cid] = {
            "id": cid,
            "team_id": team_id,
            "owner_id": owner_id,
            "first_name": d["first_name"],
            "last_name": d["last_name"],
            "email": d["email"],
            "phone": d["phone"],
            "company": d["company"],
            "status": d["status"],
            "tags": d["tags"],
            "source": d["source"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "deleted": False,
        }


_seed_demo_contacts()


# ── CRUD Operations ────────────────────────────────────────────────────────

def list_contacts(
    team_id: str,
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    tag: str | None = None,
    status: str | None = None,
    owner_id: str | None = None,
) -> tuple[list[dict], int]:
    """List contacts with filters. Returns (items, total_count)."""
    results = [c for c in _contacts.values() if not c["deleted"]]

    # Filter by search (name or email)
    if search:
        q = search.lower()
        results = [
            c for c in results
            if q in c["first_name"].lower()
            or q in c["last_name"].lower()
            or q in (c.get("email") or "").lower()
            or q in (c.get("company") or "").lower()
        ]

    # Filter by tag
    if tag:
        results = [c for c in results if tag in c.get("tags", [])]

    # Filter by status
    if status:
        results = [c for c in results if c["status"] == status]

    # Filter by owner
    if owner_id:
        results = [c for c in results if c["owner_id"] == owner_id]

    # Sort by created_at descending
    results.sort(key=lambda c: c["created_at"], reverse=True)

    total = len(results)
    start = (page - 1) * limit
    return results[start:start + limit], total


def get_contact(contact_id: str) -> dict | None:
    c = _contacts.get(contact_id)
    if c and not c["deleted"]:
        return c
    return None


def create_contact(data: dict, team_id: str, owner_id: str) -> dict:
    cid = str(uuid.uuid4())
    contact = {
        "id": cid,
        "team_id": team_id,
        "owner_id": owner_id,
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data.get("email"),
        "phone": data.get("phone"),
        "company": data.get("company"),
        "status": data.get("status", "active"),
        "tags": data.get("tags", []),
        "source": data.get("source"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "deleted": False,
    }
    _contacts[cid] = contact
    return contact


def update_contact(contact_id: str, data: dict) -> dict | None:
    contact = get_contact(contact_id)
    if not contact:
        return None
    for key in ["first_name", "last_name", "email", "phone", "company", "status", "tags", "source"]:
        if key in data and data[key] is not None:
            contact[key] = data[key]
    return contact


def delete_contact(contact_id: str) -> bool:
    contact = _contacts.get(contact_id)
    if not contact or contact["deleted"]:
        return False
    contact["deleted"] = True
    return True


def import_contacts_csv(csv_content: str, team_id: str, owner_id: str) -> list[dict]:
    """Parse CSV and create contacts. Returns created contacts."""
    reader = csv.DictReader(io.StringIO(csv_content))
    created = []
    for row in reader:
        data = {
            "first_name": row.get("first_name", row.get("First Name", "")),
            "last_name": row.get("last_name", row.get("Last Name", "")),
            "email": row.get("email", row.get("Email", "")),
            "phone": row.get("phone", row.get("Phone", "")),
            "company": row.get("company", row.get("Company", "")),
            "status": "active",
            "tags": [],
            "source": "csv-import",
        }
        if data["first_name"] and data["last_name"]:
            contact = create_contact(data, team_id, owner_id)
            created.append(contact)
    return created


def contact_to_response(contact: dict) -> dict:
    """Strip internal fields."""
    return {k: v for k, v in contact.items() if k != "deleted"}
