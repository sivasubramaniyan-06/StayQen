"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GitPullRequestDraft, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Code2,
  FileCode2,
  Layers
} from "lucide-react";
import { HandoffCreate, api } from "@/lib/api";

export default function HandoffPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("Alex Rivera");
  const [sourceTool, setSourceTool] = useState("Antigravity");
  const [completedWork, setCompletedWork] = useState("");
  const [affectedModulesStr, setAffectedModulesStr] = useState("auth_service, frontend_web");
  const [dependenciesStr, setDependenciesStr] = useState("fastapi, pydantic");
  const [unfinishedWork, setUnfinishedWork] = useState("");
  const [potentialBlockers, setPotentialBlockers] = useState("");

  // Structured entities
  const [technicalDecisions, setTechnicalDecisions] = useState([
    { title: "Standardize Session Expiration", description: "Set default token lifetime to 24 hours.", affected_modules: ["auth_service"] }
  ]);

  const [apiContracts, setApiContracts] = useState([
    {
      endpoint: "/api/auth/login",
      method: "POST",
      description: "User authentication endpoint",
      response_schema_str: JSON.stringify({ token: "string", status: "success" }, null, 2),
      affected_modules_str: "auth_service, frontend_web"
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Template loaders for easy demoing
  const loadConflictTemplate = () => {
    setTitle("FastAPI Auth Redesign & Token Simplification");
    setAuthorName("Devin AI");
    setSourceTool("Antigravity");
    setCompletedWork("Refactored user login controller to streamline payload. Replaced verbose JSON keys with simplified fields.");
    setAffectedModulesStr("auth_service, frontend_web");
    setDependenciesStr("fastapi");
    setUnfinishedWork("Update frontend clients to consume 'token' instead of 'access_token'");
    setPotentialBlockers("Frontend login components will break if expecting access_token.");
    setTechnicalDecisions([
      { title: "Compact Authentication Payload", description: "Simplified return payload from access_token to compact 'token' attribute.", affected_modules: ["auth_service"] }
    ]);
    setApiContracts([
      {
        endpoint: "/api/auth/login",
        method: "POST",
        description: "User login with compact response format",
        response_schema_str: JSON.stringify({ token: "string", status: "success" }, null, 2),
        affected_modules_str: "auth_service, frontend_web"
      }
    ]);
  };

  const loadConsistentTemplate = () => {
    setTitle("User Preferences & Theme Service");
    setAuthorName("Sarah Chen");
    setSourceTool("ChatGPT-4o");
    setCompletedWork("Created user preference storage and dark mode toggle persistence API.");
    setAffectedModulesStr("profile_service, frontend_web");
    setDependenciesStr("fastapi, redis");
    setUnfinishedWork("Sync preferences to mobile apps");
    setPotentialBlockers("None");
    setTechnicalDecisions([
      { title: "LocalStorage Sync with Redis Cache", description: "Save theme immediately locally and flush to Redis on blur.", affected_modules: ["profile_service"] }
    ]);
    setApiContracts([
      {
        endpoint: "/api/users/preferences",
        method: "PUT",
        description: "Update user theme and locale settings",
        response_schema_str: JSON.stringify({ theme: "dark", locale: "en-US", updated: true }, null, 2),
        affected_modules_str: "profile_service"
      }
    ]);
  };

  const addDecision = () => {
    setTechnicalDecisions([...technicalDecisions, { title: "", description: "", affected_modules: [] }]);
  };

  const removeDecision = (index: number) => {
    setTechnicalDecisions(technicalDecisions.filter((_, i) => i !== index));
  };

  const addContract = () => {
    setApiContracts([
      ...apiContracts,
      { endpoint: "/api/", method: "POST", description: "", response_schema_str: "{\n  \n}", affected_modules_str: "" }
    ]);
  };

  const removeContract = (index: number) => {
    setApiContracts(apiContracts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSubmissionResult(null);

    try {
      const affected_modules = affectedModulesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const dependencies = dependenciesStr.split(",").map((s) => s.trim()).filter(Boolean);

      const formattedContracts = apiContracts.map((c) => {
        let response_schema = {};
        try {
          response_schema = JSON.parse(c.response_schema_str || "{}");
        } catch {
          throw new Error(`Invalid JSON response schema for endpoint ${c.endpoint}`);
        }
        return {
          endpoint: c.endpoint,
          method: c.method,
          description: c.description,
          response_schema,
          affected_modules: c.affected_modules_str.split(",").map((s) => s.trim()).filter(Boolean),
        };
      });

      const payload: HandoffCreate = {
        title,
        author_name: authorName,
        source_tool: sourceTool,
        completed_work: completedWork,
        affected_modules,
        technical_decisions: technicalDecisions,
        api_contracts: formattedContracts,
        dependencies,
        unfinished_work: unfinishedWork,
        potential_blockers: potentialBlockers,
      };

      const result = await api.submitHandoff(payload);
      setSubmissionResult(result);
      window.dispatchEvent(new Event("stayqen:refresh"));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit handoff");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272F]">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequestDraft className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Record AI Work Handoff</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Capture completed AI coding sessions into STAYQEN’s graph memory to detect conflicting decisions.
          </p>
        </div>

        {/* Demo Templates */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadConflictTemplate}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 text-xs font-mono transition-colors"
          >
            Load Conflict Case (token vs access_token)
          </button>
          <button
            type="button"
            onClick={loadConsistentTemplate}
            className="px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#15151B] border border-[#27272F] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors"
          >
            Load Clean Case
          </button>
        </div>
      </div>

      {/* Submission Feedback Banner */}
      {submissionResult && (
        <div className={`p-5 rounded-xl border shadow-lg ${
          submissionResult.conflicts_detected > 0 
            ? "bg-red-950/30 border-red-800 text-red-200" 
            : "bg-emerald-950/30 border-emerald-800 text-emerald-200"
        }`}>
          <div className="flex items-start gap-3">
            {submissionResult.conflicts_detected > 0 ? (
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-semibold">
                {submissionResult.conflicts_detected > 0
                  ? `Handoff Stored & ${submissionResult.conflicts_detected} Conflict(s) Detected!`
                  : "Handoff Successfully Linked to Memory Graph (0 Conflicts)"}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">
                {submissionResult.conflicts_detected > 0
                  ? "STAYQEN detected a contradiction against existing project memory. Check the Conflict Explorer or Knowledge Graph to inspect the supporting evidence."
                  : "All contracts and decisions are consistent with existing project memory."}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => router.push("/conflicts")}
                  className="px-3.5 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white text-xs font-medium font-mono"
                >
                  View Conflicts & Evidence →
                </button>
                <button
                  onClick={() => router.push("/graph")}
                  className="px-3.5 py-1.5 rounded-lg bg-[#15151B] hover:bg-[#202028] text-white text-xs font-medium font-mono border border-[#27272F]"
                >
                  View in Graph
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Metadata Card */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Session Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                Handoff Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Refactor User Login Flow"
                className="w-full px-3.5 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#71717A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                  Source AI Tool *
                </label>
                <select
                  value={sourceTool}
                  onChange={(e) => setSourceTool(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white focus:outline-none focus:border-[#71717A]"
                >
                  <option value="Antigravity">Antigravity</option>
                  <option value="ChatGPT-4o">ChatGPT-4o</option>
                  <option value="Gemini">Gemini</option>
                  <option value="Claude">Claude</option>
                  <option value="Cursor">Cursor</option>
                  <option value="Copilot">Copilot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                  Author / Engineer
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white focus:outline-none focus:border-[#71717A]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
              Completed Work Summary *
            </label>
            <textarea
              required
              rows={3}
              value={completedWork}
              onChange={(e) => setCompletedWork(e.target.value)}
              placeholder="Describe the precise changes, modules implemented, and behaviors modified..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#71717A]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                Affected Modules (comma-separated)
              </label>
              <input
                type="text"
                value={affectedModulesStr}
                onChange={(e) => setAffectedModulesStr(e.target.value)}
                placeholder="auth_service, frontend_web, api_gateway"
                className="w-full px-3.5 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white focus:outline-none focus:border-[#71717A]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                Dependencies (comma-separated)
              </label>
              <input
                type="text"
                value={dependenciesStr}
                onChange={(e) => setDependenciesStr(e.target.value)}
                placeholder="fastapi, pydantic, redis"
                className="w-full px-3.5 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white focus:outline-none focus:border-[#71717A]"
              />
            </div>
          </div>
        </div>

        {/* API Contracts Section */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              API Contracts Defined or Modified
            </h2>
            <button
              type="button"
              onClick={addContract}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#15151B] hover:bg-[#1C1C24] border border-[#27272F] text-xs font-mono text-[#F5F5F5]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contract</span>
            </button>
          </div>

          {apiContracts.map((contract, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#000000] border border-[#27272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400">Contract #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeContract(idx)}
                  className="text-[#71717A] hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">Endpoint</label>
                  <input
                    type="text"
                    value={contract.endpoint}
                    onChange={(e) => {
                      const updated = [...apiContracts];
                      updated[idx].endpoint = e.target.value;
                      setApiContracts(updated);
                    }}
                    placeholder="/api/auth/login"
                    className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272F] text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">HTTP Method</label>
                  <select
                    value={contract.method}
                    onChange={(e) => {
                      const updated = [...apiContracts];
                      updated[idx].method = e.target.value;
                      setApiContracts(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272F] text-xs text-white font-mono"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">
                  Response Schema (JSON)
                </label>
                <textarea
                  rows={4}
                  value={contract.response_schema_str}
                  onChange={(e) => {
                    const updated = [...apiContracts];
                    updated[idx].response_schema_str = e.target.value;
                    setApiContracts(updated);
                  }}
                  className="w-full px-3 py-2 rounded bg-[#09090B] border border-[#27272F] text-xs text-cyan-300 font-mono focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Technical Decisions Section */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Technical Decisions Recorded
            </h2>
            <button
              type="button"
              onClick={addDecision}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#15151B] hover:bg-[#1C1C24] border border-[#27272F] text-xs font-mono text-[#F5F5F5]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Decision</span>
            </button>
          </div>

          {technicalDecisions.map((dec, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#000000] border border-[#27272F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400">Decision #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeDecision(idx)}
                  className="text-[#71717A] hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={dec.title}
                  onChange={(e) => {
                    const updated = [...technicalDecisions];
                    updated[idx].title = e.target.value;
                    setTechnicalDecisions(updated);
                  }}
                  placeholder="Decision Title (e.g. Use RSA256 for token verification)"
                  className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272F] text-xs text-white mb-2"
                />
                <textarea
                  rows={2}
                  value={dec.description}
                  onChange={(e) => {
                    const updated = [...technicalDecisions];
                    updated[idx].description = e.target.value;
                    setTechnicalDecisions(updated);
                  }}
                  placeholder="Rationale and architectural implications..."
                  className="w-full px-3 py-1.5 rounded bg-[#09090B] border border-[#27272F] text-xs text-[#A1A1AA]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Unfinished Work & Potential Blockers */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
            Unfinished Work & Blockers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                Unfinished Tasks / Next Steps
              </label>
              <textarea
                rows={2}
                value={unfinishedWork}
                onChange={(e) => setUnfinishedWork(e.target.value)}
                placeholder="What remains to be completed?"
                className="w-full px-3 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                Potential Blockers
              </label>
              <textarea
                rows={2}
                value={potentialBlockers}
                onChange={(e) => setPotentialBlockers(e.target.value)}
                placeholder="Any risks or external blockers?"
                className="w-full px-3 py-2 rounded-lg bg-[#000000] border border-[#27272F] text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{isSubmitting ? "Linking to Knowledge Graph..." : "Submit to STAYQEN Graph"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
