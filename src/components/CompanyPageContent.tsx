"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  MapPin,
  Sparkles,
  Layers,
  Code2,
  Bot,
  ArrowUpRight,
  Globe2,
} from "lucide-react";

const studioHubs = [
  {
    city: "Kuopio",
    country: "Finland",
    coords: "62.89° N, 27.68° E",
    role: "Product Strategy, Client Discovery & European Hub",
    focus: "Nordic clarity, UX architecture, and transparent project scoping.",
    accent: "#3186FF",
  },
  {
    city: "Lahore",
    country: "Pakistan",
    coords: "31.52° N, 74.36° E",
    role: "Engineering, Web Design & AI Systems Studio",
    focus:
      "Full-stack Next.js/Node.js engineering, interactive motion, and AI agent development.",
    accent: "#00B95C",
  },
];

const coreBeliefs = [
  {
    num: "01",
    title: "Craft Over Complexity",
    description:
      "We focus strictly on 4 disciplines—UI/UX Design, Web Development, Web Designing, and AI Agents—so every interface and codebase ships with obsessive care.",
    icon: <Layers className="w-5 h-5 text-[#3186FF]" />,
  },
  {
    num: "02",
    title: "Direct Maker Collaboration",
    description:
      "You collaborate directly with the designers and engineers building your product—no account-manager telephone game or hidden handoffs.",
    icon: <Code2 className="w-5 h-5 text-[#121317]" />,
  },
  {
    num: "03",
    title: "Motion With Purpose",
    description:
      "Every GPU particle transition, spring curve, and kinetic reveal guides attention and clarifies state while honoring reduced-motion accessibility.",
    icon: <Sparkles className="w-5 h-5 text-[#FBBC04]" />,
  },
  {
    num: "04",
    title: "Practical Autonomous AI",
    description:
      "We deploy grounded AI agents with deterministic tool schemas, audit logs, and human-in-the-loop controls that solve real operational bottlenecks.",
    icon: <Bot className="w-5 h-5 text-[#00B95C]" />,
  },
];

