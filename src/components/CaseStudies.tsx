import React from "react";
import Link from "next/link";
import { caseStudiesData } from "@/data/caseStudies";
import { ArrowUpRight, TrendingUp, Layers, CheckCircle2 } from "lucide-react";

export default function CaseStudies() {
  return (
    <section id="work" className="py-24 sm:py-32 relative border-t border-white/[0.08] bg-[#020202]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-4">
              <span>CASE STUDIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Selected Systems Engineered in Production.
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Real outcomes from real deployments. Explore how our partners leverage sovereign AI architectures and precision web systems to dominate their sectors.
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

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {caseStudiesData.slice(0, 4).map((study) => (
            <article
              key={study.id}
              className="group relative rounded-2xl glass-panel p-8 flex flex-col justify-between transition-all duration-300 hover:border-brand-primary/50 hover:bg-[#0b0b10] hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-1"
            >
              <div>
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/10">
                      {study.client}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/ {study.year}</span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                    {study.category}
                  </span>
                </div>

                {/* Big Metric Box */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-brand-primary/15 via-white/[0.02] to-transparent border border-brand-primary/20 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                      {study.impactMetric}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 font-medium">
                      {study.impactLabel}
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-brand-primary opacity-60" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-brand-primary transition-colors">
                  {study.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {study.summary}
                </p>

                {/* Technology Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {study.techStack.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                    >
                      {tech}
                    </span>
                  ))}
                  {study.techStack.length > 4 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.02] text-zinc-500">
                      +{study.techStack.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* View Case Study Link */}
              <div className="pt-5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Full Architecture Dossier
                </span>
                <Link
                  href={`/work/${study.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-brand-primary transition-colors"
                >
                  <span>Read Case Study</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
