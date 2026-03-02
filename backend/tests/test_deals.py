import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_deals(client: AsyncClient, admin_headers: dict):
    """Test listing all deals."""
    response = await client.get("/api/v1/deals", headers=admin_headers)
    assert response.status_code == 200
    
    data = response.json()["data"]
    assert isinstance(data, list)
    assert len(data) == 10  # our actual seed length
    assert "stage_id" in data[0]
    assert "value" in data[0]

@pytest.mark.asyncio
async def test_update_deal_stage(client: AsyncClient, admin_headers: dict):
    """Test changing a deal's stage via the PATCH endpoint (used by Kanban drag-and-drop)"""
    # Get a list to grab an ID
    list_response = await client.get("/api/v1/deals", headers=admin_headers)
    target_deal = list_response.json()["data"][0]
    deal_id = target_deal["id"]
    
    # Try moving to "Closed Won" (stage id usually maps sequentially if hardcoded, or dynamically. For this test just "stage_5")
    payload = {"stage_id": "stage_5"}
    patch_response = await client.patch(f"/api/v1/deals/{deal_id}/stage", json=payload, headers=admin_headers)
    
    assert patch_response.status_code == 200
    updated_deal = patch_response.json()["data"]
    
    assert updated_deal["id"] == deal_id
    assert updated_deal["stage_id"] == "stage_5"
