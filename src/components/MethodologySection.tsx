"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import SpotlightCard from "./SpotlightCard";
import { Terminal, Shield, RefreshCw } from "lucide-react";

const pillars = [
  {
    index: "01",
    icon: Terminal,
    badge: "MCP JSON-RPC",
    title: "Autonomous Tool Protocol",
    description:
      "We integrate structured Model Context Protocol (MCP) servers, granting AI models typed, authenticated, and bounded access to enterprise backends.",
    telemetry: "DETERMINISTIC SCHEMA VALIDATED",
  },
  {
    index: "02",
    icon: Shield,
    badge: "AIR-GAPPED VPC",
    title: "Zero-Knowledge Isolation",
    description:
      "Proprietary algorithms and customer data never leave your private VPC. We deploy air-gapped models and edge inference engines with complete data sovereignty.",
    telemetry: "ZERO-RETENTION CRYPTO ENFORCED",
  },
  {
    index: "03",
    icon: RefreshCw,
    badge: "CI/CD EVAL HARNESS",
    title: "Continuous Automated Evals",
    description:
      "Every code change, prompt iteration, and fine-tuned weight checkpoint is automatically tested against regression test sets before reaching production.",
    telemetry: "99.4% REGRESSION GATE FIDELITY",
  },
];

export default function MethodologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 45%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="py-24 sm:py-32 border-t border-white/[0.08] bg-[#020203] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-light text-xs font-mono font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span>OUR METHODOLOGY • 01 — 03</span>
          </div>
          <SplitTextReveal
            as="h2"
            text="Deterministic Engineering Over Guesswork."
            accentFromWordIndex={2}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
          />
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
            Modern AI implementations frequently fail due to stochastic
            inconsistency and hidden runtime drift. We build deterministic
            guardrails, rigorous automated evaluation loops, and hardened
            sandboxes into every deployment.
          </p>
        </div>

        {/* Scroll-Scrubbed Horizontal Architectural Bus (Desktop) */}
        <div className="hidden md:block relative h-[2px] w-full bg-white/[0.06] rounded-full mb-10 overflow-hidden">
          <motion.div
            style={{ scaleX: lineScale, transformOrigin: "0% 50%" }}
            className="h-full w-full bg-gradient-to-r from-brand-primary via-brand-light to-emerald-400 will-change-transform"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <SpotlightCard
                key={pillar.index}
                delay={idx * 0.09}
                tilt
                className="p-8 rounded-2xl glass-panel border border-white/10 hover:border-brand-primary/45"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                        {pillar.badge}
                      </span>
                      <span className="font-mono text-xs font-bold text-brand-primary">
                        {pillar.index}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-light transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center gap-2 text-[11px] font-mono text-emerald-400/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{pillar.telemetry}</span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
