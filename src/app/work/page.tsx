"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import { clientCaseStudies, clientCategories } from "@/data/clients";
import { MOTION_EASE } from "@/lib/motionTokens";
import { ArrowUpRight, CheckCircle2, Layers } from "lucide-react";

export default function WorkDirectoryPage() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof clientCategories)[number]>("All");

  const filteredStudies =
    activeCategory === "All"
      ? clientCaseStudies
      : clientCaseStudies.filter((item) => item.category === activeCategory);

  return (
    <>
      <Navbar />

      <main
        id="main-content"
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#030303] text-zinc-100"
      >
        <LightRays />

        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
          {/* Centered Character-Split Hero Header */}
          <div className="max-w-4xl mx-auto text-center mb-14 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-6">
              <Layers className="w-3.5 h-3.5" />
              <span>STUDIO CONCEPT BUILDS • INTERNAL PROTOTYPES</span>
            </div>

            <SplitTextReveal
              as="h1"
              text="WORK"
              triggerOnLoad
              className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-4 text-center"
            />
            <SplitTextReveal
              as="h2"
              text="Web Development, Web Designing, UI/UX & AI Agent Concepts."
              accentFromWordIndex={4}
              triggerOnLoad
              delay={0.22}
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4 text-center"
            />

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal max-w-2xl mx-auto">
              Explore our internal studio prototypes and reference builds—crafted
              to demonstrate the exact design quality, speed, and AI engineering
              we bring to client projects.
            </p>
          </div>

          {/* Filter Tabs with Animated Pill Indicator */}
          <div
            role="tablist"
            aria-label="Filter concept builds by service"
            className="flex flex-wrap items-center justify-center gap-2 mb-12 pb-6 border-b border-white/[0.08]"
          >
            {clientCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-4 py-2 rounded-full text-xs font-mono transition-colors ${
                    isActive
                      ? "text-white font-semibold"
                      : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="workFilterActivePill"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-full bg-brand-primary shadow-lg shadow-brand-primary/25 -z-0"
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              );
            })}
          </div>

          {/* Animated Concept Cards Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredStudies.map((study, idx) => (
                <motion.div
                  key={study.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.05,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                >
                  <Link
                    href={`/work/${study.slug}`}
                    className="group relative rounded-2xl glass-panel glass-panel-hover p-8 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded bg-white/[0.06] border border-white/10">
                            {study.client}
                          </span>
                          <span className="text-xs font-mono text-brand-primary px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                            {study.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">
                          {study.year} • {study.duration}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-primary transition-colors">
                        {study.title}
                      </h2>

                      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                        {study.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-8">
                        {study.techStack.slice(0, 5).map((tech, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.06] flex items-end justify-between gap-4">
                      <div>
                        <div className="text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                          {study.impactMetric}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{study.impactLabel}</span>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-brand-primary transition-colors">
                        <span>Inspect Concept</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Bottom CTA */}
          <div className="mt-20 p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e0e14] via-[#070709] to-[#040405] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Ready to become our next featured launch?
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl">
                Partner directly with our design and engineering team in Kuopio
                &amp; Lahore to launch a fast, custom website, UI/UX system, or
                AI agent.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-full text-sm font-semibold bg-brand-primary hover:bg-brand-hover text-white transition-all shadow-lg shadow-brand-primary/25 shrink-0"
            >
              Book a Free Discovery Call
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
