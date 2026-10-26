"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import ViewWorkCursor from "@/components/ViewWorkCursor";
import { clientsData, clientCategories } from "@/data/clients";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motionTokens";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function WorkIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [spotlights, setSpotlights] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const filteredProjects =
    activeCategory === "All"
      ? clientsData
      : clientsData.filter((p) => p.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main
        id="main-content"
        className="relative pt-32 pb-24 px-8 sm:px-12 lg:px-16 max-w-6xl mx-auto w-full flex-1"
      >
        <LightRays />

        {/* Centered Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-brand-primary mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Portfolio of Impact
          </motion.div>

          <SplitTextReveal
            as="h1"
            text="Engineering That Moves The Needle"
            accentFromWordIndex={2}
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] text-center"
          />

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Explore our deployed autonomous agent meshes, clinical intelligence
            copilots, and high-throughput digital flagship platforms across
            enterprise clients.
          </p>
        </div>

        {/* Category Filter Tabs with Spring Shared-Element Sliding Pill */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 mr-1 hidden sm:inline" />
            {clientCategories.map((cat) => {
              const isSelected = activeCategory === cat;
              const count =
                cat === "All"
                  ? clientsData.length
                  : clientsData.filter((p) => p.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? "text-black"
                      : "text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06]"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="workCategoryPill"
                      transition={MOTION_SPRING.snappy}
                      className="absolute inset-0 rounded-full bg-white shadow-lg shadow-white/15 -z-0"
                    />
                  )}
                  <span className="relative z-10">
                    {cat} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400 tabular-nums">
            <span>Showing {filteredProjects.length} case studies</span>
          </div>
        </div>

        {/* Project Dossier Cards Grid with Layout Morph + 3D Tilt + Radial Spotlight */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 [perspective:1100px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              const coords = spotlights[project.id] || { x: 200, y: 140 };
              return (
                <motion.div
                  layout
                  key={project.id}
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
                    href={`/work/${project.slug}`}
                    data-cursor="view-work"
                    data-cursor-label="View Work"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      setSpotlights((prev) => ({
                        ...prev,
                        [project.id]: { x, y },
                      }));
                      const nx = x / rect.width - 0.5;
                      const ny = y / rect.height - 0.5;
                      e.currentTarget.style.transform = `perspective(1000px) rotateX(${(
                        -ny * 4.5
                      ).toFixed(2)}deg) rotateY(${(nx * 4.5).toFixed(
                        2
                      )}deg) translateY(-4px)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
                    }}
                    style={
                      {
                        "--mouse-x": `${coords.x}px`,
                        "--mouse-y": `${coords.y}px`,
                      } as React.CSSProperties
                    }
                    className="group relative h-full rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-brand-primary/45 p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl hover:shadow-brand-primary/10 flex flex-col justify-between overflow-hidden will-change-transform"
                  >
                    {/* Cursor-Tracked Radial Glass Spotlight */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(133, 135, 227, 0.14), transparent 45%)",
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                            {project.client}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                            {project.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">
                          {project.year}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#09090d] border border-white/[0.06] mb-6 flex items-baseline justify-between group-hover:border-brand-primary/30 transition-colors">
                        <div>
                          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                            {project.impactMetric}
                          </span>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {project.impactLabel}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified ROI
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-brand-light transition-colors flex items-center justify-between">
                        {project.title}
                        <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                      </h3>
                      <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                        {project.summary}
                      </p>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.02] text-zinc-500">
                            +{project.techStack.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-brand-primary font-semibold shrink-0">
                        View Dossier →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Consultation Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-primary/20 via-brand-muted/10 to-transparent border border-brand-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              YOUR PROJECT NEXT
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Have an ambitious architecture challenge?
            </h3>
            <p className="text-sm text-zinc-300">
              Schedule a technical scoping review directly with our principal
              AI and distributed systems engineers.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
          >
            Start Scoping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
      <ViewWorkCursor label="View Work" />
    </div>
  );
}
