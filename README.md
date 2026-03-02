# CRM Platform

A production-grade CRM platform built with React (Vite + TypeScript), FastAPI (Python), and Supabase.

## Quick Start

### Prerequisites
- Node.js 20 LTS
- Python 3.12+
- Docker (for Supabase local dev)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd CRM

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev          # → http://localhost:5173

# Backend (new terminal)
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload  # → http://localhost:8000/docs

# Database
supabase start
supabase db push
python scripts/seed_dev.py
```

### Architecture
```
frontend/    → React (Vite + TypeScript + Tailwind CSS)
backend/     → Python FastAPI + Pydantic
supabase/    → Database migrations + RLS policies
```

### Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Router v6, Recharts |
| Backend | Python, FastAPI, Pydantic v2, Uvicorn |
| Database | Supabase (PostgreSQL), Row Level Security |
| Auth | Supabase Auth (JWT), Google OAuth, Magic Link |
| Icons | Lucide React |

### Project Modules
1. Authentication & User Management
2. Contact Management
3. Lead Management
4. Sales Pipeline & Deal Management
5. Task & Activity Management
6. Email & Communication Center
7. Analytics & Reporting Dashboard
8. Notifications & Automation
9. Settings & Configuration
