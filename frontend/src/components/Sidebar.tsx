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
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink
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
      setToastMsg(`Conflict injected! Detected: ${res.conflicts_detected}`);
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
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Submit Handoff", href: "/handoffs", icon: GitPullRequestDraft },
    { label: "Knowledge Graph", href: "/graph", icon: Network },
    { label: "Conflict Explorer", href: "/conflicts", icon: AlertTriangle },
  ];

  return (
    <aside className="w-72 bg-[#121317] border-r border-[#22242B] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header with Official Logo */}
      <div>
        <div className="p-5 border-b border-[#22242B]">
          <Link href="/" className="block group">
            <div className="bg-[#16171D] border border-[#24262E] rounded-xl p-2.5 shadow-sm group-hover:border-[#383B46] transition-all">
              <div className="relative w-full h-11 flex items-center justify-center">
                <Image
                  src="/stayqen-logo.png"
                  alt="STAYQEN Logo"
                  fill
                  sizes="260px"
                  priority
                  className="object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#8C867E]">
                Shared Project Memory
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202229] text-[#B5AFA7] border border-[#2C2E37]">
                v1.0 MVP
              </span>
            </div>
          </Link>

          {/* Engine Status Badge */}
          <div className="mt-3.5 flex items-center justify-between px-3 py-2 rounded-lg bg-[#18191F] border border-[#23252E] text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#B5AFA7]" />
              <span className="text-gray-300 font-medium text-[11px]">FalkorDB Memory</span>
            </div>
            {falkorConnected === null ? (
              <span className="text-gray-500 text-[10px]">Connecting...</span>
            ) : falkorConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#20222A] text-white border border-[#30333E] shadow-inner"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#18191E]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#DCD8D3]" : "text-gray-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Demo Actions & Footer */}
      <div className="p-4 border-t border-[#22242B] bg-[#101115]/50 space-y-3">
        {toastMsg && (
          <div className="text-xs bg-[#1F2129] border border-[#353844] text-[#E4E0DB] p-2 rounded-lg text-center animate-fade-in font-mono">
            {toastMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="text-[10px] font-mono tracking-wider text-gray-500 uppercase px-1">
            Hackathon Verification
          </div>
          <button
            onClick={handleTriggerConflict}
            disabled={isDemoTriggering}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 text-xs font-medium transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{isDemoTriggering ? "Analyzing..." : "Trigger Test Conflict"}</span>
          </button>
          
          <button
            onClick={handleResetDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#18191E] hover:bg-[#202229] border border-[#292B33] text-gray-400 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-gray-400" />
            <span>Reset Demo Memory</span>
          </button>
        </div>

        <div className="pt-2 text-[10px] text-gray-500 font-mono flex items-center justify-between border-t border-[#1F2127]">
          <span>Multi-AI Memory Layer</span>
          <span className="text-[#8C867E]">FastAPI + FalkorDB</span>
        </div>
      </div>
    </aside>
  );
}
