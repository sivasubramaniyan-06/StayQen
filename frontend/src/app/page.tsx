"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  GitPullRequestDraft, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { DashboardStats, api } from "@/lib/api";

export default function LandingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col selection:bg-[#27272F] selection:text-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Vibrant Blue Gradient
          Centered headline, superhero illustration,
          floating productivity cards, CTA buttons
         ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0f2280 0%, #1a3aad 20%, #2563eb 45%, #3b82f6 65%, #6366f1 85%, #7c3aed 100%)",
        }}
      >
        {/* Subtle radial glow at top-center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.10) 0%, transparent 70%)",
          }}
        />

        {/* ── Top Navigation ── */}
        <header className="relative z-20 px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between">
          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/stayqen-logo.png"
                alt="Stayqen logo"
                fill
                priority
                sizes="32px"
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Stayqen</span>
          </Link>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Features", "How it Works", "About"].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-colors ${item === "Home" ? "text-white border-b-2 border-white pb-0.5" : "text-blue-200 hover:text-white"}`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", boxShadow: "0 4px 20px rgba(99,102,241,0.5)" }}
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* ── Hero Content (Centered Above Illustration) ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-8 sm:pt-12 pb-0">
          {/* Large brand wordmark */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-4"
            style={{ color: "#fff", textShadow: "0 2px 30px rgba(0,0,0,0.25)" }}
          >
            <span style={{ color: "#fff" }}>Stay</span>
            <span style={{ color: "#93c5fd" }}>qen</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.2)" }}>
            Small Steps. Bigger You.
          </p>

          {/* Tagline */}
          <p className="text-sm sm:text-base text-blue-100 max-w-lg mb-8 leading-relaxed">
            A smart habit tracker to help you stay consistent,<br className="hidden sm:inline" />
            build better routines, and achieve your goals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.04] active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", boxShadow: "0 6px 28px rgba(99,102,241,0.55)" }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white border transition-all hover:scale-[1.04] active:scale-[0.97]"
              style={{ borderColor: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
                <polygon points="10,8 16,12 10,16" fill="white" />
              </svg>
              Watch Demo
            </button>
          </div>
        </div>

        {/* ── Hero Illustration — Full Width at Bottom ── */}
        <div className="relative z-10 w-full flex-1 flex items-end overflow-hidden" style={{ minHeight: "380px" }}>
          {/* Floating productivity cards — Left side */}
          <div className="absolute left-[4%] top-[8%] z-20 hidden sm:flex flex-col gap-3">
            {[
              { icon: "🎯", label: "Set Goals" },
              { icon: "📅", label: "Build Habits" },
              { icon: "📊", label: "Track Progress" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Floating productivity cards — Right side */}
          <div className="absolute right-[4%] top-[8%] z-20 hidden sm:flex flex-col gap-3">
            {[
              { icon: "🏆", label: "Achieve More" },
              { icon: "👥", label: "A Better You" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Main illustration image */}
          <div className="w-full h-full relative" style={{ minHeight: "380px" }}>
            <Image
              src="/stayqen-hero-illustration.jpg"
              alt="Stayqen superhero collaboration illustration"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
              style={{ maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 15%, rgba(0,0,0,1) 35%)" }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BELOW-THE-FOLD SECTIONS — Real System Capabilities
         ═══════════════════════════════════════════════ */}

      {/* Live Product Preview */}
      <section id="preview" className="px-6 max-w-6xl mx-auto py-16">
        <div className="rounded-2xl border border-[#27272F] bg-[#09090B] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272F] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Live System Intelligence
              </span>
              <h2 className="text-lg font-bold text-white">
                Cross-Assistant Coordination Engine
              </h2>
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

      {/* Feature Architecture Cards */}
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
          <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-purple-400">
              <GitPullRequestDraft className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Shared AI Project Memory</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Structured capture of completed work, unfinished tasks, technical decisions, and blockers from any AI coding tool.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Knowledge Graph Relationships</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              FalkorDB graph engine mapping relationships between projects, team members, handoffs, API contracts, and modules.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cross-AI Conflict Detection</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Continuous comparison of incoming handoffs against existing memory to detect breaking schema changes and contradictory decisions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272F] hover:border-[#3F3F46] transition-colors space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#15151B] border border-[#27272F] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Evidence-Based Resolution</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Side-by-side evidence inspection tracing each side to its original tool and author, with 1-click reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* Final Action Section */}
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ECECEE] hover:bg-white text-black font-semibold text-sm transition-all hover:scale-[1.02]"
          >
            <span>Enter STAYQEN Platform</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>
        </div>
      </section>

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
            <Link href="/handoffs" className="hover:text-white transition-colors">AI Handoffs</Link>
            <Link href="/graph" className="hover:text-white transition-colors">Knowledge Graph</Link>
            <Link href="/conflicts" className="hover:text-white transition-colors">Conflict Explorer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
