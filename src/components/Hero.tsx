"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LightRays from "./LightRays";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Terminal,
} from "lucide-react";

const heroSpecs = [
  {
    icon: Zap,
    title: "< 85ms Latency",
    sub: "Median Token Streaming",
  },
  {
    icon: ShieldCheck,
    title: "SOC2 & HIPAA",
    sub: "Zero-Retention Security",
  },
  {
    icon: Terminal,
    title: "MCP Native",
    sub: "Autonomous Protocol",
  },
  {
    icon: Sparkles,
    title: "99.99% SLA",
    sub: "Distributed Edge Infra",
  },
];

export default function Hero() {
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
    e.currentTarget.style.transform = `translate3d(${dx.toFixed(
      1
    )}px, ${dy.toFixed(1)}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translate3d(0px, 0px, 0)";
  };

  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      {/* Volumetric Light Rays + Dust Mote Shader */}
      <LightRays />

      {/* 100ms — Hero Eyebrow Pill */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1, ease: MOTION_EASE.cinematicOut }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-brand-primary/30 text-zinc-300 text-xs font-mono mb-8 hover:border-brand-primary/60 transition-colors"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
        </span>
        <span className="text-zinc-200">Axiom Studio</span>
        <span className="text-zinc-500">•</span>
        <span className="text-brand-primary">
          Enterprise AI &amp; Systems Architecture
        </span>
      </motion.div>

      {/* 180ms — Character-by-Character 3D Kinetic Reveal Heading */}
      <SplitTextReveal
        as="h1"
        text="Architecting Digital Systems That Think, Scale, and Matter."
        accentFromWordIndex={4}
        accentClassName="text-brand-light"
        delay={0.18}
        triggerOnLoad
        className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
      />

      {/* 680ms — Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.68, ease: MOTION_EASE.cinematicOut }}
        className="max-w-2xl text-base sm:text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-normal"
      >
        Axiom Studio partners with ambitious technology leaders to build
        sovereign AI infrastructure, autonomous agent orchestration networks,
        and precision digital flagships.
      </motion.p>

      {/* 820ms — Magnetic Primary CTA & Secondary Dossier Pill */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.82, ease: MOTION_EASE.cinematicOut }}
        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
      >
        <Link
          href="/contact"
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 will-change-transform"
        >
          <span>Schedule Architecture Review</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/work"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full glass-panel hover:bg-white/[0.08] text-zinc-300 hover:text-white text-sm font-semibold transition-all duration-200 border border-white/10 hover:border-white/20"
        >
          <span>Explore 7 Case Studies</span>
        </Link>
      </motion.div>

      {/* 960ms — Staggered Trust & Spec Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl w-full border-t border-white/[0.08] pt-8 text-left">
        {heroSpecs.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <motion.div
              key={spec.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.96 + idx * 0.07,
                ease: MOTION_EASE.cinematicOut,
              }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-brand-primary/30 transition-colors"
            >
              <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {spec.title}
                </div>
                <div className="text-[11px] text-zinc-400">{spec.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
