"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import SpotlightCard from "./SpotlightCard";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import { Compass, Layers, Code2, Rocket, CheckCircle2 } from "lucide-react";

const steps = [
  {
    phase: "PHASE 01",
    title: "Discovery & Scope",
    duration: "Days 1 — 3",
    description:
      "We clarify your goals, target audience, user journeys, and technical requirements—delivering a clear roadmap, sitemap, and milestone plan before writing code.",
    deliverable: "Scope Document + Sitemap & Architecture Plan",
    icon: <Compass className="w-5 h-5 text-[#3186FF]" />,
    chipBg: "bg-[#3186FF]/10 border-[#3186FF]/20",
  },
  {
    phase: "PHASE 02",
    title: "UI/UX & Web Design",
    duration: "Week 1 — 2",
    description:
      "We craft interactive wireframes, visual direction, responsive layouts, and reusable Figma component tokens so you can experience the product before build.",
    deliverable: "Interactive Figma Prototype + Design System",
    icon: <Layers className="w-5 h-5 text-[#FC413D]" />,
    chipBg: "bg-[#FC413D]/10 border-[#FC413D]/20",
  },
  {
    phase: "PHASE 03",
    title: "Engineering & AI Build",
    duration: "Week 2 — 5",
    description:
      "We build your frontend, backend APIs, CMS or database, motion interactions, and custom AI agents in clean TypeScript with weekly staging previews.",
    deliverable: "Live Staging Link + Clean Git Repository",
    icon: <Code2 className="w-5 h-5 text-[#FBBC04]" />,
    chipBg: "bg-[#FBBC04]/15 border-[#FBBC04]/30",
  },
  {
    phase: "PHASE 04",
    title: "QA, Launch & Handover",
    duration: "Final Week",
    description:
      "We test across devices, optimize Core Web Vitals and SEO metadata, deploy to Vercel or cloud production, and hand over full code and documentation.",
    deliverable: "Production Deployment + Full Ownership Handover",
    icon: <Rocket className="w-5 h-5 text-[#00B95C]" />,
    chipBg: "bg-[#00B95C]/10 border-[#00B95C]/20",
  },
];

export default function MethodologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-24 sm:py-32 bg-[#FFFFFF] border-t border-[#212226]/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
            <span>HOW WE WORK</span>
          </div>
          <SplitTextReveal
            as="h2"
            text="Transparent Process. Predictable Delivery."
            accentFromWordIndex={2}
            accentClassName="text-[#3186FF]"
            className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121317] mb-4 justify-center"
          />
          <p className="text-[#45474D] text-sm sm:text-base leading-relaxed">
            No black-box agency handoffs. You work directly with our designers
            and engineers from initial Figma wireframes to live deployment.
          </p>
        </div>

        {/* Scroll-Scrubbed Antigravity Multicolor Progress Bus */}
        <div className="hidden lg:block relative mb-8 px-12" aria-hidden="true">
          <div className="h-[2px] w-full bg-[#E6EAF0] rounded-full overflow-hidden">
            <motion.div
              style={{
                scaleX: lineScale,
                transformOrigin: "0% 50%",
                background:
                  "linear-gradient(90deg, #3186FF 0%, #FC413D 45%, #FBBC04 75%, #00B95C 100%)",
              }}
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.65,
                delay: idx * 0.1,
                ease: MOTION_EASE.cinematicOut,
              }}
            >
              <SpotlightCard className="relative h-full rounded-2xl p-6 sm:p-7 bg-[#F8F9FC] hover:bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 shadow-sm hover:shadow-[0_16px_40px_rgba(18,19,23,0.07)] transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-[#3186FF] px-2.5 py-1 rounded-md bg-[#3186FF]/[0.08] border border-[#3186FF]/20">
                      {step.phase}
                    </span>
                    <span className="text-xs font-mono text-[#6A6A71]">
                      {step.duration}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border w-fit mb-5 group-hover:scale-105 transition-transform duration-300 ${step.chipBg}`}
                  >
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-bold text-[#121317] mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#45474D] leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#212226]/[0.08] flex items-start gap-2 text-xs text-[#121317]">
                  <CheckCircle2 className="w-4 h-4 text-[#00B95C] shrink-0 mt-0.5" />
                  <span className="font-mono">{step.deliverable}</span>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
