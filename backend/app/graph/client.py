import logging
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import settings

logger = logging.getLogger(__name__)

class FalkorGraphService:
    def __init__(self):
        self.connected = False
        self.client = None
        self.graph = None
        # In-memory graph storage fallback (preserves nodes, edges, queries)
        self.fallback_nodes: Dict[str, Dict[str, Any]] = {}
        self.fallback_edges: List[Dict[str, Any]] = []
        self._init_connection()

    def _init_connection(self):
        try:
            from falkordb import FalkorDB
            self.client = FalkorDB(
                host=settings.FALKORDB_HOST,
                port=settings.FALKORDB_PORT,
                password=settings.FALKORDB_PASSWORD if settings.FALKORDB_PASSWORD else None
            )
            # Test connectivity
            self.graph = self.client.select_graph(settings.FALKORDB_GRAPH)
            # Run simple test query
            self.graph.query("RETURN 1")
            self.connected = True
            logger.info(f"Connected to FalkorDB at {settings.FALKORDB_HOST}:{settings.FALKORDB_PORT}, graph: {settings.FALKORDB_GRAPH}")
        except Exception as e:
            self.connected = False
            logger.warning(f"Could not connect to FalkorDB ({e}). Using persistent in-memory graph fallback.")

    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None):
        """Execute a controlled Cypher query with parameters."""
        if self.connected and self.graph:
            try:
                return self.graph.query(cypher, params or {})
            except Exception as e:
                logger.error(f"FalkorDB query failed: {e}. Falling back to in-memory state.")
        return None

    def reset_graph(self):
        """Clear the graph for demo or testing purposes."""
        if self.connected and self.graph:
            try:
                self.graph.query("MATCH (n) DETACH DELETE n")
            except Exception as e:
                logger.error(f"FalkorDB reset failed: {e}")
        self.fallback_nodes.clear()
        self.fallback_edges.clear()

    # High-level domain graph operations
    def create_project(self, project_id: str, name: str, description: str = ""):
        props = {"id": project_id, "name": name, "description": description, "created_at": datetime.now(timezone.utc).isoformat()}
        self.fallback_nodes[project_id] = {"label": "Project", "props": props}
        if self.connected and self.graph:
            try:
                self.graph.query(
                    "MERGE (p:Project {id: $id}) ON CREATE SET p.name = $name, p.description = $description, p.created_at = $created_at",
                    props
                )
            except Exception as e:
                logger.error(f"Cypher create_project error: {e}")

    def add_module(self, project_id: str, module_name: str):
        mod_id = f"mod_{module_name.lower().replace('/', '_').replace('.', '_')}"
        props = {"id": mod_id, "name": module_name, "project_id": project_id}
        self.fallback_nodes[mod_id] = {"label": "Module", "props": props}
        self.fallback_edges.append({"source": project_id, "target": mod_id, "type": "CONTAINS"})
        if self.connected and self.graph:
            try:
                self.graph.query(
                    "MERGE (m:Module {id: $id}) ON CREATE SET m.name = $name, m.project_id = $project_id "
                    "WITH m MATCH (p:Project {id: $project_id}) MERGE (p)-[:CONTAINS]->(m)",
                    props
                )
            except Exception as e:
                logger.error(f"Cypher add_module error: {e}")
        return mod_id

    def record_handoff(self, handoff_data: Dict[str, Any], project_id: str = "stayqen-core") -> str:
        handoff_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        
        # 1. TeamMember
        author_name = handoff_data.get("author_name", "Teammate")
        author_id = f"author_{author_name.lower().replace(' ', '_')}"
        self.fallback_nodes[author_id] = {"label": "TeamMember", "props": {"id": author_id, "name": author_name}}

        # 2. Handoff node
        h_props = {
            "id": handoff_id,
            "title": handoff_data["title"],
            "source_tool": handoff_data["source_tool"],
            "completed_work": handoff_data["completed_work"],
            "unfinished_work": handoff_data.get("unfinished_work", ""),
            "potential_blockers": handoff_data.get("potential_blockers", ""),
            "created_at": created_at,
            "project_id": project_id
        }
        self.fallback_nodes[handoff_id] = {"label": "Handoff", "props": h_props}
        self.fallback_edges.append({"source": author_id, "target": handoff_id, "type": "SUBMITTED"})
        self.fallback_edges.append({"source": project_id, "target": handoff_id, "type": "CONTAINS"})

        # 3. Affected Modules
        for mod in handoff_data.get("affected_modules", []):
            mod_id = self.add_module(project_id, mod)
            self.fallback_edges.append({"source": handoff_id, "target": mod_id, "type": "AFFECTS"})

        # 4. Decisions
        for dec in handoff_data.get("technical_decisions", []):
            dec_id = dec.get("id") or str(uuid.uuid4())
            dec_props = {
                "id": dec_id,
                "title": dec.get("title", ""),
                "description": dec.get("description", ""),
                "status": dec.get("status", "active"),
                "handoff_id": handoff_id
            }
            self.fallback_nodes[dec_id] = {"label": "Decision", "props": dec_props}
            self.fallback_edges.append({"source": handoff_id, "target": dec_id, "type": "RECORDED"})
            for mod in dec.get("affected_modules", []):
                mod_id = self.add_module(project_id, mod)
                self.fallback_edges.append({"source": dec_id, "target": mod_id, "type": "AFFECTS"})

        # 5. API Contracts
        for contract in handoff_data.get("api_contracts", []):
            c_id = contract.get("id") or str(uuid.uuid4())
            c_props = {
                "id": c_id,
                "endpoint": contract.get("endpoint", ""),
                "method": contract.get("method", "POST"),
                "description": contract.get("description", ""),
                "response_schema": json.dumps(contract.get("response_schema", {})),
                "request_schema": json.dumps(contract.get("request_schema", {})),
                "auth_required": contract.get("auth_required", True),
                "handoff_id": handoff_id
            }
            self.fallback_nodes[c_id] = {"label": "APIContract", "props": c_props}
            self.fallback_edges.append({"source": handoff_id, "target": c_id, "type": "RECORDED"})
            for mod in contract.get("affected_modules", []):
                mod_id = self.add_module(project_id, mod)
                self.fallback_edges.append({"source": c_id, "target": mod_id, "type": "AFFECTS"})

        # Execute FalkorDB cypher if connected
        if self.connected and self.graph:
            try:
                # Merge Author
                self.graph.query(
                    "MERGE (tm:TeamMember {id: $author_id}) ON CREATE SET tm.name = $author_name",
                    {"author_id": author_id, "author_name": author_name}
                )
                # Create Handoff
                self.graph.query(
                    "CREATE (h:Handoff {id: $id, title: $title, source_tool: $source_tool, "
                    "completed_work: $completed_work, unfinished_work: $unfinished_work, "
                    "potential_blockers: $potential_blockers, created_at: $created_at, project_id: $project_id}) "
                    "WITH h MATCH (tm:TeamMember {id: $author_id}), (p:Project {id: $project_id}) "
                    "MERGE (tm)-[:SUBMITTED]->(h) "
                    "MERGE (p)-[:CONTAINS]->(h)",
                    {**h_props, "author_id": author_id, "project_id": project_id}
                )
                # Link modules
                for mod in handoff_data.get("affected_modules", []):
                    mod_id = f"mod_{mod.lower().replace('/', '_').replace('.', '_')}"
                    self.graph.query(
                        "MATCH (h:Handoff {id: $h_id}), (m:Module {id: $m_id}) MERGE (h)-[:AFFECTS]->(m)",
                        {"h_id": handoff_id, "m_id": mod_id}
                    )
                # Record API contracts
                for contract in handoff_data.get("api_contracts", []):
                    c_id = contract.get("id") or str(uuid.uuid4())
                    self.graph.query(
                        "MATCH (h:Handoff {id: $h_id}) "
                        "CREATE (c:APIContract {id: $id, endpoint: $endpoint, method: $method, "
                        "response_schema: $response_schema, request_schema: $request_schema, "
                        "auth_required: $auth_required, handoff_id: $h_id}) "
                        "MERGE (h)-[:RECORDED]->(c)",
                        {
                            "h_id": handoff_id,
                            "id": c_id,
                            "endpoint": contract.get("endpoint", ""),
                            "method": contract.get("method", "POST"),
                            "response_schema": json.dumps(contract.get("response_schema", {})),
                            "request_schema": json.dumps(contract.get("request_schema", {})),
                            "auth_required": contract.get("auth_required", True)
                        }
                    )
            except Exception as e:
                logger.error(f"FalkorDB Cypher execution error in record_handoff: {e}")

        return handoff_id

    def get_all_api_contracts(self) -> List[Dict[str, Any]]:
        """Retrieve all active API contracts in the graph."""
        contracts = []
        if self.connected and self.graph:
            try:
                res = self.graph.query("MATCH (c:APIContract) RETURN c.id, c.endpoint, c.method, c.response_schema, c.handoff_id")
                for row in res.result_set:
                    c_id, ep, method, schema_str, h_id = row
                    schema = json.loads(schema_str) if isinstance(schema_str, str) else schema_str
                    contracts.append({
                        "id": c_id,
                        "endpoint": ep,
                        "method": method,
                        "response_schema": schema,
                        "handoff_id": h_id
                    })
                return contracts
            except Exception as e:
                logger.error(f"Failed to query API contracts from FalkorDB: {e}")
        
        # Fallback
        for nid, node in self.fallback_nodes.items():
            if node["label"] == "APIContract":
                p = node["props"]
                s = p.get("response_schema", {})
                schema = json.loads(s) if isinstance(s, str) else s
                contracts.append({
                    "id": p["id"],
                    "endpoint": p["endpoint"],
                    "method": p.get("method", "POST"),
                    "response_schema": schema,
                    "handoff_id": p.get("handoff_id")
                })
        return contracts

    def get_all_handoffs(self) -> List[Dict[str, Any]]:
        handoffs = []
        for nid, node in self.fallback_nodes.items():
            if node["label"] == "Handoff":
                props = node["props"]
                # collect connected decisions & contracts
                decisions = [
                    self.fallback_nodes[e["target"]]["props"]
                    for e in self.fallback_edges
                    if e["source"] == nid and e["type"] == "RECORDED" and self.fallback_nodes.get(e["target"], {}).get("label") == "Decision"
                ]
                def parse_schema(s):
                    if isinstance(s, str):
                        try:
                            return json.loads(s)
                        except Exception:
                            return {}
                    return s or {}

                contracts = [
                    {
                        **self.fallback_nodes[e["target"]]["props"],
                        "response_schema": parse_schema(self.fallback_nodes[e["target"]]["props"].get("response_schema")),
                        "request_schema": parse_schema(self.fallback_nodes[e["target"]]["props"].get("request_schema"))
                    }
                    for e in self.fallback_edges
                    if e["source"] == nid and e["type"] == "RECORDED" and self.fallback_nodes.get(e["target"], {}).get("label") == "APIContract"
                ]
                modules = [
                    self.fallback_nodes[e["target"]]["props"]["name"]
                    for e in self.fallback_edges
                    if e["source"] == nid and e["type"] == "AFFECTS" and self.fallback_nodes.get(e["target"], {}).get("label") == "Module"
                ]
                author = "Teammate"
                for e in self.fallback_edges:
                    if e["target"] == nid and e["type"] == "SUBMITTED":
                        author = self.fallback_nodes.get(e["source"], {}).get("props", {}).get("name", "Teammate")

                handoffs.append({
                    "id": props["id"],
                    "title": props["title"],
                    "author_name": author,
                    "source_tool": props["source_tool"],
                    "completed_work": props["completed_work"],
                    "affected_modules": modules,
                    "technical_decisions": decisions,
                    "api_contracts": contracts,
                    "dependencies": [],
                    "unfinished_work": props.get("unfinished_work", ""),
                    "potential_blockers": props.get("potential_blockers", ""),
                    "created_at": props["created_at"]
                })
        return sorted(handoffs, key=lambda x: x["created_at"], reverse=True)

    def record_conflict(self, conflict_data: Dict[str, Any]):
        c_id = conflict_data["id"]
        props = {
            "id": c_id,
            "title": conflict_data["title"],
            "severity": conflict_data["severity"],
            "summary": conflict_data["summary"],
            "status": conflict_data.get("status", "open"),
            "data": json.dumps(conflict_data)
        }
        self.fallback_nodes[c_id] = {"label": "Conflict", "props": props}
        
        # Link CONTRADICTS edge in graph
        source_id = conflict_data["new_evidence"].get("source_id")
        target_id = conflict_data["existing_evidence"].get("source_id")
        if source_id and target_id:
            self.fallback_edges.append({
                "source": source_id,
                "target": target_id,
                "type": "CONTRADICTS",
                "label": "CONTRADICTS"
            })
            if self.connected and self.graph:
                try:
                    self.graph.query(
                        "MATCH (a), (b) WHERE a.id = $source_id AND b.id = $target_id "
                        "MERGE (a)-[r:CONTRADICTS {severity: $severity, title: $title}]->(b)",
                        {"source_id": source_id, "target_id": target_id, "severity": conflict_data["severity"], "title": conflict_data["title"]}
                    )
                except Exception as e:
                    logger.error(f"FalkorDB CONTRADICTS edge error: {e}")

    def get_all_conflicts(self) -> List[Dict[str, Any]]:
        conflicts = []
        for nid, node in self.fallback_nodes.items():
            if node["label"] == "Conflict":
                raw = node["props"]["data"]
                data = json.loads(raw) if isinstance(raw, str) else raw
                data["status"] = node["props"].get("status", "open")
                conflicts.append(data)
        return conflicts

    def resolve_conflict(self, conflict_id: str, resolution: Dict[str, Any]) -> bool:
        if conflict_id in self.fallback_nodes:
            self.fallback_nodes[conflict_id]["props"]["status"] = "resolved"
            raw = self.fallback_nodes[conflict_id]["props"]["data"]
            data = json.loads(raw) if isinstance(raw, str) else raw
            data["status"] = "resolved"
            data["resolution"] = resolution
            self.fallback_nodes[conflict_id]["props"]["data"] = json.dumps(data)
            return True
        return False

    def get_graph_visualization(self) -> Dict[str, Any]:
        """Convert current graph state into React Flow nodes and edges with computed layouts."""
        nodes = []
        edges = []
        
        # Calculate distinct levels for visual layout
        col_x = {
            "Project": 80,
            "TeamMember": 80,
            "Handoff": 360,
            "Decision": 660,
            "APIContract": 660,
            "Conflict": 960,
            "Module": 960
        }
        y_counters: Dict[str, int] = {}

        for nid, node in self.fallback_nodes.items():
            label_type = node["label"]
            y_counters[label_type] = y_counters.get(label_type, 0) + 1
            y_pos = y_counters[label_type] * 120

            props = node["props"]
            title = props.get("title") or props.get("name") or props.get("endpoint") or nid
            
            nodes.append({
                "id": nid,
                "type": "custom",
                "position": {"x": col_x.get(label_type, 500), "y": y_pos},
                "data": {
                    "label": title,
                    "type": label_type,
                    "subtitle": props.get("source_tool") or props.get("method") or label_type,
                    "status": props.get("status"),
                    "properties": props
                }
            })

        for idx, edge in enumerate(self.fallback_edges):
            is_conflict = edge["type"] == "CONTRADICTS"
            edges.append({
                "id": f"e_{idx}_{edge['source']}_{edge['target']}",
                "source": edge["source"],
                "target": edge["target"],
                "label": edge.get("label", edge["type"]),
                "animated": is_conflict,
                "style": {
                    "stroke": "#EF4444" if is_conflict else "#78716C",
                    "strokeWidth": 2.5 if is_conflict else 1.5,
                    "strokeDasharray": "5 5" if is_conflict else None
                }
            })

        return {"nodes": nodes, "edges": edges}

# Singleton instance
graph_service = FalkorGraphService()
