import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_company_profile(client: AsyncClient, admin_headers: dict):
    """Test retrieving the company profile returns 200 and correct shape."""
    response = await client.get("/api/v1/settings/profile", headers=admin_headers)
    assert response.status_code == 200
    
    data = response.json()["data"]
    assert "name" in data
    assert "timezone" in data
    assert data["name"] == "Acme Corp" # The initialized seed

@pytest.mark.asyncio
async def test_update_company_profile_admin_only(client: AsyncClient, admin_headers: dict):
    """Test that an admin can update the company profile."""
    update_payload = {
        "name": "Wayne Enterprises",
        "timezone": "America/New_York",
        "currency": "USD",
        "language": "en"
    }
    response = await client.patch("/api/v1/settings/profile", json=update_payload, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "Wayne Enterprises"

@pytest.mark.asyncio
async def test_update_company_profile_rejects_sales(client: AsyncClient, sales_headers: dict):
    """Test that a sales_manager cannot update the company profile."""
    update_payload = {
        "name": "Hacked Corp",
        "timezone": "UTC",
        "currency": "USD",
        "language": "en"
    }
    response = await client.patch("/api/v1/settings/profile", json=update_payload, headers=sales_headers)
    assert response.status_code == 403
    assert "is not authorized for this action" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_api_keys_admin_only(client: AsyncClient, admin_headers: dict, sales_headers: dict):
    """Test that only admins can view API Keys."""
    
    # 1. Sales should be blocked
    sales_resp = await client.get("/api/v1/settings/api-keys", headers=sales_headers)
    assert sales_resp.status_code == 403
    
    # 2. Admin should succeed
    admin_resp = await client.get("/api/v1/settings/api-keys", headers=admin_headers)
    assert admin_resp.status_code == 200
    assert isinstance(admin_resp.json()["data"], list)
