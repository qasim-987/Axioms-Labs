"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import RollingNumber from "./RollingNumber";
import { MOTION_EASE } from "@/lib/motionTokens";

const stats = [
  {
    value: "04",
    label: "Core Disciplines",
    detail: "Web Dev • Web Design • UI/UX • AI Agents",
    accent: "#3186FF",
  },
  {
    value: "99+",
    label: "Lighthouse Target",
    detail: "Core Web Vitals & WCAG 2.1 AA",
    accent: "#00B95C",
  },
  {
    value: "02",
    label: "Global Studio Hubs",
    detail: "Kuopio, Finland & Lahore, Pakistan",
    accent: "#FBBC04",
  },
  {
    value: "24/7",
    label: "Agentic Readiness",
    detail: "Autonomous AI Workflows & Support",
    accent: "#FC413D",
  },
];

function TiltStatCard({
  stat,
  idx,
}: {
  stat: (typeof stats)[number];
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
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - ny) * 8,
      ry: (nx - 0.5) * 8,
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
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.68,
        delay: idx * 0.08,
        ease: MOTION_EASE.cinematicOut,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: tilt.hovered
          ? "transform 120ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms ease, box-shadow 300ms ease"
          : "transform 520ms cubic-bezier(0.16, 1, 0.3, 1), border-color 300ms ease, box-shadow 300ms ease",
      }}
      className="group relative rounded-3xl p-7 sm:p-8 bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 overflow-hidden shadow-[0_8px_30px_rgba(18,19,23,0.03)] hover:shadow-[0_18px_44px_rgba(18,19,23,0.08)] will-change-transform"
    >
      {/* Cursor-tracking Antigravity radial spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(49, 134, 255, 0.09), transparent 70%)`,
        }}
      />

      <div
        className="w-8 h-1 rounded-full mb-5 transition-all duration-300 group-hover:w-12"
        style={{ backgroundColor: stat.accent }}
      />
      <div className="relative text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-[#121317] mb-3">
        <RollingNumber value={stat.value} />
      </div>
      <div className="relative text-base font-bold text-[#121317] mb-1">
        {stat.label}
      </div>
      <div className="relative text-xs font-mono text-[#6A6A71]">
        {stat.detail}
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-[#F8F9FC] border-y border-[#212226]/[0.07] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
            <span>STUDIO BENCHMARKS</span>
          </div>
          <SplitTextReveal
            as="h2"
            text="Crafted for Speed, Clarity, and Scale"
            accentFromWordIndex={4}
            accentClassName="text-[#3186FF]"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121317]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <TiltStatCard key={stat.label} stat={stat} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
