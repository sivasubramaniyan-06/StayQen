import logging
from typing import Dict, Any
from app.graph.client import graph_service
from app.services.conflict_agent import conflict_agent

logger = logging.getLogger(__name__)

def seed_baseline_data():
    """Initializes the baseline graph state with authentic project knowledge."""
    graph_service.reset_graph()
    
    # 1. Project
    project_id = "stayqen-core"
    graph_service.create_project(
        project_id=project_id,
        name="STAYQEN Shared Memory Engine",
        description="Core multi-agent coordination and graph memory platform"
    )

    # 2. Baseline modules
    for mod in ["auth_service", "frontend_web", "api_gateway", "graph_service"]:
        graph_service.add_module(project_id, mod)

    # 3. Baseline Handoff #1 (ChatGPT)
    baseline_handoff = {
        "title": "Setup OAuth2 JWT Authentication Pipeline",
        "author_name": "Alex Rivera",
        "source_tool": "ChatGPT-4o",
        "completed_work": "Implemented authentication routes and JWT token generator following RFC 6749 standards.",
        "affected_modules": ["auth_service", "frontend_web", "api_gateway"],
        "technical_decisions": [
            {
                "id": "dec_jwt_standard",
                "title": "Use RFC 6749 OAuth2 Token Spec",
                "description": "Standardize access token issuance with standard field 'access_token' and 'bearer' token_type.",
                "affected_modules": ["auth_service", "frontend_web"]
            }
        ],
        "api_contracts": [
            {
                "id": "contract_auth_login_v1",
                "endpoint": "/api/auth/login",
                "method": "POST",
                "description": "Authenticate user credentials and issue session JWT",
                "request_schema": {"email": "string", "password": "string"},
                "response_schema": {
                    "access_token": "string",
                    "token_type": "bearer",
                    "expires_in": 86400
                },
                "auth_required": False,
                "affected_modules": ["auth_service", "frontend_web"]
            }
        ],
        "dependencies": ["fastapi", "pyjwt", "passlib"],
        "unfinished_work": "Refresh token rotation and rate limiting on /api/auth/login",
        "potential_blockers": "None"
    }

    h_id = graph_service.record_handoff(baseline_handoff, project_id=project_id)
    logger.info(f"Seeded baseline handoff: {h_id}")
    return h_id

def trigger_test_conflict() -> Dict[str, Any]:
    """
    Submits the deterministic conflicting handoff:
    Existing contract returns 'access_token'; new handoff returns 'token'.
    """
    project_id = "stayqen-core"
    conflicting_handoff = {
        "title": "FastAPI Auth Redesign & Token Simplification",
        "author_name": "Devin AI",
        "source_tool": "Antigravity",
        "completed_work": "Refactored user login controller to streamline payload. Replaced verbose JSON keys with simplified fields.",
        "affected_modules": ["auth_service", "frontend_web"],
        "technical_decisions": [
            {
                "id": "dec_simplified_payload",
                "title": "Compact Authentication Payload",
                "description": "Simplified return payload from access_token to compact 'token' attribute.",
                "affected_modules": ["auth_service"]
            }
        ],
        "api_contracts": [
            {
                "id": "contract_auth_login_v2_conflict",
                "endpoint": "/api/auth/login",
                "method": "POST",
                "description": "User login with compact response format",
                "request_schema": {"email": "string", "password": "string"},
                "response_schema": {
                    "token": "string",
                    "status": "success"
                },
                "auth_required": False,
                "affected_modules": ["auth_service", "frontend_web"]
            }
        ],
        "dependencies": ["fastapi"],
        "unfinished_work": "Update client libraries to consume 'token' instead of 'access_token'",
        "potential_blockers": "Frontend login components will break if expecting access_token."
    }

    h_id = graph_service.record_handoff(conflicting_handoff, project_id=project_id)
    detected = conflict_agent.detect_conflicts(conflicting_handoff, h_id)
    return {
        "handoff_id": h_id,
        "conflicts_detected": len(detected),
        "conflicts": [c.model_dump() for c in detected]
    }
