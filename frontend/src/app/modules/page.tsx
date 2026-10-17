"use client";

import React, { useEffect, useState } from "react";
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileCode2, 
  GitCommit,
  Cpu
} from "lucide-react";
import { api } from "@/lib/api";

export default function ModulesCatalogPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await api.getModulesCatalog();
      setModules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272F]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Project Modules & Dependencies</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Component boundaries monitored by STAYQEN to track blast radius when AI tools make changes.
          </p>
        </div>

        <button
          onClick={loadModules}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-[#15151B] border border-[#27272F] text-xs text-[#A1A1AA] hover:text-white font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => {
          const hasConflict = m.status === "conflict";
          return (
            <div
              key={m.id}
              className={`rounded-xl border p-5 transition-all space-y-4 ${
                hasConflict 
                  ? "bg-[#09090B] border-red-900/60 shadow-lg shadow-red-950/20" 
                  : "bg-[#09090B] border-[#27272F]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h3 className="text-sm font-bold font-mono text-white">{m.name}</h3>
                </div>

                {hasConflict ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/60 text-red-400 border border-red-800/60">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    AFFECTED BY CONFLICT
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    STABLE
                  </span>
                )}
              </div>

              {/* Related API Contracts */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#71717A] flex items-center gap-1">
                  <FileCode2 className="w-3 h-3 text-cyan-400" />
                  Associated API Contracts ({m.related_contracts.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {m.related_contracts.length > 0 ? (
                    m.related_contracts.map((c: string) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-[#111116] border border-[#27272F] text-[10px] font-mono text-cyan-300">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#71717A] font-mono">No direct contracts bound</span>
                  )}
                </div>
              </div>

              {/* Related Handoffs */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#71717A] flex items-center gap-1">
                  <GitCommit className="w-3 h-3 text-purple-400" />
                  Contributing AI Sessions ({m.related_handoffs.length})
                </span>
                <div className="space-y-1 pt-0.5">
                  {m.related_handoffs.map((h: string) => (
                    <div key={h} className="text-[11px] text-[#A1A1AA] font-mono truncate">
                      • {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              <div className="pt-2 border-t border-[#1C1C24] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                <span>Dependencies:</span>
                <div className="flex gap-1.5">
                  {m.dependencies.map((d: string) => (
                    <span key={d} className="px-1.5 py-0.5 rounded bg-[#15151B] text-[#A1A1AA] border border-[#27272F] text-[10px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
