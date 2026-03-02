"""Emails service \u2014 simulated backend for demo purposes."""

import uuid
from datetime import datetime, timedelta, timezone

# \u2500\u2500 In-memory stores \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

from typing import Any

_emails: dict[str, dict[str, Any]] = {}
_templates: dict[str, dict[str, Any]] = {}

def _seed_templates():
    default_templates = [
        {
            "name": "Introductory Follow-up",
            "subject": "Checking in - {{company}}",
            "body": "Hi {{first_name}},\n\nIt was great speaking with you recently. I'm following up to see if you had any thoughts on our previous discussion regarding {{company}}'s next steps.\n\nBest,\nYour Name"
        },
        {
            "name": "Meeting Request",
            "subject": "Scheduling a quick sync",
            "body": "Hi {{first_name}},\n\nDo you have 15 minutes next week to sync on the proposal? Let me know what time works best for you.\n\nBest,\nYour Name"
        },
        {
            "name": "Pricing Details",
            "subject": "Requested Pricing Information",
            "body": "Hi {{first_name}},\n\nAs requested, I've attached our updated pricing sheets for your review. Let me know if you have any questions.\n\nBest,\nYour Name"
        }
    ]
    for idx, t in enumerate(default_templates):
        tid = f"template-demo-00{idx+1}"
        _templates[tid] = {
            "id": tid,
            "name": t["name"],
            "subject": t["subject"],
            "body": t["body"]
        }

def _seed_emails():
    now = datetime.now(timezone.utc)
    team_id = "team-default-001"
    
    # 5 Received emails (Inbox)
    inbox_demos = [
        {"subject": "Re: Partnership Proposal", "from": "michael.chen@globalfin.com", "to": "admin@crm.com", "contact": "Michael Chen", "body": "Hi Admin,\n\nWe've reviewed the proposal and it looks great. Let's schedule a call to finalize the integration details next week.\n\nThanks,\nMichael", "days_ago": 1},
        {"subject": "Questions regarding SLA", "from": "sarah.j@techstart.io", "to": "admin@crm.com", "contact": "Sarah Johnson", "body": "Hello,\n\nCould you clarify Section 4.2 of the SLA regarding uptime guarantees? We need this cleared up before sign-off.\n\nBest,\nSarah", "days_ago": 2},
        {"subject": "Checking in", "from": "lisa.anderson@designhub.co", "to": "admin@crm.com", "contact": "Lisa Anderson", "body": "Just checking in to see if my account manager has been assigned yet. Thanks!", "days_ago": 3},
        {"subject": "Invoice Paid", "from": "billing@retailmax.com", "to": "admin@crm.com", "contact": "James Wilson", "body": "Receipt attached for your records. The payment for Invoice #14992 has cleared.", "days_ago": 4},
        {"subject": "Out of Office", "from": "alex.rivera@startupx.co", "to": "admin@crm.com", "contact": "Alex Rivera", "body": "I am currently out of the office and will return on Monday. For urgent matters, please contact my team.", "days_ago": 5},
    ]
    
    for d in inbox_demos:
        eid = str(uuid.uuid4())
        _emails[eid] = {
            "id": eid,
            "team_id": team_id,
            "from_email": d["from"],
            "to_email": d["to"],
            "contact_name": d["contact"],
            "subject": d["subject"],
            "body": d["body"],
            "status": "received",
            "folder": "inbox",
            "sent_at": (now - timedelta(days=int(d["days_ago"]))).isoformat(),
            "created_at": (now - timedelta(days=int(d["days_ago"]))).isoformat(),
        }

    # 5 Sent emails (Sent Folder)
    sent_demos = [
        {"subject": "Following up on Q3 Renewal", "from": "admin@crm.com", "to": "john.smith@acmecorp.com", "contact": "John Smith", "body": "Hi John, just floating this to the top of your inbox.", "days_ago": 0},
        {"subject": "Your updated contract", "from": "admin@crm.com", "to": "omar.h@buildfast.com", "contact": "Omar Hassan", "body": "Please find attached the revised agreement.", "days_ago": 1},
        {"subject": "Introduction", "from": "admin@crm.com", "to": "robert.taylor@healthplus.org", "contact": "Robert Taylor", "body": "Hi Robert, great meeting you yesterday. Let's connect next week.", "days_ago": 4},
        {"subject": "Welcome to the Platform!", "from": "admin@crm.com", "to": "newuser@example.com", "contact": None, "body": "We are thrilled to have you onboard.", "days_ago": 6},
        {"subject": "Pricing Info", "from": "admin@crm.com", "to": "info@prospect.com", "contact": None, "body": "Here are the customized pricing tiers we discussed.", "days_ago": 10},
    ]

    for d in sent_demos:
        eid = str(uuid.uuid4())
        _emails[eid] = {
            "id": eid,
            "team_id": team_id,
            "from_email": d["from"],
            "to_email": d["to"],
            "contact_name": d["contact"],
            "subject": d["subject"],
            "body": d["body"],
            "status": "sent",
            "folder": "sent",
            "sent_at": (now - timedelta(days=int(d["days_ago"]))).isoformat(),
            "created_at": (now - timedelta(days=int(d["days_ago"]))).isoformat(),
        }

_seed_templates()
_seed_emails()

# \u2500\u2500 Service Functions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

def list_emails(
    team_id: str,
    folder: str = "inbox",
    page: int = 1,
    limit: int = 50,
) -> tuple[list[dict], int]:
    results = [e for e in _emails.values() if e["team_id"] == team_id and e["folder"] == folder]
    results.sort(key=lambda x: x["sent_at"], reverse=True)
    
    total = len(results)
    start = (page - 1) * limit
    return results[start:start + limit], total

def get_email(email_id: str) -> dict | None:
    return _emails.get(email_id)

def send_email(data: dict, team_id: str, sender_email: str) -> dict:
    """Simulates sending an email by adding it to the sent folder."""
    eid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    email = {
        "id": eid,
        "team_id": team_id,
        "from_email": sender_email,
        "to_email": data["to_email"],
        "contact_name": data.get("contact_name"),
        "subject": data["subject"],
        "body": data["body"],
        "status": "sent",
        "folder": "sent",
        "sent_at": now,
        "created_at": now,
    }
    _emails[eid] = email
    return email

def list_templates() -> list[dict]:
    return list(_templates.values())
