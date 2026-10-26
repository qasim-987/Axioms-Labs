"use client";

import React from "react";
import { motion } from "framer-motion";
import RollingNumber from "./RollingNumber";
import { MOTION_EASE } from "@/lib/motionTokens";
import { Award, CheckCircle2, TrendingUp, Clock } from "lucide-react";

const statItems = [
  {
    icon: Award,
    iconColor: "text-brand-primary",
    label: "Production Deployments",
    value: 74,
    decimals: 0,
    duration: 1800,
    suffix: "+",
    staticValue: null as string | null,
    desc: "High-concurrency systems delivered across enterprise AI, fintech & healthcare.",
  },
  {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    label: "Client Satisfaction",
    value: 99.4,
    decimals: 1,
    duration: 2000,
    suffix: "%",
    staticValue: null as string | null,
    desc: "Measured post-deployment partner retention and NPS benchmark over 36 months.",
  },
  {
    icon: TrendingUp,
    iconColor: "text-brand-light",
    label: "Agent Accuracy",
    value: 94.8,
    decimals: 1,
    duration: 2200,
    suffix: "%",
    staticValue: null as string | null,
    desc: "Autonomous tool execution fidelity validated through continuous automated eval suites.",
  },
  {
    icon: Clock,
    iconColor: "text-amber-400",
    label: "Telemetry & Uptime",
    value: 0,
    decimals: 0,
    duration: 1800,
    suffix: "",
    staticValue: "24/7",
    desc: "Autonomous self-healing infrastructure monitoring and proactive telemetry guards.",
  },
];

export default function StatsSection() {
  return (
    <section className="relative py-16 sm:py-20 border-y border-white/[0.08] bg-black/40 backdrop-blur-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
