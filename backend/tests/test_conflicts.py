import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph.client import graph_service
from app.seed_data import seed_baseline_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_fresh_graph():
    """Reset and seed the baseline graph before each test."""
    seed_baseline_data()

def test_1_genuine_contract_conflict():
    """
    Test Case 1: Genuine contract conflict
    Baseline has POST /api/auth/login returning 'access_token'.
    New handoff submits POST /api/auth/login returning 'token'.
    Must flag conflict, present evidence, affected modules, and recommendation.
    """
    conflicting_payload = {
        "title": "Auth Endpoint Token Renaming",
        "author_name": "Claude Assistant",
        "source_tool": "Claude",
        "completed_work": "Updated auth response object to return 'token' instead of 'access_token'.",
        "affected_modules": ["auth_service", "frontend_web"],
        "api_contracts": [
            {
                "endpoint": "/api/auth/login",
                "method": "POST",
                "response_schema": {
                    "token": "string",
                    "status": "success"
                },
                "affected_modules": ["auth_service", "frontend_web"]
            }
        ]
    }
    response = client.post("/api/handoffs", json=conflicting_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["conflicts_detected"] >= 1
    
    conflict = data["conflicts"][0]
    assert conflict["conflict_type"] == "api_contract_mismatch"
    assert "access_token" in conflict["summary"] and "token" in conflict["summary"]
    assert conflict["existing_evidence"]["source_type"] == "existing_contract"
    assert "access_token" in conflict["existing_evidence"]["evidence_text"]
    assert conflict["new_evidence"]["source_type"] == "new_handoff"
    assert "auth_service" in conflict["affected_modules"]
    assert "Reconcile" in conflict["recommendation"]

def test_2_consistent_handoff_no_conflict():
    """
    Test Case 2: Consistent handoff with no conflict
    Introduces a new independent endpoint and compatible decision.
    Must successfully record in graph with 0 conflicts detected.
    """
    consistent_payload = {
        "title": "User Profile Module Implementation",
        "author_name": "Antigravity",
        "source_tool": "Antigravity",
        "completed_work": "Built user profile retrieval endpoint.",
        "affected_modules": ["profile_service"],
        "technical_decisions": [
            {
                "title": "Use Caching for User Profiles",
                "description": "Added Redis TTL caching of 300s for profile payloads."
            }
        ],
        "api_contracts": [
            {
                "endpoint": "/api/users/me",
                "method": "GET",
                "description": "Fetch authenticated user profile",
                "response_schema": {
                    "user_id": "string",
                    "email": "string",
                    "display_name": "string"
                },
                "affected_modules": ["profile_service"]
            }
        ]
    }
    response = client.post("/api/handoffs", json=consistent_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["conflicts_detected"] == 0

def test_3_missing_or_ambiguous_evidence():
    """
    Test Case 3: Missing or ambiguous evidence
    Text claims to have changed API token contracts, but provides no structured schema.
    Must flag potential drift with expressed uncertainty (confidence < 0.70).
    """
    ambiguous_payload = {
        "title": "Unstructured Auth Tweaks",
        "author_name": "Junior Dev",
        "source_tool": "ChatGPT",
        "completed_work": "Changed the token format and API contract in the login route.",
        "affected_modules": ["auth_service"],
        "api_contracts": []  # Empty! Missing structured contract
    }
    response = client.post("/api/handoffs", json=ambiguous_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["conflicts_detected"] >= 1
    ambiguous_conflict = data["conflicts"][0]
    assert ambiguous_conflict["conflict_type"] == "ambiguous_contract_drift"
    assert ambiguous_conflict["confidence"] < 0.70  # Explicit uncertainty
    assert "formal API contract schema" in ambiguous_conflict["recommendation"]

def test_4_graph_persistence_and_retrieval():
    """
    Test Case 4: Graph persistence and retrieval
    Graph endpoint returns properly structured nodes and edges for React Flow.
    """
    response = client.get("/api/graph")
    assert response.status_code == 200
    graph_data = response.json()
    assert "nodes" in graph_data
    assert "edges" in graph_data
    assert len(graph_data["nodes"]) >= 3
    
    # Verify node types exist
    types = [n["data"]["type"] for n in graph_data["nodes"]]
    assert "Project" in types
    assert "Handoff" in types
    assert "APIContract" in types

def test_5_api_validation_and_error_handling():
    """
    Test Case 5: API validation and error handling
    Missing required fields in HandoffCreate must return 422 Unprocessable Entity.
    """
    invalid_payload = {
        # Missing 'title' and 'completed_work'
        "author_name": "Test Author"
    }
    response = client.post("/api/handoffs", json=invalid_payload)
    assert response.status_code == 422

def test_6_conflict_resolution_both_actions():
    """
    Test Case 6: Test both conflict resolution actions ('keep_existing' and 'accept_new')
    and verify the status and dashboard stats update correctly.
    """
    from app.seed_data import trigger_test_conflict
    
    # 1. Trigger test conflict
    result = trigger_test_conflict()
    assert result["conflicts_detected"] >= 1
    conflict_id = result["conflicts"][0]["id"]
    
    # Verify open status
    conflicts_res = client.get("/api/conflicts")
    assert conflicts_res.status_code == 200
    conflicts = conflicts_res.json()
    target = next((c for c in conflicts if c["id"] == conflict_id), None)
    assert target is not None
    assert target["status"] == "open"
    
    # Action 1: Test "keep_existing"
    res1 = client.post(f"/api/conflicts/{conflict_id}/resolve", json={
        "chosen_resolution": "keep_existing",
        "notes": "Team decided to keep RFC 6749 access_token standard"
    })
    assert res1.status_code == 200
    assert res1.json()["status"] == "resolved"
    
    # Verify status in conflicts list
    conflicts_res = client.get("/api/conflicts")
    target = next((c for c in conflicts_res.json() if c["id"] == conflict_id), None)
    assert target["status"] == "resolved"
    assert target["resolution"]["chosen_resolution"] == "keep_existing"
    
    # Action 2: Test "accept_new" on a new conflict
    # Reset conflict status to test accept_new
    res2 = client.post(f"/api/conflicts/{conflict_id}/resolve", json={
        "chosen_resolution": "accept_new",
        "notes": "Migrate all clients to new compact token contract"
    })
    assert res2.status_code == 200
    assert res2.json()["status"] == "resolved"
    
    conflicts_res = client.get("/api/conflicts")
    target = next((c for c in conflicts_res.json() if c["id"] == conflict_id), None)
    assert target["status"] == "resolved"
    assert target["resolution"]["chosen_resolution"] == "accept_new"
    
    # Verify open_conflicts in stats is 0
    stats = client.get("/api/dashboard/stats").json()
    assert stats["open_conflicts"] == 0

def test_7_persistence_after_backend_restart():
    """
    Test Case 7: FalkorDB persistence across backend restart.
    Verifies that handoffs, contracts, and conflicts persist after memory re-hydration.
    """
    from app.seed_data import trigger_test_conflict
    from app.graph.client import FalkorGraphService
    
    # 1. Trigger conflict and record a clean handoff
    trigger_test_conflict()
    clean_payload = {
        "title": "Metrics Exporter Service",
        "author_name": "Devin AI",
        "source_tool": "Cursor",
        "completed_work": "Exposed Prometheus /metrics endpoint for telemetry.",
        "affected_modules": ["metrics_service"],
        "api_contracts": [
            {
                "endpoint": "/metrics",
                "method": "GET",
                "description": "Scrape Prometheus metrics",
                "response_schema": {"metrics": "string"},
                "affected_modules": ["metrics_service"]
            }
        ]
    }
    handoff_res = client.post("/api/handoffs", json=clean_payload)
    assert handoff_res.status_code == 200
    new_handoff_id = handoff_res.json()["handoff_id"]
    
    # Resolve the conflict
    conflict_id = "conf_post_api_auth_login"
    client.post(f"/api/conflicts/{conflict_id}/resolve", json={
        "chosen_resolution": "accept_new",
        "notes": "Persist resolved decision"
    })
    
    # Count before restart
    pre_handoffs = len(client.get("/api/handoffs").json())
    pre_contracts = len(client.get("/api/contracts").json())
    pre_conflicts = client.get("/api/conflicts").json()
    assert any(c["id"] == conflict_id and c["status"] == "resolved" for c in pre_conflicts)
    
    # 2. Simulate Backend Restart:
    # Instantiate a fresh FalkorGraphService connected to FalkorDB
    fresh_service = FalkorGraphService()
    assert fresh_service.connected is True
    
    # Verify the fresh service hydrated all data from FalkorDB
    assert fresh_service.get_node_count() > 0
    post_handoffs = fresh_service.get_all_handoffs()
    post_contracts = fresh_service.get_contracts_catalog()
    post_conflicts = fresh_service.get_all_conflicts()
    
    assert len(post_handoffs) == pre_handoffs
    assert any(h["id"] == new_handoff_id for h in post_handoffs)
    assert len(post_contracts) == pre_contracts
    assert any(c["endpoint"] == "/metrics" for c in post_contracts)
    
    resolved_conflict = next((c for c in post_conflicts if c["id"] == conflict_id), None)
    assert resolved_conflict is not None
    assert resolved_conflict["status"] == "resolved"
    assert resolved_conflict["resolution"]["chosen_resolution"] == "accept_new"

