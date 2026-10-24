import React from "react";
import Link from "next/link";
import LightRays from "./LightRays";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Terminal } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      {/* Light Rays Background Component */}
      <LightRays />

      {/* Hero Eyebrow Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-brand-primary/30 text-zinc-300 text-xs font-mono mb-8 hover:border-brand-primary/60 transition-colors animate-in fade-in-50 duration-700">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
        </span>
        <span className="text-zinc-200">Axiom Labs Studio</span>
        <span className="text-zinc-500">•</span>
        <span className="text-brand-primary">Enterprise AI &amp; Systems Architecture</span>
      </div>

      {/* Staggered Heading */}
      <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
        Architecting Digital Systems That{" "}
        <span className="bg-gradient-to-r from-white via-zinc-200 to-brand-primary bg-clip-text text-transparent">
          Think, Scale, and Matter.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl text-base sm:text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-normal">
        Axiom Labs partners with ambitious technology leaders to build sovereign AI infrastructure, autonomous agent orchestration networks, and precision digital flagships.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
        <Link
          href="/contact"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:-translate-y-0.5"
        >
          <span>Schedule Architecture Review</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/work"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full glass-panel hover:bg-white/[0.08] text-zinc-300 hover:text-white text-sm font-semibold transition-all duration-200 border border-white/10 hover:border-white/20"
        >
          <span>Explore 7 Case Studies</span>
        </Link>
      </div>

      {/* Trust & Spec Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl w-full border-t border-white/[0.08] pt-8 text-left">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">&lt; 85ms Latency</div>
            <div className="text-[11px] text-zinc-400">Median Token Streaming</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">SOC2 &amp; HIPAA</div>
            <div className="text-[11px] text-zinc-400">Zero-Retention Security</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">MCP Native</div>
            <div className="text-[11px] text-zinc-400">Autonomous Protocol</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">99.99% SLA</div>
            <div className="text-[11px] text-zinc-400">Distributed Edge Infra</div>
          </div>
        </div>
      </div>
    </section>
  );
}
