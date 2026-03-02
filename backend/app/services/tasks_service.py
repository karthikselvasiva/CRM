"""Tasks service — in-memory storage for activities and to-dos."""

import uuid
from datetime import datetime, timedelta, timezone

# ── In-memory tasks store ──────────────────────────────────────────────────

_tasks: dict[str, dict] = {}


def _seed_demo_tasks() -> None:
    """Seed demo tasks for the CRM."""
    now = datetime.now(timezone.utc)
    team_id = "team-default-001"
    owner_id = "system"

    demos = [
        {"title": "Follow up on Enterprise proposal", "type": "call", "priority": "high", "status": "pending", "contact": "Michael Chen", "deal": "Global Fin Custom Integration", "due_days": 0},
        {"title": "Send Q3 product roadmap", "type": "email", "priority": "medium", "status": "pending", "contact": "Sarah Johnson", "deal": "TechStart Enterprise License", "due_days": 1},
        {"title": "Weekly pipeline review", "type": "meeting", "priority": "high", "status": "pending", "contact": None, "deal": None, "due_days": 0},
        {"title": "Prepare slide deck for RetailMax", "type": "to-do", "priority": "urgent", "status": "in_progress", "contact": "James Wilson", "deal": "RetailMax Multi-site Rollout", "due_days": -1},
        {"title": "Check in on pilot program", "type": "follow-up", "priority": "low", "status": "pending", "contact": "Lisa Anderson", "deal": "DesignHub Standard Tier", "due_days": 3},
        {"title": "Draft contract terms", "type": "to-do", "priority": "high", "status": "completed", "contact": "Alex Rivera", "deal": "StartupX Pro Plan", "due_days": -2},
        {"title": "Initial discovery call", "type": "call", "priority": "medium", "status": "completed", "contact": "John Smith", "deal": "Acme Corp Q3 Renewal", "due_days": -5},
        {"title": "Send partnership agreement", "type": "email", "priority": "medium", "status": "pending", "contact": "Omar Hassan", "deal": "BuildFast Partner Program", "due_days": 2},
        {"title": "Sync with legal on compliance", "type": "meeting", "priority": "high", "status": "pending", "contact": "Robert Taylor", "deal": "HealthPlus Compliance Module", "due_days": 1},
        {"title": "Update pricing sheet", "type": "to-do", "priority": "low", "status": "completed", "contact": None, "deal": None, "due_days": -10},
    ]

    for d in demos:
        tid = str(uuid.uuid4())
        due_at = (now + timedelta(days=d["due_days"])).isoformat() if d["due_days"] is not None else None
        
        _tasks[tid] = {
            "id": tid,
            "team_id": team_id,
            "created_by": owner_id,
            "assigned_to": owner_id,
            "type": d["type"],
            "title": d["title"],
            "due_at": due_at,
            "priority": d["priority"],
            "status": d["status"],
            "contact_name": d["contact"],
            "deal_name": d["deal"],
            "notes": None,
            "is_recurring": False,
            "recurrence_rule": None,
            "created_at": now.isoformat(),
            "deleted": False,
        }

_seed_demo_tasks()


# ── CRUD Operations ────────────────────────────────────────────────────────

def list_tasks(
    team_id: str,
    page: int = 1,
    limit: int = 100,
    status: str | None = None,
    priority: str | None = None,
    task_type: str | None = None,
    assigned_to: str | None = None,
) -> tuple[list[dict], int]:
    """List tasks with filters. Returns (items, total)."""
    results = [t for t in _tasks.values() if not t["deleted"]]

    if status:
        results = [t for t in results if t["status"] == status]
    if priority:
        results = [t for t in results if t["priority"] == priority]
    if task_type:
        results = [t for t in results if t["type"] == task_type]
    if assigned_to:
        results = [t for t in results if t["assigned_to"] == assigned_to]

    # Sort logic: Pending/In Progress first, then completed. Secondary sort by due date.
    def sort_key(t):
        status_weight = 0 if t["status"] != "completed" else 1
        # Use a far future date if due_at is None to put them at the end
        date_str = t["due_at"] or "9999-12-31T00:00:00"
        return (status_weight, date_str)

    results.sort(key=sort_key)

    total = len(results)
    start = (page - 1) * limit
    return results[start:start + limit], total


def get_task(task_id: str) -> dict | None:
    t = _tasks.get(task_id)
    if t and not t["deleted"]:
        return t
    return None


def create_task(data: dict, team_id: str, user_id: str) -> dict:
    tid = str(uuid.uuid4())
    
    task = {
        "id": tid,
        "team_id": team_id,
        "created_by": user_id,
        "assigned_to": data.get("assigned_to", user_id),
        "type": data.get("type", "to-do"),
        "title": data["title"],
        "due_at": data.get("due_at"),
        "priority": data.get("priority", "medium"),
        "status": data.get("status", "pending"),
        "contact_name": data.get("contact_name"),
        "deal_name": data.get("deal_name"),
        "notes": data.get("notes"),
        "is_recurring": data.get("is_recurring", False),
        "recurrence_rule": data.get("recurrence_rule"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "deleted": False,
    }
    _tasks[tid] = task
    return task


def update_task(task_id: str, data: dict) -> dict | None:
    task = get_task(task_id)
    if not task:
        return None
        
    for key in ["title", "type", "due_at", "priority", "status", "contact_name", "deal_name", "notes", "assigned_to"]:
        if key in data and data[key] is not None:
            task[key] = data[key]
            
    return task


def delete_task(task_id: str) -> bool:
    task = get_task(task_id)
    if not task:
        return False
        
    task["deleted"] = True
    return True


def task_to_response(task: dict) -> dict:
    """Strip internal fields."""
    return {k: v for k, v in task.items() if k != "deleted"}
