"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import { synthesizeOutreachViaApi } from "@/lib/apiClient";
import {
  TrendingUp,
  Sliders,
  Sparkles,
  Mail,
  CheckCircle2,
  Building2,
  ArrowRight,
  Send,
  Zap,
  Flame
} from "lucide-react";

interface IntentAccount {
  id: string;
  name: string;
  domain: string;
  intentScore: number;
  stage: "Evaluating" | "Budget Allocated" | "Exploratory";
  signals: string[];
  recommendedPlay: string;
  draftSubject: string;
  draftBody: string;
}

const mockAccounts: IntentAccount[] = [
  {
    id: "ACC-1",
    name: "Apex Logistics Corp",
    domain: "apexlogistics.io",
    intentScore: 94,
    stage: "Budget Allocated",
    signals: ["3x documentation visits to FHIR/HL7", "CTO downloaded SOC2 security packet", "Pricing page viewed 6 times"],
    recommendedPlay: "Executive Architecture Consultation",
    draftSubject: "Autonomous route optimization & HIPAA compliance for Apex Logistics",
    draftBody: "Hi team Apex, we noticed your infrastructure team actively exploring our zero-retention routing architectures. Given your fleet expansion this quarter, our team can share our benchmark post-mortem achieving a 28% reduction in dispatch overhead."
  },
  {
    id: "ACC-2",
    name: "Vanguard BioSciences",
    domain: "vanguardbio.com",
    intentScore: 88,
    stage: "Evaluating",
    signals: ["Visited AI Agent RAG whitepaper", "Tested vendor matrix comparison tool"],
    recommendedPlay: "Private VPC Cluster Sizing Brief",
    draftSubject: "Zero-data-retention foundation model deployment for Vanguard",
    draftBody: "Hello Vanguard team, following your review of our private cluster deployment architectures, we've prepared a customized GPU sizing estimate for on-premises quantized clinical models."
  },
  {
    id: "ACC-3",
    name: "Krypton Global Capital",
    domain: "kryptoncap.com",
    intentScore: 79,
    stage: "Evaluating",
    signals: ["Searched latency benchmarks for news sentiment models", "2 visits to case study archive"],
    recommendedPlay: "Sub-15ms Signal Ingestion Demo",
    draftSubject: "Low-latency market sentiment ingestion benchmark",
    draftBody: "Hi Krypton engineering team, we benchmarked our DPDK kernel-bypass news transcription engine at sub-12ms end-to-end signal generation. Would you like to review the live telemetry recording?"
  },
  {
    id: "ACC-4",
    name: "Solace Health Systems",
    domain: "solacehealth.org",
    intentScore: 68,
    stage: "Exploratory",
    signals: ["Downloaded clinical copilot architecture PDF", "Subscribed to engineering newsletter"],
    recommendedPlay: "Clinician Documentation ROI Calculator",
    draftSubject: "Reclaiming physician documentation hours with ambient EHR copilots",
    draftBody: "Hi Solace Health team, we put together an interactive ROI model comparing manual clinical charting vs zero-retention ambient transcription across ambulatory clinics."
  }
];

export default function IntentIQDemoPage() {
  const [minScore, setMinScore] = useState<number>(75);
  const [selectedAccount, setSelectedAccount] = useState<IntentAccount>(mockAccounts[0]);
  const [synthesizing, setSynthesizing] = useState<boolean>(false);

  const handleSynthesizeLive = async () => {
    setSynthesizing(true);
    const res = await synthesizeOutreachViaApi({
      company: selectedAccount.name,
      industry: selectedAccount.domain,
      intentScore: selectedAccount.intentScore,
      signals: selectedAccount.signals,
    });
    if (res) {
      setSelectedAccount((prev) => ({
        ...prev,
        draftSubject: res.subject,
        draftBody: res.draft,
      }));
    }
    setSynthesizing(false);
  };

  const filteredAccounts = mockAccounts.filter((a) => a.intentScore >= minScore);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-8 sm:px-12 lg:px-16 max-w-6xl mx-auto w-full flex-1">
        <LightRays />

        {/* Centered Header Block */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-wider text-amber-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Interactive Simulation
          </div>
          <SplitTextReveal
            as="h1"
            text="Atom IntentIQ: Buyer Intent Intelligence"
            accentFromWordIndex={2}
            accentClassName="text-amber-300"
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          />
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Real-time pipeline intent scoring, telemetry correlation, and AI-synthesized contextual executive outreach. Adjust the sensitivity threshold below to simulate dynamic lead routing.
          </p>
        </div>

        {/* Interactive Threshold Slider */}
        <div className="p-6 rounded-2xl bg-[#09090e] border border-white/[0.08] mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Intent Score Filter Threshold
              </span>
              <span className="text-xl font-bold font-mono text-white">
                Min Score: {minScore} / 100
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-72">
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-xs text-amber-400 font-bold shrink-0">
              {filteredAccounts.length} Leads
            </span>
          </div>
        </div>

        {/* Two-Column Interface: Account Pipeline (Left) & Outreach Synthesizer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Left Column: Account Pipeline */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              QUALIFIED INTENT ACCOUNTS ({filteredAccounts.length})
            </span>

            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => {
                  setSelectedAccount(account);
                }}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedAccount.id === account.id
                    ? "bg-amber-500/[0.08] border-amber-500/40 shadow-xl shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-bold text-white text-base">
                      {account.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{account.intentScore} Score</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-zinc-500 mb-3">
                  {account.domain} • Stage: {account.stage}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                    Telemetry Signals Detected:
                  </span>
                  {account.signals.map((sig, sIdx) => (
                    <div key={sIdx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredAccounts.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-zinc-500 text-sm">
                No accounts match the current threshold of {minScore}. Try lowering the slider.
              </div>
            )}
          </div>

          {/* Right Column: AI-Synthesized Outreach Sequence */}
          <div className="lg:col-span-6">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-2 block">
              AI INTENT-SYNTHESIZED OUTREACH DRAFT
            </span>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#08080c] border border-brand-primary/30 shadow-2xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-mono font-semibold text-white">
                      AUTONOMOUS SEQUENCER
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary">
                    Play: {selectedAccount.recommendedPlay}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">
                      Recipient
                    </label>
                    <div className="text-xs font-mono text-zinc-300 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      CTO / VP Architecture &lt;engineering@{selectedAccount.domain}&gt;
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">
                      Synthesized Subject Line
                    </label>
                    <div className="text-xs font-semibold text-white p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      {selectedAccount.draftSubject}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">
                      Body Copy (Tailored to Observed Telemetry)
                    </label>
                    <div className="text-xs text-zinc-300 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] leading-relaxed whitespace-pre-wrap">
                      {selectedAccount.draftBody}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSynthesizeLive}
                  disabled={synthesizing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/15 border border-brand-primary/30 hover:bg-brand-primary/25 text-brand-light text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {synthesizing ? "Synthesizing..." : "Re-Synthesize via API"}
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Deploy IntentIQ Engine
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
