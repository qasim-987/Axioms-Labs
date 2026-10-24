"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import {
  Mic,
  MicOff,
  Activity,
  Volume2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Play
} from "lucide-react";

interface AudioScenario {
  id: string;
  label: string;
  description: string;
  stressScore: number;
  tremorHz: number;
  confidenceRating: number;
  sentiment: "Confident & Authentic" | "Strained / Deceptive Potential" | "Elevated Stress / Urgent";
}

const scenarios: AudioScenario[] = [
  {
    id: "executive-brief",
    label: "Confident Executive Brief",
    description: "Stable fundamental vocal frequency (F0) with zero linguistic micro-tremors and consistent pitch cadence.",
    stressScore: 12,
    tremorHz: 1.2,
    confidenceRating: 98,
    sentiment: "Confident & Authentic"
  },
  {
    id: "high-stress-call",
    label: "High-Stress Incident Call",
    description: "Rapid pitch shifts, elevated respiratory rhythm, and high acoustic tension across high-frequency bands.",
    stressScore: 84,
    tremorHz: 8.9,
    confidenceRating: 46,
    sentiment: "Elevated Stress / Urgent"
  },
  {
    id: "ambiguous-interview",
    label: "Ambiguous Forensic Witness",
    description: "Frequent vocal hesitation, micro-tremors detected between 8-12Hz (physiological stress response), guarded cadence.",
    stressScore: 71,
    tremorHz: 7.4,
    confidenceRating: 38,
    sentiment: "Strained / Deceptive Potential"
  }
];

export default function VoiceSentimentDemoPage() {
  const [activeScenario, setActiveScenario] = useState<AudioScenario>(scenarios[0]);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [waveHeights, setWaveHeights] = useState<number[]>([30, 45, 70, 40, 85, 60, 95, 50, 75, 35, 65, 80, 55, 90, 40, 60, 30, 85, 50, 40]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * (activeScenario.stressScore > 50 ? 80 : 50) + 15))
      );
    }, 150);
    return () => clearInterval(interval);
  }, [isRecording, activeScenario]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono uppercase tracking-wider text-purple-400 mb-6">
            <Volume2 className="w-3.5 h-3.5" />
            Acoustic Telemetry Demo
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Acoustic Tremor &amp; <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-brand-primary">
              Voice Sentiment Engine
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Real-time vocal micro-tremor analysis, acoustic stress scoring, and linguistic confidence evaluation. Switch sample scenarios below or simulate live microphone input.
          </p>
        </div>

        {/* Scenario Presets Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase text-zinc-500 mr-2">
            Select Sample Audio Scenario:
          </span>
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveScenario(s)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                activeScenario.id === s.id
                  ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Waveform Visualizer & Metrics Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Left Column: Live Audio Waveform Canvas */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#08080c] border border-white/[0.1] shadow-2xl flex flex-col justify-between min-h-[440px]">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-zinc-600"}`} />
                  <span className="text-xs font-mono font-semibold text-white">
                    {isRecording ? "ACOUSTIC INGESTION: ACTIVE" : "ACOUSTIC INGESTION: IDLE"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-zinc-300 transition-colors"
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isRecording ? "Mute Analyzer" : "Start Live Feed"}</span>
                </button>
              </div>

              {/* Dynamic Waveform Bars */}
              <div className="flex items-center justify-center gap-2 h-48 my-auto px-4">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    className="w-2.5 rounded-full bg-gradient-to-t from-purple-600 via-brand-primary to-white transition-all duration-150"
                    style={{
                      height: isRecording ? `${h}%` : "8%",
                      opacity: isRecording ? 0.9 : 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Audio Status Footer */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>SAMPLE RATE: 48.0 KHZ (FLOAT32)</span>
                <span>SPECTRAL DEVIATION: ±0.04%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Gauges & Sentiment Intelligence */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stress Probability Gauge */}
            <div className="p-6 rounded-2xl bg-[#08080c] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  Stress Probability Score
                </span>
                <span className={`font-mono text-xl font-bold ${activeScenario.stressScore > 50 ? "text-rose-400" : "text-emerald-400"}`}>
                  {activeScenario.stressScore}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeScenario.stressScore > 50
                      ? "bg-gradient-to-r from-amber-500 to-rose-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400"
                  }`}
                  style={{ width: `${activeScenario.stressScore}%` }}
                />
              </div>
            </div>

            {/* Vocal Micro-Tremor (Hz) */}
            <div className="p-6 rounded-2xl bg-[#08080c] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  Vocal Micro-Tremor (8-12Hz Band)
                </span>
                <span className="font-mono text-xl font-bold text-white">
                  {activeScenario.tremorHz} Hz
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-normal">
                Physiological micro-tremors in laryngeal muscles indicate heightened involuntary nervous system arousal.
              </p>
            </div>

            {/* Classification Card */}
            <div className="p-6 rounded-2xl bg-brand-primary/[0.06] border border-brand-primary/30">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold block mb-1">
                EVALUATED VERDICT
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                {activeScenario.sentiment}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                {activeScenario.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-brand-primary/20 text-xs font-mono text-zinc-400">
                <span>Confidence Rating:</span>
                <span className="text-white font-bold">{activeScenario.confidenceRating}%</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
