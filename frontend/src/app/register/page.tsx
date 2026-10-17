"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Sparkles,
  GitPullRequestDraft,
  Network,
  AlertTriangle
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex@company.com");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("stayqen_user", JSON.stringify({ email, name }));
      }
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col md:flex-row">
      {/* Left Column: Brand & Architecture */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#27272F] bg-[#000000]">
        <div>
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
              Join Your Team&apos;s Shared Project Memory
            </h1>

            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Create an account to start syncing code handoffs, API contracts, and architecture decisions across all AI coding assistants.
            </p>
          </div>

          <div className="mt-10 space-y-4 max-w-md">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#09090B] border border-[#27272F]">
              <div className="p-2 rounded-lg bg-[#15151B] text-purple-400 shrink-0">
                <GitPullRequestDraft className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Ingest Handoffs in Seconds</h4>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Paste work summaries and contracts from ChatGPT, Gemini, and Antigravity.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#09090B] border border-[#27272F]">
              <div className="p-2 rounded-lg bg-[#15151B] text-cyan-400 shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Full Graph Visibility</h4>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">Explore the live Cypher dependency graph of modules and endpoints.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs font-mono text-[#71717A]">
          STAYQEN AI Systems Architecture • v1.0 MVP
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-[#000000]">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Create an account</h2>
            <p className="text-xs text-[#A1A1AA]">
              Start aligning multi-AI development across your organization
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272F] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#71717A]"
                />
              </div>
            </div>

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
              <label className="block text-xs font-mono text-[#A1A1AA] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#09090B] border border-[#27272F] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#71717A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs shadow-md transition-all hover:scale-[1.01]"
            >
              <span>{loading ? "Creating..." : "Create Account & Enter"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#A1A1AA]">
            <span>Already have an account? </span>
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
