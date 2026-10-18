from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

class DecisionItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    context: Optional[str] = None
    status: str = "active"  # active, superseded, conflicted
    affected_modules: List[str] = Field(default_factory=list)

class APIContractItem(BaseModel):
    id: Optional[str] = None
    endpoint: str
    method: str = "POST"
    description: Optional[str] = ""
    request_schema: Optional[Dict[str, Any]] = Field(default_factory=dict)
    response_schema: Optional[Dict[str, Any]] = Field(default_factory=dict)
    auth_required: bool = True
    affected_modules: List[str] = Field(default_factory=list)

    @field_validator("request_schema", "response_schema", mode="before")
    @classmethod
    def parse_json_if_string(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v or {}

class TaskItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    status: str = "completed"  # completed, in_progress, blocked
    dependencies: List[str] = Field(default_factory=list)
    affected_modules: List[str] = Field(default_factory=list)

class HandoffCreate(BaseModel):
    title: str
    author_name: str = "Teammate"
    source_tool: str = "ChatGPT"  # ChatGPT, Gemini, Antigravity, Claude, Cursor, Copilot
    completed_work: str
    affected_modules: List[str] = Field(default_factory=list)
    technical_decisions: List[DecisionItem] = Field(default_factory=list)
    api_contracts: List[APIContractItem] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    unfinished_work: Optional[str] = ""
    potential_blockers: Optional[str] = ""

class HandoffResponse(BaseModel):
    id: str
    title: str
    author_name: str
    source_tool: str
    completed_work: str
    affected_modules: List[str]
    technical_decisions: List[DecisionItem]
    api_contracts: List[APIContractItem]
    dependencies: List[str]
    unfinished_work: Optional[str]
    potential_blockers: Optional[str]
    created_at: str

class ConflictEvidence(BaseModel):
    source_type: str  # "existing_contract", "new_handoff", "decision"
    source_id: str
    source_title: str
    source_tool: Optional[str] = None
    evidence_text: str
    timestamp: Optional[str] = None

class ConflictReportItem(BaseModel):
    id: str
    title: str
    conflict_type: str  # "api_contract_mismatch", "decision_contradiction", "dependency_drift"
    severity: str = "high"  # high, medium, low
    confidence: float = 0.95  # 0.0 to 1.0
    status: str = "open"  # open, resolved, ignored
    detection_method: str = "rules"  # "rules", "llm"
    summary: str
    existing_item_summary: str
    conflicting_item_summary: str
    existing_evidence: ConflictEvidence
    new_evidence: ConflictEvidence
    affected_modules: List[str]
    recommendation: str
    detected_at: str
    resolution: Optional[Dict[str, Any]] = None

class ConflictResolution(BaseModel):
    chosen_resolution: str  # "keep_existing", "accept_new", "custom"
    notes: Optional[str] = ""

# Graph Visualization (React Flow compatibility)
class GraphNodeData(BaseModel):
    label: str
    type: str  # "Project", "TeamMember", "Handoff", "Decision", "APIContract", "Module", "Conflict"
    subtitle: Optional[str] = None
    status: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphNode(BaseModel):
    id: str
    type: Optional[str] = "custom"
    data: GraphNodeData
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = False
    style: Optional[Dict[str, Any]] = None

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class DashboardStats(BaseModel):
    total_handoffs: int
    total_decisions: int
    total_contracts: int
    open_conflicts: int
    affected_modules_count: int
    tools_used: List[str]
    recent_handoffs: List[HandoffResponse]
    active_conflicts: List[ConflictReportItem]
