"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ParticleSphereHero from "./ParticleSphereHero";
import LightBeam from "./LightBeam";
import RollingNumber from "./RollingNumber";
import { Sparkles, ArrowUpRight } from "lucide-react";

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
    <section className="relative w-full min-h-screen bg-[#FFFFFF] overflow-hidden flex flex-col justify-between pt-28 pb-12 sm:pb-16 selection:bg-[#3186FF] selection:text-white">
      {/* LAYER 1B: Centered Radial Precision Micro-Grid Backdrop (#212226 specks on #FFFFFF) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(18, 19, 23, 0.75) 1px, transparent 1px)",
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
          className="font-extrabold uppercase tracking-[0.03em] text-[#121317]/[0.032] whitespace-nowrap leading-none scale-y-110 text-center mx-auto"
          style={{ fontSize: "clamp(2.25rem, 9.2vw, 9rem)" }}
        >
          AXIOM STUDIO
        </span>
      </div>

      {/* LAYER 3: Symmetrical Centered Antigravity Pastel Aura */}
      <LightBeam />

      {/* LAYER 4: Centered Hollow 3D Multicolor Antigravity Particle Sphere */}
      <ParticleSphereHero />

      {/* LAYER 5: Centered Foreground Typography, Paired Pill CTAs & Balanced Stats */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 sm:px-14 lg:px-20 flex-1 flex flex-col items-center justify-between text-center pointer-events-none">
        <div className="h-4 sm:h-8" />

        {/* Centered Main Hero Stack */}
        <div className="my-auto py-10 sm:py-14 flex flex-col items-center justify-center text-center max-w-4xl mx-auto pointer-events-auto">
          {/* Subtle Antigravity Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8F9FC]/90 backdrop-blur-md border border-[#212226]/[0.08] text-xs font-mono text-[#45474D] mb-6 shadow-sm"
          >
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FC413D]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B95C]" />
            </span>
            <span>Web Dev • Web Design • UI/UX • AI Agents</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center tracking-tight text-[#121317] text-4xl sm:text-6xl md:text-[64px] lg:text-[72px] leading-[1.08] select-none mb-7"
          >
            {/* Line 1 — Centered */}
            <span className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4">
              <span className="font-normal text-[#121317]">Building</span>
              <span className="font-extrabold italic text-[#121317]">
                Digital
              </span>
            </span>

            {/* Line 2 — Centered (with Antigravity secondary slate contrast) */}
            <span className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 mt-2 sm:mt-3">
              <span className="font-extrabold italic text-[#3186FF]">
                Solutions
              </span>
              <span className="font-normal text-[#45474D]">That Matter</span>
            </span>
          </motion.h1>

          {/* Centered Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.85,
              delay: 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-xl mx-auto text-center text-sm sm:text-base md:text-lg text-[#45474D] leading-relaxed font-normal mb-8 bg-white/65 backdrop-blur-[2px] rounded-2xl px-4 py-1"
          >
            We craft high-converting websites, intuitive UI/UX interfaces,
            scalable web applications, and custom AI agents for modern brands.
          </motion.p>

          {/* Centered Paired Antigravity Pill Buttons (Solid #121317 Primary + Tonal #B7BFD9 Secondary) */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium bg-[#121317] hover:bg-[#2F3034] text-white tracking-wide transition-all duration-200 shadow-[0_8px_24px_rgba(18,19,23,0.16)] hover:scale-[1.02] active:scale-[0.98] will-change-transform"
            >
              <span>Start Your Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/work"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-medium bg-[#B7BFD9]/[0.18] hover:bg-[#F0F1F5] border border-[#212226]/[0.08] text-[#121317] tracking-wide transition-all duration-200 backdrop-blur-sm"
            >
              <span>Explore Concept Work</span>
            </Link>
          </motion.div>
        </div>

        {/* Centered Bottom Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mx-auto pt-7 border-t border-[#212226]/[0.08] flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 pointer-events-auto"
        >
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-[#121317] tracking-tight tabular-nums">
              <RollingNumber value={4} duration={1400} suffix="" />
            </span>
            <span className="text-xs text-[#45474D] font-medium leading-snug">
              Core Studio
              <br />
              Disciplines
            </span>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:block h-8 w-px bg-[#212226]/[0.1]"
          />

          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-[#121317] tracking-tight tabular-nums">
              <RollingNumber value={99} duration={1800} suffix="+" />
            </span>
            <span className="text-xs text-[#45474D] font-medium leading-snug">
              Lighthouse
              <br />
              Performance
            </span>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:block h-8 w-px bg-[#212226]/[0.1]"
          />

          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-[#121317] tracking-tight font-mono tabular-nums">
              24/7
            </span>
            <span className="text-xs text-[#45474D] font-medium leading-snug">
              Direct Team
              <br />
              Support
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating Quick-Contact Badge (#121317 Obsidian Pill with Antigravity Multicolor Ring) */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
        <Link
          href="/contact"
          aria-label="Start Conversation with Axiom Studio"
          className="group relative w-12 h-12 rounded-full bg-[#121317] hover:bg-[#2F3034] border border-[#212226]/15 shadow-[0_12px_32px_rgba(18,19,23,0.22)] flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          <div
            className="relative w-8 h-8 rounded-full p-[1.5px] flex items-center justify-center"
            style={{
              background:
                "conic-gradient(from 0deg, #3186FF, #FC413D, #FBBC04, #00B95C, #3186FF)",
            }}
          >
            <div className="w-full h-full bg-[#121317] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
