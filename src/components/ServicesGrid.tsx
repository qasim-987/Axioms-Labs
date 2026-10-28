"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { servicesData, ServiceItem } from "@/data/services";
import {
  SERVICE_STAGE_ORDER,
  ServiceShapeId,
} from "@/lib/serviceParticleShapes";
import ServicesParticleCanvas, {
  evaluateServicesMasterTimeline,
  PARTICLE_TUNING,
} from "./ServicesParticleCanvas";
import { renderServiceToolIcon } from "./ServiceToolIcons";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TUNABLE SECTION & CARD CONSTANTS
// ============================================================================
export const SERVICES_SECTION_TUNING = {
  SECTION_BG: "#05050c",
  RADIAL_GLOW_COLOR: "rgba(32, 34, 108, 0.62)", // #1b1b4d deep navy/indigo left glow
  ACTIVE_CARD_TOP: "#4c48a4", // Indigo/violet top-left fill
  ACTIVE_CARD_BOTTOM: "#3b3882", // Indigo/violet base fill
  INACTIVE_CARD_BG: "#090910", // Near-black glassy collapsed card fill
  SCROLL_VH_PER_STEP: 92, // ~92vh per service step (368vh total pinned travel for 4 steps)
  CARD_EXPANDED_MAX_PX: 356,
  CARD_COLLAPSED_MAX_PX: 194,
  CARD_GAP_PX: 18,
  INACTIVE_TOP_OFFSET_PX: 16, // Collapsed cards sit 16px lower & rise into alignment on expand
} as const;

interface OrderedServiceEntry {
  service: ServiceItem;
  shape: ServiceShapeId;
  shortCardBullets: string[];
  displayTools: string[];
}

