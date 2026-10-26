"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motionTokens";
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Code2,
  Cpu,
  Compass,
  Play,
  Pause,
  Award,
  Maximize2,
  X,
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const companyFaqs: FAQItem[] = [
  {
    q: "How does Axiom Studio differ from traditional software agencies or consulting firms?",
    a: "Traditional agencies assemble off-the-shelf templates and junior teams. Axiom Studio is an engineering-first systems studio led by senior systems architects and machine learning engineers. We build production-hardened AI pipelines, custom fine-tuned weights, and high-throughput web flagships with deterministic evaluation suites and measurable ROI guarantees.",
  },
  {
    q: "Who owns the intellectual property (IP) and custom models developed during an engagement?",
    a: "You retain 100% full legal ownership of all code, custom-trained model weights, datasets, prompt templates, and infrastructure scripts created during our engagement. We never license shared models or claim recurring royalties on your IP.",
  },
  {
    q: "How do you protect proprietary corporate data from leaking into public AI models?",
    a: "We adhere to a strict Zero-Data-Retention architecture. We deploy open-weight foundation models (Llama 3, Mistral, Qwen) inside your private cloud VPC or on-premises GPU clusters. When enterprise APIs are utilized, we configure enterprise BAA agreements that guarantee inputs are never stored, cached, or used for model retraining.",
  },
  {
    q: "What is your typical engagement structure and timeline?",
    a: "Engagements typically run as 8 to 12-week intensive delivery sprints with dedicated two-week milestones. We operate with high transparency: weekly executable demos, continuous CI/CD preview branches, and direct Slack/Teams shared channel access with our engineering leads.",
  },
  {
    q: "Do you offer post-launch support and continuous SLA maintenance?",
    a: "Yes. Following launch, we offer continuous operational telemetry management, model drift monitoring, fine-tuning retraining runs, and 24/7 high-availability infrastructure SLAs.",
  },
];

const coreBeliefs = [
  {
    num: "01",
    title: "Code as Deterministic Proof",
    body: "We treat machine learning outputs not as magic, but as probabilistic functions requiring strict boundary guardrails, schema enforcement, and continuous synthetic evaluation suites.",
  },
  {
    num: "02",
    title: "Human Sovereignty & Privacy",
    body: "Autonomous agents must amplify human capability without compromising security. We deploy zero-retention private clusters where sensitive enterprise IP never trains public models.",
  },
  {
    num: "03",
    title: "Velocity Through Rigor",
    body: "True engineering speed does not come from cutting corners; it comes from airtight type safety, automated CI/CD canary verification, and architectural clarity from day one.",
  },
];

