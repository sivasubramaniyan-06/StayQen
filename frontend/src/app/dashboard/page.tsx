"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  GitPullRequestDraft, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode2, 
  Layers, 
  Network, 
  Sparkles, 
  ArrowRight,
  Clock,
  Cpu,
  RefreshCw,
  Plus
} from "lucide-react";
import { DashboardStats, api } from "@/lib/api";
import ConflictCard from "@/components/ConflictCard";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to STAYQEN backend API. Verify FastAPI server on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleRefresh = () => fetchStats();
    window.addEventListener("stayqen:refresh", handleRefresh);
    return () => window.removeEventListener("stayqen:refresh", handleRefresh);
  }, []);

  const getToolBadge = (tool: string) => {
    switch (tool?.toLowerCase()) {
      case "chatgpt-4o":
      case "chatgpt":
        return "bg-emerald-950/50 text-emerald-300 border-emerald-800/50";
      case "gemini":
        return "bg-blue-950/50 text-blue-300 border-blue-800/50";
      case "antigravity":
        return "bg-purple-950/50 text-purple-300 border-purple-800/50";
      case "claude":
        return "bg-amber-950/50 text-amber-300 border-amber-800/50";
      default:
        return "bg-[#15151B] text-[#A1A1AA] border-[#27272F]";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#000000]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272F] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
              Project: stayqen-core
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400">Live Memory Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Overview & Memory Health
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Real-time multi-AI coordination state grounded in FalkorDB graph data.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/handoffs"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs shadow-sm transition-all hover:scale-[1.01]"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span>Submit Handoff</span>
          </Link>

          <Link
            href="/graph"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#09090B] hover:bg-[#15151B] border border-[#27272F] text-white text-xs font-medium transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span>View Graph</span>
          </Link>

          <button
            onClick={fetchStats}
            className="p-2 rounded-lg bg-[#09090B] hover:bg-[#15151B] border border-[#27272F] text-[#A1A1AA] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-2">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-[11px] font-mono uppercase tracking-wider">AI Handoffs</span>
            <GitPullRequestDraft className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {stats ? stats.total_handoffs : "..."}
          </div>
          <div className="text-[10px] text-[#71717A] font-mono">
            Recorded across {stats?.tools_used.length || 1} AI tool(s)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-2">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-[11px] font-mono uppercase tracking-wider">API Contracts</span>
            <FileCode2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {stats ? stats.total_contracts : "..."}
          </div>
          <div className="text-[10px] text-[#71717A] font-mono">
            Tracked in FalkorDB graph
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] space-y-2">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Modules Protected</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {stats ? stats.affected_modules_count : "..."}
          </div>
          <div className="text-[10px] text-[#71717A] font-mono">
            Live components monitored
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`p-5 rounded-xl border space-y-2 transition-all ${
          stats && stats.open_conflicts > 0
            ? "bg-red-950/25 border-red-900/60 shadow-lg shadow-red-950/20"
            : "bg-[#09090B] border-[#27272F]"
        }`}>
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Open Conflicts</span>
            <AlertTriangle className={`w-4 h-4 ${stats && stats.open_conflicts > 0 ? "text-red-400" : "text-emerald-400"}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono ${stats && stats.open_conflicts > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {stats ? stats.open_conflicts : "..."}
          </div>
          <div className="text-[10px] font-mono text-[#71717A]">
            {stats && stats.open_conflicts > 0 ? "Requires developer alignment" : "All contracts aligned"}
          </div>
        </div>
      </div>

      {/* Active Conflict Spotlight */}
      {stats && stats.active_conflicts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                Active Contradictions Requiring Reconciliation ({stats.active_conflicts.length})
              </h2>
            </div>
            <Link
              href="/conflicts"
              className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <span>Conflict Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.active_conflicts.map((conf) => (
              <ConflictCard key={conf.id} conflict={conf} onResolved={fetchStats} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Handoffs Stream */}
      <div className="rounded-xl bg-[#09090B] border border-[#27272F] overflow-hidden">
        <div className="p-5 border-b border-[#27272F] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recent AI Work Handoffs
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Chronological memory log of contributions from AI coding assistants
            </p>
          </div>
          <Link
            href="/handoffs"
            className="text-xs font-mono text-[#F5F5F5] hover:underline flex items-center gap-1"
          >
            <span>+ Submit Handoff</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#000000] text-[#71717A] font-mono uppercase text-[10px] tracking-wider border-b border-[#27272F]">
              <tr>
                <th className="py-3 px-4">Title & Completed Work</th>
                <th className="py-3 px-4">Source Tool</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Contracts / Decisions</th>
                <th className="py-3 px-4">Modules Affected</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181820]">
              {stats?.recent_handoffs.map((h) => (
                <tr key={h.id} className="hover:bg-[#111116] transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-white truncate">{h.title}</div>
                    <div className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{h.completed_work}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getToolBadge(h.source_tool)}`}>
                      {h.source_tool}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#A1A1AA] font-mono whitespace-nowrap">
                    {h.author_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#71717A] whitespace-nowrap">
                    {h.api_contracts.length} contract{h.api_contracts.length === 1 ? "" : "s"}, {h.technical_decisions.length} decision{h.technical_decisions.length === 1 ? "" : "s"}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {h.affected_modules.map((m) => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-[#15151B] border border-[#27272F] text-[10px] font-mono text-[#A1A1AA]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#71717A] font-mono text-[11px] whitespace-nowrap">
                    {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
