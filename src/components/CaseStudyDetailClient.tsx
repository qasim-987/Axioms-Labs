"use client";

import ToolChipContent from "@/components/ToolChipContent";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import CaseStudyScrollShowcase from "@/components/CaseStudyScrollShowcase";
import { ClientCaseStudy } from "@/data/clients";
import { MOTION_EASE } from "@/lib/motionTokens";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const dialGauges = [
  { label: "Lighthouse Speed", display: "99/100", pct: 99, stroke: "#3186FF" },
  { label: "UI Token Consistency", display: "100%", pct: 100, stroke: "#00B95C" },
  { label: "Edge Latency", display: "<85ms", pct: 94, stroke: "#FC413D" },
  { label: "Responsive & A11y", display: "WCAG AA", pct: 98, stroke: "#FBBC04" },
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

      <main
        id="main-content"
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#FFFFFF] text-[#121317]"
      >
        <LightRays />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#6A6A71] mb-8">
            <Link
              href="/"
              className="min-h-[44px] lg:min-h-0 inline-flex items-center px-1.5 hover:text-[#121317] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/work"
              className="min-h-[44px] lg:min-h-0 inline-flex items-center px-1.5 hover:text-[#121317] transition-colors"
            >
              Concept Showcase
            </Link>
            <span>/</span>
            <span className="text-[#3186FF] font-semibold">
              {study.client}
            </span>
          </div>

          {/* Centered Header Block */}
          <div data-page-header className="mb-14 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
              className="flex flex-wrap items-center justify-center gap-3 mb-5"
            >
              <span className="text-xs font-mono font-bold text-[#121317] px-3 py-1 rounded-md bg-[#F8F9FC] border border-[#212226]/[0.08]">
                {study.client}
              </span>
              <span className="text-xs font-mono text-[#3186FF] px-2.5 py-0.5 rounded-full bg-[#3186FF]/[0.08] border border-[#3186FF]/20 font-medium">
                {study.category}
              </span>
              <span className="text-xs font-mono text-[#6A6A71]">
                {study.year} • {study.duration}
              </span>
            </motion.div>

            <SplitTextReveal
              as="h1"
              text={study.title}
              accentFromWordIndex={3}
              accentClassName="text-[#3186FF]"
              triggerOnLoad
              className="text-3xl sm:text-5xl font-extrabold text-[#121317] tracking-tight mb-4 leading-tight text-center max-w-4xl mx-auto"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.35,
                ease: MOTION_EASE.cinematicOut,
              }}
              className="text-lg text-[#45474D] leading-relaxed font-normal max-w-3xl mx-auto"
            >
              {study.tagline}
            </motion.p>
          </div>

          {/* Highlight Benchmark Banner (#121317 Inverse Dark Card + Multicolor Antigravity Radial Gauges) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: MOTION_EASE.cinematicOut }}
            className="p-5 sm:p-10 rounded-3xl bg-[#121317] text-white mb-16 shadow-[0_24px_64px_rgba(18,19,23,0.16)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 mb-8 border-b border-white/10">
              <div>
                <div className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                  {study.impactMetric}
                </div>
                <div className="text-sm text-[#B2BBC5] font-medium mt-1">
                  {study.impactLabel}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#4ADE80] bg-[#00B95C]/15 px-3.5 py-2 rounded-full border border-[#00B95C]/30 shrink-0 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                <span>Axiom Studio Internal Concept Build</span>
              </div>
            </div>

            {/* 4 Scroll-Driven Multicolor Antigravity Radial SVG Dial Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
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
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="5"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke={g.stroke}
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
                    <span className="text-[11px] font-mono text-[#B2BBC5]">
                      {g.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Concept Overview */}
          <div className="mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#3186FF] mb-3 font-semibold">
              Concept Overview
            </h2>
            <p className="text-lg text-[#121317] leading-relaxed">
              {study.summary}
            </p>
          </div>

          {/* Problem Statement & Studio Execution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SpotlightCard
              spotlightColor="rgba(252, 65, 61, 0.08)"
              className="p-8 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] hover:border-[#FC413D]/35"
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#FC413D] font-semibold mb-3 block">
                  The UX &amp; Engineering Problem
                </span>
                <h3 className="text-xl font-bold text-[#121317] mb-4">
                  Why Most Teams Struggle Here
                </h3>
                <p className="text-[#45474D] text-sm leading-relaxed">
                  {study.challenge}
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard
              delay={0.08}
              className="p-8 rounded-2xl bg-[#3186FF]/[0.05] border border-[#3186FF]/20 hover:border-[#3186FF]/40"
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#3186FF] font-semibold mb-3 block">
                  Our Studio Blueprint
                </span>
                <h3 className="text-xl font-bold text-[#121317] mb-4">
                  How Axiom Studio Built It
                </h3>
                <p className="text-[#45474D] text-sm leading-relaxed">
                  {study.solution}
                </p>
              </div>
            </SpotlightCard>
          </div>

          {/* Pinned <canvas> Scroll-Scrubbed Architecture Disassembly */}
          <CaseStudyScrollShowcase study={study} />

          {/* Architecture Highlights */}
          {study.architectureHighlights &&
            study.architectureHighlights.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xs font-mono uppercase tracking-widest text-[#3186FF] mb-3 font-semibold">
                  Craft &amp; Engineering Details
                </h2>
                <h3 className="text-2xl font-bold text-[#121317] mb-6">
                  Under the Hood: Key Design &amp; Code Decisions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {study.architectureHighlights.map((hl, i) => (
                    <SpotlightCard
                      key={i}
                      delay={i * 0.08}
                      tilt
                      className="p-6 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.08] hover:border-[#3186FF]/35"
                    >
                      <div>
                        <span className="text-xs font-mono text-[#3186FF] font-bold mb-2 block">
                          0{i + 1}
                        </span>
                        <h4 className="text-base font-semibold text-[#121317] mb-2">
                          {hl.title}
                        </h4>
                        <p className="text-xs text-[#45474D] leading-relaxed">
                          {hl.description}
                        </p>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            )}

          {/* Prototype Benchmarks */}
          <div className="mb-16 p-8 sm:p-10 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#3186FF] mb-2 font-semibold">
              Prototype Benchmarks
            </h2>
            <h3 className="text-2xl font-bold text-[#121317] mb-6">
              What This Architecture Delivers for Clients
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
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.07] hover:border-[#00B95C]/35 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00B95C] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#121317] leading-relaxed">
                    {result}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="mb-16">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#6A6A71] mb-4">
              Tools &amp; Stack Used in This Concept
            </h3>
            <div className="flex flex-wrap gap-2">
              {study.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="tool-chip-shell text-xs font-mono px-3 py-1.5 rounded-lg bg-[#F8F9FC] text-[#121317] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 transition-colors"
                >
                  <ToolChipContent name={tech} />
                </span>
              ))}
            </div>
          </div>

          {/* Previous / Next Concept Navigation */}
          <div className="pt-10 border-t border-[#212226]/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            <Link
              href={`/work/${prevStudy.slug}`}
              className="p-5 rounded-xl border border-[#212226]/[0.08] bg-[#F8F9FC] hover:bg-[#EFF2F7] hover:border-[#3186FF]/35 transition-all group flex flex-col justify-between"
            >
              <span className="text-xs font-mono text-[#6A6A71] mb-2 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Previous Concept Build
              </span>
              <span className="text-base font-semibold text-[#121317] group-hover:text-[#3186FF] transition-colors">
                {prevStudy.title}
              </span>
            </Link>

            <Link
              href={`/work/${nextStudy.slug}`}
              className="p-5 rounded-xl border border-[#212226]/[0.08] bg-[#F8F9FC] hover:bg-[#EFF2F7] hover:border-[#3186FF]/35 transition-all group flex flex-col justify-between text-right"
            >
              <span className="text-xs font-mono text-[#6A6A71] mb-2 flex items-center justify-end gap-1.5">
                Next Concept Build
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-base font-semibold text-[#121317] group-hover:text-[#3186FF] transition-colors">
                {nextStudy.title}
              </span>
            </Link>
          </div>

          {/* Bottom Consultation CTA */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-[#121317] mb-1">
                Want something like this built for your brand?
              </h4>
              <p className="text-xs text-[#45474D]">
                Book a free discovery call with our team in Kuopio &amp; Lahore
                to scope your website, UI/UX design, or AI agent.
              </p>
            </div>
            <Link
              href="/contact"
              className="w-full sm:w-auto min-h-[48px] lg:min-h-0 inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#121317] hover:bg-[#2F3034] text-white transition-colors shrink-0"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
