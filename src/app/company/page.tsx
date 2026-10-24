"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Code2,
  Cpu,
  Compass,
  Play,
  Pause,
  Award
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const companyFaqs: FAQItem[] = [
  {
    q: "How does Axiom Labs differ from traditional software agencies or consulting firms?",
    a: "Traditional agencies assemble off-the-shelf templates and junior teams. Axiom Labs is an engineering-first systems studio led by senior systems architects and machine learning engineers. We build production-hardened AI pipelines, custom fine-tuned weights, and high-throughput web flagships with deterministic evaluation suites and measurable ROI guarantees."
  },
  {
    q: "Who owns the intellectual property (IP) and custom models developed during an engagement?",
    a: "You retain 100% full legal ownership of all code, custom-trained model weights, datasets, prompt templates, and infrastructure scripts created during our engagement. We never license shared models or claim recurring royalties on your IP."
  },
  {
    q: "How do you protect proprietary corporate data from leaking into public AI models?",
    a: "We adhere to a strict Zero-Data-Retention architecture. We deploy open-weight foundation models (Llama 3, Mistral, Qwen) inside your private cloud VPC or on-premises GPU clusters. When enterprise APIs are utilized, we configure enterprise BAA agreements that guarantee inputs are never stored, cached, or used for model retraining."
  },
  {
    q: "What is your typical engagement structure and timeline?",
    a: "Engagements typically run as 8 to 12-week intensive delivery sprints with dedicated two-week milestones. We operate with high transparency: weekly executable demos, continuous CI/CD preview branches, and direct Slack/Teams shared channel access with our engineering leads."
  },
  {
    q: "Do you offer post-launch support and continuous SLA maintenance?",
    a: "Yes. Following launch, we offer continuous operational telemetry management, model drift monitoring, fine-tuning retraining runs, and 24/7 high-availability infrastructure SLAs."
  }
];

export default function CompanyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isPlayingReel, setIsPlayingReel] = useState<boolean>(true);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-brand-primary mb-6">
            <Compass className="w-3.5 h-3.5" />
            Our Mission &amp; DNA
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
            Companies create products. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-brand-primary">
              Axiom Labs Creates Impact.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            We are an autonomous systems and digital engineering studio dedicated to building high-consequence software for the next decade of intelligent computing.
          </p>
        </div>

        {/* Narrative Origins Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 items-center">
          <div className="md:col-span-5">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              OUR ORIGINS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              Things that matter.
            </h2>
            <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
              <p>
                In an era flooded with ephemeral AI wrappers and speculative prototypes, we founded Axiom Labs around a singular conviction: genuine enterprise impact demands mathematical rigor, uncompromised craft, and deep systems engineering.
              </p>
              <p>
                Whether orchestrating autonomous multi-agent meshes across 50,000 server nodes or designing clinical copilots that save physicians hours of administrative burden, we engineer software that stands the test of high-stress production environments.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            {/* Interactive Showcase Reel Simulation */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#08080c] shadow-2xl shadow-black/80 aspect-video flex flex-col justify-between p-6 sm:p-8">
              {/* Dynamic Animated Grid Pattern inside preview */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(rgba(133, 135, 227, 0.4) 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Central Audio/Video Wave Visualizer */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/30">
                  <Cpu className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 h-12 mb-3">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 65, 95, 50, 75, 35, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-brand-primary to-white rounded-full transition-all duration-300"
                      style={{
                        height: isPlayingReel ? `${h}%` : "20%",
                        opacity: isPlayingReel ? 0.9 : 0.4,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {isPlayingReel ? "STREAMING: AXIOM SYSTEMS REEL 2026" : "REEL PAUSED"}
                </span>
              </div>

              {/* Reel Controls Footer */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-zinc-300">4K HDR • 60 FPS</span>
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

        {/* Core Values Triad */}
        <div className="mb-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              OUR PILLARS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              The Axiom Standard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Design-First Innovation
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  We reject clunky enterprise software. High-density interfaces must be ergonomic, legible, and visually commanding—elevating operator decision speed without cognitive overload.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                100% WCAG 2.1 AA Compliant
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Code2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Engineering Excellence
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Type-safe Rust and TypeScript, deterministic Model Context Protocol (MCP) tool execution, sub-second edge routing, and automated regression evaluation harnesses.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                Sub-85ms Median Latency
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Real-World Impact
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  We measure our success not by lines of code or vanity demos, but by millions saved in infrastructure downtime, hours reclaimed for physicians, and conversion metrics delivered.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                Verifiable Client ROI
              </div>
            </div>
          </div>
        </div>

        {/* How We Think / Core Beliefs (01, 02, 03) */}
        <div id="beliefs" className="mb-28 p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#09090e] to-[#040406] border border-white/[0.08]">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              PHILOSOPHY &amp; ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              How We Think: Three Non-Negotiables
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Every architectural decision at Axiom Labs is guided by three founding principles that distinguish our engineering from standard consultancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-l-2 border-brand-primary/40 pl-6">
              <span className="text-3xl font-extrabold font-mono text-brand-primary mb-3 block">
                01
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Code as Deterministic Proof
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                We treat machine learning outputs not as magic, but as probabilistic functions requiring strict boundary guardrails, schema enforcement, and continuous synthetic evaluation suites.
              </p>
            </div>

            <div className="border-l-2 border-brand-primary/40 pl-6">
              <span className="text-3xl font-extrabold font-mono text-brand-primary mb-3 block">
                02
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Human Sovereignty &amp; Privacy
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Autonomous agents must amplify human capability without compromising security. We deploy zero-retention private clusters where sensitive enterprise IP never trains public models.
              </p>
            </div>

            <div className="border-l-2 border-brand-primary/40 pl-6">
              <span className="text-3xl font-extrabold font-mono text-brand-primary mb-3 block">
                03
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                Velocity Through Rigor
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                True engineering speed does not come from cutting corners; it comes from airtight type safety, automated CI/CD canary verification, and architectural clarity from day one.
              </p>
            </div>
          </div>
        </div>

        {/* Accordion FAQ Section */}
        <div className="max-w-4xl mx-auto mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              TRANSPARENCY &amp; ENGAGEMENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {companyFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors focus:outline-none"
                  aria-expanded={openFaq === idx}
                >
                  <span className="text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-primary shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
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

      <Footer />
    </div>
  );
}
