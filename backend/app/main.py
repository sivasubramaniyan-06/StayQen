import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from app.config import settings
from app.graph.client import graph_service
from app.services.conflict_agent import conflict_agent
from app.seed_data import seed_baseline_data, trigger_test_conflict
from app.models.schemas import (
    HandoffCreate, HandoffResponse, ConflictReportItem,
    ConflictResolution, GraphData, DashboardStats
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("stayqen.api")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing STAYQEN Knowledge Graph and Baseline Memory...")
    seed_baseline_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="STAYQEN Shared Project Memory and Conflict Detection Layer for Multi-AI Workflows",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "STAYQEN Backend API",
        "falkordb_connected": graph_service.connected,
        "falkordb_graph": settings.FALKORDB_GRAPH,
        "gemini_configured": conflict_agent.gemini_available,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats():
    handoffs = graph_service.get_all_handoffs()
    conflicts = graph_service.get_all_conflicts()
    active_conflicts = [c for c in conflicts if c.get("status") == "open"]
    
    total_decisions = sum(len(h.get("technical_decisions", [])) for h in handoffs)
    total_contracts = sum(len(h.get("api_contracts", [])) for h in handoffs)
    
    all_modules = set()
    tools = set()
    for h in handoffs:
        tools.add(h.get("source_tool", "AI Assistant"))
        for m in h.get("affected_modules", []):
            all_modules.add(m)

    return DashboardStats(
        total_handoffs=len(handoffs),
        total_decisions=total_decisions,
        total_contracts=total_contracts,
        open_conflicts=len(active_conflicts),
        affected_modules_count=len(all_modules),
        tools_used=list(tools),
        recent_handoffs=[HandoffResponse(**h) for h in handoffs[:5]],
        active_conflicts=[ConflictReportItem(**c) for c in active_conflicts]
    )

@app.get("/api/handoffs", response_model=List[HandoffResponse])
def list_handoffs():
    handoffs = graph_service.get_all_handoffs()
    return [HandoffResponse(**h) for h in handoffs]

@app.post("/api/handoffs")
def submit_handoff(handoff: HandoffCreate):
    try:
        handoff_dict = handoff.model_dump()
        # 1. Record in graph
        handoff_id = graph_service.record_handoff(handoff_dict)
        # 2. Run conflict detection against all graph knowledge
        detected_conflicts = conflict_agent.detect_conflicts(handoff_dict, handoff_id)
        
        return {
            "success": True,
            "handoff_id": handoff_id,
            "conflicts_detected": len(detected_conflicts),
            "conflicts": [c.model_dump() for c in detected_conflicts]
        }
    except Exception as e:
        logger.error(f"Failed to submit handoff: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conflicts", response_model=List[ConflictReportItem])
def list_conflicts():
    conflicts = graph_service.get_all_conflicts()
    return [ConflictReportItem(**c) for c in conflicts]

@app.post("/api/conflicts/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, resolution: ConflictResolution):
    success = graph_service.resolve_conflict(conflict_id, resolution.model_dump())
    if not success:
        raise HTTPException(status_code=404, detail="Conflict not found")
    return {"success": True, "conflict_id": conflict_id, "status": "resolved"}

@app.get("/api/graph", response_model=GraphData)
def get_graph():
    return graph_service.get_graph_visualization()

@app.post("/api/demo/seed")
def reset_and_seed_demo():
    h_id = seed_baseline_data()
    return {"success": True, "baseline_handoff_id": h_id, "message": "Baseline knowledge reset and re-seeded"}

@app.post("/api/demo/trigger-test-conflict")
def trigger_deterministic_conflict():
    result = trigger_test_conflict()
    return {"success": True, **result}
