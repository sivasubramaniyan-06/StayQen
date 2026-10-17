"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Cpu, 
  ShieldAlert, 
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ConflictReportItem, api } from "@/lib/api";

interface ConflictCardProps {
  conflict: ConflictReportItem;
  onResolved?: () => void;
}

export default function ConflictCard({ conflict, onResolved }: ConflictCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const isResolved = conflict.status === "resolved";

  const handleResolve = async (action: string) => {
    setIsResolving(true);
    try {
      await api.resolveConflict(conflict.id, action, `User selected ${action} from UI`);
      if (onResolved) onResolved();
    } catch (err: any) {
      alert(`Error resolving conflict: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  const getToolBadgeColor = (tool?: string) => {
    switch (tool?.toLowerCase()) {
      case "chatgpt":
      case "chatgpt-4o":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";
      case "gemini":
        return "bg-blue-950/60 text-blue-300 border-blue-800/60";
      case "antigravity":
        return "bg-purple-950/60 text-purple-300 border-purple-800/60";
      case "claude":
        return "bg-amber-950/60 text-amber-300 border-amber-800/60";
      default:
        return "bg-[#1E2027] text-gray-300 border-[#2D303A]";
    }
  };

  return (
    <div className={`rounded-xl border transition-all ${
      isResolved 
        ? "bg-[#121317]/60 border-[#22242B] opacity-75" 
        : "bg-[#15161B] border-red-900/40 shadow-lg shadow-red-950/10"
    }`}>
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#22242B]">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg mt-0.5 ${isResolved ? "bg-emerald-950/50 border border-emerald-800/40" : "bg-red-950/60 border border-red-800/50"}`}>
            {isResolved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                isResolved 
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" 
                  : "bg-red-950/40 text-red-400 border-red-800/40"
              }`}>
                {isResolved ? "RESOLVED" : `${conflict.severity} SEVERITY`}
              </span>
              <span className="text-xs font-mono text-gray-500">
                Confidence: {(conflict.confidence * 100).toFixed(0)}%
              </span>
              <span className="text-xs font-mono text-gray-500">
                ID: {conflict.id}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-100 mt-1">
              {conflict.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1D1F26] hover:bg-[#252831] border border-[#2B2E38] text-gray-400 text-xs font-medium transition-colors"
          >
            {expanded ? (
              <>
                <span>Hide Details</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View Evidence</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary statement */}
      <div className="px-5 py-3.5 bg-[#171820] text-sm text-gray-300 border-b border-[#22242B] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{conflict.summary}</p>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Side-by-side Evidence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Existing Knowledge */}
            <div className="rounded-lg bg-[#111216] border border-[#22242B] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-semibold">
                    1. Established Project Knowledge
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getToolBadgeColor(conflict.existing_evidence.source_tool)}`}>
                    {conflict.existing_evidence.source_tool || "Prior Contract"}
                  </span>
                </div>
                <div className="text-xs text-gray-300 font-medium mb-2">
                  {conflict.existing_evidence.source_title}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {conflict.existing_item_summary}
                </div>
              </div>
              <div className="mt-2 bg-[#0C0D10] border border-[#1E2026] rounded p-2.5 font-mono text-[11px] text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {conflict.existing_evidence.evidence_text}
              </div>
            </div>

            {/* Conflicting New Handoff */}
            <div className="rounded-lg bg-[#1A1315]/80 border border-red-900/30 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-red-300 uppercase tracking-wider font-semibold">
                    2. Conflicting Incoming Handoff
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getToolBadgeColor(conflict.new_evidence.source_tool)}`}>
                    {conflict.new_evidence.source_tool || "Incoming Tool"}
                  </span>
                </div>
                <div className="text-xs text-red-200 font-medium mb-2">
                  {conflict.new_evidence.source_title}
                </div>
                <div className="text-xs text-red-300/80 mb-2">
                  {conflict.conflicting_item_summary}
                </div>
              </div>
              <div className="mt-2 bg-[#0C0D10] border border-red-900/30 rounded p-2.5 font-mono text-[11px] text-red-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {conflict.new_evidence.evidence_text}
              </div>
            </div>
          </div>

          {/* Affected Modules */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Potentially Affected Modules ({conflict.affected_modules.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {conflict.affected_modules.map((mod) => (
                <span
                  key={mod}
                  className="px-2.5 py-1 rounded-md bg-[#1B1D24] border border-[#2B2E38] text-xs font-mono text-gray-300"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendation & Action Section */}
          <div className="p-4 rounded-lg bg-[#181920] border border-[#282B35] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#DCD8D3] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Architectural Action</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                {conflict.recommendation}
              </p>
            </div>

            {!isResolved && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={isResolving}
                  onClick={() => handleResolve("keep_existing")}
                  className="px-3 py-1.5 rounded-lg bg-[#22242E] hover:bg-[#2C2F3D] border border-[#353948] text-gray-200 text-xs font-medium transition-colors"
                >
                  Keep Existing
                </button>
                <button
                  disabled={isResolving}
                  onClick={() => handleResolve("accept_new")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition-colors"
                >
                  Accept & Migrate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
