import json
import uuid
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from app.config import settings
from app.graph.client import graph_service
from app.models.schemas import ConflictReportItem, ConflictEvidence

logger = logging.getLogger(__name__)

class ConflictDetectionAgent:
    def __init__(self):
        self.init_client()

    def init_client(self, api_key: Optional[str] = None):
        """Initializes or resets the Gemini client from settings or provided key."""
        key = api_key if api_key is not None else settings.GEMINI_API_KEY
        self.gemini_available = bool(key and key.strip())
        self.client = None
        if self.gemini_available:
            try:
                from google import genai
                self.client = genai.Client(api_key=key.strip())
                logger.info("Gemini API Client initialized for conflict analysis.")
            except Exception as e:
                logger.warning(
                    f"Could not initialize Gemini Client: {e}. "
                    "Falling back to deterministic conflict detection."
                )
                self.gemini_available = False
                self.client = None
        else:
            logger.info("Gemini API key not configured. Conflict detection running in deterministic rules mode.")

    def _build_context(self, new_handoff: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieves relevant project context from FalkorDB knowledge graph:
        - Active API contracts
        - Technical decisions across previous handoffs
        - Known project modules
        - Recent prior handoffs
        """
        try:
            contracts = graph_service.get_all_api_contracts()
        except Exception as e:
            logger.error(f"Error fetching API contracts for context: {e}")
            contracts = []

        try:
            handoffs = graph_service.get_all_handoffs()
        except Exception as e:
            logger.error(f"Error fetching handoffs for context: {e}")
            handoffs = []

        decisions = []
        for h in handoffs:
            h_title = h.get("title", "Unknown Handoff")
            for d in h.get("technical_decisions", []):
                decisions.append({
                    "title": d.get("title"),
                    "description": d.get("description"),
                    "status": d.get("status", "active"),
                    "affected_modules": d.get("affected_modules", []),
                    "source_handoff": h_title
                })

        try:
            modules = [m.get("name") for m in graph_service.get_all_modules() if m.get("name")]
        except Exception as e:
            logger.error(f"Error fetching modules for context: {e}")
            modules = []

        return {
            "existing_contracts": contracts,
            "existing_decisions": decisions,
            "known_modules": modules,
            "recent_handoff_summaries": [
                {
                    "id": h.get("id"),
                    "title": h.get("title"),
                    "author": h.get("author_name"),
                    "tool": h.get("source_tool"),
                    "completed_work": (h.get("completed_work") or "")[:200]
                }
                for h in handoffs[:5]
            ]
        }

    def detect_conflicts(self, new_handoff: Dict[str, Any], handoff_id: str) -> List[ConflictReportItem]:
        """
        Examines new handoff against established graph knowledge.
        Applies deterministic contract/decision verification and optional Gemini inference.
        """
        conflicts: List[ConflictReportItem] = []
        
        try:
            existing_contracts = graph_service.get_all_api_contracts()
        except Exception as e:
            logger.error(f"Failed to fetch existing contracts from graph: {e}")
            existing_contracts = []

        # 1. Deterministic API Contract Conflict Analysis
        for new_c in new_handoff.get("api_contracts", []):
            endpoint = new_c.get("endpoint")
            method = new_c.get("method", "POST")
            new_res_schema = new_c.get("response_schema", {})

            for ex_c in existing_contracts:
                # Do not compare contract against itself
                if ex_c.get("handoff_id") == handoff_id or (new_c.get("id") and ex_c.get("id") == new_c.get("id")):
                    continue
                # Compare same endpoint and HTTP method
                if ex_c.get("endpoint") == endpoint and ex_c.get("method") == method:
                    ex_res_schema = ex_c.get("response_schema", {})
                    is_conflict, details, confidence, rec = self._compare_response_schemas(
                        ex_res_schema, new_res_schema, endpoint
                    )
                    
                    if is_conflict:
                        # Deterministic canonical ID to prevent duplicate conflict entries for same contract
                        clean_ep = endpoint.strip("/").replace("/", "_")
                        conflict_id = f"conf_{method.lower()}_{clean_ep}"
                        
                        # Check if conflict already exists in graph
                        try:
                            existing_all = graph_service.get_all_conflicts()
                            already_open = any(c.get("id") == conflict_id and c.get("status") == "open" for c in existing_all)
                            if already_open:
                                continue
                        except Exception as e:
                            logger.error(f"Failed to query existing conflicts: {e}")

                        affected = list(set(
                            new_c.get("affected_modules", []) + 
                            new_handoff.get("affected_modules", []) + 
                            ["auth_module", "api_gateway"]
                        ))

                        now_iso = datetime.now(timezone.utc).isoformat()
                        conflict_item = ConflictReportItem(
                            id=conflict_id,
                            title=f"API Contract Response Field Mismatch on {method} {endpoint}",
                            conflict_type="api_contract_mismatch",
                            severity="high",
                            confidence=confidence,
                            status="open",
                            detection_method="rules",
                            summary=details,
                            existing_item_summary=f"Existing contract returns fields: {list(ex_res_schema.keys())}",
                            conflicting_item_summary=f"New handoff contract returns fields: {list(new_res_schema.keys())}",
                            existing_evidence=ConflictEvidence(
                                source_type="existing_contract",
                                source_id=ex_c.get("id", "contract_existing"),
                                source_title=f"Contract: {method} {endpoint}",
                                source_tool="Previous Handoff",
                                evidence_text=f"Endpoint: {endpoint}\nResponse schema: {json.dumps(ex_res_schema, indent=2)}",
                                timestamp=now_iso
                            ),
                            new_evidence=ConflictEvidence(
                                source_type="new_handoff",
                                source_id=handoff_id,
                                source_title=new_handoff.get("title", "New Handoff"),
                                source_tool=new_handoff.get("source_tool", "AI Assistant"),
                                evidence_text=f"Handoff '{new_handoff.get('title')}' specifies response: {json.dumps(new_res_schema, indent=2)}",
                                timestamp=now_iso
                            ),
                            affected_modules=affected,
                            recommendation=rec,
                            detected_at=now_iso
                        )
                        conflicts.append(conflict_item)
                        try:
                            graph_service.record_conflict(conflict_item.model_dump())
                        except Exception as e:
                            logger.error(f"Failed to record conflict in graph: {e}")

        # 2. Ambiguity & Missing Evidence Check
        completed_text = (new_handoff.get("completed_work") or "").lower()
        if "token" in completed_text or "endpoint" in completed_text or "api" in completed_text:
            if not new_handoff.get("api_contracts") and "contract" in completed_text:
                conflict_id = f"conf_ambig_{uuid.uuid4().hex[:8]}"
                now_iso = datetime.now(timezone.utc).isoformat()
                ambig_item = ConflictReportItem(
                    id=conflict_id,
                    title="Potential Undocumented API Modification Detected",
                    conflict_type="ambiguous_contract_drift",
                    severity="medium",
                    confidence=0.55,  # Express uncertainty
                    status="open",
                    detection_method="rules",
                    summary="Completed work description implies an API modification, but no structured API contract was declared.",
                    existing_item_summary="Existing API contracts assume documented stable schemas.",
                    conflicting_item_summary=f"Unstructured completed work statement: {(new_handoff.get('completed_work') or '')[:140]}...",
                    existing_evidence=ConflictEvidence(
                        source_type="graph_schema",
                        source_id="schema_registry",
                        source_title="Known Project Schema",
                        evidence_text="Active registered contracts require explicit JSON response definitions.",
                        timestamp=now_iso
                    ),
                    new_evidence=ConflictEvidence(
                        source_type="new_handoff",
                        source_id=handoff_id,
                        source_title=new_handoff.get("title", "New Handoff"),
                        source_tool=new_handoff.get("source_tool", "AI Assistant"),
                        evidence_text=f"Text reference without contract schema: '{new_handoff.get('completed_work')}'",
                        timestamp=now_iso
                    ),
                    affected_modules=new_handoff.get("affected_modules", []),
                    recommendation="Request author or AI assistant to submit a formal API contract schema to verify compatibility.",
                    detected_at=now_iso
                )
                conflicts.append(ambig_item)
                try:
                    graph_service.record_conflict(ambig_item.model_dump())
                except Exception as e:
                    logger.error(f"Failed to record ambiguous conflict in graph: {e}")

        # 3. Gemini LLM Semantic Analysis (Context-Aware)
        if self.gemini_available and self.client:
            try:
                ai_conflicts = self._analyze_with_gemini(new_handoff, handoff_id)
                for aic in ai_conflicts:
                    # Avoid duplicate conflict if identical title already reported
                    if any(c.title.lower() == aic.title.lower() for c in conflicts):
                        continue
                    conflicts.append(aic)
                    try:
                        graph_service.record_conflict(aic.model_dump())
                    except Exception as e:
                        logger.error(f"Failed to record AI conflict in graph: {e}")
            except Exception as e:
                logger.error(f"Gemini conflict analysis error: {e}")

        return conflicts

    def _compare_response_schemas(
        self, ex_schema: Dict[str, Any], new_schema: Dict[str, Any], endpoint: str
    ) -> Tuple[bool, str, float, str]:
        """
        Deterministic comparison of schema structures and keys.
        Detects specific breaking differences like 'access_token' vs 'token'.
        """
        ex_keys = set(ex_schema.keys())
        new_keys = set(new_schema.keys())

        # Exact match
        if ex_keys == new_keys:
            return False, "", 0.0, ""

        # Specific deterministic test case: access_token vs token
        if "access_token" in ex_keys and "token" in new_keys and "access_token" not in new_keys:
            details = (
                f"Existing contract for '{endpoint}' returns 'access_token', "
                f"whereas the new handoff returns 'token'. This is a breaking API contract conflict."
            )
            rec = (
                f"Reconcile authentication token key: standardize either 'access_token' (OAuth2/JWT standard) "
                f"or 'token' across both backend response serializer and frontend auth client before merging."
            )
            return True, details, 0.98, rec

        # General missing expected keys
        missing_in_new = ex_keys - new_keys
        if missing_in_new:
            details = (
                f"Endpoint '{endpoint}' is missing previously established contract fields: {list(missing_in_new)}."
            )
            rec = "Preserve backward-compatible response fields or release a major version endpoint migration."
            return True, details, 0.90, rec

        return False, "", 0.0, ""

    def _analyze_with_gemini(
        self, handoff: Dict[str, Any], handoff_id: str, context: Optional[Dict[str, Any]] = None
    ) -> List[ConflictReportItem]:
        """
        Calls Gemini API for context-aware semantic conflict detection.
        Sends new handoff alongside relevant project graph context (contracts, decisions, modules).
        Validates and sanitizes structured LLM outputs.
        """
        if context is None:
            context = self._build_context(handoff)

        prompt = f"""You are the STAYQEN AI Conflict Detection Agent. STAYQEN is an intelligent shared-memory system for multi-AI coding workflows (e.g., ChatGPT, Claude, Antigravity, Gemini, Cursor).

Your mission is to examine this new AI handoff against established project memory and determine if there are ANY breaking changes, subtle contradictions, conflicting architectural decisions, or unstated API drifts.

### NEW HANDOFF:
{json.dumps(handoff, indent=2)}

### ESTABLISHED PROJECT CONTEXT (from Knowledge Graph):
1. API Contracts:
{json.dumps(context.get("existing_contracts", []), indent=2)}

2. Technical Decisions:
{json.dumps(context.get("existing_decisions", []), indent=2)}

3. Known Modules:
{json.dumps(context.get("known_modules", []), indent=2)}

4. Recent Prior Handoffs:
{json.dumps(context.get("recent_handoff_summaries", []), indent=2)}

### EVALUATION CRITERIA:
1. API Contract Discrepancy: Check if the new handoff changes, removes, or renames endpoints, response payload fields, or request requirements without backward compatibility.
2. Architectural/Decision Contradiction: Check if the handoff violates previous technical decisions (e.g. choosing a conflicting database, caching layer, auth mechanism, or architecture pattern).
3. Ambiguous Drift: Check if the completed work claims to modify an API or component but lacks formal specification or breaks downstream assumptions.

### OUTPUT INSTRUCTIONS:
Return a JSON array of conflict objects. If NO genuine conflict exists, return an empty JSON array: [].
Do NOT wrap your output in markdown code blocks. Return pure JSON only.

Each conflict object in the array MUST have the following structure:
{{
  "id": "conf_ai_<unique_short_id>",
  "title": "<Concise descriptive title of conflict>",
  "conflict_type": "<api_contract_mismatch | decision_contradiction | dependency_drift | semantic_conflict>",
  "severity": "<high | medium | low>",
  "confidence": <float between 0.0 and 1.0 expressing calibrated certainty>,
  "summary": "<Clear explanation of the conflict>",
  "existing_item_summary": "<Summary of what established project memory expects>",
  "conflicting_item_summary": "<Summary of what new handoff proposes or changes>",
  "existing_source_id": "<ID or name of existing contract, decision, or node>",
  "existing_evidence_text": "<Verbatim text or schema from existing memory proving the contradiction>",
  "new_evidence_text": "<Verbatim text or schema from new handoff proving the contradiction>",
  "affected_modules": ["<module1>", "<module2>"],
  "recommendation": "<Specific, actionable steps to reconcile or resolve the conflict>"
}}
"""
        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )

        raw_text = (response.text or "").strip()
        # Strip potential markdown fences if present
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        try:
            data = json.loads(raw_text)
        except Exception as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}. Raw response: {raw_text[:200]}")
            return []

        # Handle either list [...] or object with list {"conflicts": [...]}
        if isinstance(data, dict):
            if "conflicts" in data and isinstance(data["conflicts"], list):
                raw_items = data["conflicts"]
            else:
                raw_items = [data]
        elif isinstance(data, list):
            raw_items = data
        else:
            raw_items = []

        validated_conflicts = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for item in raw_items:
            if not isinstance(item, dict):
                continue

            c_id = item.get("id")
            if not c_id or not str(c_id).startswith("conf_"):
                c_id = f"conf_ai_{uuid.uuid4().hex[:8]}"

            # Validate confidence
            try:
                confidence = float(item.get("confidence", 0.85))
                confidence = max(0.0, min(1.0, confidence))
            except (ValueError, TypeError):
                confidence = 0.85

            # Validate severity
            severity = str(item.get("severity", "medium")).lower()
            if severity not in ["high", "medium", "low"]:
                severity = "medium"

            title = item.get("title") or "AI-Detected Architectural Inconsistency"
            summary = item.get("summary") or "Semantic contradiction detected by Gemini conflict analysis agent."

            conflict_report = ConflictReportItem(
                id=c_id,
                title=title,
                conflict_type=item.get("conflict_type", "semantic_conflict"),
                severity=severity,
                confidence=confidence,
                status="open",
                detection_method="llm",
                summary=summary,
                existing_item_summary=item.get("existing_item_summary", "Established project memory specification."),
                conflicting_item_summary=item.get("conflicting_item_summary", "Proposed handoff change."),
                existing_evidence=ConflictEvidence(
                    source_type="graph_node",
                    source_id=str(item.get("existing_source_id", "project_graph")),
                    source_title="Recorded Project Knowledge",
                    source_tool="FalkorDB Memory",
                    evidence_text=str(item.get("existing_evidence_text", "Existing memory constraint")),
                    timestamp=now_iso
                ),
                new_evidence=ConflictEvidence(
                    source_type="new_handoff",
                    source_id=handoff_id,
                    source_title=handoff.get("title", "New Handoff"),
                    source_tool=handoff.get("source_tool", "AI Assistant"),
                    evidence_text=str(item.get("new_evidence_text", summary)),
                    timestamp=now_iso
                ),
                affected_modules=item.get("affected_modules") or handoff.get("affected_modules", []),
                recommendation=item.get("recommendation", "Review and align with team before proceeding."),
                detected_at=now_iso
            )
            validated_conflicts.append(conflict_report)

        return validated_conflicts

conflict_agent = ConflictDetectionAgent()
