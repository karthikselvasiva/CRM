from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, contacts, leads, deals, tasks, emails, reports, automations, settings as settings_router
from app.middleware.error_handler import register_exception_handlers

app = FastAPI(
    title="CRM Platform API",
    description="Production-grade CRM API built with FastAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
register_exception_handlers(app)

# Mount routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(contacts.router, prefix="/api/v1/contacts", tags=["Contacts"])
app.include_router(leads.router, prefix="/api/v1/leads", tags=["Leads"])
app.include_router(deals.router, prefix="/api/v1/deals", tags=["Deals"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(emails.router, prefix="/api/v1/emails", tags=["Emails"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(automations.router, prefix="/api/v1/automations", tags=["Automations"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["Settings"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
