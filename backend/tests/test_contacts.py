import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_contacts(client: AsyncClient, admin_headers: dict):
    """Test getting the list of contacts. Should return the initial seeded 10 contacts."""
    response = await client.get("/api/v1/contacts", headers=admin_headers)
    assert response.status_code == 200
    
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) == 10  # from our mock seed logic
    # Check shape
    assert "email" in data[0]
    assert "first_name" in data[0]
    assert "last_name" in data[0]

@pytest.mark.asyncio
async def test_create_contact_success(client: AsyncClient, admin_headers: dict):
    """Test creating a new contact."""
    new_contact = {
        "first_name": "Jane",
        "last_name": "Doe Test",
        "email": "jane@test.com",
        "phone": "+19998887777",
        "company": "Test Corp",
        "status": "active"
    }
    response = await client.post("/api/v1/contacts", json=new_contact, headers=admin_headers)
    assert response.status_code in [200, 201]
    
    created = response.json()["data"]
    assert "id" in created
    assert created["first_name"] == "Jane"
    assert created["last_name"] == "Doe Test"
    assert created["email"] == "jane@test.com"
    
@pytest.mark.asyncio
async def test_get_single_contact(client: AsyncClient, admin_headers: dict):
    """Test retrieving a specific contact by its ID."""
    # First get list to find a valid ID
    list_response = await client.get("/api/v1/contacts", headers=admin_headers)
    target_id = list_response.json()["data"][0]["id"]
    
    response = await client.get(f"/api/v1/contacts/{target_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["data"]["id"] == target_id
    
@pytest.mark.asyncio
async def test_get_contact_not_found(client: AsyncClient, admin_headers: dict):
    """Test retrieving a non-existent contact returns a 404."""
    response = await client.get("/api/v1/contacts/invalid-id-xyz", headers=admin_headers)
    assert response.status_code == 404
