"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  GitPullRequestDraft, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode2, 
  Layers, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Database,
  Terminal,
  Cpu
} from "lucide-react";
import { DashboardStats, api } from "@/lib/api";

export default function LandingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col justify-between selection:bg-[#27272F] selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-[#27272F] bg-[#000000]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo on Pure Black - No Box */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-36 h-9">
              <Image
                src="/stayqen-logo.png"
                alt="STAYQEN Logo"
                fill
                priority
                sizes="180px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-[#A1A1AA]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#preview" className="hover:text-white transition-colors">Live Preview</a>
          </nav>

          {/* Auth / App CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-mono text-[#A1A1AA] hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs transition-all hover:scale-[1.02]"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-6 max-w-5xl mx-auto text-center space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] border border-[#27272F] text-xs font-mono text-[#A1A1AA]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Shared Project Memory & Conflict Coordination Layer</span>
          </div>

          {/* Prominent Transparent Logo on Pure Black */}
          <div className="relative w-full max-w-md h-24 sm:h-28 mx-auto flex items-center justify-center">
            <Image
              src="/stayqen-logo.png"
              alt="STAYQEN Logo"
              fill
              priority
              sizes="440px"
              className="object-contain drop-shadow-[0_4px_24px_rgba(255,255,255,0.06)]"
            />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Different AI Tools. <br />
            <span className="text-[#A1A1AA]">One Connected Intelligence.</span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            STAYQEN connects technical decisions, API contracts, modules, and work handoffs produced by ChatGPT, Gemini, Antigravity, and Claude into an interconnected FalkorDB graph memory.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-sm transition-all shadow-lg hover:scale-[1.02]"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#111116] hover:bg-[#15151B] border border-[#27272F] text-white text-sm font-medium transition-colors"
            >
              <span>Explore the Platform</span>
              <ArrowRight className="w-4 h-4 text-[#A1A1AA]" />
            </Link>
          </div>
        </section>

        {/* Live Product Preview */}
        <section id="preview" className="px-6 max-w-6xl mx-auto py-12">
          <div className="rounded-2xl border border-[#27272F] bg-[#09090B] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272F] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                  Live System Intelligence
                </span>
                <h3 className="text-lg font-bold text-white">
                  Cross-Assistant Coordination Engine
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FalkorDB Memory Active
                </span>
              </div>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#111116] border border-[#27272F] space-y-1">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Recorded Handoffs</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {stats ? stats.total_handoffs : "2"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-[#27272F] space-y-1">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">API Contracts</span>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {stats ? stats.total_contracts : "2"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-[#27272F] space-y-1">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Tracked Modules</span>
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {stats ? stats.affected_modules_count : "4"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#111116] border border-red-900/40 space-y-1">
                <span className="text-[10px] font-mono text-red-400 uppercase">Open Conflicts</span>
                <div className="text-2xl font-bold font-mono text-red-400">
                  {stats ? stats.open_conflicts : "1"}
                </div>
              </div>
            </div>

            {/* Deterministic Conflict Callout */}
            <div className="p-4 rounded-xl bg-[#15151B] border border-[#27272F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/50 mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs font-mono text-red-400 uppercase font-semibold">
                    Live Conflict Detection
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    POST /api/auth/login Response Key Mismatch
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
                    ChatGPT defined OAuth2 token response as <code className="text-[#F5F5F5] font-mono">access_token</code>. Antigravity refactored payload to <code className="text-red-400 font-mono">token</code>. STAYQEN caught the breaking contract before merge.
                  </p>
                </div>
              </div>
              <Link
                href="/conflicts"
                className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-mono whitespace-nowrap"
              >
                Inspect Evidence →
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section id="features" className="py-16 px-6 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built for Modern AI-Assisted Engineering
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-purple-400">
                <GitPullRequestDraft className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Shared AI Project Memory
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Structured capture of completed work, unfinished tasks, technical decisions, and blockers from any AI coding tool.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-cyan-400">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Knowledge Graph Relationships
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                FalkorDB graph engine mapping relationships between projects, team members, handoffs, API contracts, and modules.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Cross-AI Conflict Detection
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Continuous comparison of incoming handoffs against existing memory to detect breaking schema changes and contradictory decisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Evidence-Based Resolution
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Side-by-side evidence inspection tracing each side to its original tool and author, with 1-click reconciliation.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6 border-t border-[#27272F]">
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Align Your Multi-AI Engineering Team
          </h2>
          <p className="text-sm text-[#A1A1AA] max-w-xl mx-auto">
            Stop losing context between ChatGPT, Gemini, Antigravity, and Claude. Keep decisions, contracts, and modules coordinated in a single source of truth.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-sm transition-all hover:scale-[1.02]"
            >
              <span>Enter STAYQEN Platform</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </section>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-[#27272F] bg-[#000000] py-8 px-6 text-xs text-[#71717A] font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-6">
              <Image
                src="/stayqen-logo.png"
                alt="STAYQEN"
                fill
                sizes="100px"
                className="object-contain object-left"
              />
            </div>
            <span>© 2026 STAYQEN. Shared Project Memory.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/graph" className="hover:text-white transition-colors">Knowledge Graph</Link>
            <Link href="/conflicts" className="hover:text-white transition-colors">Conflict Explorer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
