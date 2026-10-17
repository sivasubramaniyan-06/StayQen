"use client";

import React from "react";
import { 
  Network, 
  Database, 
  Layers, 
  FileCode2, 
  GitCommit, 
  AlertTriangle 
} from "lucide-react";
import GraphCanvas from "@/components/GraphCanvas";

export default function GraphPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272F]">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Project Knowledge Graph</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Visual map of handoffs, API contracts, architectural decisions, and detected conflicts in FalkorDB.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09090B] border border-blue-500/50 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Project
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09090B] border border-purple-500/50 text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Handoff
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09090B] border border-cyan-500/50 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            API Contract
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09090B] border border-amber-500/50 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Decision
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-500 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Conflict
          </span>
        </div>
      </div>

      {/* React Flow Graph Canvas */}
      <GraphCanvas />

      {/* Explanatory Banner */}
      <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#71717A]" />
          <span>FalkorDB Cypher Engine: Red animated dashed edges represent recorded <code className="text-red-400 font-mono">CONTRADICTS</code> relationships.</span>
        </div>
        <div className="font-mono text-[11px] text-[#71717A]">
          Click any node to inspect raw JSON properties
        </div>
      </div>
    </div>
  );
}
