"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import CaseStudyScrollShowcase from "@/components/CaseStudyScrollShowcase";
import { ClientCaseStudy } from "@/data/clients";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const dialGauges = [
  { label: "Availability SLA", display: "99.99%", pct: 99 },
  { label: "Eval Gate Fidelity", display: "99.4%", pct: 96 },
  { label: "Latency Budget", display: "<85ms", pct: 92 },
  { label: "Zero-Trust Isolation", display: "100%", pct: 100 },
];

export default function CaseStudyDetailClient({
  study,
  prevStudy,
  nextStudy,
}: {
  study: ClientCaseStudy;
  prevStudy: ClientCaseStudy;
  nextStudy: ClientCaseStudy;
}) {
  const circumference = 2 * Math.PI * 34;

  return (
    <>
      <Navbar />

      <main
        id="main-content"
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#030303] text-zinc-100"
      >
        <LightRays />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/work" className="hover:text-white transition-colors">
              Work
            </Link>
            <span>/</span>
            <span className="text-brand-primary font-medium">
              {study.client}
            </span>
          </div>

          {/* Header Block */}
          <div className="mb-14">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
              className="flex flex-wrap items-center gap-3 mb-5"
            >
              <span className="text-xs font-mono font-bold text-white px-3 py-1 rounded-md bg-white/[0.08] border border-white/10">
                {study.client}
              </span>
              <span className="text-xs font-mono text-brand-primary px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                {study.category}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {study.year} • {study.duration}
              </span>
            </motion.div>

            <SplitTextReveal
              as="h1"
              text={study.title}
              accentFromWordIndex={3}
              triggerOnLoad
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.35,
                ease: MOTION_EASE.cinematicOut,
              }}
              className="text-lg text-zinc-300 leading-relaxed font-light max-w-3xl"
            >
              {study.tagline}
            </motion.p>
          </div>

          {/* Highlight Impact Stat Banner + Scroll-Driven Radial Dial Gauges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: MOTION_EASE.cinematicOut }}
            className="p-8 sm:p-10 rounded-3xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/15 via-[#0c0c12] to-transparent mb-16 shadow-2xl shadow-brand-primary/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 mb-8 border-b border-white/[0.08]">
              <div>
                <div className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                  {study.impactMetric}
                </div>
                <div className="text-sm text-zinc-300 font-medium mt-1">
                  {study.impactLabel}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-full border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Production Benchmark Verified</span>
              </div>
            </div>

            {/* 4 Scroll-Driven Radial SVG Dial Gauges (Talitrix Parity) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {dialGauges.map((g, idx) => {
                const targetOffset = circumference * (1 - g.pct / 100);
                return (
                  <div
                    key={g.label}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                      <svg
                        viewBox="0 0 80 80"
                        className="w-full h-full -rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="5"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="#8587e3"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          whileInView={{ strokeDashoffset: targetOffset }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{
                            duration: 1.25,
                            delay: 0.15 + idx * 0.1,
                            ease: MOTION_EASE.cinematicOut,
                          }}
                        />
                      </svg>
                      <span className="absolute font-mono text-xs font-bold text-white tabular-nums">
                        {g.display}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {g.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Executive Summary */}
          <div className="mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-3 font-semibold">
              Executive Summary
            </h2>
            <p className="text-lg text-zinc-200 leading-relaxed">
              {study.summary}
            </p>
          </div>

          {/* Challenge & Solution Spotlight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SpotlightCard
              spotlightColor="rgba(251, 191, 36, 0.12)"
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-400/35"
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-3 block">
                  The Operational Bottleneck
                </span>
                <h3 className="text-xl font-bold text-white mb-4">
                  Challenge &amp; Blast Radius
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {study.challenge}
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard
              delay={0.08}
              className="p-8 rounded-2xl bg-brand-primary/[0.04] border border-brand-primary/20 hover:border-brand-primary/45"
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-primary font-semibold mb-3 block">
                  Engineered Architecture
                </span>
                <h3 className="text-xl font-bold text-white mb-4">
                  The Axiom Studio Solution
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {study.solution}
                </p>
              </div>
            </SpotlightCard>
          </div>

          {/* Talitrix-Style Pinned <canvas> Scroll-Scrubbed Architecture Disassembly */}
          <CaseStudyScrollShowcase study={study} />

          {/* Architecture Highlights (3D Tilt Spotlight Cards) */}
          {study.architectureHighlights &&
            study.architectureHighlights.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-3 font-semibold">
                  Technical Highlights
                </h2>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Under the Hood: Key Engineering Decisions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {study.architectureHighlights.map((hl, i) => (
                    <SpotlightCard
                      key={i}
                      delay={i * 0.08}
                      tilt
                      className="p-6 rounded-xl bg-[#09090d] border border-white/[0.08] hover:border-brand-primary/40"
                    >
                      <div>
                        <span className="text-xs font-mono text-brand-primary font-bold mb-2 block">
                          0{i + 1}
                        </span>
                        <h4 className="text-base font-semibold text-white mb-2">
                          {hl.title}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {hl.description}
                        </p>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            )}

          {/* Quantified Results */}
          <div className="mb-16 p-8 sm:p-10 rounded-2xl bg-[#08080c] border border-white/[0.08]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-2 font-semibold">
              Measurable Outcomes
            </h2>
            <h3 className="text-2xl font-bold text-white mb-6">
              Quantified Production Impact
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {study.results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.07,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-200 leading-relaxed">
                    {result}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="mb-16">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
              Technologies &amp; Frameworks Deployed
            </h3>
            <div className="flex flex-wrap gap-2">
              {study.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08] hover:border-brand-primary/40 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Previous / Next Case Study Navigation */}
          <div className="pt-10 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            <Link
              href={`/work/${prevStudy.slug}`}
              className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-primary/40 transition-all group flex flex-col justify-between"
            >
              <span className="text-xs font-mono text-zinc-500 mb-2 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Previous Case Study
              </span>
              <span className="text-base font-semibold text-white group-hover:text-brand-light transition-colors">
                {prevStudy.client}: {prevStudy.title}
              </span>
            </Link>

            <Link
              href={`/work/${nextStudy.slug}`}
              className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-primary/40 transition-all group flex flex-col justify-between text-right"
            >
              <span className="text-xs font-mono text-zinc-500 mb-2 flex items-center justify-end gap-1.5">
                Next Case Study
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-base font-semibold text-white group-hover:text-brand-light transition-colors">
                {nextStudy.client}: {nextStudy.title}
              </span>
            </Link>
          </div>

          {/* Bottom Consultation CTA */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-primary/10 to-transparent border border-brand-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-1">
                Explore an architecture tailored to your data
              </h4>
              <p className="text-xs text-zinc-400">
                Schedule a direct 45-minute architectural scoping session with
                our engineering leads.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
            >
              Book Scoping Call
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
