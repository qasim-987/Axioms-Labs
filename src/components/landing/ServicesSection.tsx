"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useParticleAPI } from "@/lib/particleContext";
import { SERVICES } from "@/data/brand";
import { PARTICLES, BREAKPOINT, SERVICES as CONFIG_SERVICES } from "@/lib/landingConfig";
import ServiceCard from "./ServiceCard";
import { registerStage } from "@/lib/registry";

gsap.registerPlugin(ScrollTrigger);

const MORPH_TARGETS: Array<"sphere" | "square" | "glyph"> = [
  "sphere",
  "square",
  "glyph",
];

export default function ServicesSection() {
  const prefersReduced = useReducedMotion();
  const { api } = useParticleAPI();
  const stageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [scrollActive, setScrollActive] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex ?? scrollActive;
  const maxScrollRef = useRef(0);

  // Morph the shared particle sphere when the active card changes.
  useEffect(() => {
    if (!api) return;
    const target = MORPH_TARGETS[activeIndex % MORPH_TARGETS.length];
    api.setTarget(target);
  }, [activeIndex, api]);

  // Desktop: pinned ScrollTrigger stage — scrub scroll moves the horizontal
  // card track; the heading stays fixed.
  useEffect(() => {
    if (prefersReduced) return undefined;
    const container = containerRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!container || !track || !stage || !api) return undefined;

    const progressProxy = { p: 0 };

    const refreshMax = () => {
      maxScrollRef.current = Math.max(
        0,
        track.scrollWidth - container.clientWidth
      );
    };

    const ctx = gsap.context(() => {
      refreshMax();
      window.addEventListener("resize", refreshMax, { passive: true });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=328vh",
          scrub: CONFIG_SERVICES.scrub,
          pin: true,
          anticipatePin: 1,
          scroller: document.documentElement,
          onUpdate: () => {
            const p = progressProxy.p;
            const active = Math.min(
              SERVICES.length - 1,
              Math.round(p * (SERVICES.length - 1))
            );
            setScrollActive(active);
            track.style.transform = `translate3d(${-p * maxScrollRef.current}px, 0, 0)`;
            track.style.willChange = "transform";
          },
          onRefresh: refreshMax,
        },
      });

      tl.to(progressProxy, { p: 1, ease: "none" }, 0);
    }, stage);

    return () => {
      window.removeEventListener("resize", refreshMax);
      ctx.revert();
    };
  }, [prefersReduced]);

  // Touch / coarse pointer: scroll-snap row; the card nearest the centre is
  // active. No hover states.
  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarse || !trackRef.current || !containerRef.current) {
      return undefined;
    }
    const track = trackRef.current;
    const container = containerRef.current;
    let raf = 0;
    const loop = () => {
      const center = track.scrollLeft + container.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const dist = Math.abs(ref.offsetLeft + ref.clientWidth / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
        }
      });
      setScrollActive(best);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleCardEnter = useCallback((idx: number) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setHoverIndex(idx);
    }
  }, []);
  const handleCardLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  // Clean up ScrollTriggers / WebGL stages if this route is left.
  // (Also registered globally via registry in TransitionProvider.)
  registerStage(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  });

  return (
    <section
      id="services"
      className="relative w-full overflow-hidden"
      aria-label="Our Services"
    >
      <div
        ref={stageRef}
        className="relative z-10"
        style={
          typeof window !== "undefined" && window.innerWidth >= BREAKPOINT.desktop
            ? {
                height: `calc(100svh - var(--nav-h, 68px))`,
                minHeight: `calc(100vh - var(--nav-h, 68px))`,
              }
            : {}
        }
      >
        {/* Heading stays fixed at the top while the cards slide. */}
        <div className="mb-6 sm:mb-8 lg:sticky lg:top-[calc(var(--nav-h,68px)+16px)] z-20">
          <h2
            className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-2"
          >
            Our Services
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-md">
            We design, build, and ship digital products and brand experiences.
          </p>
        </div>
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          style={
            typeof window !== "undefined" && window.innerWidth >= BREAKPOINT.desktop
              ? {}
              : {
                  overflowX: "auto",
                  overflowY: "hidden",
                  scrollSnapType: "x mandatory",
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }
          }
        >
          <div
            ref={trackRef}
            className={`flex gap-6 sm:gap-8 lg:gap-12 ${typeof window !== "undefined" && window.innerWidth < BREAKPOINT.desktop ? "scroll-snap-x min-w-max" : "flex-nowrap min-w-max"} pb-8`}
          >
            {SERVICES.map((service, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={service.slug}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className={`flex-shrink-0 w-[280px] sm:w-[340px] lg:w-[380px] ${typeof window !== "undefined" && window.innerWidth < BREAKPOINT.desktop ? "scroll-snap-align-center" : ""}`}
                  style={{ height: "100%" }}
                >
                  <ServiceCard
                    service={service}
                    index={idx}
                    isActive={isActive}
                    onMouseEnter={() => handleCardEnter(idx)}
                    onMouseLeave={handleCardLeave}
                    onFocus={() => handleCardEnter(idx)}
                    onBlur={handleCardLeave}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
