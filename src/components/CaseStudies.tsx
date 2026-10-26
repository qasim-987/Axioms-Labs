"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ViewWorkCursor from "./ViewWorkCursor";

export default function CaseStudies() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section
      id="work"
      className="relative w-full bg-[#000000] text-white pt-12 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 border-t border-white/15"
    >
      <div className="max-w-[1800px] mx-auto w-full">
        {/* 50/50 Two-Card Project Grid with ~24px gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* ================= CARD 01 (Left: Dark Card) ================= */}
          <div className="flex flex-col w-full">
            {/* Index Label "01" above card */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 px-1">
              <span className="text-xl sm:text-2xl font-light tracking-wide text-white font-mono">
                01
              </span>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                Axiom Studio • Case Study
              </span>
            </div>

            {/* Project Link Card */}
            <Link
              href="/work/strata-systems"
              data-cursor="view-work"
              data-cursor-label="View Work"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative w-full h-[480px] sm:h-[560px] md:h-[620px] lg:h-[700px] bg-[#050508] border border-white/[0.08] hover:border-white/25 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-500 ease-out select-none"
            >
              {/* Tool Icon Badge (Photoshop "Ps" badge, ~26px) at top-left under index */}
              <div className="absolute top-5 left-5 z-20 pointer-events-none">
                <div
                  className={`w-7 h-7 rounded-md bg-[#001e36] border border-[#31a8ff]/40 flex items-center justify-center shadow-lg transition-opacity duration-200 ${
                    hoveredCard === 1 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="text-[#31a8ff] font-bold text-xs tracking-tighter">
                    Ps
                  </span>
                </div>
              </div>

              {/* Sub-label top-right */}
              <div className="absolute top-5 right-5 z-20 flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs text-zinc-400 font-mono">Autonomous Cloud</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Mockup Canvas Area (Dark Card) */}
              <div className="relative w-full h-full flex flex-col items-center justify-end px-4 sm:px-8 pt-16 overflow-hidden">
                {/* Background Atmosphere glow */}
                <div className="absolute inset-0 bg-radial-gradient from-[#1a1233]/40 via-transparent to-transparent pointer-events-none" />

                {/* Device Mockup (Laptop / Monitor with warm amber screen glow) */}
                <div className="relative w-full max-w-[560px] transition-transform duration-700 ease-out group-hover:scale-[1.015] origin-bottom">
                  {/* Laptop Screen Bezel */}
                  <div className="relative rounded-t-xl bg-[#111115] border-t-2 border-x-2 border-[#2b2b35] p-3 pb-0 shadow-2xl shadow-black">
                    {/* Screen Camera Notch */}
                    <div className="w-2.5 h-2.5 rounded-full bg-black mx-auto mb-2 border border-zinc-800" />

                    {/* Active Mockup Screen */}
                    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] bg-gradient-to-b from-[#18120d] via-[#100a06] to-[#040201] rounded-t-lg overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-white/5">
                      {/* Top Bar inside mockup */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-3">
                        <span className="font-semibold tracking-wider text-amber-200/90">
                          STRATA SYSTEMS
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500">Architecture</span>
                          <span className="text-zinc-500">Autonomous</span>
                          <span className="text-zinc-500">Live 99.9%</span>
                        </div>
                      </div>

                      {/* Mockup Center Headline matching reference footage */}
                      <div className="my-auto text-center px-2">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white tracking-tight leading-snug">
                          The Standard for
                          <br />
                          <span className="font-semibold text-white">Modern Supervision.</span>
                        </h3>

                        {/* Telemetry Badge / Watch-style display */}
                        <div className="mt-6 inline-flex items-center justify-center">
                          <div className="relative w-20 h-20 rounded-2xl bg-black/80 border border-amber-500/30 shadow-xl shadow-amber-500/10 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-mono uppercase text-amber-400/80">
                              TELEMETRY
                            </span>
                            <span className="text-lg font-bold font-mono text-white tracking-wider mt-0.5">
                              10:15
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom status line */}
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Axiom Studio Production Build</span>
                        <span>0.00ms Latency</span>
                      </div>
                    </div>
                  </div>

                  {/* Laptop Base Stand */}
                  <div className="w-[110%] -ml-[5%] h-3 bg-gradient-to-b from-[#222228] to-[#121216] rounded-b-md shadow-2xl border-t border-zinc-700/40" />
                </div>
              </div>
            </Link>
          </div>

          {/* ================= CARD 02 (Right: Light Gray #e8e8e8 Card) ================= */}
          <div className="flex flex-col w-full">
            {/* Index Label "02" above card */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 px-1">
              <span className="text-xl sm:text-2xl font-light tracking-wide text-white font-mono">
                02
              </span>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                Axiom Studio • Case Study
              </span>
            </div>

            {/* Project Link Card with Light Gray Background */}
            <Link
              href="/work/zenith-health"
              data-cursor="view-work"
              data-cursor-label="View Work"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative w-full h-[480px] sm:h-[560px] md:h-[620px] lg:h-[700px] bg-[#e8e8e8] border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-500 ease-out select-none"
            >
              {/* Tool Icon Badge (Photoshop "Ps" badge, ~26px) at top-left under index */}
              <div className="absolute top-5 left-5 z-20 pointer-events-none">
                <div
                  className={`w-7 h-7 rounded-md bg-[#001e36] border border-[#31a8ff]/40 flex items-center justify-center shadow-lg transition-opacity duration-200 ${
                    hoveredCard === 2 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="text-[#31a8ff] font-bold text-xs tracking-tighter">
                    Ps
                  </span>
                </div>
              </div>

              {/* Sub-label top-right */}
              <div className="absolute top-5 right-5 z-20 flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs text-zinc-600 font-mono">Healthcare Intelligence</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>

              {/* Mockup Canvas Area (Light Gray #e8e8e8 Card) */}
              <div className="relative w-full h-full flex flex-col items-center justify-end px-4 sm:px-8 pt-16 overflow-hidden">
                {/* Desktop iMac Device Mockup */}
                <div className="relative w-full max-w-[560px] transition-transform duration-700 ease-out group-hover:scale-[1.015] origin-bottom">
                  {/* iMac Outer Bezel */}
                  <div className="relative rounded-t-2xl bg-[#0a0a0c] border-t-2 border-x-2 border-[#1a1a20] p-3 pb-0 shadow-2xl shadow-black/30">
                    {/* Screen Camera */}
                    <div className="w-2 h-2 rounded-full bg-black mx-auto mb-2 border border-zinc-800" />

                    {/* Active Mockup Screen */}
                    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] bg-gradient-to-b from-[#101b2a] via-[#09111c] to-[#04080e] rounded-t-lg overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-white/5">
                      {/* Dark Navbar inside mockup on light card (gives the exact split inversion in frame_01!) */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 border-b border-white/10 pb-3">
                        <span className="font-semibold tracking-wider text-cyan-300">
                          ZENITH HEALTH
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400">Clinical AI</span>
                          <span className="text-zinc-400">HIPAA Verified</span>
                          <span className="text-zinc-400">VPC Native</span>
                        </div>
                      </div>

                      {/* Mockup Headline matching reference footage */}
                      <div className="my-auto text-center px-2">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-normal text-white tracking-tight leading-snug">
                          Creating the New Standard for
                          <br />
                          <span className="font-semibold text-white">
                            Innovative Materials &amp; Manufacturing.
                          </span>
                        </h3>

                        {/* Manufacturing / Medical Telemetry Strip */}
                        <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 border border-cyan-500/25 backdrop-blur-md">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono text-zinc-300">
                            Neural Pipeline Active • 99.4% Precision
                          </span>
                        </div>
                      </div>

                      {/* Bottom status line */}
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Axiom Studio Enterprise Client</span>
                        <span>SOC2 Type II</span>
                      </div>
                    </div>

                    {/* iMac Aluminum Chin */}
                    <div className="w-full h-8 bg-gradient-to-b from-[#d4d4d8] via-[#e4e4e7] to-[#cbd5e1] flex items-center justify-center border-t border-zinc-300 shadow-inner">
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-600/30" />
                    </div>
                  </div>

                  {/* iMac Stand */}
                  <div className="w-28 h-10 bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8] mx-auto rounded-b shadow-xl" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Explore Link */}
        <div className="mt-12 sm:mt-16 flex items-center justify-between border-t border-white/[0.08] pt-6">
          <p className="text-xs sm:text-sm text-zinc-500 font-mono">
            Showing 01 — 02 of 7 enterprise client case studies
          </p>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-primary hover:text-white transition-colors group"
          >
            <span>View all 7 case studies</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
