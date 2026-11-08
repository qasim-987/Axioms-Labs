"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clientsData, ClientCaseStudy } from "@/data/clients";
import SplitTextReveal from "./SplitTextReveal";
import ViewWorkCursor from "./ViewWorkCursor";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * 100%-Width Studio Concept Visual Preview for Card 01 (Dark Obsidian + Electric Blue) & Card 02 (Cool Light Surface iMac)
 * Strictly preserves edge-to-edge 100% card width and high-contrast imagery so ViewWorkCursor's
 * mix-blend-mode: difference inverts sharply over both cards and never leaks outside the image.
 */
function ProjectShowcaseVisual({
  study,
  variant,
}: {
  study: ClientCaseStudy;
  variant: "dark" | "light";
}) {
  if (variant === "dark") {
    return (
      <div data-showcase="clean" className="flex h-full w-full select-none flex-col bg-[#121317] p-6 sm:p-7 lg:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#B2BBC5]">
            {study.category}
          </span>
          <span className="text-[10px] text-[#B2BBC5]">{study.liveUrl ? "Live project" : "Studio concept"}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <h3 className="max-w-md text-xl font-semibold leading-snug tracking-tight text-white lg:text-2xl">
            {study.title}
          </h3>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#B2BBC5] lg:text-sm">
            {study.tagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {study.architectureHighlights.slice(0, 2).map((item) => (
              <span key={item.title} className="text-[11px] text-[#E6EAF0]">
                {item.title}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <span className="min-w-0 break-words text-[11px] text-[#B2BBC5]">
            {study.liveUrl ? study.liveUrl.replace(/^https?:\/\//, "") : "Axiom Studio"}
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-[11px] font-medium text-white">
            View project <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    );
  }

  // Light Studio Display Canvas (Antigravity Surface Container High #EFF2F7 -> #E1E6EC)
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#F8F9FC] via-[#EFF2F7] to-[#E1E6EC] select-none flex flex-col justify-between p-5 sm:p-7 lg:p-8">
      {/* Soft Studio Key-Light & Shadow Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 w-[75%] h-[70%] rounded-full blur-3xl opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(49,134,255,0.14) 60%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#CDD4DC]/55 to-transparent"
      />

      {/* Top Studio Metadata Strip */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#45474D]">
        <span className="uppercase tracking-wider font-semibold text-[#121317]">
          {study.client} • Web Design Concept
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-white/85 border border-[#212226]/10 text-[#121317] font-medium shadow-sm">
          {study.category}
        </span>
      </div>

      {/* Centered Wide Studio Monitor Mockup */}
      <div className="relative z-10 my-auto pt-3 flex flex-col items-center w-full">
        {/* Monitor Bezel */}
        <div className="w-full rounded-2xl bg-[#121317] p-2 sm:p-2.5 shadow-[0_24px_56px_rgba(18,19,23,0.22)] border border-[#212226]/20">
          {/* Screen Content */}
          <div className="w-full rounded-xl bg-white overflow-hidden border border-[#E6EAF0]">
            {/* Minimalist Website Topbar inside Screen */}
            <div className="px-4 py-2.5 bg-[#F8F9FC] border-b border-[#E6EAF0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#121317] flex items-center justify-center text-[10px] font-bold text-white">
                  A
                </div>
                <span className="text-xs font-bold text-[#121317] tracking-tight">
                  {study.client}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#45474D] font-medium">
                <span>Architecture</span>
                <span>Motion</span>
                <span>Design System</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#121317] text-[10px] font-semibold text-white">
                Live Preview
              </span>
            </div>

            {/* Screen Body Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-12 gap-4 items-center bg-gradient-to-br from-white via-[#F8F9FC] to-[#EFF2F7]">
              <div className="col-span-7 space-y-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3186FF]/10 text-[#3186FF] text-[10px] font-semibold">
                  <Sparkles className="w-3 h-3" /> Editorial Web Design
                </span>
                <div className="text-sm sm:text-base font-extrabold text-[#121317] leading-snug">
                  {study.title}
                </div>
                <p className="text-[11px] text-[#45474D] line-clamp-2 leading-relaxed">
                  {study.challenge}
                </p>
              </div>

              <div className="col-span-5 rounded-xl bg-[#121317] text-white p-3.5 shadow-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF]">
                  BENCHMARK
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono mt-0.5 text-white">
                  {study.impactMetric}
                </div>
                <div className="text-[10px] text-[#B2BBC5] mt-0.5 leading-tight">
                  {study.impactLabel}
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-[#4ADE80] font-mono">
                  <CheckCircle2 className="w-3 h-3" /> 60fps Motion
                </div>
              </div>
            </div>
          </div>

          {/* Monitor Chin */}
          <div className="h-3 sm:h-3.5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Brushed Aluminum Pedestal Stand */}
        <div className="w-16 sm:w-20 h-4 sm:h-5 bg-gradient-to-b from-[#B2BBC5] to-[#CDD4DC] shadow-inner" />
        <div className="w-28 sm:w-36 h-1.5 rounded-full bg-gradient-to-r from-[#B2BBC5] via-[#F8F9FC] to-[#B2BBC5] shadow-md" />
      </div>

      {/* Bottom Caption */}
      <div className="relative z-10 flex items-center justify-between pt-2 text-[11px] font-mono text-[#45474D]">
        <span>Axioms Lab • Design Showcase</span>
        <span className="font-semibold text-[#121317] flex items-center gap-1">
          Explore Concept <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  useEffect(() => {
    const timer=setTimeout(()=>ScrollTrigger.refresh(),220);
    return()=>clearTimeout(timer);
  }, []);
  const featuredShowcase = clientsData.slice(0, 2);

  const sectionRef = useRef<HTMLElement>(null);
  const cardParallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardParallaxRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { yPercent: -3.5, scale: 1.06 },
          {
            yPercent: 3.5,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative py-24 sm:py-32 bg-[#FFFFFF] border-t border-[#212226]/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
              <span>LAB CONCEPT BUILDS</span>
            </div>
            <SplitTextReveal
              as="h2"
              text="Selected Concept Builds"
              accentFromWordIndex={1}
              accentClassName="text-[#3186FF]"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121317]"
            />
          </div>
          <p className="text-[#45474D] max-w-md text-sm sm:text-base leading-relaxed">
            Proven engineering standards, measurable craft—explore the Lab
            Concept Builds we&apos;ve architected across Web, UI/UX, and AI.
          </p>
        </div>

        {/* =====================================================================
            FEATURED 50/50 LAB SHOWCASE (01 & 02)
            - Image fills 100% of each card's width (`w-full` edge-to-edge)
            - `ViewWorkCursor` is mounted INSIDE the `overflow-hidden` image container
              so the "View Work" cursor NEVER works or appears outside the image!
           ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featuredShowcase.map((study, idx) => {
            const indexLabel = String(idx + 1).padStart(2, "0");
            const categoryTags =
              idx === 0
                ? "Web Development  |  UI/UX"
                : "UI/UX Web Design  |  Motion";

            return (
              <motion.div
                key={study.slug}
                initial={{ opacity: 0, y: 32}}
                whileInView={{ opacity: 1, y: 0}}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.78,
                  delay: idx * 0.12,
                  ease: MOTION_EASE.cinematicOut,
                }}
                className="flex flex-col"
              >
                {/* 100%-Width Edge-to-Edge Image Card with Strictly Clipped "View Work" Cursor */}
                <Link
                  href={`/work/${study.slug}`}
                  aria-label={`View Concept Build: ${study.client} — ${study.title}`}
                  className={`group relative block w-full ${idx === 0 ? "aspect-[4/5] xl:aspect-[16/10]" : "aspect-[16/10]"} rounded-[24px] overflow-hidden border border-[#212226]/[0.1] hover:border-[#3186FF]/40 shadow-[0_12px_36px_rgba(18,19,23,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] cursor-pointer`}
                >
                  {/* 100%-Width Scroll-Parallax Visual Canvas */}
                  <div
                    ref={(el) => {
                      cardParallaxRefs.current[idx] = el;
                    }}
                    className="w-full h-full will-change-transform"
                  >
                    <div className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
                      <ProjectShowcaseVisual
                        study={study}
                        variant={idx === 0 ? "dark" : "light"}
                      />
                    </div>
                  </div>

                  {/* Strictly Image-Clipped "View Work" Difference-Blend Cursor */}
                  <ViewWorkCursor label="View Work" />
                </Link>

                {/* Minimal Numbered Caption Row Below Image (01 / 02 + Category Tags) */}
                <div className="mt-5 px-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span className="text-3xl sm:text-4xl font-light font-sans tracking-tight text-[#121317] tabular-nums select-none">
                      {indexLabel}
                    </span>
                    <Link
                      href={`/work/${study.slug}`}
                      className="text-base sm:text-lg font-medium text-[#121317] hover:text-[#3186FF] transition-colors truncate"
                    >
                      {study.client}
                    </Link>
                  </div>

                  <span className="text-xs sm:text-sm text-[#45474D] font-normal whitespace-nowrap shrink-0">
                    {categoryTags}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
