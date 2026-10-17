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
