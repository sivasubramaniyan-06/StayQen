"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Sparkles,
  GitPullRequestDraft,
  Network,
  AlertTriangle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("engineer@stayqen.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Client-side session for MVP
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("stayqen_user", JSON.stringify({ email, name: email.split("@")[0] }));
      }
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col md:flex-row">
      {/* Left Column: Brand Hero & Highlights (Pure black background) */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#27272F] bg-[#000000]">
        <div>
          {/* Transparent Logo on Pure Black - No Box */}
          <Link href="/" className="inline-block">
            <div className="relative w-44 h-12">
              <Image
                src="/stayqen-logo.png"
                alt="STAYQEN Logo"
                fill
                priority
                sizes="200px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div className="mt-12 space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] border border-[#27272F] text-[11px] font-mono text-[#A1A1AA]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-AI Engineering Coordination</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Shared Project Memory for AI Coding Teams
            </h1>

            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Connect decisions, contracts, and handoffs from ChatGPT, Gemini, Antigravity, and Claude into a unified FalkorDB knowledge graph.
            </p>
          </div>

          {/* Three Feature Highlights */}
          <div className="mt-10 space-y-4 max-w-md">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#09090B] border border-[#27272F]">
              <div className="p-2 rounded-lg bg-[#15151B] text-purple-400 shrink-0">
                <GitPullRequestDraft className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Cross-Tool Memory Capture</h4>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Record API changes and technical decisions made in different AI tools.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#09090B] border border-[#27272F]">
              <div className="p-2 rounded-lg bg-[#15151B] text-cyan-400 shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">FalkorDB Cypher Graph</h4>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Explore relationships between modules, contracts, and handoffs in real-time.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#09090B] border border-[#27272F]">
              <div className="p-2 rounded-lg bg-[#15151B] text-red-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Automated Conflict Detection</h4>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Flag breaking contract mismatches before code is integrated.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs font-mono text-[#71717A]">
          STAYQEN AI Systems Architecture • v1.0 MVP
        </div>
      </div>

      {/* Right Column: Sign-in Panel */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-[#000000]">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-xs text-[#A1A1AA]">
              Sign in to access your team&apos;s shared project memory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272F] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#71717A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-[#A1A1AA]">
                  Password
                </label>
                <span className="text-[11px] font-mono text-[#71717A] hover:text-white cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#09090B] border border-[#27272F] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#71717A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded border-[#27272F] bg-[#09090B] accent-[#F5F5F5]" />
                <span className="text-[11px]">Remember session</span>
              </label>
              <span className="text-[10px] font-mono text-[#71717A]">Local Session</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs shadow-md transition-all hover:scale-[1.01]"
            >
              <span>{loading ? "Authenticating..." : "Sign In to STAYQEN"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#A1A1AA]">
            <span>Don&apos;t have an account? </span>
            <Link href="/register" className="text-white hover:underline font-medium">
              Create an account
            </Link>
          </div>

          <div className="pt-4 border-t border-[#1C1C24] text-[11px] text-[#71717A] text-center font-mono">
            Hackathon MVP Note: Direct access enabled for review
          </div>
        </div>
      </div>
    </div>
  );
}
