"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { servicesData } from "@/data/services";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  Cpu,
  Bot,
  Globe,
  Layout,
  Cloud,
  Shield,
  ArrowUpRight,
  Check,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-5 h-5 text-brand-primary" />,
  Globe: <Globe className="w-5 h-5 text-brand-primary" />,
  Cpu: <Cpu className="w-5 h-5 text-brand-primary" />,
  Bot: <Bot className="w-5 h-5 text-brand-primary" />,
  Shield: <Shield className="w-5 h-5 text-brand-primary" />,
  Cloud: <Cloud className="w-5 h-5 text-brand-primary" />,
};

export default function ServicesGrid() {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [mouseCoords, setMouseCoords] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const handleCardMouseMove = (
    id: string,
    e: React.MouseEvent<HTMLElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords((prev) => ({
      ...prev,
      [id]: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    }));
  };

  return (
    <section id="services" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-4">
            <span>OUR SERVICES • 01 — 06</span>
          </div>
          <SplitTextReveal
            as="h2"
            text="Specialized Engineering Pillars Built for Extreme Demands."
            accentFromWordIndex={4}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
          />
          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
            We don&apos;t build cookie-cutter templates. Each engagement is an
            intensive technical partnership designed to eliminate operational
            bottlenecks and build permanent technical moats.
          </p>
        </div>

        {/* 6 Interactive Spotlight & Expandable Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {servicesData.map((service, idx) => {
            const isActive = activePillar === idx;
            const coords = mouseCoords[service.id] || { x: 180, y: 120 };
            const formattedIdx = String(idx + 1).padStart(2, "0");

            return (
              <motion.article
                key={service.id}
                onMouseEnter={() => setActivePillar(idx)}
                onFocus={() => setActivePillar(idx)}
                onClick={() => setActivePillar(idx)}
                onMouseMove={(e) => handleCardMouseMove(service.id, e)}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.65,
                  delay: idx * 0.07,
                  ease: MOTION_EASE.cinematicOut,
                }}
                data-cursor="view-work"
                data-cursor-label="View Work"
                style={
                  {
                    "--mouse-x": `${coords.x}px`,
                    "--mouse-y": `${coords.y}px`,
                  } as React.CSSProperties
                }
                className={`group relative overflow-hidden rounded-2xl glass-panel p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-brand-primary/50 bg-[#0c0c14]/90 shadow-2xl shadow-brand-primary/10 -translate-y-1"
                    : "hover:border-brand-primary/40 hover:bg-[#0c0c11]/80 hover:-translate-y-1"
                }`}
              >
                {/* Cursor-Tracked Radial Glass Spotlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(133, 135, 227, 0.14), transparent 45%)",
                  }}
                />

                <div className="relative z-10">
                  {/* Header Row: 01 Index + Icon + Badge + Launch Arrow */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold tracking-widest px-2.5 py-1 rounded-md bg-brand-primary/15 border border-brand-primary/30 text-brand-light">
                        {formattedIdx}
                      </span>
                      <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10 transition-colors">
                        {iconMap[service.iconName] || (
                          <Cpu className="w-5 h-5 text-brand-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">
                        {service.badge}
                      </span>
                      <Link
                        href={`/services/${service.slug}`}
                        aria-label={`Explore ${service.title}`}
                        className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white transition-all duration-300"
                      >
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight group-hover:text-brand-light transition-colors">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                    {service.shortDesc}
                  </p>

                  {/* Capabilities & Tools (antimatterai.agency Services + Tools structure) */}
                  <div className="space-y-2 mb-5 border-t border-white/[0.06] pt-4">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                      Services
                    </div>
                    {service.deliverables.slice(0, 4).map((item, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-start gap-2 text-xs text-zinc-300"
                      >
                        <Check className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {typeof item === "string" ? item : item.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Smooth Expandable Tools Row */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive
                        ? "grid-rows-[1fr] opacity-100 mb-5"
                        : "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:mb-5"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-3 border-t border-white/[0.05]">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                          Tools
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {service.tools.slice(0, 5).map((tool) => (
                            <span
                              key={tool}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-300"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="text-xs font-mono text-zinc-400">
                    <span className="text-zinc-500">SLA: </span>
                    <span className="text-white font-medium">
                      {service.metrics}
                    </span>
                  </div>

                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary group-hover:text-white transition-colors"
                  >
                    <span>Explore Pillar</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 text-center">
          <Link
            href="/services/ai-development"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <span>Need a custom architecture assessment?</span>
            <span className="text-brand-primary font-semibold underline underline-offset-4">
              Explore Our AI Development Blueprint →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
