"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TransitionLink from "./TransitionLink";
import type { Service } from "@/data/brand";
import { BRAND } from "@/lib/landingConfig";

interface ServiceCardProps {
  service: Service;
  index: number;
  isActive: boolean;
  onMouseEnter?: (idx: number) => void;
  onMouseLeave?: () => void;
  onFocus?: (idx: number) => void;
  onBlur?: () => void;
}

export default function ServiceCard({
  service,
  index,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: ServiceCardProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");
  const tools = service.tools.slice(0, 6);

  const cardClass = isActive
    ? `rounded-[24px] border border-white/20 bg-gradient-to-br from-${BRAND.violet.replace("#", "")} via-white/10 to-${BRAND.violetDark.replace("#", "")} shadow-[0_0_40px_rgba(108,111,216,0.35)]`
    : `rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm transition-colors`;

  const revealDelay = (part: number) =>
    isActive ? `${part * 0.12}s` : "0s";

  return (
    <article
      className={`service-card relative overflow-hidden h-full flex flex-col duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? "opacity-100 scale-100" : "opacity-60 scale-95"} ${cardClass}`}
      style={{
        flexGrow: isActive ? 2.2 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={() => onMouseEnter?.(index)}
      onMouseLeave={onMouseLeave}
      onFocus={() => onFocus?.(index)}
      onBlur={onBlur}
    >
      <TransitionLink
        href={`/services/${service.slug}`}
        className="block h-full"
      >
        <div className="absolute top-4 left-4 z-10 text-xs font-mono font-bold text-white/60">
          {formattedIndex}
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-sm transition-all group-hover:bg-white/20 group-hover:border-white/30">
            <ArrowUpRight className="w-3.5 h-3.5 text-white stroke-[2.2] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Halftone dot pattern, bottom-right, faded by a mask gradient. */}
        <div
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-48 h-32 opacity-40 select-none pointer-events-none halftone-dots"
          style={{ color: BRAND.violet }}
        />

        <div className="relative z-20 h-full flex flex-col justify-between p-6 sm:p-8 pt-16">
          <div>
            <h3
              className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2"
              style={{
                opacity: 1,
                transition: "opacity 0.4s ease",
                transitionDelay: revealDelay(0),
              }}
            >
              {service.title}
            </h3>
            <p
              className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2"
              style={{
                opacity: isActive ? 1 : 0,
                transform: `translateY(${isActive ? 0 : 8}px)`,
                transition: "opacity 0.4s ease, transform 0.4s ease",
                transitionDelay: revealDelay(1),
              }}
            >
              {service.description}
            </p>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
                Services
              </div>
              {service.subServices.map((sub) => (
                <div
                  key={sub.title}
                  className="flex items-start gap-2 text-xs text-white/60 leading-snug"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${isActive ? 0 : 8}px)`,
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    transitionDelay: revealDelay(2),
                  }}
                >
                  <span className="shrink-0 self-start mt-[2px] text-white/40">•</span>
                  <span className="leading-none">{sub.title}</span>
                </div>
              ))}
              <div className="mt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
                  Tools
                </div>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span
                      key={tool.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 transition-colors hover:bg-white/10"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${isActive ? 0 : 8}px)`,
                        transition: "opacity 0.4s ease, transform 0.4s ease",
                        transitionDelay: revealDelay(3),
                      }}
                    >
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionLink>
    </article>
  );
}
