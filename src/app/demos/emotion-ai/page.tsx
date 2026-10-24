"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import {
  Sparkles,
  Heart,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  ArrowRight,
  RefreshCw,
  Sliders
} from "lucide-react";

interface ScenarioPreset {
  label: string;
  text: string;
  positive: number;
  urgent: number;
  skeptical: number;
  neutral: number;
  primaryTone: string;
}

const presets: ScenarioPreset[] = [
  {
    label: "Enthusiastic Enterprise Renewal",
    text: "The latency drop across our European nodes after the Axiom Labs deployment has been astonishing. Our clinical users are thrilled with the sub-100ms charting speed, and executive leadership has authorized budget expansion for Q4.",
    positive: 92,
    urgent: 14,
    skeptical: 4,
    neutral: 18,
    primaryTone: "Delighted & High Intent"
  },
  {
    label: "Urgent Escalation Incident",
    text: "CRITICAL: Our tier-1 payment gateway experienced an unexpected timeout during high-volume trading hours. We need immediate architectural review and root-cause verification before market open tomorrow.",
    positive: 8,
    urgent: 96,
    skeptical: 42,
    neutral: 12,
    primaryTone: "Severe Urgency / Action Mandate"
  },
  {
    label: "Guarded Financial Scoping",
    text: "We reviewed your multi-agent architecture brief. While the benchmarks appear promising, our compliance committee remains hesitant regarding data residency outside our private VPC. We require formal audit proof.",
    positive: 34,
    urgent: 38,
    skeptical: 78,
    neutral: 45,
    primaryTone: "Guarded / Risk Averse"
  }
];

export default function EmotionAIDemoPage() {
  const [inputText, setInputText] = useState<string>(presets[0].text);
  const [activePreset, setActivePreset] = useState<ScenarioPreset>(presets[0]);

  const selectPreset = (p: ScenarioPreset) => {
    setActivePreset(p);
    setInputText(p.text);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono uppercase tracking-wider text-pink-400 mb-6">
            <Heart className="w-3.5 h-3.5" />
            Multimodal Sentiment Engine
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Sentiment AI for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-brand-primary">
              High-Stakes Decision Making
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Extract emotional temperature, urgency gradients, and unspoken customer hesitation from unstructured text. Test arbitrary copy below or load pre-calibrated enterprise communication scenarios.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-mono uppercase text-zinc-500 mr-2">
            Load Sample Scenario:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectPreset(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activePreset.label === p.label
                  ? "bg-white text-black font-semibold shadow-md"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Left Column: Input Text Area */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#08080c] border border-white/[0.1] shadow-2xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                  <span className="text-xs font-mono font-semibold text-white">
                    UNSTRUCTURED TEXT INPUT
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {inputText.length} Characters Analyzed
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste customer emails, support tickets, earnings call Q&A, or interview transcripts..."
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-pink-500/50 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>INFERENCE LATENCY: 18MS</span>
                <span>MODEL: AXIOM SENTIMENT-V4</span>
              </div>
            </div>
          </div>

          {/* Right Column: Multimodal Emotional Radar Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#08080c] border border-pink-500/30 shadow-2xl space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 font-semibold block mb-1">
                  PREDOMINANT TONE CLASSIFICATION
                </span>
                <h3 className="text-xl font-bold text-white">
                  {activePreset.primaryTone}
                </h3>
              </div>

              {/* Metric 1: Positive / Delight */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5" />
                    Positive / Delight
                  </span>
                  <span className="text-white font-bold">{activePreset.positive}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${activePreset.positive}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Urgency */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Urgency / Mandate
                  </span>
                  <span className="text-white font-bold">{activePreset.urgent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${activePreset.urgent}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Skepticism / Risk */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Frown className="w-3.5 h-3.5" />
                    Skepticism / Risk
                  </span>
                  <span className="text-white font-bold">{activePreset.skeptical}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${activePreset.skeptical}%` }}
                  />
                </div>
              </div>

              {/* Metric 4: Informational / Neutral */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <Meh className="w-3.5 h-3.5" />
                    Informational / Neutral
                  </span>
                  <span className="text-white font-bold">{activePreset.neutral}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${activePreset.neutral}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Integrate Sentiment Pipeline
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