// Concise, scannable descriptions & capability lines derived from our 4 services in `src/data/services.ts`
function buildOrderedServices(): OrderedServiceEntry[] {
  const ordered: OrderedServiceEntry[] = [];

  for (const cfg of SERVICE_STAGE_ORDER) {
    const found = servicesData.find((s) => s.slug === cfg.slug);
    if (!found) continue;

    // Ensure 6 tool items for a clean 3x2 icon grid using the service's existing tools
    const baseTools = found.tools.slice(0, 6);
    while (baseTools.length < 6 && found.tools.length > 0) {
      baseTools.push(found.tools[baseTools.length % found.tools.length]);
    }

    ordered.push({
      service: found,
      shape: cfg.shape,
      shortCardBullets: found.deliverables.slice(0, 4).map((d) => d.title),
      displayTools: baseTools,
    });
  }

  return ordered;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

// Target scroll progress centers for clicking collapsed cards 0..3
const STEP_HOLD_PROGRESS = [0.14, 0.41, 0.68, 0.95] as const;

export default function ServicesGrid() {
  const entries = useMemo(() => buildOrderedServices(), []);

  const pinSectionRef = useRef<HTMLElement>(null);
  const cardsViewportRef = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);

  const cardShellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indigoFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sweepGlowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inactiveNumberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inactiveBottomLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const halftoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Staggered active-card content refs (never rewrap because parent inner frame has fixed expandedW)
  const activeTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const activeDescRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const activeColumnsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeToolsGridRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Shared master scroll progress [0..1] consumed by BOTH particle stage and cards RAF loop
  const scrollProgressRef = useRef<number>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [mobileStepIndex, setMobileStepIndex] = useState<number>(0);
  const [cardDims, setCardDims] = useState<{
    expandedW: number;
    collapsedW: number;
    gap: number;
  }>({
    expandedW: 344,
    collapsedW: 188,
    gap: SERVICES_SECTION_TUNING.CARD_GAP_PX,
  });

  // Detect viewport mode & prefers-reduced-motion
  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateFlags = () => {
      const vw = window.innerWidth;
      setIsDesktop(vw >= 1024);
      setReducedMotion(mqReduced.matches);

      const expandedW = Math.round(
        Math.max(288, Math.min(vw * 0.2, SERVICES_SECTION_TUNING.CARD_EXPANDED_MAX_PX))
      );
      const collapsedW = Math.round(
        Math.max(156, Math.min(vw * 0.108, SERVICES_SECTION_TUNING.CARD_COLLAPSED_MAX_PX))
      );
      setCardDims({
        expandedW,
        collapsedW,
        gap: vw >= 1440 ? 18 : 14,
      });
    };

    updateFlags();
    window.addEventListener("resize", updateFlags);
    mqReduced.addEventListener("change", updateFlags);
    return () => {
      window.removeEventListener("resize", updateFlags);
      mqReduced.removeEventListener("change", updateFlags);
    };
  }, []);

  // Scroll smoothly to a specific service step when user clicks an inactive card
  const scrollToServiceStep = useCallback(
    (stepIdx: number) => {
      if (!isDesktop || reducedMotion) {
        setMobileStepIndex(stepIdx);
        scrollProgressRef.current = STEP_HOLD_PROGRESS[stepIdx] ?? 0.14;
        return;
      }
      const st = scrollTriggerRef.current;
      if (!st) return;
      const targetP = STEP_HOLD_PROGRESS[stepIdx] ?? 0.14;
      const targetScrollY = st.start + (st.end - st.start) * targetP;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    },
    [isDesktop, reducedMotion]
  );

  // Desktop GSAP ScrollTrigger Pin + Unified RAF Card Choreographer
  useEffect(() => {
    if (!isDesktop || reducedMotion) {
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
      return;
    }

    const sectionEl = pinSectionRef.current;
    if (!sectionEl) return;

    const totalScrollVh =
      entries.length * SERVICES_SECTION_TUNING.SCROLL_VH_PER_STEP;

    const st = ScrollTrigger.create({
      trigger: sectionEl,
      start: "top top",
      end: `+=${totalScrollVh}%`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });
    scrollTriggerRef.current = st;

    let rafId = 0;
    let smoothP = scrollProgressRef.current;
    let lastReportedIdx = -1;

    const applyChoreography = () => {
      rafId = requestAnimationFrame(applyChoreography);

      smoothP +=
        (scrollProgressRef.current - smoothP) * PARTICLE_TUNING.PROGRESS_LERP;

      const state = evaluateServicesMasterTimeline(smoothP);
      const { fromCardIndex, toCardIndex, cardTransitionT, activeCardIndex } =
        state;

      if (activeCardIndex !== lastReportedIdx) {
        lastReportedIdx = activeCardIndex;
        setActiveStepIndex(activeCardIndex);
      }

      const { expandedW, collapsedW, gap } = cardDims;
      const isTransitioning = fromCardIndex !== toCardIndex;
      const easedMove = easeInOutCubic(cardTransitionT);

      // Translate row left so outgoing card clips out cleanly and incoming card lands at x = 0
      const baseIndex = isTransitioning ? fromCardIndex : activeCardIndex;
      const trackX = -(
        baseIndex * (collapsedW + gap) +
        (isTransitioning ? easedMove * (collapsedW + gap) : 0)
      );

      if (cardsTrackRef.current) {
        cardsTrackRef.current.style.transform = `translate3d(${trackX.toFixed(
          2
        )}px, 0, 0)`;
      }

      // Intro stagger for Card 0 during initial Step 0 (frames 001 -> 020: title & desc visible, list & tools fade up)
      const introReveal = Math.min(1, 0.35 + (smoothP / 0.06) * 0.65);

      for (let i = 0; i < entries.length; i++) {
        let activeWeight = 0; // 0 = collapsed dark card, 1 = expanded indigo card
        let contentProgress = 0; // drives staggered inner reveal
        let sweepOpacity = 0;
        let sweepShift = 0;

        if (!isTransitioning) {
          if (i === activeCardIndex) {
            activeWeight = 1;
            contentProgress = i === 0 ? introReveal : 1;
          }
        } else if (i === fromCardIndex) {
          // Outgoing card: fade content out rapidly in first 32% BEFORE width collapses
          activeWeight = 1 - easedMove;
          contentProgress = Math.max(0, 1 - cardTransitionT / 0.32);
        } else if (i === toCardIndex) {
          // Incoming card: expand width, sweep top-left violet glow, then stagger content in
          activeWeight = easedMove;
          contentProgress = Math.max(0, (cardTransitionT - 0.24) / 0.76);
          // Diagonal violet sweep peaks mid-transition (seen on incoming "02" card in frames)
          sweepOpacity = Math.sin(Math.PI * cardTransitionT) * 0.95;
          sweepShift = (1 - cardTransitionT) * -28;
        }

        const widthPx =
          collapsedW + (expandedW - collapsedW) * activeWeight;
        const yOffsetPx =
          SERVICES_SECTION_TUNING.INACTIVE_TOP_OFFSET_PX * (1 - activeWeight);

        const shell = cardShellRefs.current[i];
        if (shell) {
          shell.style.width = `${widthPx.toFixed(1)}px`;
          shell.style.transform = `translate3d(0, ${yOffsetPx.toFixed(
            2
          )}px, 0)`;
          shell.style.borderColor =
            activeWeight > 0.5
              ? `rgba(196, 194, 255, ${(0.12 + activeWeight * 0.14).toFixed(3)})`
              : "rgba(255, 255, 255, 0.08)";
        }

        const indigoFill = indigoFillRefs.current[i];
        if (indigoFill) {
          indigoFill.style.opacity = activeWeight.toFixed(3);
        }

        const sweepEl = sweepGlowRefs.current[i];
        if (sweepEl) {
          sweepEl.style.opacity = sweepOpacity.toFixed(3);
          sweepEl.style.transform = `translate3d(${sweepShift.toFixed(
            1
          )}px, ${sweepShift.toFixed(1)}px, 0)`;
        }

        // Inactive number ("02", "03", "04"), bottom-left caption & bottom-right halftone
        const inactiveAlpha = Math.max(0, 1 - activeWeight * 1.45);
        const numEl = inactiveNumberRefs.current[i];
        if (numEl) {
          numEl.style.opacity = inactiveAlpha.toFixed(3);
          numEl.style.transform = `translate3d(0, ${(
            -activeWeight * 8
          ).toFixed(1)}px, 0)`;
        }

        const botLabelEl = inactiveBottomLabelRefs.current[i];
        if (botLabelEl) {
          botLabelEl.style.opacity = inactiveAlpha.toFixed(3);
        }

        const halftoneEl = halftoneRefs.current[i];
        if (halftoneEl) {
          halftoneEl.style.opacity = (inactiveAlpha * 0.85).toFixed(3);
        }

        // Staggered Active Content Reveal (1. Title, 2. Desc, 3. Services/Tools Labels, 4. Tool Icons)
        const isOutgoing = isTransitioning && i === fromCardIndex;
        const tTitle = isOutgoing
          ? contentProgress
          : easeOutCubic((contentProgress - 0.0) / 0.45);
        const tDesc = isOutgoing
          ? contentProgress
          : easeOutCubic((contentProgress - 0.14) / 0.48);
        const tCols = isOutgoing
          ? contentProgress
          : easeOutCubic((contentProgress - 0.3) / 0.5);
        const tTools = isOutgoing
          ? contentProgress
          : easeOutCubic((contentProgress - 0.44) / 0.52);

        const slideDir = isOutgoing ? -1 : 1; // Outgoing slides up (-Y); incoming rises from +Y to 0

        const titleEl = activeTitleRefs.current[i];
        if (titleEl) {
          titleEl.style.opacity = tTitle.toFixed(3);
          titleEl.style.transform = `translate3d(0, ${(
            (1 - tTitle) *
            8 *
            slideDir
          ).toFixed(1)}px, 0)`;
        }

        const descEl = activeDescRefs.current[i];
        if (descEl) {
          descEl.style.opacity = tDesc.toFixed(3);
          descEl.style.transform = `translate3d(0, ${(
            (1 - tDesc) *
            10 *
            slideDir
          ).toFixed(1)}px, 0)`;
        }

        const colsEl = activeColumnsRefs.current[i];
        if (colsEl) {
          colsEl.style.opacity = tCols.toFixed(3);
          colsEl.style.transform = `translate3d(0, ${(
            (1 - tCols) *
            12 *
            slideDir
          ).toFixed(1)}px, 0)`;
        }

        const toolsEl = activeToolsGridRefs.current[i];
        if (toolsEl) {
          toolsEl.style.opacity = tTools.toFixed(3);
          toolsEl.style.transform = `translate3d(${(
            (1 - tTools) *
            10 *
            slideDir
          ).toFixed(1)}px, 0, 0)`;
        }
      }
    };

    rafId = requestAnimationFrame(applyChoreography);

    return () => {
      cancelAnimationFrame(rafId);
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [isDesktop, reducedMotion, cardDims, entries.length]);

  // Sync mobile/tablet step selector with particle morph progress
  useEffect(() => {
    if (isDesktop || reducedMotion) return;
    scrollProgressRef.current = STEP_HOLD_PROGRESS[mobileStepIndex] ?? 0.14;
  }, [isDesktop, reducedMotion, mobileStepIndex]);

  // --------------------------------------------------------------------------
  // REDUCED MOTION ACCESSIBLE FALLBACK (No Pinning, No Morph Animation)
  // --------------------------------------------------------------------------
  if (reducedMotion) {
    return (
      <section
        id="services"
        aria-labelledby="services-heading-reduced"
        style={{ backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG }}
        className="relative py-24 sm:py-28 text-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <h2
              id="services-heading-reduced"
              className="text-4xl sm:text-5xl font-medium tracking-tight leading-[1.08] text-white"
            >
              Our
              <br />
              Services
            </h2>
            <p className="text-sm text-white/75 max-w-xs leading-relaxed">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry, idx) => (
              <article
                key={entry.service.id}
                className="rounded-[22px] p-7 border border-white/15 bg-gradient-to-br from-[#4c48a4] to-[#3b3882] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-semibold text-white">
                      {entry.service.title}
                    </h3>
                    <Link
                      href={`/services/${entry.service.slug}`}
                      aria-label={`Explore ${entry.service.title}`}
                      className="p-1.5 rounded-lg text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">
                        ↗
                      </span>
                    </Link>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed mb-6">
                    {entry.service.shortDesc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
                  <div>
                    <div className="text-xs text-white/60 mb-2">Services</div>
                    <ul className="space-y-1 text-xs text-white/95">
                      {entry.shortCardBullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-2">Tools</div>
                    <div className="grid grid-cols-3 gap-2.5 text-white/95">
                      {entry.displayTools.map((tool, tIdx) => (
                        <span
                          key={`${tool}-${tIdx}`}
                          title={tool}
                          className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center"
                        >
                          {renderServiceToolIcon(tool)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="sr-only">Service 0{idx + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // TABLET & MOBILE STACKED INTERACTIVE VIEW (< 1024px)
  // --------------------------------------------------------------------------
  if (!isDesktop) {
    const activeEntry = entries[mobileStepIndex] || entries[0];
    return (
      <section
        id="services"
        aria-labelledby="services-heading-mobile"
        style={{ backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG }}
        className="relative py-16 sm:py-20 text-white overflow-hidden"
      >
        {/* Subtle Deep Navy/Indigo Radial Depth Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 w-[88vw] h-[42vh] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${SERVICES_SECTION_TUNING.RADIAL_GLOW_COLOR} 0%, rgba(16,17,56,0.22) 52%, transparent 75%)`,
          }}
        />

        <div className="relative z-10 max-w-xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <h2
              id="services-heading-mobile"
              className="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.1] text-white"
            >
              Our
              <br />
              Services
            </h2>
            <p className="text-xs sm:text-sm text-white/75 max-w-xs leading-relaxed">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          {/* 38vh Particle Morph Stage */}
          <div className="relative w-full h-[36vh] min-h-[250px] mb-4">
            <ServicesParticleCanvas
              scrollProgressRef={scrollProgressRef}
              layoutMode="mobile"
              className="w-full h-full"
            />
          </div>

          {/* Step Selector Pills (01 - 04) */}
          <div
            role="tablist"
            aria-label="Select service"
            className="grid grid-cols-4 gap-2 mb-5"
          >
            {entries.map((entry, idx) => {
              const selected = idx === mobileStepIndex;
              return (
                <button
                  key={entry.service.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMobileStepIndex(idx)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono transition-all border ${
                    selected
                      ? "bg-[#4a45a6] border-white/25 text-white font-semibold shadow-lg"
                      : "bg-[#0a0a12] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Expanded Indigo Card */}
          <article
            aria-live="polite"
            className="rounded-[22px] p-6 sm:p-7 border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            style={{
              background: `linear-gradient(155deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 100%)`,
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <h3 className="text-xl font-semibold text-white tracking-tight">
                {activeEntry.service.title}
              </h3>
              <Link
                href={`/services/${activeEntry.service.slug}`}
                aria-label={`Explore ${activeEntry.service.title}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M5 15L15 5M7 5h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-7">
              {activeEntry.service.shortDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-[1.25fr_1fr] gap-6 pt-5 border-t border-white/15">
              <div>
                <div className="text-xs text-white/60 mb-2.5">Services</div>
                <ul className="space-y-1.5 text-xs text-white/95 font-medium">
                  {activeEntry.shortCardBullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs text-white/60 mb-2.5">Tools</div>
                <div className="grid grid-cols-3 gap-3 max-w-[132px] text-white">
                  {activeEntry.displayTools.map((tool, tIdx) => (
                    <div
                      key={`${tool}-${tIdx}`}
                      title={tool}
                      className="w-8 h-8 flex items-center justify-center text-white/95"
                    >
                      {renderServiceToolIcon(tool)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // DESKTOP FULL-VIEWPORT PINNED PARTICLE-MORPH STAGE (>= 1024px)
  // --------------------------------------------------------------------------
  return (
    <section
      ref={pinSectionRef}
      id="services"
      aria-labelledby="services-heading-desktop"
      style={{ backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG }}
      className="relative w-full h-screen min-h-[680px] overflow-hidden text-white select-none"
    >
      {/* Layer 1: Deep Navy / Indigo Soft Radial Glow behind Left Particle Stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[5%] top-1/2 -translate-y-1/2 w-[44vw] max-w-[760px] h-[66vh] max-h-[680px] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${SERVICES_SECTION_TUNING.RADIAL_GLOW_COLOR} 0%, rgba(22, 24, 78, 0.34) 42%, rgba(5, 5, 12, 0) 74%)`,
          filter: "blur(36px)",
        }}
      />

      {/* Top Subtle Ambient Indigo Vignette matching Reference Frames */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[22%] left-[8%] w-[46vw] h-[44vh] rounded-full opacity-55"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(44, 46, 130, 0.42) 0%, transparent 72%)",
          filter: "blur(54px)",
        }}
      />

      {/* Layer 2: Right-Half Header + Horizontal Portrait Cards Stage */}
      <div className="relative z-10 w-full h-full flex items-center">
        {/* Left ~41% Spacer reserved for the 3D Particle Cloud */}
        <div className="w-[41%] xl:w-[42%] shrink-0 h-full pointer-events-none" />

        {/* Right ~59% Column: Header on top, Portrait Cards Row below running past right viewport edge */}
        <div className="w-[59%] xl:w-[58%] h-full flex flex-col justify-end pb-[4vh] pt-[9vh]">
          {/* Header Row ("Our Services" + Intro Paragraph) */}
          <div className="pr-8 lg:pr-14 xl:pr-20 mb-7 xl:mb-9 flex items-start justify-between gap-8 max-w-[820px]">
            <h2
              id="services-heading-desktop"
              className="text-[34px] xl:text-[42px] font-medium tracking-[-0.02em] leading-[1.08] text-white shrink-0"
            >
              Our
              <br />
              Services
            </h2>

            <p className="text-[12.5px] xl:text-[13.5px] text-white/75 leading-[1.58] max-w-[300px] pt-1 font-normal">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          {/* Horizontal Portrait Cards Viewport (Clips outgoing cards cleanly at left edge of column) */}
          <div
            ref={cardsViewportRef}
            className="relative w-full overflow-hidden pt-1 pb-2"
          >
            <div
              ref={cardsTrackRef}
              style={{ gap: `${cardDims.gap}px` }}
              className="flex items-start will-change-transform"
            >
              {entries.map((entry, idx) => {
                const isCurrentActive = activeStepIndex === idx;
                const indexNumber = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={entry.service.id}
                    ref={(el) => {
                      cardShellRefs.current[idx] = el;
                    }}
                    role="region"
                    aria-label={`${indexNumber} ${entry.service.title}`}
                    aria-current={isCurrentActive ? "step" : undefined}
                    onClick={() => {
                      if (!isCurrentActive) {
                        scrollToServiceStep(idx);
                      }
                    }}
                    style={{
                      width:
                        idx === 0
                          ? `${cardDims.expandedW}px`
                          : `${cardDims.collapsedW}px`,
                      height: "clamp(385px, 57vh, 505px)",
                      backgroundColor: SERVICES_SECTION_TUNING.INACTIVE_CARD_BG,
                    }}
                    className={`group/card relative shrink-0 rounded-[22px] border border-white/[0.08] overflow-hidden select-text ${
                      isCurrentActive ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    {/* Subtle Top-Edge Specular Rim Sheen on Collapsed Dark Cards */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.02) 100%)",
                      }}
                    />

                    {/* Inactive Card Decorative Bottom-Right Indigo Halftone Dot-Cross Matrix */}
                    <div
                      ref={(el) => {
                        halftoneRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        opacity: idx === 0 ? 0 : 0.85,
                        backgroundImage:
                          "radial-gradient(circle, rgba(108, 102, 214, 0.48) 1.35px, transparent 1.45px)",
                        backgroundSize: "14px 14px",
                        maskImage:
                          "radial-gradient(circle at 92% 92%, black 0%, rgba(0,0,0,0.55) 34%, transparent 68%)",
                        WebkitMaskImage:
                          "radial-gradient(circle at 92% 92%, black 0%, rgba(0,0,0,0.55) 34%, transparent 68%)",
                      }}
                    />

                    {/* Active Indigo/Violet Fill Overlay */}
                    <div
                      ref={(el) => {
                        indigoFillRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        opacity: idx === 0 ? 1 : 0,
                        background: `linear-gradient(155deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 65%, #343176 100%)`,
                      }}
                    />

                    {/* Incoming Diagonal Light-Violet Sweep Overlay (Top-Left -> Bottom-Right) */}
                    <div
                      ref={(el) => {
                        sweepGlowRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-8 will-change-transform"
                      style={{
                        opacity: 0,
                        background:
                          "linear-gradient(135deg, rgba(186, 182, 255, 0.62) 0%, rgba(120, 114, 232, 0.28) 38%, rgba(67, 63, 148, 0) 70%)",
                      }}
                    />

                    {/* Top-Right Thin Diagonal Arrow "↗" (Always pinned to card's right edge) */}
                    <Link
                      href={`/services/${entry.service.slug}`}
                      aria-label={`View ${entry.service.title} details`}
                      onClick={(e) => {
                        if (!isCurrentActive) {
                          e.preventDefault();
                          e.stopPropagation();
                          scrollToServiceStep(idx);
                        }
                      }}
                      className="group/arrow absolute top-6 right-6 z-30 w-8 h-8 rounded-lg flex items-center justify-center text-white/95 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <svg
                        viewBox="0 0 22 22"
                        className="w-[18px] h-[18px] transition-transform duration-200 group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.65"
                      >
                        <path
                          d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Subtle top-right spark tick visible on hover (matching frames 3-16) */}
                        <path
                          d="M16.8 5.2L19.2 2.8"
                          strokeLinecap="round"
                          className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                        />
                      </svg>
                    </Link>

                    {/* Inactive Card Top-Left Number ("02", "03", "04") */}
                    <span
                      ref={(el) => {
                        inactiveNumberRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      style={{ opacity: idx === 0 ? 0 : 1 }}
                      className="pointer-events-none absolute top-6 left-6 z-20 text-[25px] font-medium tracking-tight text-white tabular-nums will-change-transform"
                    >
                      {indexNumber}
                    </span>

                    {/* Inactive Card Bottom-Left Service Label Caption */}
                    <div
                      ref={(el) => {
                        inactiveBottomLabelRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      style={{ opacity: idx === 0 ? 0 : 1 }}
                      className="pointer-events-none absolute bottom-5 left-6 right-5 z-20 text-[13.5px] font-medium text-white/90 truncate"
                    >
                      {entry.service.title}
                    </div>

                    {/* Fixed-Width Expanded Content Frame (Prevents ANY text reflow during width collapse/expand) */}
                    <div
                      style={{ width: `${cardDims.expandedW}px` }}
                      className="relative z-20 h-full p-7 pb-6 flex flex-col justify-between pointer-events-none"
                    >
                      {/* 1. Active Service Title (Top-Left) */}
                      <div className="pr-10">
                        <h3
                          ref={(el) => {
                            activeTitleRefs.current[idx] = el;
                          }}
                          className="text-[19px] xl:text-[21px] font-semibold tracking-tight text-white will-change-transform"
                        >
                          {entry.service.title}
                        </h3>
                      </div>

                      {/* 2. Middle Description Paragraph */}
                      <div className="my-auto py-3 pr-2">
                        <p
                          ref={(el) => {
                            activeDescRefs.current[idx] = el;
                          }}
                          className="text-[12px] xl:text-[12.5px] leading-[1.58] text-white/90 font-normal max-w-[280px] will-change-transform"
                        >
                          {entry.service.shortDesc}
                        </p>
                      </div>

                      {/* 3 & 4. Bottom Two-Column Split: "Services" List + "Tools" 3x2 Monoline Icons */}
                      <div
                        ref={(el) => {
                          activeColumnsRefs.current[idx] = el;
                        }}
                        className="grid grid-cols-[1.28fr_1fr] gap-4 items-start pt-2 will-change-transform"
                      >
                        {/* Left Column: Bullet-less Services List */}
                        <div>
                          <div className="text-[12px] text-white/60 font-normal mb-2">
                            Services
                          </div>
                          <ul className="space-y-1.5 text-[11px] xl:text-[11.5px] leading-[1.35] text-white/95 font-medium">
                            {entry.shortCardBullets.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Right Column: 3x2 Monoline Tool Icons */}
                        <div>
                          <div className="text-[12px] text-white/60 font-normal mb-2.5">
                            Tools
                          </div>
                          <div
                            ref={(el) => {
                              activeToolsGridRefs.current[idx] = el;
                            }}
                            className="grid grid-cols-3 gap-x-3 gap-y-3 max-w-[112px] text-white/95 will-change-transform"
                          >
                            {entry.displayTools.map((tool, tIdx) => (
                              <div
                                key={`${tool}-${tIdx}`}
                                title={tool}
                                className="w-6 h-6 flex items-center justify-center opacity-95"
                              >
                                {renderServiceToolIcon(tool)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Layer 3: Full-Stage GPU Particle Canvas (`pointer-events-none`, screen/additive stardust so Step 0 burst can overlap card's left edge just like frames 18-20!) */}
      <ServicesParticleCanvas
        scrollProgressRef={scrollProgressRef}
        layoutMode="desktop"
        className="absolute inset-0 z-20 w-full h-full"
      />
    </section>
  );
}