export default function CompanyPageContent() {
  return (
    <section className="pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Antimatter-inspired Split Headline */}
        <div className="max-w-4xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
            <span>ABOUT AXIOM STUDIO</span>
          </motion.div>

          <SplitTextReveal
            as="h1"
            text="Companies create products. Axiom Creates Impact."
            accentFromWordIndex={3}
            accentClassName="text-[#3186FF] italic"
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#121317] mb-6 leading-[1.08]"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.25,
              ease: MOTION_EASE.cinematicOut,
            }}
            className="text-lg text-[#45474D] leading-relaxed max-w-2xl"
          >
            Axiom Studio is a focused design and engineering studio operating
            across Kuopio, Finland and Lahore, Pakistan. We partner with
            founders and growing teams to build modern web platforms, refined
            user interfaces, and practical AI agents.
          </motion.p>
        </div>

        {/* Dotted Global Corridor Map + Pulsing Studio Beacons (`Kuopio` <-> `Lahore`) */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: MOTION_EASE.cinematicOut }}
          className="relative rounded-[32px] p-7 sm:p-10 mb-14 bg-[#121317] text-white border border-[#212226]/[0.12] overflow-hidden shadow-[0_24px_64px_rgba(18,19,23,0.16)]"
        >
          {/* Halftone World Grid Matrix */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(183, 191, 217, 0.42) 1.25px, transparent 1.25px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[260px] rounded-full blur-3xl opacity-35"
            style={{
              background:
                "radial-gradient(circle, rgba(49, 134, 255, 0.55) 0%, transparent 72%)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#749BFF] mb-3">
                <Globe2 className="w-4 h-4 text-[#3186FF]" />
                <span>TWO CONNECTED STUDIO HUBS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                Nordic Strategy Meets High-Velocity Engineering
              </h2>
              <p className="text-sm text-[#B2BBC5] leading-relaxed">
                Synchronized daily across European and South Asian timezones for
                rapid design-to-code turnarounds and responsive communication.
              </p>
            </div>

            {/* Animated SVG Studio Corridor (`Kuopio` <-> `Lahore`) */}
            <div className="relative w-full lg:w-[480px] h-[190px] rounded-2xl bg-white/[0.04] border border-white/10 p-4 flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 440 160"
                className="w-full h-full overflow-visible"
                aria-label="Global Studio Corridor connecting Kuopio, Finland and Lahore, Pakistan"
              >
                <defs>
                  <linearGradient
                    id="corridorArcGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3186FF" />
                    <stop offset="50%" stopColor="#749BFF" />
                    <stop offset="100%" stopColor="#00B95C" />
                  </linearGradient>
                </defs>

                {/* Subtle Dashed Guide Arc */}
                <path
                  d="M 86 48 Q 225 -6 352 108"
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                />

                {/* Animated Signal Arc */}
                <motion.path
                  d="M 86 48 Q 225 -6 352 108"
                  fill="none"
                  stroke="url(#corridorArcGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.4 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.5,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                />

                {/* Kuopio Beacon */}
                <g transform="translate(86, 48)">
                  <circle
                    r="16"
                    fill="rgba(49, 134, 255, 0.22)"
                    className="animate-ping"
                  />
                  <circle r="6" fill="#3186FF" />
                  <circle r="2.5" fill="#FFFFFF" />
                  <text
                    x="0"
                    y="24"
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold"
                  >
                    Kuopio, FI
                  </text>
                  <text
                    x="0"
                    y="37"
                    textAnchor="middle"
                    className="fill-[#B2BBC5] text-[9px] font-mono"
                  >
                    62.89°N • EET
                  </text>
                </g>

                {/* Lahore Beacon */}
                <g transform="translate(352, 108)">
                  <circle
                    r="16"
                    fill="rgba(0, 185, 92, 0.22)"
                    className="animate-ping"
                  />
                  <circle r="6" fill="#00B95C" />
                  <circle r="2.5" fill="#FFFFFF" />
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold"
                  >
                    Lahore, PK
                  </text>
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    className="fill-[#B2BBC5] text-[9px] font-mono"
                  >
                    31.52°N • PKT
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Studio Hubs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {studioHubs.map((hub, idx) => (
            <motion.div
              key={hub.city}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.65,
                delay: idx * 0.1,
                ease: MOTION_EASE.cinematicOut,
              }}
              className="rounded-3xl p-8 bg-[#F8F9FC] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 transition-all"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#212226]/[0.08] flex items-center justify-center shadow-sm">
                    <MapPin
                      className="w-5 h-5"
                      style={{ color: hub.accent }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#121317]">
                      {hub.city}, {hub.country}
                    </h2>
                    <p className="text-xs font-mono text-[#3186FF]">
                      {hub.role}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#6A6A71] hidden sm:inline">
                  {hub.coords}
                </span>
              </div>
              <p className="text-sm text-[#45474D] leading-relaxed">
                {hub.focus}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Antimatter-inspired Numbered `01`–`04` CORE BELIEFS Section */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#3186FF] font-semibold">
                CORE BELIEFS (01 — 04)
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#121317]">
                How We Approach Every Build
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreBeliefs.map((belief, idx) => (
              <motion.div
                key={belief.num}
                initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.68,
                  delay: idx * 0.08,
                  ease: MOTION_EASE.cinematicOut,
                }}
                className="group rounded-3xl p-8 bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 shadow-[0_8px_30px_rgba(18,19,23,0.03)] hover:shadow-[0_18px_44px_rgba(18,19,23,0.08)] transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {belief.icon}
                  </div>
                  <span className="text-2xl font-mono font-bold text-[#121317]/20 group-hover:text-[#3186FF] transition-colors tabular-nums">
                    {belief.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#121317] mb-2.5">
                  {belief.title}
                </h3>
                <p className="text-sm text-[#45474D] leading-relaxed">
                  {belief.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: MOTION_EASE.cinematicOut }}
          className="rounded-3xl p-8 sm:p-12 bg-[#121317] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(18,19,23,0.16)]"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Ready to build something thoughtful?
            </h2>
            <p className="text-sm text-[#B2BBC5] max-w-xl">
              Tell us about your web platform, interface design, or AI agent
              idea and we&apos;ll share a clear plan.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#121317] text-sm font-semibold hover:bg-[#EFF2F7] transition-all shrink-0"
          >
            <span>Start a Conversation</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
