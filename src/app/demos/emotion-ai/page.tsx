"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import { analyzeEmotionViaApi } from "@/lib/apiClient";
import {
  Heart,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  ArrowRight,
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
    text: "The latency drop across our European nodes after the Axiom Studio deployment has been astonishing. Our clinical users are thrilled with the sub-100ms charting speed, and executive leadership has authorized budget expansion for Q4.",
    positive: 92,
    urgent: 14,
    skeptical: 4,
    neutral: 18,
    primaryTone: "Delighted & High Intent",
  },
  {
    label: "Urgent Escalation Incident",
    text: "CRITICAL: Our tier-1 payment gateway experienced an unexpected timeout during high-volume trading hours. We need immediate architectural review and root-cause verification before market open tomorrow.",
    positive: 8,
    urgent: 96,
    skeptical: 42,
    neutral: 12,
    primaryTone: "Severe Urgency / Action Mandate",
  },
  {
    label: "Guarded Financial Scoping",
    text: "We reviewed your multi-agent architecture brief. While the benchmarks appear promising, our compliance committee remains hesitant regarding data residency outside our private VPC. We require formal audit proof.",
    positive: 34,
    urgent: 38,
    skeptical: 78,
    neutral: 45,
    primaryTone: "Guarded / Risk Averse",
  },
];

export default function EmotionAIDemoPage() {
  const [inputText, setInputText] = useState<string>(presets[0].text);
  const [activeLabel, setActiveLabel] = useState<string>(presets[0].label);
  const [metrics, setMetrics] = useState({
    positive: presets[0].positive,
    urgent: presets[0].urgent,
    skeptical: presets[0].skeptical,
    neutral: presets[0].neutral,
    primaryTone: presets[0].primaryTone,
    latencyMs: 16,
  });

  const selectPreset = (p: ScenarioPreset) => {
    setActiveLabel(p.label);
    setInputText(p.text);
    setMetrics({
      positive: p.positive,
      urgent: p.urgent,
      skeptical: p.skeptical,
      neutral: p.neutral,
      primaryTone: p.primaryTone,
      latencyMs: 14,
    });
  };

  useEffect(() => {
    const matchedPreset = presets.find((p) => p.text === inputText);
    if (matchedPreset) return;

    const trimmed = inputText.trim();
    if (!trimmed) {
      setMetrics({
        positive: 0,
        urgent: 0,
        skeptical: 0,
        neutral: 100,
        primaryTone: "Awaiting Telemetry Input",
        latencyMs: 0,
      });
      return;
    }

    const timer = setTimeout(async () => {
      const apiRes = await analyzeEmotionViaApi(trimmed);
      if (apiRes) {
        setMetrics({
          positive: apiRes.positive,
          urgent: apiRes.urgency,
          skeptical: apiRes.skepticism,
          neutral: apiRes.neutral,
          primaryTone: apiRes.dominantTone,
          latencyMs: apiRes.inferenceLatencyMs,
        });
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [inputText]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main
        id="main-content"
        className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1"
      >
        <LightRays />

        <div className="max-w-4xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono uppercase tracking-wider text-pink-400 mb-6">
            <Heart className="w-3.5 h-3.5" />
            Multimodal Sentiment Engine
          </div>
          <SplitTextReveal
            as="h1"
            text="Sentiment AI for High-Stakes Decision Making"
            accentFromWordIndex={3}
            accentClassName="text-pink-300"
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          />
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Extract emotional temperature, urgency gradients, and unspoken
            customer hesitation from unstructured text in real time via the
            Axiom Studio Sentiment Engine.
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
                activeLabel === p.label
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
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#08080c] border border-white/[0.1] shadow-2xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                  <span className="text-xs font-mono font-semibold text-white">
                    UNSTRUCTURED TEXT INPUT
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                    {inputText.length} Characters Analyzed
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => {
                    setActiveLabel("Custom Live Input");
                    setInputText(e.target.value);
                  }}
                  placeholder="Type or paste customer emails, support tickets, earnings call Q&A, or interview transcripts..."
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-pink-500/50 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 tabular-nums">
                <span>INFERENCE LATENCY: {metrics.latencyMs}MS</span>
                <span>MODEL: AXIOM SENTIMENT-V4</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#08080c] border border-pink-500/30 shadow-2xl space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 font-semibold block mb-1">
                  PREDOMINANT TONE CLASSIFICATION
                </span>
                <h3 className="text-xl font-bold text-white">
                  {metrics.primaryTone}
                </h3>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5 tabular-nums">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5" />
                    Positive / Delight
                  </span>
                  <span className="text-white font-bold">
                    {metrics.positive}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${metrics.positive}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5 tabular-nums">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Urgency / Mandate
                  </span>
                  <span className="text-white font-bold">
                    {metrics.urgent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${metrics.urgent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5 tabular-nums">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Frown className="w-3.5 h-3.5" />
                    Skepticism / Risk
                  </span>
                  <span className="text-white font-bold">
                    {metrics.skeptical}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${metrics.skeptical}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1.5 tabular-nums">
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <Meh className="w-3.5 h-3.5" />
                    Informational / Neutral
                  </span>
                  <span className="text-white font-bold">
                    {metrics.neutral}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${metrics.neutral}%` }}
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
