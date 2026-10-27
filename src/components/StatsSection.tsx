"use client";

import React from "react";
import { motion } from "framer-motion";
import RollingNumber from "./RollingNumber";
import { MOTION_EASE } from "@/lib/motionTokens";
import { Layers, Gauge, Smartphone, Sparkles } from "lucide-react";

const metrics = [
  {
    id: "disciplines",
    value: 4,
    suffix: "",
    decimals: 0,
    label: "Core Studio Disciplines",
    detail: "Web Dev, Web Design, UI/UX Design, and custom AI Agents.",
    icon: <Layers className="w-5 h-5 text-[#3186FF]" />,
    chipBg: "bg-[#3186FF]/10 border-[#3186FF]/20",
  },
  {
    id: "lighthouse",
    value: 99,
    suffix: "+",
    decimals: 0,
    label: "Lighthouse Target Score",
    detail: "Engineered for Core Web Vitals, accessibility, and fast loads.",
    icon: <Gauge className="w-5 h-5 text-[#00B95C]" />,
    chipBg: "bg-[#00B95C]/10 border-[#00B95C]/20",
  },
  {
    id: "responsive",
    value: 100,
    suffix: "%",
    decimals: 0,
    label: "Responsive Breakpoints",
    detail: "Pixel-accurate layouts across desktop, tablet, and mobile screens.",
    icon: <Smartphone className="w-5 h-5 text-[#FC413D]" />,
    chipBg: "bg-[#FC413D]/10 border-[#FC413D]/20",
  },
  {
    id: "turnaround",
    value: 24,
    suffix: "h",
    decimals: 0,
    label: "Proposal Response Time",
    detail: "Clear scope, timeline, and architecture breakdown within 24 hours.",
    icon: <Sparkles className="w-5 h-5 text-[#FBBC04]" />,
    chipBg: "bg-[#FBBC04]/15 border-[#FBBC04]/30",
  },
];

export default function StatsSection() {
  return (
    <section
      aria-label="Axiom Studio Standards"
      className="relative py-20 sm:py-24 bg-[#FFFFFF] border-b border-[#212226]/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#212226]/[0.08]">
          {metrics.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.65,
                delay: idx * 0.08,
                ease: MOTION_EASE.cinematicOut,
              }}
              className="lg:px-8 first:lg:pl-0 last:lg:pr-0 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#6A6A71]">
                    0{idx + 1} / STANDARD
                  </span>
                  <div
                    className={`p-2 rounded-xl border transition-transform duration-300 group-hover:scale-105 ${m.chipBg}`}
                  >
                    {m.icon}
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#121317] mb-2">
                  <RollingNumber
                    value={m.value}
                    prefix=""
                    suffix={m.suffix}
                    decimals={m.decimals}
                  />
                </div>
                <h3 className="text-base font-semibold text-[#121317] mb-1.5">
                  {m.label}
                </h3>
              </div>
              <p className="text-sm text-[#45474D] leading-relaxed">
                {m.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
