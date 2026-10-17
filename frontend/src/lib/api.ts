const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DecisionItem {
  id?: string;
  title: string;
  description: string;
  context?: string;
  status?: string;
  affected_modules?: string[];
}

export interface APIContractItem {
  id?: string;
  endpoint: string;
  method?: string;
  description?: string;
  request_schema?: Record<string, any>;
  response_schema?: Record<string, any>;
  auth_required?: boolean;
  affected_modules?: string[];
}

export interface HandoffCreate {
  title: string;
  author_name: string;
  source_tool: string;
  completed_work: string;
  affected_modules: string[];
  technical_decisions: DecisionItem[];
  api_contracts: APIContractItem[];
  dependencies: string[];
  unfinished_work?: string;
  potential_blockers?: string;
}

export interface HandoffResponse extends HandoffCreate {
  id: string;
  created_at: string;
}

export interface ConflictEvidence {
  source_type: string;
  source_id: string;
  source_title: string;
  source_tool?: string;
  evidence_text: string;
  timestamp?: string;
}

export interface ConflictReportItem {
  id: string;
  title: string;
  conflict_type: string;
  severity: string;
  confidence: number;
  status: string;
  summary: string;
  existing_item_summary: string;
  conflicting_item_summary: string;
  existing_evidence: ConflictEvidence;
  new_evidence: ConflictEvidence;
  affected_modules: string[];
  recommendation: string;
  detected_at: string;
  resolution?: any;
}

export interface DashboardStats {
  total_handoffs: number;
  total_decisions: number;
  total_contracts: number;
  open_conflicts: number;
  affected_modules_count: number;
  tools_used: string[];
  recent_handoffs: HandoffResponse[];
  active_conflicts: ConflictReportItem[];
}

export interface GraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: string;
    subtitle?: string;
    status?: string;
    properties: Record<string, any>;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  async getHandoffs(): Promise<HandoffResponse[]> {
    const res = await fetch(`${API_BASE}/api/handoffs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch handoffs");
    return res.json();
  },

  async submitHandoff(handoff: HandoffCreate): Promise<{ success: boolean; handoff_id: string; conflicts_detected: number; conflicts: ConflictReportItem[] }> {
    const res = await fetch(`${API_BASE}/api/handoffs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(handoff),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Submission failed" }));
      throw new Error(err.detail || "Submission failed");
    }
    return res.json();
  },

  async getConflicts(): Promise<ConflictReportItem[]> {
    const res = await fetch(`${API_BASE}/api/conflicts`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch conflicts");
    return res.json();
  },

  async resolveConflict(conflictId: string, chosenResolution: string, notes?: string) {
    const res = await fetch(`${API_BASE}/api/conflicts/${conflictId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chosen_resolution: chosenResolution, notes }),
    });
    if (!res.ok) throw new Error("Failed to resolve conflict");
    return res.json();
  },

  async getGraph(): Promise<GraphData> {
    const res = await fetch(`${API_BASE}/api/graph`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch graph");
    return res.json();
  },

  async getContractsCatalog(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/contracts`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch contracts catalog");
    return res.json();
  },

  async getModulesCatalog(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/modules`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch modules catalog");
    return res.json();
  },

  async resetAndSeedDemo() {
    const res = await fetch(`${API_BASE}/api/demo/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to reset demo");
    return res.json();
  },

  async triggerDeterministicConflict() {
    const res = await fetch(`${API_BASE}/api/demo/trigger-test-conflict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to trigger test conflict");
    return res.json();
  },
};
