import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.auth_service import create_access_token

@pytest.fixture
async def client():
    # ASGITransport prevents the need to have a live uvicorn server running during tests
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def admin_token(client: AsyncClient) -> str:
    """Fixture to get a valid admin JWT token via login"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@crm.com",
        "password": "admin123"
    })
    return response.json()["data"]["access_token"]

@pytest.fixture
async def sales_token(client: AsyncClient) -> str:
    """Fixture to get a valid sales manager JWT token via login"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "manager@crm.com",
        "password": "manager123"
    })
    return response.json()["data"]["access_token"]

@pytest.fixture
async def admin_headers(admin_token) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture
async def sales_headers(sales_token) -> dict:
    return {"Authorization": f"Bearer {sales_token}"}
