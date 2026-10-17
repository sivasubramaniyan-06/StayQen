"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  GitPullRequestDraft, 
  Network, 
  AlertTriangle, 
  Database, 
  FileCode2,
  Layers,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [falkorConnected, setFalkorConnected] = useState<boolean | null>(null);
  const [isDemoTriggering, setIsDemoTriggering] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setFalkorConnected(data.falkordb_connected);
    } catch {
      setFalkorConnected(false);
    }
  };

  const handleTriggerConflict = async () => {
    setIsDemoTriggering(true);
    try {
      const res = await api.triggerDeterministicConflict();
      setToastMsg(`Conflict detected: ${res.conflicts_detected} issue(s)`);
      window.dispatchEvent(new Event("stayqen:refresh"));
    } catch (err: any) {
      setToastMsg(`Error: ${err.message}`);
    } finally {
      setIsDemoTriggering(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetAndSeedDemo();
      setToastMsg("Memory reset to baseline!");
      window.dispatchEvent(new Event("stayqen:refresh"));
    } catch (err: any) {
      setToastMsg(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Submit Handoff", href: "/handoffs", icon: GitPullRequestDraft },
    { label: "Knowledge Graph", href: "/graph", icon: Network },
    { label: "Conflict Explorer", href: "/conflicts", icon: AlertTriangle },
    { label: "API Contracts", href: "/contracts", icon: FileCode2 },
    { label: "Modules", href: "/modules", icon: Layers },
  ];

  return (
    <aside className="w-64 bg-[#09090B] border-r border-[#27272F] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header with Transparent STAYQEN Logo directly on black background */}
      <div>
        <div className="p-5 border-b border-[#27272F]">
          <Link href="/" className="block group">
            {/* Zero gray/white box: Transparent logo on pure black */}
            <div className="relative w-full h-10 flex items-center justify-start">
              <Image
                src="/stayqen-logo.png"
                alt="STAYQEN Logo"
                fill
                sizes="240px"
                priority
                className="object-contain object-left transition-transform group-hover:scale-[1.01]"
              />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-[9px] tracking-widest uppercase font-mono text-[#A1A1AA]">
                SHARED PROJECT MEMORY
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#15151B] text-[#A1A1AA] border border-[#27272F]">
                v1.0
              </span>
            </div>
          </Link>

          {/* Engine Status Badge */}
          <div className="mt-3.5 flex items-center justify-between px-3 py-2 rounded-lg bg-[#111116] border border-[#27272F] text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span className="text-gray-300 font-medium text-[11px]">FalkorDB Memory</span>
            </div>
            {falkorConnected === null ? (
              <span className="text-gray-500 text-[10px]">Connecting...</span>
            ) : falkorConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                FALLBACK
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#15151B] text-white border border-[#27272F] shadow-sm font-semibold"
                    : "text-[#A1A1AA] hover:text-white hover:bg-[#111116]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F5F5F5]" : "text-[#71717A]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Demo Actions & Footer */}
      <div className="p-4 border-t border-[#27272F] bg-[#09090B] space-y-3">
        {toastMsg && (
          <div className="text-[11px] bg-[#15151B] border border-[#27272F] text-[#F5F5F5] p-2 rounded-lg text-center font-mono">
            {toastMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="text-[9px] font-mono tracking-wider text-[#71717A] uppercase px-1">
            Verification Controls
          </div>
          <button
            onClick={handleTriggerConflict}
            disabled={isDemoTriggering}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 text-xs font-medium transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{isDemoTriggering ? "Analyzing..." : "Trigger Test Conflict"}</span>
          </button>
          
          <button
            onClick={handleResetDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#111116] hover:bg-[#15151B] border border-[#27272F] text-[#A1A1AA] hover:text-white text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#71717A]" />
            <span>Reset Demo Memory</span>
          </button>
        </div>

        <div className="pt-2 text-[10px] text-[#71717A] font-mono flex items-center justify-between border-t border-[#1C1C24]">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            ← Public Landing
          </Link>
          <span>Port 8000</span>
        </div>
      </div>
    </aside>
  );
}
