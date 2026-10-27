"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { clientsData, ClientCaseStudy } from "@/data/clients";
import SplitTextReveal from "./SplitTextReveal";
import ViewWorkCursor from "./ViewWorkCursor";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Activity,
  Bot,
  Layers,
  ShieldCheck,
  Terminal,
  TrendingUp,
} from "lucide-react";

/**
 * 100%-Width Studio Concept Visual Preview for Card 01 (Dark Obsidian + Electric Blue) & Card 02 (Cool Light Surface iMac)
 * Strictly preserves edge-to-edge 100% card width and high-contrast imagery so ViewWorkCursor's
 * mix-blend-mode: difference inverts sharply over both cards and never leaks outside the image.
 */
function ProjectShowcaseVisual({
  study,
  variant,
}: {
  study: ClientCaseStudy;
  variant: "dark" | "light";
}) {
  if (variant === "dark") {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#121317] select-none flex flex-col justify-between p-5 sm:p-7 lg:p-8">
        {/* Ambient Antigravity Electric Blue & Periwinkle Studio Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-16 w-[80%] h-[78%] rounded-full blur-3xl opacity-65"
          style={{
            background:
              "radial-gradient(circle, rgba(49,134,255,0.42) 0%, rgba(116,155,255,0.16) 52%, transparent 75%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-12 w-[72%] h-[72%] rounded-full blur-3xl opacity-55"
          style={{
            background:
              "radial-gradient(circle, rgba(0,185,92,0.22) 0%, rgba(49,134,255,0.18) 55%, transparent 78%)",
          }}
        />

        {/* Subtle Architectural Grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Full-Width Browser Chrome Header */}
        <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FC413D]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B95C]" />
            <span className="ml-2 text-[11px] font-mono tracking-wider uppercase text-white/75">
              {study.client} • {study.category}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00B95C]/15 border border-[#00B95C]/30 text-[10px] font-mono text-[#4ADE80]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B95C] animate-pulse" />
            Next.js 14 • Edge Ready
          </span>
        </div>

        {/* Full-Width 12-Col SaaS Product Workspace Mockup */}
        <div className="relative z-10 my-auto py-4 grid grid-cols-12 gap-3.5 sm:gap-4 items-stretch w-full">
          {/* Left Navigation & KPI Rail */}
          <div className="col-span-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#749BFF]">
                  WEB ARCHITECTURE
                </span>
                <Terminal className="w-3.5 h-3.5 text-[#3186FF]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {study.impactMetric}
              </div>
              <div className="text-[11px] text-[#B2BBC5] mt-1 leading-snug">
                {study.impactLabel}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              {study.architectureHighlights.slice(0, 2).map((hl) => (
                <div
                  key={hl.title}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-[#B2BBC5] truncate pr-2">
                    {hl.title}
                  </span>
                  <span className="font-mono font-semibold text-[#4ADE80]">
                    ✓
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Telemetry & Storefront Preview */}
          <div className="col-span-7 rounded-2xl bg-gradient-to-br from-[#18191D]/95 via-[#121317]/95 to-[#1D2842]/80 border border-[#3186FF]/30 p-4 sm:p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">
                  {study.title}
                </div>
                <div className="text-[11px] text-[#B2BBC5] mt-0.5 line-clamp-1">
                  {study.category} • {study.duration}
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#3186FF]/20 border border-[#3186FF]/40 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-[#749BFF]" />
              </div>
            </div>

            {/* Synthetic Performance Bars */}
            <div className="my-4 space-y-2.5">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-[#B2BBC5] mb-1">
                  <span>SSR Streaming &amp; Edge Cache</span>
                  <span className="text-[#4ADE80]">99 / 100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-[#3186FF] via-[#749BFF] to-[#00B95C]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono text-[#B2BBC5] mb-1">
                  <span>Checkout Interaction Latency</span>
                  <span className="text-[#749BFF]">&lt; 50ms</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#3186FF] to-[#FBBC04]" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {study.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-white/[0.07] border border-white/10 text-[10px] font-mono text-[#E6EAF0]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Studio Footer Strip */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-[11px] font-mono text-[#B2BBC5]">
          <span>Axiom Studio • Concept Showcase</span>
          <span className="text-[#749BFF] flex items-center gap-1">
            Interactive Build <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // Light Studio Display Canvas (Antigravity Surface Container High #EFF2F7 -> #E1E6EC)
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#F8F9FC] via-[#EFF2F7] to-[#E1E6EC] select-none flex flex-col justify-between p-5 sm:p-7 lg:p-8">
      {/* Soft Studio Key-Light & Shadow Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 w-[75%] h-[70%] rounded-full blur-3xl opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(49,134,255,0.14) 60%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#CDD4DC]/55 to-transparent"
      />

      {/* Top Studio Metadata Strip */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#45474D]">
        <span className="uppercase tracking-wider font-semibold text-[#121317]">
          {study.client} • Web Design Concept
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-white/85 border border-[#212226]/10 text-[#121317] font-medium shadow-sm">
          {study.category}
        </span>
      </div>

      {/* Centered Wide Studio Monitor Mockup */}
      <div className="relative z-10 my-auto pt-3 flex flex-col items-center w-full">
        {/* Monitor Bezel */}
        <div className="w-full rounded-2xl bg-[#121317] p-2 sm:p-2.5 shadow-[0_24px_56px_rgba(18,19,23,0.22)] border border-[#212226]/20">
          {/* Screen Content */}
          <div className="w-full rounded-xl bg-white overflow-hidden border border-[#E6EAF0]">
            {/* Minimalist Website Topbar inside Screen */}
            <div className="px-4 py-2.5 bg-[#F8F9FC] border-b border-[#E6EAF0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#121317] flex items-center justify-center text-[10px] font-bold text-white">
                  A
                </div>
                <span className="text-xs font-bold text-[#121317] tracking-tight">
                  {study.client}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#45474D] font-medium">
                <span>Architecture</span>
                <span>Motion</span>
                <span>Design System</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#121317] text-[10px] font-semibold text-white">
                Live Preview
              </span>
            </div>

            {/* Screen Body Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-12 gap-4 items-center bg-gradient-to-br from-white via-[#F8F9FC] to-[#EFF2F7]">
              <div className="col-span-7 space-y-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3186FF]/10 text-[#3186FF] text-[10px] font-semibold">
                  <Sparkles className="w-3 h-3" /> Editorial Web Design
                </span>
                <div className="text-sm sm:text-base font-extrabold text-[#121317] leading-snug">
                  {study.title}
                </div>
                <p className="text-[11px] text-[#45474D] line-clamp-2 leading-relaxed">
                  {study.challenge}
                </p>
              </div>

              <div className="col-span-5 rounded-xl bg-[#121317] text-white p-3.5 shadow-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF]">
                  BENCHMARK
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono mt-0.5 text-white">
                  {study.impactMetric}
                </div>
                <div className="text-[10px] text-[#B2BBC5] mt-0.5 leading-tight">
                  {study.impactLabel}
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-[#4ADE80] font-mono">
                  <CheckCircle2 className="w-3 h-3" /> 60fps Motion
                </div>
              </div>
            </div>
          </div>

          {/* Monitor Chin */}
          <div className="h-3 sm:h-3.5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Brushed Aluminum Pedestal Stand */}
        <div className="w-16 sm:w-20 h-4 sm:h-5 bg-gradient-to-b from-[#B2BBC5] to-[#CDD4DC] shadow-inner" />
        <div className="w-28 sm:w-36 h-1.5 rounded-full bg-gradient-to-r from-[#B2BBC5] via-[#F8F9FC] to-[#B2BBC5] shadow-md" />
      </div>

      {/* Bottom Caption */}
      <div className="relative z-10 flex items-center justify-between pt-2 text-[11px] font-mono text-[#45474D]">
        <span>Axiom Studio • Design Showcase</span>
        <span className="font-semibold text-[#121317] flex items-center gap-1">
          Explore Concept <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

const secondaryIcons = [
  <Layers key="layers" className="w-4 h-4 text-[#3186FF]" />,
  <Bot key="bot" className="w-4 h-4 text-[#00B95C]" />,
  <ShieldCheck key="shield" className="w-4 h-4 text-[#FC413D]" />,
  <Activity key="activity" className="w-4 h-4 text-[#FBBC04]" />,
];

export default function CaseStudies() {
  const featuredShowcase = clientsData.slice(0, 2);
  const additionalStudies = clientsData.slice(2);

  return (
    <section
      id="work"
      className="relative py-24 sm:py-32 bg-[#FFFFFF] border-t border-[#212226]/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
              <span>STUDIO CONCEPT BUILDS</span>
            </div>
            <SplitTextReveal
              as="h2"
              text="Selected Concept Showcases"
              accentFromWordIndex={2}
              accentClassName="text-[#3186FF]"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121317]"
            />
          </div>
          <p className="text-[#45474D] max-w-md text-sm sm:text-base leading-relaxed">
            Explore our studio-crafted concept builds demonstrating our
            production standards in Web Development, Web Designing, UI/UX
            Design, and AI Agents.
          </p>
        </div>

        {/* =====================================================================
            FEATURED 50/50 STUDIO SHOWCASE (01 & 02)
            - Image fills 100% of each card's width (`w-full` edge-to-edge)
            - `ViewWorkCursor` is mounted INSIDE the `overflow-hidden` image container
              so the "View Work" cursor NEVER works or appears outside the image!
           ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featuredShowcase.map((study, idx) => {
            const indexLabel = String(idx + 1).padStart(2, "0");
            const categoryTags =
              idx === 0
                ? "Web Development  |  UI/UX"
                : "Web Designing  |  Motion";

            return (
              <motion.div
                key={study.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.12,
                  ease: MOTION_EASE.cinematicOut,
                }}
                className="flex flex-col"
              >
                {/* 100%-Width Edge-to-Edge Image Card with Strictly Clipped "View Work" Cursor */}
                <Link
                  href={`/work/${study.slug}`}
                  aria-label={`View Concept Build: ${study.client} — ${study.title}`}
                  className="group relative block w-full aspect-[16/10] rounded-[24px] overflow-hidden border border-[#212226]/[0.1] hover:border-[#3186FF]/40 shadow-[0_12px_36px_rgba(18,19,23,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] cursor-pointer"
                >
                  {/* 100%-Width Visual Canvas */}
                  <div className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
                    <ProjectShowcaseVisual
                      study={study}
                      variant={idx === 0 ? "dark" : "light"}
                    />
                  </div>

                  {/* Strictly Image-Clipped "View Work" Difference-Blend Cursor */}
                  <ViewWorkCursor label="View Work" />
                </Link>

                {/* Minimal Numbered Caption Row Below Image (01 / 02 + Category Tags) */}
                <div className="mt-5 px-1 flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span className="text-3xl sm:text-4xl font-light font-sans tracking-tight text-[#121317] tabular-nums select-none">
                      {indexLabel}
                    </span>
                    <Link
                      href={`/work/${study.slug}`}
                      className="text-base sm:text-lg font-medium text-[#121317] hover:text-[#3186FF] transition-colors truncate"
                    >
                      {study.client}
                    </Link>
                  </div>

                  <span className="text-xs sm:text-sm text-[#45474D] font-normal whitespace-nowrap shrink-0">
                    {categoryTags}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Concept Builds Strip (UI/UX Design System & AI Agent Concepts) */}
        {additionalStudies.length > 0 && (
          <div className="mt-14 pt-12 border-t border-[#212226]/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6A6A71]">
                MORE STUDIO CONCEPTS (03 — 04)
              </span>
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#121317] hover:text-[#3186FF] transition-colors"
              >
                <span>Explore Full Concept Index</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {additionalStudies.map((study, idx) => (
                <Link
                  key={study.slug}
                  href={`/work/${study.slug}`}
                  className="group rounded-2xl p-6 bg-[#F8F9FC] hover:bg-[#EFF2F7] border border-[#212226]/[0.07] hover:border-[#3186FF]/30 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-lg font-mono font-semibold text-[#3186FF] pt-0.5 tabular-nums">
                      {String(idx + 3).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {secondaryIcons[idx % secondaryIcons.length]}
                        <span className="text-base font-bold text-[#121317] group-hover:text-[#3186FF] transition-colors truncate">
                          {study.client}
                        </span>
                        <span className="hidden sm:inline-block text-[11px] font-mono text-[#6A6A71]">
                          • {study.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#45474D] line-clamp-1">
                        {study.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-base font-extrabold font-mono text-[#121317]">
                        {study.impactMetric}
                      </div>
                      <div className="text-[10px] font-mono text-[#6A6A71]">
                        Target Spec
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.1] group-hover:bg-[#121317] flex items-center justify-center transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 text-[#121317] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
