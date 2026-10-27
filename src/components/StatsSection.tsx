"use client";

import React from "react";
import { motion } from "framer-motion";
import RollingNumber from "./RollingNumber";
import { MOTION_EASE } from "@/lib/motionTokens";
import { Gauge, Sparkles, Layers, Clock } from "lucide-react";

const statItems = [
  {
    icon: Gauge,
    iconColor: "text-brand-primary",
    label: "Performance Target",
    value: 99,
    decimals: 0,
    duration: 1800,
    suffix: "+",
    staticValue: null as string | null,
    desc: "Engineered for sub-second Core Web Vitals, SEO visibility, and smooth 60fps motion.",
  },
  {
    icon: Sparkles,
    iconColor: "text-emerald-400",
    label: "Custom Craft",
    value: 100,
    decimals: 0,
    duration: 2000,
    suffix: "%",
    staticValue: null as string | null,
    desc: "Zero bloated page-builder themes—every website, UI system, and AI agent is custom built.",
  },
  {
    icon: Layers,
    iconColor: "text-brand-light",
    label: "Core Services",
    value: 4,
    decimals: 0,
    duration: 1500,
    suffix: "",
    staticValue: null as string | null,
    desc: "Dedicated mastery across Web Development, Web Designing, UI/UX Design, and AI Agents.",
  },
  {
    icon: Clock,
    iconColor: "text-amber-400",
    label: "Nordic & PK Sync",
    value: 0,
    decimals: 0,
    duration: 1800,
    suffix: "",
    staticValue: "24/7",
    desc: "Direct founder & engineer communication across Kuopio, Finland and Lahore, Pakistan.",
  },
];

export default function StatsSection() {
  return (
    <section className="relative py-16 sm:py-20 border-y border-white/[0.08] bg-black/40 backdrop-blur-sm overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.65,
                  delay: idx * 0.08,
                  ease: MOTION_EASE.cinematicOut,
                }}
                className="relative flex flex-col pt-5 group"
              >
                {/* Animated Top Hairline Sweep */}
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.85,
                    delay: 0.1 + idx * 0.09,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                  style={{ transformOrigin: "0% 50%" }}
                  className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-brand-primary/60 via-white/15 to-transparent"
                />

                <div className="flex items-center gap-2 mb-2.5 text-zinc-400">
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  <span className="text-xs uppercase font-mono tracking-wider">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-baseline text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                  {item.staticValue ? (
                    <span className="font-mono tabular-nums">
                      {item.staticValue}
                    </span>
                  ) : (
                    <RollingNumber
                      value={item.value}
                      decimals={item.decimals}
                      duration={item.duration}
                      suffix={item.suffix}
                    />
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
