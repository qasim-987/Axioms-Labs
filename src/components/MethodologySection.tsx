"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import { Compass, Layers, Code2, Rocket } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const phases = [
  {
    step: "01",
    title: "Discovery & Product Scope",
    duration: "Week 1",
    description:
      "We map your user journeys, business goals, and technical requirements into a clear, actionable product blueprint.",
    icon: <Compass className="w-5 h-5 text-[#3186FF]" />,
  },
  {
    step: "02",
    title: "UI/UX & Web Design",
    duration: "Weeks 2–3",
    description:
      "Interactive Figma prototypes, design tokens, and visual direction—refining layout, typography, and motion before writing code.",
    icon: <Layers className="w-5 h-5 text-[#121317]" />,
  },
  {
    step: "03",
    title: "Web & AI Engineering",
    duration: "Weeks 3–6",
    description:
      "Clean Next.js / TypeScript web applications and custom AI agent workflows built with weekly staging previews.",
    icon: <Code2 className="w-5 h-5 text-[#00B95C]" />,
  },
  {
    step: "04",
    title: "QA, Launch & Handover",
    duration: "Final Sprint",
    description:
      "Performance tuning, responsive QA across devices, production deployment, and full source-code ownership.",
    icon: <Rocket className="w-5 h-5 text-[#FC413D]" />,
  },
];

function PhaseTiltCard({
  phase,
  idx,
}: {
  phase: (typeof phases)[number];
  idx: number;
}) {
  const [tilt, setTilt] = useState<{
    rx: number;
    ry: number;
    spotX: number;
    spotY: number;
    hovered: boolean;
  }>({ rx: 0, ry: 0, spotX: 50, spotY: 50, hovered: false });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - ny) * 7,
      ry: (nx - 0.5) * 7,
      spotX: nx * 100,
      spotY: ny * 100,
      hovered: true,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setTilt((prev) => ({ ...prev, rx: 0, ry: 0, hovered: false }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.68,
        delay: idx * 0.09,
        ease: MOTION_EASE.cinematicOut,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(950px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: tilt.hovered
          ? "transform 120ms cubic-bezier(0.22, 1, 0.36, 1), background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease"
          : "transform 520ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
      }}
      className="group relative rounded-3xl p-7 bg-[#F8F9FC] hover:bg-[#FFFFFF] border border-[#212226]/[0.07] hover:border-[#3186FF]/35 flex flex-col justify-between overflow-hidden shadow-[0_6px_24px_rgba(18,19,23,0.03)] hover:shadow-[0_20px_48px_rgba(18,19,23,0.08)] will-change-transform"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(49, 134, 255, 0.08), transparent 72%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#FFFFFF] border border-[#212226]/[0.08] group-hover:border-[#3186FF]/30 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
            {phase.icon}
          </div>
          <span className="text-xs font-mono text-[#3186FF] font-semibold">
            PHASE {phase.step}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#121317] mb-2.5">
          {phase.title}
        </h3>
        <p className="text-sm text-[#45474D] leading-relaxed mb-6">
          {phase.description}
        </p>
      </div>

      <div className="relative z-10 pt-4 border-t border-[#212226]/[0.07] flex items-center justify-between text-xs font-mono">
        <span className="text-[#6A6A71]">CADENCE</span>
        <span className="text-[#121317] font-medium">{phase.duration}</span>
      </div>
    </motion.div>
  );
}

export default function MethodologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !sectionRef.current || !progressBarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        progressBarRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            end: "bottom 55%",
            scrub: 0.5,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-24 sm:py-32 bg-[#FFFFFF]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
              <span>HOW WE WORK</span>
            </div>
            <SplitTextReveal
              as="h2"
              text="Transparent Delivery Process"
              accentFromWordIndex={2}
              accentClassName="text-[#3186FF]"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121317]"
            />
          </div>
          <p className="text-[#45474D] max-w-md text-sm sm:text-base leading-relaxed">
            Direct collaboration with designers and engineers from Kuopio and
            Lahore—structured in clear weekly milestones.
          </p>
        </div>

        {/* Scroll-Scrubbed Delivery Progress Rail (Desktop) */}
        <div className="hidden lg:block relative mb-8">
          <div className="h-[2px] w-full bg-[#E6EAF0] rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-gradient-to-r from-[#121317] via-[#3186FF] to-[#749BFF]"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, idx) => (
            <PhaseTiltCard key={phase.step} phase={phase} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
