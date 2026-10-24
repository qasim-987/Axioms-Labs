import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import { clientsData, ClientCaseStudy } from "@/data/clients";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowUpRight
} from "lucide-react";

interface CaseStudyPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return clientsData.map((study) => ({
    slug: study.slug,
  }));
}

export function generateMetadata({ params }: CaseStudyPageProps) {
  const study = clientsData.find((s) => s.slug === params.slug);
  if (!study) return { title: "Case Study Not Found | Axiom Labs" };

  return {
    title: `${study.title} — ${study.client} Dossier | Axiom Labs`,
    description: study.summary,
  };
}

export default function CaseStudyDetail({ params }: CaseStudyPageProps) {
  const currentIndex = clientsData.findIndex((s) => s.slug === params.slug);

  if (currentIndex === -1) {
    notFound();
  }

  const study = clientsData[currentIndex];
  const prevStudy = currentIndex > 0 ? clientsData[currentIndex - 1] : clientsData[clientsData.length - 1];
  const nextStudy = currentIndex < clientsData.length - 1 ? clientsData[currentIndex + 1] : clientsData[0];

  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#030303] text-zinc-100">
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
            <span className="text-brand-primary font-medium">{study.client}</span>
          </div>

          {/* Header Block */}
          <div className="mb-14">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-mono font-bold text-white px-3 py-1 rounded-md bg-white/[0.08] border border-white/10">
                {study.client}
              </span>
              <span className="text-xs font-mono text-brand-primary px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                {study.category}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {study.year} • {study.duration}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              {study.title}
            </h1>

            <p className="text-lg text-zinc-300 leading-relaxed font-light max-w-3xl">
              {study.tagline}
            </p>
          </div>

          {/* Highlight Impact Stat Banner */}
          <div className="p-8 sm:p-10 rounded-2xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/15 via-[#0c0c12] to-transparent mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl shadow-brand-primary/10">
            <div>
              <div className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-mono">
                {study.impactMetric}
              </div>
              <div className="text-sm text-zinc-300 font-medium mt-1">
                {study.impactLabel}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-full border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Production Benchmark Verified</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-3 font-semibold">
              Executive Summary
            </h2>
            <p className="text-lg text-zinc-200 leading-relaxed">
              {study.summary}
            </p>
          </div>

          {/* Challenge & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* The Challenge */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
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

            {/* The Solution */}
            <div className="p-8 rounded-2xl bg-brand-primary/[0.04] border border-brand-primary/20 relative">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-primary font-semibold mb-3 block">
                Engineered Architecture
              </span>
              <h3 className="text-xl font-bold text-white mb-4">
                The Axiom Solution
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {study.solution}
              </p>
            </div>
          </div>

          {/* Architecture Highlights */}
          {study.architectureHighlights && study.architectureHighlights.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-3 font-semibold">
                Technical Highlights
              </h2>
              <h3 className="text-2xl font-bold text-white mb-6">
                Under the Hood: Key Engineering Decisions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {study.architectureHighlights.map((hl, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl bg-[#09090d] border border-white/[0.08] hover:border-brand-primary/30 transition-colors"
                  >
                    <span className="text-xs font-mono text-zinc-500 mb-2 block">
                      0{i + 1}
                    </span>
                    <h4 className="text-base font-semibold text-white mb-2">
                      {hl.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {hl.description}
                    </p>
                  </div>
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
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-200 leading-relaxed">
                    {result}
                  </span>
                </div>
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
                  className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08]"
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
              className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.2] transition-all group flex flex-col justify-between"
            >
              <span className="text-xs font-mono text-zinc-500 mb-2 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Previous Case Study
              </span>
              <span className="text-base font-semibold text-white group-hover:text-brand-primary transition-colors">
                {prevStudy.client}: {prevStudy.title}
              </span>
            </Link>

            <Link
              href={`/work/${nextStudy.slug}`}
              className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.2] transition-all group flex flex-col justify-between text-right"
            >
              <span className="text-xs font-mono text-zinc-500 mb-2 flex items-center justify-end gap-1.5">
                Next Case Study
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-base font-semibold text-white group-hover:text-brand-primary transition-colors">
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
                Schedule a direct 45-minute architectural scoping session with our engineering leads.
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
