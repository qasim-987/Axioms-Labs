"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ParticleSphereHero from "./ParticleSphereHero";
import LightBeam from "./LightBeam";
import RollingNumber from "./RollingNumber";
import { Sparkles } from "lucide-react";

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
    <section className="relative w-full min-h-screen bg-[#020108] overflow-hidden flex flex-col justify-between pt-28 pb-12 sm:pb-16 selection:bg-brand-primary selection:text-white">
      {/* LAYER 1B: Centered Radial Precision Micro-Grid Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.65) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "center center",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 18%, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 18%, transparent 68%)",
        }}
      />

      {/* LAYER 2: Centered Giant Ghost Watermark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 px-8"
      >
        <span
          className="font-extrabold uppercase tracking-[0.03em] text-white/[0.038] whitespace-nowrap leading-none scale-y-110 text-center mx-auto"
          style={{ fontSize: "clamp(2.25rem, 9.2vw, 9rem)" }}
        >
          AXIOM STUDIO
        </span>
      </div>

      {/* LAYER 3: Symmetrical Volumetric Violet-Blue Light Beam */}
      <LightBeam />

      {/* LAYER 4: Centered Hollow 3D Particle Sphere with Fibonacci Distribution & Cursor Physics */}
      <ParticleSphereHero />

      {/* LAYER 5: Centered Foreground Typography, CTA & Balanced Stats Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 sm:px-14 lg:px-20 flex-1 flex flex-col items-center justify-between text-center pointer-events-none">
        {/* Top breathing spacer below fixed navbar */}
        <div className="h-4 sm:h-8" />

        {/* Centered Main Hero Stack (Headline + Subtext + CTA) */}
        <div className="my-auto py-10 sm:py-14 flex flex-col items-center justify-center text-center max-w-4xl mx-auto pointer-events-auto">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center tracking-tight text-white text-4xl sm:text-6xl md:text-[64px] lg:text-[72px] leading-[1.08] select-none mb-7"
          >
            {/* Line 1 — Centered */}
            <span className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4">
              <span className="font-light text-white">Building</span>
              <span className="font-extrabold italic text-white">Digital</span>
            </span>

            {/* Line 2 — Centered */}
            <span className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 mt-2 sm:mt-3">
              <span className="font-extrabold italic text-white">
                Solutions
              </span>
              <span className="font-light text-white">That Matter</span>
            </span>
          </motion.h1>

          {/* Centered Subtitle tailored to Web Dev, Web Design, UI/UX & AI Agents */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.85,
              delay: 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-xl mx-auto text-center text-sm sm:text-base md:text-lg text-white/85 leading-relaxed font-normal mb-8"
          >
            We craft high-converting websites, intuitive UI/UX interfaces,
            scalable web applications, and custom AI agents for modern brands.
          </motion.p>

          {/* Centered Primary CTA Pill */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center justify-center"
          >
            <Link
              href="/contact"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="inline-flex items-center justify-center px-9 py-3.5 rounded-full text-sm font-semibold text-white tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] will-change-transform"
              style={{
                background: "linear-gradient(135deg, #6b5fd6 0%, #8a7ff0 100%)",
                boxShadow:
                  "0 0 32px rgba(107, 95, 214, 0.55), 0 4px 16px rgba(0, 0, 0, 0.35)",
              }}
            >
              <span>Start Your Project</span>
            </Link>
          </motion.div>
        </div>

        {/* Centered Bottom Metrics Strip (Honest Studio Standards) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mx-auto pt-7 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 pointer-events-auto"
        >
          {/* Stat 1 */}
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              <RollingNumber value={4} duration={1400} suffix="" />
            </span>
            <span className="text-xs text-zinc-400 font-medium leading-snug">
              Core Studio
              <br />
              Disciplines
            </span>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:block h-8 w-px bg-white/[0.1]"
          />

          {/* Stat 2 */}
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              <RollingNumber value={99} duration={1800} suffix="+" />
            </span>
            <span className="text-xs text-zinc-400 font-medium leading-snug">
              Lighthouse
              <br />
              Performance
            </span>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:block h-8 w-px bg-white/[0.1]"
          />

          {/* Stat 3 */}
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-mono tabular-nums">
              24/7
            </span>
            <span className="text-xs text-zinc-400 font-medium leading-snug">
              Direct Team
              <br />
              Support
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating Quick-Contact Badge */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
        <Link
          href="/contact"
          aria-label="Start Conversation with Axiom Studio"
          className="group relative w-12 h-12 rounded-full bg-[#0d0c15] border border-white/20 shadow-2xl shadow-purple-600/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-brand-primary/60"
        >
          <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#6b5fd6] via-[#9488f5] to-white p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#12111d] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#b9b2ff] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
