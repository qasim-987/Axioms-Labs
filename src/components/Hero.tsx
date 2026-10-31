"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleSphereHero from "./ParticleSphereHero";
import LightBeam from "./LightBeam";
import RollingNumber from "./RollingNumber";
import { MOTION_EASE } from "@/lib/motionTokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface HeroWordToken {
  word: string;
  className: string;
}

const HERO_LINE_1: HeroWordToken[] = [
  { word: "Building", className: "font-normal text-[#121317]" },
  { word: "Digital", className: "font-extrabold italic text-[#121317]" },
];

const HERO_LINE_2: HeroWordToken[] = [
  { word: "Solutions", className: "font-extrabold italic text-[#3186FF]" },
  { word: "That", className: "font-normal text-[#45474D]" },
  { word: "Matter", className: "font-normal text-[#45474D]" },
];

function SplitHeroLine({
  tokens,
  startCharIndex,
  prefersReduced,
}: {
  tokens: HeroWordToken[];
  startCharIndex: number;
  prefersReduced: boolean;
}) {
  let charCursor = startCharIndex;

  return (
    <>
      {tokens.map((token, wIdx) => (
        <span
          key={token.word + wIdx}
          className={`inline-block whitespace-nowrap ${token.className}`}
        >
          {Array.from(token.word).map((ch, cIdx) => {
            const idx = charCursor++;
            if (prefersReduced) {
              return <span key={cIdx}>{ch}</span>;
            }
            return (
              <motion.span
                key={cIdx}
                initial={{
                  opacity: 0,
                  y: "68%",
                  rotateX: -42,
                  filter: "blur(7px)",
                }}
                animate={{
                  opacity: 1,
                  y: "0%",
                  rotateX: 0,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 0.78,
                  delay: 0.14 + idx * 0.022,
                  ease: MOTION_EASE.cinematicOut,
                }}
                className="inline-block will-change-transform origin-bottom"
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const prefersReduced = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const sphereStageRef = useRef<HTMLDivElement>(null);
  const foregroundCopyRef = useRef<HTMLDivElement>(null);

  // Antimatter-style multi-plane scroll depth parallax on Hero exit
  useEffect(() => {
    if (prefersReduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      });

      if (foregroundCopyRef.current) {
        tl.to(
          foregroundCopyRef.current,
          {
            y: -72,
            scale: 0.965,
            opacity: 0.18,
            ease: "none",
          },
          0
        );
      }

      if (sphereStageRef.current && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        tl.to(
          sphereStageRef.current,
          {
            y: -36,
            scale: 1.06,
            ease: "none",
          },
          0
        );
      }

      if (watermarkRef.current) {
        tl.to(
          watermarkRef.current,
          {
            y: 78,
            ease: "none",
          },
          0
        );
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReduced]);

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
    e.currentTarget.style.transform = `translate3d(${dx.toFixed(
      1
    )}px, ${dy.toFixed(1)}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translate3d(0px, 0px, 0)";
  };

  const line1CharCount = HERO_LINE_1.reduce(
    (sum, t) => sum + t.word.length,
    0
  );

  return (
    <section
      ref={sectionRef}
      className="hero-responsive relative w-full min-h-screen bg-[#FFFFFF] overflow-hidden flex flex-col justify-between pt-28 pb-12 sm:pb-16 selection:bg-[#3186FF] selection:text-white"
    >
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

      {/* LAYER 2: Centered Giant Ghost Watermark with Deep Scroll Parallax */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 px-8 will-change-transform"
      >
        <span
          className="font-extrabold uppercase tracking-[0.03em] text-[#121317]/[0.032] whitespace-nowrap leading-none scale-y-110 text-center mx-auto"
          style={{ fontSize: "clamp(2.25rem, 9.2vw, 9rem)" }}
        >
          AXIOM STUDIO
        </span>
      </div>

      {/* LAYER 3: Symmetrical Centered Antigravity Pastel Aura (Mouse-Parallax Reactive) */}
      <LightBeam />

      {/* LAYER 4: Centered Hollow 3D Multicolor Antigravity Particle Sphere */}
      <div
        ref={sphereStageRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ zIndex: 1 }}
      >
        <ParticleSphereHero />
      </div>

      {/* LAYER 5: Centered Character-Split Foreground Typography, Magnetic Pill CTAs & Odometer Stats */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 sm:px-14 lg:px-20 flex-1 flex flex-col items-center justify-between text-center pointer-events-none">
        <div className="h-4 sm:h-8" />

        {/* Centered Main Hero Stack */}
        <div
          ref={foregroundCopyRef}
          data-page-header
          className="hero-touch-copy my-auto py-10 sm:py-14 flex flex-col items-center justify-center text-center max-w-4xl mx-auto pointer-events-auto will-change-transform"
        >
          {/* Antimatter Character-by-Character 3D Kinetic Headline */}
          <h1 data-reveal="lines"
            aria-label="Building Digital Solutions That Matter"
            className="flex flex-col items-center justify-center text-center tracking-tight text-[#121317] text-4xl sm:text-6xl md:text-[64px] lg:text-[72px] leading-[1.08] select-none mb-7 [perspective:900px]"
          >
            <span
              aria-hidden="true"
              className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4"
            >
              <SplitHeroLine
                tokens={HERO_LINE_1}
                startCharIndex={0}
                prefersReduced={prefersReduced}
              />
            </span>

            <span
              aria-hidden="true"
              className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 mt-2 sm:mt-3"
            >
              <SplitHeroLine
                tokens={HERO_LINE_2}
                startCharIndex={line1CharCount}
                prefersReduced={prefersReduced}
              />
            </span>
          </h1>

          {/* Centered Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.8,
              delay: 0.62,
              ease: MOTION_EASE.cinematicOut,
            }}
            className="max-w-xl mx-auto text-center text-sm sm:text-base md:text-lg text-[#45474D] leading-relaxed font-normal mb-8 bg-white/65 backdrop-blur-[2px] rounded-2xl px-4 py-1"
          >
            We craft high-converting websites, intuitive UI/UX interfaces,
            scalable web applications, and custom AI agents for modern brands.
          </motion.p>

          {/* Centered Paired Magnetic Antigravity Pill Buttons */}
          <motion.div data-reveal="fade-up"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.75,
              delay: 0.76,
              ease: MOTION_EASE.cinematicOut,
            }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium bg-[#121317] hover:bg-[#2F3034] text-white tracking-wide transition-all duration-200 shadow-[0_8px_24px_rgba(18,19,23,0.16)] will-change-transform"
            >
              <span>Start Your Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/work"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-medium bg-[#B7BFD9]/[0.18] hover:bg-[#F0F1F5] border border-[#212226]/[0.08] text-[#121317] tracking-wide transition-all duration-200 backdrop-blur-sm will-change-transform"
            >
              <span>Explore Concept Work</span>
            </Link>
          </motion.div>
        </div>

        {/* Centered Bottom Odometer Metrics Strip (`0123456789` Physical Ribbons) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.9,
            ease: MOTION_EASE.cinematicOut,
          }}
          className="w-full max-w-3xl mx-auto pt-7 border-t border-[#212226]/[0.08] flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 pointer-events-auto"
        >
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl sm:text-4xl font-bold text-[#121317] tracking-tight tabular-nums">
              <RollingNumber value={4} prefix="0" duration={1550} suffix="" />
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
              <RollingNumber value={99} duration={1750} suffix="+" />
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
    </section>
  );
}
