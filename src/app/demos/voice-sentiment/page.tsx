"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import { MOTION_SPRING } from "@/lib/motionTokens";
import { Mic, MicOff, Volume2, ArrowRight } from "lucide-react";

interface AudioScenario {
  id: string;
  label: string;
  description: string;
  stressScore: number;
  tremorHz: number;
  confidenceRating: number;
  sentiment:
    | "Confident & Authentic"
    | "Strained / Deceptive Potential"
    | "Elevated Stress / Urgent";
}

const scenarios: AudioScenario[] = [
  {
    id: "executive-brief",
    label: "Confident Executive Brief",
    description:
      "Stable fundamental vocal frequency (F0) with zero linguistic micro-tremors and consistent pitch cadence.",
    stressScore: 12,
    tremorHz: 1.2,
    confidenceRating: 98,
    sentiment: "Confident & Authentic",
  },
  {
    id: "high-stress-call",
    label: "High-Stress Incident Call",
    description:
      "Rapid pitch shifts, elevated respiratory rhythm, and high acoustic tension across high-frequency bands.",
    stressScore: 84,
    tremorHz: 8.9,
    confidenceRating: 46,
    sentiment: "Elevated Stress / Urgent",
  },
  {
    id: "ambiguous-interview",
    label: "Ambiguous Forensic Witness",
    description:
      "Frequent vocal hesitation, micro-tremors detected between 8-12Hz (physiological stress response), guarded cadence.",
    stressScore: 71,
    tremorHz: 7.4,
    confidenceRating: 38,
    sentiment: "Strained / Deceptive Potential",
  },
];

export default function VoiceSentimentDemoPage() {
  const [activeScenario, setActiveScenario] = useState<AudioScenario>(
    scenarios[0]
  );
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId = 0;
    let phase = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const midY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Center zero-crossing reference line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();

      if (isRecording && !prefersReduced) {
        phase += 0.055 + activeScenario.tremorHz * 0.008;
      }

      const amp = isRecording
        ? (h * 0.34 * (28 + activeScenario.stressScore)) / 115
        : h * 0.04;
      const freq = 0.018 + activeScenario.tremorHz * 0.0022;

      // Secondary Harmonic Wave
      ctx.strokeStyle =
        activeScenario.stressScore > 50
          ? "rgba(251, 113, 133, 0.45)"
          : "rgba(195, 196, 247, 0.4)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const envelope = Math.sin((x / w) * Math.PI);
        const y =
          midY +
          Math.sin(x * freq * 1.7 - phase * 1.3) * amp * 0.65 * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Primary Fundamental Prosody Oscilloscope Curve
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      if (activeScenario.stressScore > 50) {
        grad.addColorStop(0, "#a855f7");
        grad.addColorStop(0.5, "#fb7185");
        grad.addColorStop(1, "#f59e0b");
      } else {
        grad.addColorStop(0, "#8587e3");
        grad.addColorStop(0.5, "#34d399");
        grad.addColorStop(1, "#c3c4f7");
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const envelope = Math.sin((x / w) * Math.PI);
        const tremor =
          Math.sin(x * 0.11 + phase * 2.4) * (activeScenario.tremorHz * 1.1);
        const y =
          midY +
          (Math.sin(x * freq + phase) * amp + tremor) * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [isRecording, activeScenario]);

  const circumference = 2 * Math.PI * 36;
  const stressOffset =
    circumference * (1 - activeScenario.stressScore / 100);
  const confOffset =
    circumference * (1 - activeScenario.confidenceRating / 100);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main
        id="main-content"
        className="relative pt-32 pb-24 px-8 sm:px-12 lg:px-16 max-w-6xl mx-auto w-full flex-1"
      >
        <LightRays />

        {/* Centered Header Block */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono uppercase tracking-wider text-purple-400 mb-6">
            <Volume2 className="w-3.5 h-3.5" />
            Acoustic Telemetry Demo
          </div>
          <SplitTextReveal
            as="h1"
            text="Acoustic Tremor & Voice Sentiment Engine"
            accentFromWordIndex={3}
            accentClassName="text-purple-300"
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          />
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Real-time vocal micro-tremor analysis, acoustic stress scoring, and
            linguistic confidence evaluation. Switch sample scenarios below or
            simulate live microphone input.
          </p>
        </div>

        {/* Scenario Presets Bar with Spring Active Pill */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <span className="text-xs font-mono uppercase text-zinc-500 mr-2">
            Select Sample Audio Scenario:
          </span>
          {scenarios.map((s) => {
            const isSelected = activeScenario.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveScenario(s)}
                className={`relative px-4 py-2 rounded-xl text-xs font-mono transition-colors ${
                  isSelected
                    ? "text-black font-semibold"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="voiceScenarioPill"
                    transition={MOTION_SPRING.snappy}
                    className="absolute inset-0 rounded-xl bg-white shadow-lg shadow-white/10 -z-0"
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* 60fps Oscilloscope Canvas & Radial Dial Metrics Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#08080c] border border-white/[0.1] shadow-2xl flex flex-col justify-between min-h-[440px]">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRecording ? "bg-rose-500 animate-ping" : "bg-zinc-600"
                    }`}
                  />
                  <span className="text-xs font-mono font-semibold text-white">
                    {isRecording
                      ? "ACOUSTIC INGESTION: 60FPS OSCILLOSCOPE"
                      : "ACOUSTIC INGESTION: IDLE"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-zinc-300 transition-colors"
                >
                  {isRecording ? (
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>
                    {isRecording ? "Mute Analyzer" : "Start Live Feed"}
                  </span>
                </button>
              </div>

              {/* 60fps Dual-Harmonic Acoustic Oscilloscope Canvas */}
              <div className="my-auto py-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-52 rounded-2xl bg-[#050509] border border-white/[0.06] block"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>SAMPLE RATE: 48.0 KHZ (FLOAT32)</span>
                <span>TREMOR BAND: {activeScenario.tremorHz} HZ</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Dual Animated SVG Radial Gauges */}
            <div className="p-6 rounded-2xl bg-[#08080c] border border-white/[0.08] grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                  <svg
                    viewBox="0 0 88 88"
                    className="w-full h-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke={
                        activeScenario.stressScore > 50 ? "#fb7185" : "#34d399"
                      }
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={stressOffset}
                      className="transition-[stroke-dashoffset,stroke] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </svg>
                  <span className="absolute font-mono text-base font-bold text-white tabular-nums">
                    {activeScenario.stressScore}%
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Stress Probability
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                  <svg
                    viewBox="0 0 88 88"
                    className="w-full h-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke="#8587e3"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={confOffset}
                      className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </svg>
                  <span className="absolute font-mono text-base font-bold text-white tabular-nums">
                    {activeScenario.confidenceRating}%
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Vocal Confidence
                </span>
              </div>
            </div>

            {/* Vocal Micro-Tremor (Hz) */}
            <div className="p-6 rounded-2xl bg-[#08080c] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  Vocal Micro-Tremor (8-12Hz Band)
                </span>
                <span className="font-mono text-xl font-bold text-white tabular-nums">
                  {activeScenario.tremorHz} Hz
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-normal">
                Physiological micro-tremors in laryngeal muscles indicate
                heightened involuntary nervous system arousal.
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
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Deploy Acoustic Pipeline
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
