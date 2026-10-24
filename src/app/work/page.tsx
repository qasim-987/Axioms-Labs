"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import { clientsData, clientCategories, ClientCaseStudy } from "@/data/clients";
import { ArrowRight, ArrowUpRight, Sparkles, Filter, CheckCircle2 } from "lucide-react";

export default function WorkIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredProjects = activeCategory === "All"
    ? clientsData
    : clientsData.filter((p) => p.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        {/* Ambient Top Light Cone */}
        <LightRays />

        {/* Header Section */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-brand-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Portfolio of Impact
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Engineering That <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-brand-primary">
              Moves The Needle
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Explore our deployed autonomous agent meshes, clinical intelligence copilots, and high-throughput digital flagship platforms across enterprise clients.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 mr-1 hidden sm:inline" />
            {clientCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                {cat}
                {cat === "All" && ` (${clientsData.length})`}
                {cat !== "All" && ` (${clientsData.filter((p) => p.category === cat).length})`}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Showing {filteredProjects.length} case studies</span>
          </div>
        </div>

        {/* Project Dossier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {filteredProjects.map((project, idx) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className="group relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-brand-primary/40 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-primary/20 transition-all" />

              <div>
                {/* Meta Top: Client + Category + Year */}
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

                {/* Primary Metric Callout Banner */}
                <div className="p-4 rounded-xl bg-[#09090d] border border-white/[0.06] mb-6 flex items-baseline justify-between group-hover:border-brand-primary/30 transition-colors">
                  <div>
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
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

                {/* Title & Tagline */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors flex items-center justify-between">
                  {project.title}
                  <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                  {project.summary}
                </p>
              </div>

              {/* Bottom: Tech Stack Pills + Read More */}
              <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
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

                <span className="text-xs font-semibold text-white group-hover:text-brand-primary shrink-0 flex items-center gap-1">
                  View Dossier
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Project Consultation Callout */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-primary/15 via-brand-muted/10 to-transparent border border-brand-primary/25 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              Architectural Scoping
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Have a high-consequence system in mind?
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              We consult directly with technical founders, VP of Engineering leaders, and product executives to scope deterministic AI architectures with measurable ROI.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-all shadow-xl shadow-brand-primary/20 shrink-0"
          >
            Start Technical Inquiry
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
