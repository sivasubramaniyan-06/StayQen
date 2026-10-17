"use client";

import React, { useEffect, useState } from "react";
import { 
  FileCode2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  GitCommit,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

export default function ContractsCatalogPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await api.getContractsCatalog();
      setContracts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272F]">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">API Contracts Registry</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Grounded API contract schemas tracked in FalkorDB across multi-AI contributions.
          </p>
        </div>

        <button
          onClick={loadContracts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#15151B] border border-[#27272F] text-xs text-[#A1A1AA] hover:text-white font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((c) => {
          const isConflicted = c.status === "conflicted";
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-5 transition-all ${
                isConflicted 
                  ? "bg-[#09090B] border-red-900/60 shadow-lg shadow-red-950/20" 
                  : "bg-[#09090B] border-[#27272F]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1C1C24] pb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                    c.method === "POST" ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/60" : "bg-purple-950/60 text-purple-300 border-purple-800/60"
                  }`}>
                    {c.method}
                  </span>
                  <span className="text-sm font-mono font-bold text-white">{c.endpoint}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isConflicted ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950/60 text-red-400 border border-red-800/60">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      DRIFT / CONFLICT DETECTED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ALIGNED
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meta details */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#71717A] block">Description</span>
                    <p className="text-[#A1A1AA] mt-0.5">{c.description || "Endpoint registered in graph memory"}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#71717A] block">Source Handoff</span>
                    <span className="text-[#F5F5F5] font-mono text-[11px]">{c.source_handoff_title}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#71717A] block mb-1">Affected Modules</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.affected_modules.map((m: string) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-[#15151B] border border-[#27272F] text-[10px] font-mono text-[#A1A1AA]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schema viewer */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#71717A] block mb-1">Response Schema</span>
                  <pre className="p-3 rounded-lg bg-[#000000] border border-[#27272F] font-mono text-[11px] text-cyan-200 overflow-x-auto max-h-40">
                    {JSON.stringify(c.response_schema, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
