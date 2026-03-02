import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success_admin(client: AsyncClient):
    """Test login with valid hardcoded admin credentials"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@crm.com",
        "password": "admin123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]
    assert data["data"]["user"]["role"] == "admin"

@pytest.mark.asyncio
async def test_login_success_sales(client: AsyncClient):
    """Test login with valid hardcoded sales credentials"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "manager@crm.com",
        "password": "manager123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["user"]["role"] == "sales_manager"

@pytest.mark.asyncio
async def test_login_failure_bad_password(client: AsyncClient):
    """Test login with an invalid password"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@crm.com",
        "password": "wrongpassword123"
    })
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_protected_route_without_token(client: AsyncClient):
    """Test accessing a protected route without an Authorization header blocks access"""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_route_with_valid_token(client: AsyncClient, admin_headers: dict):
    """Test accessing a protected route with a valid JWT token"""
    response = await client.get("/api/v1/auth/me", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "admin@crm.com"
