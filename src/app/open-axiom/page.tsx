"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import { openSourceItems, openSourceCategories, OpenSourceItem } from "@/data/openSource";
import {
  Code,
  Github,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Star,
  GitFork,
  Filter,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function OpenAxiomPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = activeCategory === "All"
    ? openSourceItems
    : openSourceItems.filter((item) => item.category === activeCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-6">
            <Code className="w-3.5 h-3.5" />
            Open-Source Infrastructure
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Open Axiom: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-brand-primary">
              Tools, Skills &amp; Templates
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Free, permissive, open-source software built and maintained by Axiom Labs. From autonomous agent skills to production Next.js boilerplates and orchestration utilities.
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-6 mb-12 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-zinc-400 mr-2 shrink-0 hidden sm:inline" />
          {openSourceCategories.map((cat) => (
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
              {cat === "All" && ` (${openSourceItems.length})`}
              {cat !== "All" && ` (${openSourceItems.filter((i) => i.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Open-Source Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/40 p-6 sm:p-8 transition-all hover:bg-white/[0.04] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Meta Top: Category + License + Stars */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {item.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-zinc-500" />
                      {item.forks}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Quick Copy Install Command */}
                {item.installCommand && (
                  <div className="mb-6 p-2.5 rounded-xl bg-[#08080c] border border-white/[0.06] flex items-center justify-between gap-2 text-xs font-mono text-zinc-300">
                    <div className="flex items-center gap-2 truncate">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{item.installCommand}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.installCommand!)}
                      aria-label="Copy install command"
                      className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors shrink-0"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {item.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.04]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: GitHub Link + License */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-500">
                  License: {item.license}
                </span>
                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-emerald-400 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Contribution Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold mb-2 block">
              OPEN SOURCE ECOSYSTEM
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">
              Have an agent skill or tool to contribute?
            </h3>
            <p className="text-sm text-zinc-300">
              Open Axiom is governed transparently on GitHub. We accept pull requests for MCP tools, foundation evals, and performance templates.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0 shadow-xl shadow-emerald-500/20"
          >
            <Github className="w-4 h-4" />
            <span>Visit GitHub Org</span>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
