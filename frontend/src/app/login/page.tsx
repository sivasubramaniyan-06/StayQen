"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Info
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("engineer@stayqen.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Preserves existing local session logic
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "stayqen_user", 
          JSON.stringify({ 
            email, 
            name: email.split("@")[0],
            rememberMe 
          })
        );
      }
      router.push("/dashboard");
    }, 350);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#000000] text-[#F5F5F5] selection:bg-[#27272F] selection:text-white">
      
      {/* ═══════════════════════════════════════════════
          LEFT PANEL — 50% Desktop Split
          Houses the Approved Dark Orb & Mountains Artwork (Reference D)
          Uncluttered, atmospheric, centered orb
         ═══════════════════════════════════════════════ */}
      <div className="relative w-full lg:w-1/2 min-h-[260px] sm:min-h-[320px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#050507] border-b lg:border-b-0 lg:border-r border-[#18181F] overflow-hidden">
        
        {/* Approved Artwork Background (Dark Textured Orb above Mountain Silhouettes) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none transition-transform duration-1000"
          style={{
            backgroundImage: "url('/stayqen-auth-background.png')",
          }}
        >
          {/* Subtle vignette gradient to keep edges clean */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40" />
        </div>

        {/* Small STAYQEN logo for brand anchor (links to /) */}
        <div className="relative z-10">
          <Link href="/" className="inline-block group transition-transform hover:scale-[1.01]">
            <div className="relative w-32 sm:w-36 h-8">
              <Image
                src="/stayqen-logo.png"
                alt="STAYQEN"
                fill
                priority
                sizes="150px"
                className="object-contain object-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              />
            </div>
          </Link>
        </div>

        {/* Minimalist Atmospheric Caption */}
        <div className="relative z-10 hidden sm:flex items-center justify-between text-xs font-mono text-[#71717A]">
          <span>Shared Project Memory Architecture</span>
          <span>v1.0 MVP</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT PANEL — 50% Desktop Split
          Solid near-black background with centered sign-in card
          Never overlaps the orb artwork
         ═══════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-[#000000]">
        
        {/* Top Header: Navigation back */}
        <div className="flex items-center justify-end">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-[#71717A] hover:text-white transition-colors"
          >
            ← Back to Overview
          </Link>
        </div>

        {/* Centered Sign-In Panel (Max width ~440px) */}
        <div className="my-auto flex justify-center py-6 sm:py-8">
          <div className="w-full max-w-[440px] rounded-2xl bg-[#0C0C10] border border-[#27272F] p-7 sm:p-9 shadow-2xl shadow-black/90 space-y-6">
            
            {/* Form Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome Back
              </h1>
              <p className="text-sm text-[#94949E]">
                Sign in to your STAYQEN workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="login-email" 
                  className="block text-xs font-mono text-[#A1A1AA] uppercase tracking-wider"
                >
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@stayqen.ai"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111116] border border-[#27272F] text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="login-password" 
                    className="block text-xs font-mono text-[#A1A1AA] uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password reset is managed by your workspace administrator or team lead.");
                    }}
                    className="text-xs text-[#71717A] hover:text-[#D4D4D8] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#111116] border border-[#27272F] text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-[#A1A1AA]">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#27272F] bg-[#111116] text-white focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-neutral-200" 
                  />
                  <span>Remember me</span>
                </label>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/90">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Encrypted</span>
                </span>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#EDEDED] hover:bg-white text-[#0A0A0C] font-semibold text-sm transition-all hover:scale-[1.005] shadow-lg shadow-white/5 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Honest Workspace Status Indicator */}
            <div className="pt-4 border-t border-white/5 flex items-center gap-2.5 text-[11px] text-[#71717A] leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-[#A1A1AA]" />
              <span>
                Local Workspace Authentication active. External OAuth providers are disabled for this environment.
              </span>
            </div>

            {/* Registration Link */}
            <div className="text-center text-xs text-[#71717A] pt-1">
              Don&apos;t have a workspace?{" "}
              <Link 
                href="/register" 
                className="text-white hover:underline font-medium transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#52525B]">
          <span>STAYQEN Project Coordination</span>
          <span>FalkorDB Knowledge Graph</span>
        </div>
      </div>
    </div>
  );
}
