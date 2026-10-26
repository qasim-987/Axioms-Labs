"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ParticleSphereHero from "./ParticleSphereHero";
import LightBeam from "./LightBeam";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-[#020108] overflow-hidden flex flex-col justify-between pt-24 pb-12 sm:pb-16 px-6 sm:px-10 lg:px-16 selection:bg-brand-primary selection:text-white">
      {/* LAYER 1: Deep Near-Black Background is on the parent section (#020108) */}

      {/* LAYER 2: Giant Ghost Watermark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
      >
        <span className="text-[34vh] md:text-[40vh] font-extrabold uppercase tracking-tight text-white/[0.035] whitespace-nowrap leading-none scale-y-110">
          AXIOM STUDIO
        </span>
      </div>

      {/* LAYER 3: Volumetric Violet-Blue Light Beam from Top-Left */}
      <LightBeam />

      {/* LAYER 4: Hollow 3D Particle Sphere with Fibonacci distribution & Cursor Physics */}
      <ParticleSphereHero />

      {/* LAYER 5: Foreground Typography, CTAs and Stats UI (z-10, sits in front of sphere) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between pointer-events-none">
        {/* Top spacer below navbar */}
        <div className="h-6 sm:h-12" />

        {/* Headline Left-Center (Sphere sits behind this) */}
        <div className="my-auto py-12 sm:py-16 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col tracking-tight text-white text-4xl sm:text-6xl md:text-[62px] lg:text-[70px] leading-[1.08] select-none"
          >
            {/* Line 1 */}
            <div className="flex items-center flex-wrap">
              <span className="font-light text-white">Building</span>
              <span className="font-extrabold italic text-white ml-3 sm:ml-4">Digital</span>
            </div>

            {/* Line 2 — Indented ~170px on desktop */}
            <div className="flex items-center flex-wrap mt-2 sm:mt-3 pl-0 sm:pl-[120px] md:pl-[170px]">
              <span className="font-extrabold italic text-white mr-3 sm:mr-4">Solutions</span>
              <span className="font-light text-white">That Matter</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Subtext & CTA (Left) + Stats Row (Right) */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-8 sm:gap-12 pt-6 pointer-events-auto">
          {/* Subtext and Primary CTA Button (Bottom-Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md flex flex-col items-start"
          >
            <p className="text-sm sm:text-base text-white/85 leading-relaxed font-normal mb-6">
              We empower organizations with AI that turns complex challenges into real-world outcomes.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold text-white tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #6b5fd6 0%, #8a7ff0 100%)",
                boxShadow: "0 0 28px rgba(107, 95, 214, 0.55), 0 4px 14px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span>Start Your Project</span>
            </Link>
          </motion.div>

          {/* Stats Row (Bottom-Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-8 sm:gap-10 lg:gap-12"
          >
            {/* Stat 1 */}
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">50+</span>
              <span className="text-xs text-zinc-400 font-medium leading-snug">
                Projects
                <br />
                Delivered
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">100%</span>
              <span className="text-xs text-zinc-400 font-medium leading-snug">
                Client
                <br />
                Satisfaction
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">24/7</span>
              <span className="text-xs text-zinc-400 font-medium leading-snug">
                Support
                <br />
                Available
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Chat Badge (Bottom-Right Corner) */}
      <div className="fixed bottom-5 right-5 z-40 pointer-events-auto">
        <button
          type="button"
          aria-label="Start Conversation with Axiom AI"
          className="group relative w-12 h-12 rounded-full bg-[#0d0c15] border border-white/20 shadow-2xl shadow-purple-600/30 flex items-center justify-center transition-all duration-300 hover:scale-108 hover:border-brand-primary/60"
        >
          <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#6b5fd6] via-[#9488f5] to-white p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#12111d] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#b9b2ff] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}
