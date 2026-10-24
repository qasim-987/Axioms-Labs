"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import {
  Search,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  Filter
} from "lucide-react";

interface SearchDocument {
  id: string;
  title: string;
  category: "Architecture" | "Clinical" | "Security" | "Economics";
  excerpt: string;
  cosineSimilarity: number;
  tokens: number;
}

const corpus: SearchDocument[] = [
  {
    id: "DOC-101",
    title: "Zero-Knowledge Multi-Agent Orchestration Protocol",
    category: "Architecture",
    excerpt: "Model Context Protocol (MCP) server integration isolating client credentials from foundation model context windows via deterministic JSON-RPC boundaries.",
    cosineSimilarity: 0.94,
    tokens: 340
  },
  {
    id: "DOC-102",
    title: "FHIR R4 Diagnostic Copilot Latency Benchmarks",
    category: "Clinical",
    excerpt: "Sub-100ms bidirectional EHR integration with ambient doctor-patient acoustic transcription parsing clinical notes into structured HL7 SOAP entries.",
    cosineSimilarity: 0.91,
    tokens: 420
  },
  {
    id: "DOC-103",
    title: "Post-Quantum Cryptography in Distributed Edge Networks",
    category: "Security",
    excerpt: "Implementation of Kyber lattice-based key encapsulation mechanisms protecting edge-to-core telemetry against quantum harvest-now-decrypt-later vectors.",
    cosineSimilarity: 0.88,
    tokens: 512
  },
  {
    id: "DOC-104",
    title: "Quantized vLLM Serving vs Commercial API Economics",
    category: "Economics",
    excerpt: "Comparative total cost of ownership (TCO) analysis demonstrating a 62% reduction in compute spend when serving AWQ 4-bit quantized open-weights models.",
    cosineSimilarity: 0.85,
    tokens: 280
  },
  {
    id: "DOC-105",
    title: "Autonomous Canary Verification for Cloud Incident Triage",
    category: "Architecture",
    excerpt: "Isolated Kubernetes cluster sandboxes that simulate canary patches before committing automated remediation to live production customer instances.",
    cosineSimilarity: 0.82,
    tokens: 390
  }
];

export default function VectorSearchDemoPage() {
  const [query, setQuery] = useState<string>("autonomous agent orchestration latency");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [latencyMs, setLatencyMs] = useState<number>(24);

  const results = useMemo(() => {
    let list = corpus;
    if (activeCategory !== "All") {
      list = list.filter((d) => d.category === activeCategory);
    }
    if (query.trim()) {
      const qLower = query.toLowerCase();
      list = list.map((doc) => {
        let boost = 0;
        if (doc.title.toLowerCase().includes(qLower)) boost += 0.05;
        if (doc.excerpt.toLowerCase().includes(qLower)) boost += 0.03;
        return {
          ...doc,
          cosineSimilarity: Math.min(0.99, doc.cosineSimilarity + boost)
        };
      });
    }
    return list.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);
  }, [query, activeCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setLatencyMs(Math.floor(Math.random() * 12) + 18);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono uppercase tracking-wider text-teal-400 mb-6">
            <Database className="w-3.5 h-3.5" />
            Vector Search Simulator
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Atom Search: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-brand-primary">
              Sub-50ms Semantic Vector Search
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Instant vector search across multi-tenant knowledge bases. Experience sub-50ms hybrid dense-sparse retrieval powered by Qdrant embeddings and hardware-accelerated cosine similarity.
          </p>
        </div>

        {/* Search Query Input Console */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08080c] border border-white/[0.1] shadow-2xl mb-10">
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-teal-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Query enterprise knowledge base (e.g. multi-agent orchestration, FHIR EHR, PQC encryption)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-base text-white focus:outline-none focus:border-teal-400 transition-colors placeholder-zinc-600 font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {["All", "Architecture", "Clinical", "Security", "Economics"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-teal-400 text-black font-semibold"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Stopwatch Counter */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                {latencyMs}ms Query Latency
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{results.length} matches indexed</span>
            </div>
          </div>
        </div>

        {/* Search Results List */}
        <div className="space-y-4 mb-24">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
            RANKED VECTOR RETRIEVAL CANDIDATES
          </span>

          {results.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-teal-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
            >
              <div className="max-w-3xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                    {doc.category}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    {doc.id} • {doc.tokens} Tokens
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {doc.excerpt}
                </p>
              </div>

              {/* Similarity Score Pill */}
              <div className="shrink-0 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center min-w-[120px]">
                <div className="text-xl font-bold font-mono text-teal-300">
                  {(doc.cosineSimilarity * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Cosine Match
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
