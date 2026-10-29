"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import { renderServiceToolIcon, hasServiceToolIcon } from "./ServiceToolIcons";
import { MOTION_EASE } from "@/lib/motionTokens";

const techEcosystem = [
  { name: "Next.js 14", badge: "App Router" },
  { name: "TypeScript", badge: "Strict" },
  { name: "Tailwind CSS", badge: "Design Tokens" },
  { name: "Three.js", badge: "WebGL 3D" },
  { name: "GSAP", badge: "ScrollTrigger" },
  { name: "Framer Motion", badge: "Spring UI" },
  { name: "Node.js", badge: "Express API" },
  { name: "OpenAI SDK", badge: "Tool-Use" },
  { name: "LangGraph", badge: "Agentic" },
  { name: "Figma", badge: "Design Systems" },
];

export default function LogoStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let visible = false;
    const update = () => setPaused(!visible || document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(section);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Core Technology Stack"
      className="relative py-20 sm:py-24 border-y border-[#212226]/[0.07] bg-[#F8F9FC] overflow-hidden"
    >
      {/* Antimatter-inspired `clientsLightCurve` Horizon Arc in Antigravity Electric Blue + Obsidian */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-x-0 -bottom-56 flex justify-center"
      >
        <div
          className="w-[130vw] max-w-[1680px] h-[290px] rounded-[100%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(49, 134, 255, 0.16) 0%, rgba(116, 155, 255, 0.08) 42%, transparent 72%)",
            boxShadow:
              "inset 0 1.5px 0 rgba(49, 134, 255, 0.34), 0 -18px 54px rgba(49, 134, 255, 0.12)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: MOTION_EASE.cinematicOut }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-11 text-center"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.08] text-[11px] font-mono uppercase tracking-[0.2em] text-[#121317] mb-4 shadow-[0_2px_8px_rgba(18,19,23,0.03)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
          Production Stack &amp; Ecosystem
        </span>
        <SplitTextReveal
          as="h2"
          text="Engineered with Modern Standards"
          accentFromWordIndex={2}
          accentClassName="text-[#3186FF]"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121317]"
        />
        <p className="mt-2.5 text-sm text-[#45474D] max-w-xl mx-auto">
          Powering fast, reliable Web Platforms, Design Systems, and Autonomous
          AI Agents with battle-tested open standards.
        </p>
      </motion.div>

      {/* Infinite Marquee with True Alpha Mask Edge Fade */}
      <div
        className="technology-ribbon relative z-10 flex overflow-x-hidden group"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        }}
      >
        <div className="technology-track flex w-max shrink-0 animate-marquee py-2 items-center" style={{ animationPlayState: paused ? "paused" : undefined }}>
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className="technology-group flex w-max shrink-0 items-center gap-4 pr-4"
            >
              {techEcosystem.map((item) => (
                <div
                  key={item.name}
                  title={item.name}
                  aria-label={item.name}
                  role="img"
                  className={`technology-pill inline-flex shrink-0 items-center gap-3 whitespace-nowrap h-12 sm:h-14 px-4 sm:px-5 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/45 shadow-[0_4px_16px_rgba(18,19,23,0.04)] hover:shadow-[0_10px_26px_rgba(49,134,255,0.12)] hover:-translate-y-0.5 transition-all duration-300 select-none ${hasServiceToolIcon(item.name) ? "" : "is-text-only"}`}
                >
                  {hasServiceToolIcon(item.name) && <span aria-hidden="true" className="w-5 h-5 shrink-0">{renderServiceToolIcon(item.name)}</span>}
                  <span className="technology-tool-name text-sm sm:text-[15px] font-medium tracking-tight text-[#121317]">
                    {item.name}
                  </span>
                  <span className="hidden sm:inline-flex rounded-full bg-[#EFF2F7] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#45474D]">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
