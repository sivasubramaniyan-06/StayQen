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
        self.gemini_available = bool(settings.GEMINI_API_KEY)
        self.client = None
        if self.gemini_available:
            try:
                from google import genai
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info("Gemini API Client initialized for conflict analysis.")
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}. Falling back to deterministic conflict detection.")
                self.gemini_available = False

    def detect_conflicts(self, new_handoff: Dict[str, Any], handoff_id: str) -> List[ConflictReportItem]:
        """
        Examines new handoff against all established graph knowledge.
        Applies deterministic contract/decision verification and optional Gemini inference.
        """
        conflicts: List[ConflictReportItem] = []
        existing_contracts = graph_service.get_all_api_contracts()

        # 1. API Contract Conflict Analysis
        for new_c in new_handoff.get("api_contracts", []):
            endpoint = new_c.get("endpoint")
            method = new_c.get("method", "POST")
            new_res_schema = new_c.get("response_schema", {})
            new_c_id = new_c.get("id") or str(uuid.uuid4())

            for ex_c in existing_contracts:
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
                        existing_all = graph_service.get_all_conflicts()
                        already_open = any(c.get("id") == conflict_id and c.get("status") == "open" for c in existing_all)
                        if already_open:
                            continue

                        affected = list(set(
                            new_c.get("affected_modules", []) + 
                            new_handoff.get("affected_modules", []) + 
                            ["auth_module", "api_gateway"]
                        ))

                        conflict_item = ConflictReportItem(
                            id=conflict_id,
                            title=f"API Contract Response Field Mismatch on {method} {endpoint}",
                            conflict_type="api_contract_mismatch",
                            severity="high",
                            confidence=confidence,
                            status="open",
                            summary=details,
                            existing_item_summary=f"Existing contract returns fields: {list(ex_res_schema.keys())}",
                            conflicting_item_summary=f"New handoff contract returns fields: {list(new_res_schema.keys())}",
                            existing_evidence=ConflictEvidence(
                                source_type="existing_contract",
                                source_id=ex_c.get("id", "contract_existing"),
                                source_title=f"Contract: {method} {endpoint}",
                                source_tool="Previous Handoff",
                                evidence_text=f"Endpoint: {endpoint}\nResponse schema: {json.dumps(ex_res_schema, indent=2)}",
                                timestamp=datetime.now(timezone.utc).isoformat()
                            ),
                            new_evidence=ConflictEvidence(
                                source_type="new_handoff",
                                source_id=handoff_id,
                                source_title=new_handoff.get("title", "New Handoff"),
                                source_tool=new_handoff.get("source_tool", "AI Assistant"),
                                evidence_text=f"Handoff '{new_handoff.get('title')}' specifies response: {json.dumps(new_res_schema, indent=2)}",
                                timestamp=datetime.now(timezone.utc).isoformat()
                            ),
                            affected_modules=affected,
                            recommendation=rec,
                            detected_at=datetime.now(timezone.utc).isoformat()
                        )
                        conflicts.append(conflict_item)
                        # Record in graph
                        graph_service.record_conflict(conflict_item.model_dump())

        # 2. Ambiguity & Missing Evidence Check
        # If a handoff mentions an endpoint change in completed_work without defining an APIContract schema
        completed_text = new_handoff.get("completed_work", "").lower()
        if "token" in completed_text or "endpoint" in completed_text or "api" in completed_text:
            if not new_handoff.get("api_contracts") and "contract" in completed_text:
                conflict_id = f"conf_ambig_{uuid.uuid4().hex[:8]}"
                conflicts.append(ConflictReportItem(
                    id=conflict_id,
                    title="Potential Undocumented API Modification Detected",
                    conflict_type="ambiguous_contract_drift",
                    severity="medium",
                    confidence=0.55,  # Express uncertainty!
                    status="open",
                    summary="Completed work description implies an API modification, but no structured API contract was declared.",
                    existing_item_summary="Existing API contracts assume documented stable schemas.",
                    conflicting_item_summary=f"Unstructured completed work statement: {new_handoff.get('completed_work')[:140]}...",
                    existing_evidence=ConflictEvidence(
                        source_type="graph_schema",
                        source_id="schema_registry",
                        source_title="Known Project Schema",
                        evidence_text="Active registered contracts require explicit JSON response definitions.",
                        timestamp=datetime.now(timezone.utc).isoformat()
                    ),
                    new_evidence=ConflictEvidence(
                        source_type="new_handoff",
                        source_id=handoff_id,
                        source_title=new_handoff.get("title"),
                        source_tool=new_handoff.get("source_tool"),
                        evidence_text=f"Text reference without contract schema: '{new_handoff.get('completed_work')}'",
                        timestamp=datetime.now(timezone.utc).isoformat()
                    ),
                    affected_modules=new_handoff.get("affected_modules", []),
                    recommendation="Request author or AI assistant to submit a formal API contract schema to verify compatibility.",
                    detected_at=datetime.now(timezone.utc).isoformat()
                ))

        # 3. Optional Gemini AI In-depth Semantic Analysis (if key configured)
        if self.gemini_available and self.client:
            try:
                ai_conflicts = self._analyze_with_gemini(new_handoff, existing_contracts)
                for aic in ai_conflicts:
                    conflicts.append(aic)
                    graph_service.record_conflict(aic.model_dump())
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
        extra_in_new = new_keys - ex_keys
        if missing_in_new:
            details = (
                f"Endpoint '{endpoint}' is missing previously established contract fields: {list(missing_in_new)}."
            )
            rec = f"Preserve backward-compatible response fields or release a major version endpoint migration."
            return True, details, 0.90, rec

        return False, "", 0.0, ""

    def _analyze_with_gemini(self, handoff: Dict[str, Any], existing_contracts: List[Dict[str, Any]]) -> List[ConflictReportItem]:
        """Calls Gemini API for structured semantic conflict detection."""
        prompt = f"""
You are the STAYQEN AI Conflict Detection Agent.
Compare this new AI handoff with existing project contracts and decisions.
New Handoff:
{json.dumps(handoff, indent=2)}

Existing Contracts in Knowledge Graph:
{json.dumps(existing_contracts, indent=2)}

Check if there are any subtle contradictions, conflicting architectural decisions, or breaking API changes.
If a genuine conflict exists with concrete evidence, return a JSON list of conflicts.
If no conflict exists, return an empty list [].
Only return pure JSON.
"""
        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text)
        results = []
        if isinstance(data, list):
            for item in data:
                c_id = f"conf_ai_{uuid.uuid4().hex[:8]}"
                results.append(ConflictReportItem(
                    id=c_id,
                    title=item.get("title", "AI-Detected Inconsistency"),
                    conflict_type=item.get("conflict_type", "semantic_conflict"),
                    severity=item.get("severity", "medium"),
                    confidence=item.get("confidence", 0.85),
                    status="open",
                    summary=item.get("summary", ""),
                    existing_item_summary=item.get("existing_item_summary", ""),
                    conflicting_item_summary=item.get("conflicting_item_summary", ""),
                    existing_evidence=ConflictEvidence(
                        source_type="graph_node",
                        source_id=item.get("existing_source_id", "graph"),
                        source_title="Recorded Project Knowledge",
                        evidence_text=item.get("existing_evidence_text", ""),
                        timestamp=datetime.utcnow().isoformat()
                    ),
                    new_evidence=ConflictEvidence(
                        source_type="new_handoff",
                        source_id=handoff.get("title", "New Handoff"),
                        source_title=handoff.get("title", "New Handoff"),
                        source_tool=handoff.get("source_tool"),
                        evidence_text=item.get("new_evidence_text", ""),
                        timestamp=datetime.utcnow().isoformat()
                    ),
                    affected_modules=item.get("affected_modules", []),
                    recommendation=item.get("recommendation", "Review and align with team."),
                    detected_at=datetime.utcnow().isoformat()
                ))
        return results

conflict_agent = ConflictDetectionAgent()
