"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { clientsData } from "@/data/clients";
import ViewWorkCursor from "./ViewWorkCursor";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motionTokens";
import { ArrowUpRight, Sparkles } from "lucide-react";

const CATEGORIES = [
  "All Concepts",
  "Web Development",
  "Web Designing",
  "UI/UX Design",
  "AI Agents",
] as const;

export default function WorkPageContent() {
  const [activeCategory, setActiveCategory] = useState<string>("All Concepts");

  const filteredStudies = useMemo(() => {
    if (activeCategory === "All Concepts") return clientsData;
    return clientsData.filter((study) => study.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Antimatter-inspired Character-Split `W O R K` Hero Header */}
        <div className="max-w-4xl mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
            <span>STUDIO CONCEPT SHOWCASE</span>
          </motion.div>

          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 mb-6">
            <h1
              aria-label="WORK"
              className="text-6xl sm:text-8xl font-extrabold tracking-[-0.04em] text-[#121317] leading-none"
              style={{ perspective: "900px" }}
            >
              {"WORK".split("").map((ch, idx) => (
                <motion.span
                  key={idx}
                  aria-hidden="true"
                  initial={{
                    opacity: 0,
                    y: 36,
                    rotateX: -42,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 0.72,
                    delay: 0.06 + idx * 0.055,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                  className="inline-block origin-bottom will-change-transform"
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.34,
                ease: MOTION_EASE.cinematicOut,
              }}
              className="text-xl sm:text-3xl font-bold italic text-[#3186FF]"
            >
              Concept Builds (01 — 04)
            </motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.28,
              ease: MOTION_EASE.cinematicOut,
            }}
            className="text-lg text-[#45474D] leading-relaxed max-w-2xl"
          >
            Explore our internally engineered Studio Concept Builds—crafted to
            demonstrate how Axiom Studio approaches Web Development, Web
            Designing, UI/UX Design Systems, and Autonomous AI Agents.
          </motion.p>
        </div>

        {/* Spring-Animated Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] ${
                  active
                    ? "text-white"
                    : "text-[#45474D] hover:text-[#121317] bg-[#F8F9FC] border border-[#212226]/[0.08]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="workCategoryPill"
                    transition={MOTION_SPRING.snappy}
                    className="absolute inset-0 rounded-full bg-[#121317] shadow-[0_6px_18px_rgba(18,19,23,0.16)]"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Concept Builds Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredStudies.map((study, idx) => {
              const globalIdx = clientsData.findIndex(
                (c) => c.slug === study.slug
              );
              const indexLabel = String(
                (globalIdx >= 0 ? globalIdx : idx) + 1
              ).padStart(2, "0");
              const isDarkPreview = globalIdx % 2 === 0;

              return (
                <motion.div
                  layout
                  key={study.slug}
                  initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.62,
                    delay: idx * 0.08,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                  className="flex flex-col"
                >
                  {/* Visual Preview Frame with Strictly Clipped `ViewWorkCursor` */}
                  <Link
                    href={`/work/${study.slug}`}
                    className={`group relative block w-full rounded-[28px] overflow-hidden border border-[#212226]/[0.1] hover:border-[#3186FF]/40 p-7 sm:p-9 transition-all shadow-[0_14px_38px_rgba(18,19,23,0.06)] ${
                      isDarkPreview
                        ? "bg-[#121317] text-white"
                        : "bg-[#F8F9FC] text-[#121317]"
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-24 -right-20 w-64 h-64 rounded-full blur-3xl opacity-35 transition-transform duration-700 group-hover:scale-110"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(49,134,255,0.5) 0%, rgba(116,155,255,0.18) 55%, transparent 75%)",
                      }}
                    />

                    <div className="relative z-10 flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                            isDarkPreview
                              ? "bg-white/[0.08] border-white/10 text-[#749BFF]"
                              : "bg-[#FFFFFF] border-[#212226]/[0.08] text-[#3186FF]"
                          }`}
                        >
                          {indexLabel}
                        </span>
                        <span
                          className={`text-xs font-mono uppercase tracking-wider ${
                            isDarkPreview ? "text-[#B2BBC5]" : "text-[#6A6A71]"
                          }`}
                        >
                          {study.category}
                        </span>
                      </div>
                      <ArrowUpRight
                        className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                          isDarkPreview
                            ? "text-[#B2BBC5] group-hover:text-white"
                            : "text-[#6A6A71] group-hover:text-[#3186FF]"
                        }`}
                      />
                    </div>

                    <h2
                      className={`relative z-10 text-2xl font-bold mb-2 transition-colors ${
                        isDarkPreview
                          ? "text-white group-hover:text-[#749BFF]"
                          : "text-[#121317] group-hover:text-[#3186FF]"
                      }`}
                    >
                      {study.client}
                    </h2>
                    <p
                      className={`relative z-10 text-sm font-medium mb-4 ${
                        isDarkPreview ? "text-[#E6EAF0]" : "text-[#2F3034]"
                      }`}
                    >
                      {study.title}
                    </p>
                    <p
                      className={`relative z-10 text-sm leading-relaxed mb-7 ${
                        isDarkPreview ? "text-[#B2BBC5]" : "text-[#45474D]"
                      }`}
                    >
                      {study.summary}
                    </p>

                    <div
                      className={`relative z-10 pt-5 border-t flex items-center justify-between gap-4 ${
                        isDarkPreview
                          ? "border-white/10"
                          : "border-[#212226]/[0.08]"
                      }`}
                    >
                      <div>
                        <div
                          className={`text-2xl font-extrabold font-mono ${
                            isDarkPreview ? "text-white" : "text-[#121317]"
                          }`}
                        >
                          {study.impactMetric}
                        </div>
                        <div
                          className={`text-[11px] font-mono ${
                            isDarkPreview ? "text-[#B2BBC5]" : "text-[#6A6A71]"
                          }`}
                        >
                          {study.impactLabel}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-1.5 max-w-[230px]">
                        {study.techStack.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                              isDarkPreview
                                ? "bg-white/[0.06] border-white/10 text-[#E6EAF0]"
                                : "bg-[#FFFFFF] border-[#212226]/[0.08] text-[#45474D]"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strictly Card-Clipped Difference-Blend Cursor */}
                    <ViewWorkCursor label="View Work" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