export default function CompanyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isPlayingReel, setIsPlayingReel] = useState<boolean>(true);
  const [reelModalOpen, setReelModalOpen] = useState<boolean>(false);
  const [waveTick, setWaveTick] = useState<number>(0);

  useEffect(() => {
    if (!isPlayingReel) return;
    const interval = setInterval(() => {
      setWaveTick((t) => t + 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlayingReel]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const baseBars = [40, 72, 34, 92, 58, 100, 48, 82, 64, 96, 52, 76, 38, 86];

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main
        id="main-content"
        className="relative pt-32 pb-24 px-8 sm:px-12 lg:px-16 max-w-6xl mx-auto w-full flex-1"
      >
        <LightRays />

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 sm:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-brand-primary mb-6"
          >
            <Compass className="w-3.5 h-3.5" />
            Our Mission &amp; DNA
          </motion.div>

          <SplitTextReveal
            as="h1"
            text="Companies create products. Axiom Studio Creates Impact."
            accentFromWordIndex={3}
            triggerOnLoad
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.45,
              ease: MOTION_EASE.cinematicOut,
            }}
            className="text-base sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto"
          >
            We are an autonomous systems and digital engineering studio
            dedicated to building high-consequence software for the next decade
            of intelligent computing.
          </motion.p>
        </div>

        {/* Narrative Origins + Pulsing World Map + Story Reel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 items-center">
          <div className="md:col-span-5">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              OUR ORIGINS
            </span>
            <SplitTextReveal
              as="h2"
              text="Things that matter."
              accentFromWordIndex={2}
              className="text-3xl sm:text-4xl font-extrabold text-white mb-6"
            />
            <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
              <p>
                In an era flooded with ephemeral AI wrappers and speculative
                prototypes, we founded Axiom Studio around a singular
                conviction: genuine enterprise impact demands mathematical
                rigor, uncompromised craft, and deep systems engineering.
              </p>
              <p>
                Whether orchestrating autonomous multi-agent meshes across
                50,000 server nodes or designing clinical copilots that save
                physicians hours of administrative burden, we engineer software
                that stands the test of high-stress production environments.
              </p>

              {/* Dual-Layer Dotted World Map SVG with Pulsing Hub Beacons & Animated Optical Flow */}
              <div className="pt-4">
                <div className="p-4 rounded-2xl bg-[#07070c] border border-white/[0.08] hover:border-brand-primary/35 transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                    <span>GLOBAL STUDIO TOPOLOGY</span>
                    <span className="text-brand-light flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      SF ⇄ LDN LOW-LATENCY SYNC
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 360 120"
                    className="w-full h-28 overflow-visible"
                    aria-label="Global Studio Hubs Map connecting San Francisco and London"
                  >
                    <defs>
                      <pattern
                        id="worldDots"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle
                          cx="2"
                          cy="2"
                          r="1"
                          fill="rgba(255,255,255,0.13)"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="360"
                      height="120"
                      fill="url(#worldDots)"
                      rx="8"
                    />
                    {/* Base Trans-Atlantic Track */}
                    <path
                      d="M 78 68 Q 175 12 256 46"
                      fill="none"
                      stroke="rgba(133, 135, 227, 0.22)"
                      strokeWidth="1.5"
                    />
                    {/* Animated Dash-Flow Optical Stream */}
                    <path
                      d="M 78 68 Q 175 12 256 46"
                      fill="none"
                      stroke="#8587e3"
                      strokeWidth="1.8"
                      strokeDasharray="6 10"
                      className="animate-dash-flow"
                    />
                    {/* San Francisco Concentric Pulsing Beacon */}
                    <circle
                      cx="78"
                      cy="68"
                      r="11"
                      fill="rgba(133,135,227,0.22)"
                      className="animate-ping"
                      style={{ transformOrigin: "78px 68px", animationDuration: "2.4s" }}
                    />
                    <circle
                      cx="78"
                      cy="68"
                      r="7"
                      fill="rgba(133,135,227,0.3)"
                    />
                    <circle cx="78" cy="68" r="3.5" fill="#8587e3" />
                    <text
                      x="56"
                      y="90"
                      fill="#e4e4e7"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      SFO HUB
                    </text>

                    {/* London Concentric Pulsing Beacon */}
                    <circle
                      cx="256"
                      cy="46"
                      r="11"
                      fill="rgba(52,211,153,0.22)"
                      className="animate-ping"
                      style={{ transformOrigin: "256px 46px", animationDuration: "2.7s" }}
                    />
                    <circle
                      cx="256"
                      cy="46"
                      r="7"
                      fill="rgba(52,211,153,0.3)"
                    />
                    <circle cx="256" cy="46" r="3.5" fill="#34d399" />
                    <text
                      x="236"
                      y="68"
                      fill="#e4e4e7"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      LDN HUB
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            {/* Interactive Showcase Story Reel + Cinema Modal Trigger */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#08080c] shadow-2xl shadow-black/80 aspect-video flex flex-col justify-between p-6 sm:p-8 group">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(133, 135, 227, 0.4) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Top Right Expand Cinema Button */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-light">
                  STUDIO REEL • 2026 EDITION
                </span>
                <button
                  type="button"
                  onClick={() => setReelModalOpen(true)}
                  aria-label="Open Cinema Story Reel Modal"
                  className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-zinc-300 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Central Dynamic Harmonic Wave Visualizer */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/30">
                  <Cpu className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 h-12 mb-3">
                  {baseBars.map((h, i) => {
                    const dynamicH = isPlayingReel
                      ? Math.max(
                          18,
                          Math.min(
                            100,
                            Math.round(
                              h * (0.65 + 0.35 * Math.sin(waveTick * 0.45 + i))
                            )
                          )
                        )
                      : 20;
                    return (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-brand-primary to-white rounded-full transition-all duration-150"
                        style={{
                          height: `${dynamicH}%`,
                          opacity: isPlayingReel ? 0.92 : 0.4,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {isPlayingReel
                    ? "STREAMING: AXIOM SYSTEMS REEL 2026"
                    : "REEL PAUSED"}
                </span>
              </div>

              {/* Reel Controls Footer */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-zinc-300">
                    4K HDR • 60 FPS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlayingReel(!isPlayingReel)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
                >
                  {isPlayingReel ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Reel</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Reel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Triad (Spotlight + 3D Tilt Cards) */}
        <div className="mb-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              OUR PILLARS
            </span>
            <SplitTextReveal
              as="h2"
              text="The Axiom Standard"
              accentFromWordIndex={2}
              className="text-3xl sm:text-4xl font-extrabold text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpotlightCard
              tilt
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/40"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Design-First Innovation
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  We reject clunky enterprise software. High-density interfaces
                  must be ergonomic, legible, and visually commanding—elevating
                  operator decision speed without cognitive overload.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                100% WCAG 2.1 AA Compliant
              </div>
            </SpotlightCard>

            <SpotlightCard
              delay={0.08}
              tilt
              spotlightColor="rgba(52, 211, 153, 0.14)"
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/40"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Code2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Engineering Excellence
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Type-safe Rust and TypeScript, deterministic Model Context
                  Protocol (MCP) tool execution, sub-second edge routing, and
                  automated regression evaluation harnesses.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                Sub-85ms Median Latency
              </div>
            </SpotlightCard>

            <SpotlightCard
              delay={0.16}
              tilt
              spotlightColor="rgba(96, 165, 250, 0.14)"
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/40"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Real-World Impact
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  We measure our success not by lines of code or vanity demos,
                  but by millions saved in infrastructure downtime, hours
                  reclaimed for physicians, and conversion metrics delivered.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                Verifiable Client ROI
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* How We Think / Core Beliefs (01, 02, 03 — Scroll-Illuminated Stack) */}
        <div
          id="beliefs"
          className="mb-28 p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#09090e] to-[#040406] border border-white/[0.08]"
        >
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              PHILOSOPHY &amp; ARCHITECTURE
            </span>
            <SplitTextReveal
              as="h2"
              text="How We Think: Three Non-Negotiables"
              accentFromWordIndex={3}
              className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
            />
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Every architectural decision at Axiom Studio is guided by three
              founding principles that distinguish our engineering from standard
              consultancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreBeliefs.map((belief, idx) => (
              <motion.div
                key={belief.num}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.65,
                  delay: idx * 0.1,
                  ease: MOTION_EASE.cinematicOut,
                }}
                className="border-l-2 border-brand-primary/50 hover:border-brand-light pl-6 transition-colors"
              >
                <span className="text-3xl font-extrabold font-mono text-brand-primary mb-3 block tabular-nums">
                  {belief.num}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  {belief.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {belief.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Zero-Jank 0fr -> 1fr CSS Grid Accordion FAQ Section */}
        <div className="max-w-4xl mx-auto mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              TRANSPARENCY &amp; ENGAGEMENT
            </span>
            <SplitTextReveal
              as="h2"
              text="Frequently Asked Questions"
              accentFromWordIndex={2}
              className="text-3xl sm:text-4xl font-extrabold text-white"
            />
          </div>

          <div className="space-y-4">
            {companyFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-colors overflow-hidden ${
                    isOpen
                      ? "border-brand-primary/40 bg-white/[0.03]"
                      : "border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-brand-primary shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.05] pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Consultation Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-primary/20 via-brand-muted/10 to-transparent border border-brand-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              READY TO BUILD?
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Let&apos;s build software that moves your industry.
            </h3>
            <p className="text-sm text-zinc-300">
              Direct access to our senior architects. Zero sales bureaucracy.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0 shadow-xl shadow-brand-primary/20"
          >
            Start Conversation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Expandable Story Reel Cinema Modal */}
      <AnimatePresence>
        {reelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setReelModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={MOTION_SPRING.snappy}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl rounded-3xl bg-[#07070c] border border-brand-primary/35 p-6 sm:p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary block">
                    AXIOM STUDIO SHOWCASE REEL
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Autonomous Infrastructure, Clinical Copilots &amp; Digital Flagships
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReelModalOpen(false)}
                  aria-label="Close Reel Modal"
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video rounded-2xl bg-[#040408] border border-white/[0.08] flex flex-col items-center justify-center p-8 text-center">
                <div className="flex items-center gap-2 h-20 mb-6">
                  {baseBars.map((h, i) => {
                    const dynamicH = Math.max(
                      20,
                      Math.min(
                        100,
                        Math.round(
                          h * (0.6 + 0.4 * Math.sin(waveTick * 0.5 + i))
                        )
                      )
                    );
                    return (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-brand-primary via-brand-light to-white rounded-full transition-all duration-150"
                        style={{ height: `${dynamicH}%` }}
                      />
                    );
                  })}
                </div>
                <p className="text-sm font-mono text-zinc-300 mb-2">
                  74+ Enterprise Systems • 99.4% Partner Retention • Sub-85ms Streaming
                </p>
                <p className="text-xs text-zinc-500 max-w-md">
                  Explore individual architecture deep-dives and interactive telemetry simulations across our 7 verified case study dossiers.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
