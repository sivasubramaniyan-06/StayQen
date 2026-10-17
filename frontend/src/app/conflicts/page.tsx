"use client";

import React, { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  ArrowRight,
  Filter,
  Sparkles
} from "lucide-react";
import { ConflictReportItem, api } from "@/lib/api";
import ConflictCard from "@/components/ConflictCard";

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<ConflictReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "open" | "resolved">("ALL");

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const data = await api.getConflicts();
      setConflicts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
    const handleRefresh = () => fetchConflicts();
    window.addEventListener("stayqen:refresh", handleRefresh);
    return () => window.removeEventListener("stayqen:refresh", handleRefresh);
  }, []);

  const filteredConflicts = conflicts.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  const openCount = conflicts.filter((c) => c.status === "open").length;
  const resolvedCount = conflicts.filter((c) => c.status === "resolved").length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272F]">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Conflict Resolution Center</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Evidence-backed conflict detection across multi-AI coding assistants. Inspect breaking schema changes, affected components, and recommended actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConflicts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#15151B] border border-[#27272F] text-xs text-[#A1A1AA] hover:text-white font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1C1C24] pb-3">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            filterStatus === "ALL"
              ? "bg-[#15151B] text-white border border-[#27272F]"
              : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          All Conflicts ({conflicts.length})
        </button>

        <button
          onClick={() => setFilterStatus("open")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            filterStatus === "open"
              ? "bg-red-950/60 text-red-300 border border-red-800/60"
              : "text-[#A1A1AA] hover:text-red-400"
          }`}
        >
          Open ({openCount})
        </button>

        <button
          onClick={() => setFilterStatus("resolved")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            filterStatus === "resolved"
              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
              : "text-[#A1A1AA] hover:text-emerald-400"
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Conflict List */}
      {filteredConflicts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#09090B] border border-[#27272F] space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white">No Conflicts Detected</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            All AI handoffs, API contracts, and technical decisions in project memory are fully aligned.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((c) => (
            <ConflictCard key={c.id} conflict={c} onResolved={fetchConflicts} />
          ))}
        </div>
      )}
    </div>
  );
}
