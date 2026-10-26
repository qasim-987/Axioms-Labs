"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { caseStudiesData } from "@/data/caseStudies";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motionTokens";
import {
  ArrowUpRight,
  TrendingUp,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function CaseStudies() {
  const featured = caseStudiesData.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeStudy = featured[activeIndex] || featured[0];

  return (
    <section
      id="work"
      className="py-24 sm:py-32 relative border-t border-white/[0.08] bg-[#020202]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-4">
              <span>CASE STUDIES • PROVEN IMPACT</span>
            </div>
            <SplitTextReveal
              as="h2"
              text="Selected Systems Engineered in Production."
              accentFromWordIndex={3}
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
            />
            <p className="mt-3 text-base text-zinc-400">
              Proven results, measurable impact—explore how our partners
              leverage sovereign AI architectures and precision web systems to
              dominate their sectors.
            </p>
          </div>

          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-white transition-colors group shrink-0"
          >
            <span>View all 7 case studies</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Synchronized 01-06 Split-Stage Showcase (antimatterai.agency parity) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Interactive 01-06 Index Rail */}
          <div className="lg:col-span-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {featured.map((study, idx) => {
              const isSelected = idx === activeIndex;
              const num = String(idx + 1).padStart(2, "0");

              return (
                <button
                  key={study.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  className="relative w-full text-left py-5 px-4 transition-colors hover:bg-white/[0.02] group focus:outline-none"
                >
                  {isSelected && (
                    <motion.span
                      layoutId="activeCaseIndicator"
                      transition={MOTION_SPRING.snappy}
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-primary shadow-[0_0_14px_rgba(133,135,227,0.85)]"
                    />
                  )}
                  <div
                    className={`flex items-start justify-between gap-4 transition-transform duration-300 ${
                      isSelected ? "translate-x-2" : "group-hover:translate-x-1"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-brand-primary tabular-nums">
                          {num}
                        </span>
                        <span
                          className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                            isSelected
                              ? "text-white"
                              : "text-zinc-400 group-hover:text-zinc-200"
                          }`}
                        >
                          {study.client}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 pl-7">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                          {study.category}
                        </span>
                        {study.techStack.slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="text-[11px] font-mono text-zinc-500"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <span className="font-mono text-xs font-bold text-brand-light tabular-nums">
                        {study.impactMetric}
                      </span>
                      <ArrowUpRight
                        className={`w-4 h-4 transition-all duration-300 ${
                          isSelected
                            ? "text-brand-primary translate-x-0.5 -translate-y-0.5"
                            : "text-zinc-600"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Sticky Cross-Fading Visual Dossier Stage */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="relative rounded-3xl glass-panel border border-white/10 p-7 sm:p-10 overflow-hidden min-h-[440px] flex flex-col justify-between shadow-2xl shadow-black/80">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-28 -right-28 w-72 h-72 rounded-full bg-brand-primary/15 blur-3xl"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStudy.id}
                  initial={{ opacity: 0, scale: 1.035, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.985, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.45,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                  className="relative z-10 flex flex-col justify-between h-full flex-1"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-white px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/35">
                          {activeStudy.client}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {activeStudy.year} • {activeStudy.duration}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Production Verified
                      </span>
                    </div>

                    {/* Big Verified Impact Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-primary/20 via-white/[0.03] to-transparent border border-brand-primary/25 mb-6 flex items-center justify-between">
                      <div>
                        <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                          {activeStudy.impactMetric}
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium">
                          {activeStudy.impactLabel}
                        </div>
                      </div>
                      <TrendingUp className="w-10 h-10 text-brand-primary opacity-70 shrink-0" />
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                      {activeStudy.title}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6">
                      {activeStudy.summary}
                    </p>

                    {/* Architecture Highlights Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {activeStudy.architectureHighlights
                        .slice(0, 2)
                        .map((hl) => (
                          <div
                            key={hl.title}
                            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                          >
                            <div className="text-xs font-semibold text-white mb-1">
                              {hl.title}
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {hl.description}
                            </p>
                          </div>
                        ))}
                    </div>

                    {/* Technology Stack */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {activeStudy.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.07]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Dossier CTA */}
                  <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4">
                    <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-primary" />
                      Full Architecture Dossier
                    </span>
                    <Link
                      href={`/work/${activeStudy.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-all shadow-lg shadow-brand-primary/20"
                    >
                      <span>Read Case Study</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
