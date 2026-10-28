"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ServiceItem, servicesData } from "@/data/services";
import { easeInOutCubic, easeOutOdometer } from "@/lib/particleEngine";
import {
  SERVICE_STAGE_ORDER,
  ServiceShapeId,
} from "@/lib/serviceParticleShapes";
import ServicesParticleCanvas, {
  PARTICLE_TUNING,
  STEP_HOLD_PROGRESS,
  STEP_SNAP_POINTS,
  evaluateServicesMasterTimeline,
} from "./ServicesParticleCanvas";
import { renderServiceToolIcon } from "./ServiceToolIcons";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TUNABLE SECTION, CARD & HOVER CONSTANTS
// ============================================================================
export const SERVICES_SECTION_TUNING = {
  SECTION_BG: "#05050c",
  RADIAL_GLOW_COLOR: "rgba(27, 27, 77, 0.72)", // #1b1b4d deep navy/indigo radial glow (~60% vh)
  ACTIVE_CARD_TOP: "#5650b8", // Indigo/violet top-left highlight fill
  ACTIVE_CARD_BOTTOM: "#4a45a6", // Indigo/violet base fill
  INACTIVE_CARD_BG: "#0a0a0f", // Near-black glassy collapsed card fill
  SCROLL_VH_PER_STEP: 92, // ~92vh per service (~(4 + 1) * 100vh total pinned feel)
  HOVER_INTENT_DELAY_MS: 100, // 80-120ms debounce prevents flicker across cards
  HOVER_LEAVE_DELAY_MS: 250, // Smoothly returns to scroll-dictated state 250ms after leave
  CARD_EXPANDED_AT_1900_PX: 312, // ~300-315px active width at 1900px viewport (~1.85x inactive)
  CARD_COLLAPSED_AT_1900_PX: 168, // ~160-170px inactive width at 1900px viewport
  CARD_GAP_PX: 16,
  INACTIVE_TOP_OFFSET_PX: 14,
} as const;

interface OrderedServiceEntry {
  service: ServiceItem;
  shape: ServiceShapeId;
  shortCardBullets: string[];
  displayTools: string[];
}

function buildOrderedServices(): OrderedServiceEntry[] {
  const ordered: OrderedServiceEntry[] = [];

  for (const cfg of SERVICE_STAGE_ORDER) {
    const found = servicesData.find((s) => s.slug === cfg.slug);
    if (!found) continue;

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

export default function ServicesGrid() {
  const router = useRouter();
  const entries = useMemo(() => buildOrderedServices(), []);

  const pinSectionRef = useRef<HTMLElement>(null);
  const mobileWrapperRef = useRef<HTMLElement>(null);
  const cardsViewportRef = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);

  const cardShellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indigoFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sweepGlowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inactiveNumberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inactiveBottomLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const halftoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const arrowWrapRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Staggered active-card content refs (fixed-width inner wrapper -> zero text reflow)
  const activeTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const activeDescRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const activeColumnsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeToolItemRefs = useRef<(HTMLDivElement | null)[][]>([]);

  // Shared master refs consumed by BOTH ServicesGrid & ServicesParticleCanvas
  const scrollProgressRef = useRef<number>(0);
  const hoverIndexRef = useRef<number | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Hover intent / leave timers & scroll-override suppression
  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLockedScrollStepRef = useRef<number>(0);
  const hoverSuppressedByScrollRef = useRef<boolean>(false);
  const rawPointedCardRef = useRef<number | null>(null);

  // React state for single-source-of-truth `activeIndex = hoverIndex ?? scrollIndex`
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex ?? scrollIndex;

  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [canHover, setCanHover] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [cardDims, setCardDims] = useState<{
    expandedW: number;
    collapsedW: number;
    gap: number;
  }>({
    expandedW: SERVICES_SECTION_TUNING.CARD_EXPANDED_AT_1900_PX,
    collapsedW: SERVICES_SECTION_TUNING.CARD_COLLAPSED_AT_1900_PX,
    gap: SERVICES_SECTION_TUNING.CARD_GAP_PX,
  });

  // Clear pending timers safely
  const clearHoverTimers = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
  }, []);

  // Viewport, hover capability & reduced-motion media queries
  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateFlags = () => {
      const vw = window.innerWidth;
      setIsDesktop(vw >= 1024);
      setCanHover(mqHover.matches);
      setReducedMotion(mqReduced.matches);

      const expandedW = Math.round(
        Math.max(
          268,
          Math.min(
            vw * 0.168,
            SERVICES_SECTION_TUNING.CARD_EXPANDED_AT_1900_PX + 28
          )
        )
      );
      const collapsedW = Math.round(
        Math.max(
          148,
          Math.min(
            vw * 0.09,
            SERVICES_SECTION_TUNING.CARD_COLLAPSED_AT_1900_PX + 16
          )
        )
      );
      setCardDims({
        expandedW,
        collapsedW,
        gap: vw >= 1440 ? SERVICES_SECTION_TUNING.CARD_GAP_PX : 13,
      });
    };

    updateFlags();
    window.addEventListener("resize", updateFlags);
    mqReduced.addEventListener("change", updateFlags);
    mqHover.addEventListener("change", updateFlags);

    return () => {
      window.removeEventListener("resize", updateFlags);
      mqReduced.removeEventListener("change", updateFlags);
      mqHover.removeEventListener("change", updateFlags);
      clearHoverTimers();
    };
  }, [clearHoverTimers]);

  // Smoothly scroll to a specific service step (used on mobile pills or coarse-pointer tap)
  const scrollToServiceStep = useCallback((stepIdx: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const targetP = STEP_HOLD_PROGRESS[stepIdx] ?? STEP_HOLD_PROGRESS[0];
    const targetScrollY = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  }, []);

  // Hover & Keyboard Focus Handlers (Section 6)
  const activateCardOverride = useCallback(
    (idx: number, immediate = false) => {
      clearHoverTimers();
      const apply = () => {
        const currentScrollIdx = evaluateServicesMasterTimeline(
          scrollProgressRef.current
        ).scrollIndex;
        hoverLockedScrollStepRef.current = currentScrollIdx;
        hoverIndexRef.current = idx;
        setHoverIndex(idx);
      };

      if (immediate) {
        apply();
      } else {
        hoverIntentTimerRef.current = setTimeout(
          apply,
          SERVICES_SECTION_TUNING.HOVER_INTENT_DELAY_MS
        );
      }
    },
    [clearHoverTimers]
  );

  const scheduleCardOverrideClear = useCallback(
    (delayMs: number = SERVICES_SECTION_TUNING.HOVER_LEAVE_DELAY_MS) => {
      clearHoverTimers();
      hoverLeaveTimerRef.current = setTimeout(() => {
        hoverIndexRef.current = null;
        setHoverIndex(null);
      }, delayMs);
    },
    [clearHoverTimers]
  );

  const handleCardPointerEnter = useCallback(
    (idx: number) => {
      if (!canHover || !isDesktop || reducedMotion) return;
      rawPointedCardRef.current = idx;
      if (hoverSuppressedByScrollRef.current) return;
      activateCardOverride(idx, false);
    },
    [activateCardOverride, canHover, isDesktop, reducedMotion]
  );

  const handleRowPointerMove = useCallback(
    (idx: number) => {
      if (!canHover || !isDesktop || reducedMotion) return;
      rawPointedCardRef.current = idx;
      if (hoverSuppressedByScrollRef.current) {
        hoverSuppressedByScrollRef.current = false;
        activateCardOverride(idx, false);
      }
    },
    [activateCardOverride, canHover, isDesktop, reducedMotion]
  );

  const handleCardPointerLeave = useCallback(
    (idx: number) => {
      if (rawPointedCardRef.current === idx) {
        rawPointedCardRef.current = null;
      }
    },
    []
  );

  const handleRowPointerLeave = useCallback(() => {
    rawPointedCardRef.current = null;
    hoverSuppressedByScrollRef.current = false;
    if (!canHover || !isDesktop || reducedMotion) return;
    scheduleCardOverrideClear(SERVICES_SECTION_TUNING.HOVER_LEAVE_DELAY_MS);
  }, [canHover, isDesktop, reducedMotion, scheduleCardOverrideClear]);

  const handleCardFocus = useCallback(
    (idx: number) => {
      if (!isDesktop || reducedMotion) return;
      hoverSuppressedByScrollRef.current = false;
      activateCardOverride(idx, true);
    },
    [activateCardOverride, isDesktop, reducedMotion]
  );

  const handleRowBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        scheduleCardOverrideClear(180);
      }
    },
    [scheduleCardOverrideClear]
  );

  // --------------------------------------------------------------------------
  // DESKTOP GSAP SCROLLTRIGGER PIN + UNIFIED SCROLL/HOVER RAF CHOREOGRAPHER
  // --------------------------------------------------------------------------
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
      snap: {
        snapTo: [...STEP_SNAP_POINTS],
        duration: { min: 0.22, max: 0.5 },
        delay: 0.16,
        ease: "power2.out",
        directional: false,
      },
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;

        // Rule 6.4: If scrolling moves to a different step while hovered, scroll wins!
        const liveScrollIdx = evaluateServicesMasterTimeline(
          self.progress
        ).scrollIndex;
        if (
          hoverIndexRef.current !== null &&
          liveScrollIdx !== hoverLockedScrollStepRef.current
        ) {
          clearHoverTimers();
          hoverSuppressedByScrollRef.current = true;
          hoverIndexRef.current = null;
          setHoverIndex(null);
        }
      },
    });
    scrollTriggerRef.current = st;

    let rafId = 0;
    let smoothP = scrollProgressRef.current;
    let lastReportedScrollIdx = -1;

    // Smoothed per-card weights (`0..1`) & row translation so hover AND scroll share identical fluid motion
    const liveWeights: number[] = entries.map((_, idx) => (idx === 0 ? 1 : 0));
    const prevWeights: number[] = [...liveWeights];
    let liveTrackX = 0;

    const applyChoreography = () => {
      rafId = requestAnimationFrame(applyChoreography);

      smoothP +=
        (scrollProgressRef.current - smoothP) * PARTICLE_TUNING.PROGRESS_LERP;

      const state = evaluateServicesMasterTimeline(smoothP);
      const { fromCardIndex, toCardIndex, cardTransitionT } = state;

      if (state.scrollIndex !== lastReportedScrollIdx) {
        lastReportedScrollIdx = state.scrollIndex;
        setScrollIndex(state.scrollIndex);
      }

      const { expandedW, collapsedW, gap } = cardDims;
      const currentHover = hoverIndexRef.current;
      const isScrollTrans = fromCardIndex !== toCardIndex;
      const easedScrollMove = easeInOutCubic(cardTransitionT);

      // Compute target per-card weights & target trackX from `activeIndex = hoverIndex ?? scrollIndex`
      const scrollTrackX = -(
        (isScrollTrans ? fromCardIndex : state.scrollIndex) *
          (collapsedW + gap) +
        (isScrollTrans ? easedScrollMove * (collapsedW + gap) : 0)
      );

      let targetTrackX = scrollTrackX;
      if (currentHover !== null) {
        // Keep hovered card stably under the cursor; only nudge left if its expanded width would clip off the right viewport edge
        const viewportW = cardsViewportRef.current?.clientWidth || 760;
        let leftBeforeHovered = 0;
        for (let j = 0; j < currentHover; j++) {
          leftBeforeHovered += collapsedW + gap;
        }
        const rightEdgeInViewport =
          leftBeforeHovered + expandedW + scrollTrackX;
        const overflowRight = rightEdgeInViewport - (viewportW - 24);
        if (overflowRight > 0) {
          targetTrackX = scrollTrackX - overflowRight;
        } else if (leftBeforeHovered + scrollTrackX < 0) {
          targetTrackX = -leftBeforeHovered;
        }
      }

      const lerpRate = currentHover !== null ? 0.13 : 0.24;
      liveTrackX += (targetTrackX - liveTrackX) * lerpRate;

      if (cardsTrackRef.current) {
        cardsTrackRef.current.style.transform = `translate3d(${liveTrackX.toFixed(
          2
        )}px, 0, 0)`;
      }

      for (let i = 0; i < entries.length; i++) {
        let targetW = 0;
        if (currentHover !== null) {
          targetW = i === currentHover ? 1 : 0;
        } else if (!isScrollTrans) {
          targetW = i === state.scrollIndex ? 1 : 0;
        } else if (i === fromCardIndex) {
          targetW = 1 - easedScrollMove;
        } else if (i === toCardIndex) {
          targetW = easedScrollMove;
        }

        prevWeights[i] = liveWeights[i];
        if (currentHover !== null || Math.abs(liveWeights[i] - targetW) > 0.002) {
          // Smooth blend when entering/leaving hover; tight follow during scroll scrub
          const wRate = currentHover !== null ? 0.14 : 0.26;
          liveWeights[i] += (targetW - liveWeights[i]) * wRate;
        } else {
          liveWeights[i] = targetW;
        }

        const w = Math.max(0, Math.min(1, liveWeights[i]));
        const deltaW = w - prevWeights[i];
        const isPointedInactive =
          rawPointedCardRef.current === i && w < 0.25;

        const widthPx = collapsedW + (expandedW - collapsedW) * w;
        const yOffsetPx =
          SERVICES_SECTION_TUNING.INACTIVE_TOP_OFFSET_PX * (1 - w);

        const shell = cardShellRefs.current[i];
        if (shell) {
          shell.style.width = `${widthPx.toFixed(1)}px`;
          shell.style.transform = `translate3d(0, ${yOffsetPx.toFixed(
            2
          )}px, 0)`;
          // Rule 6.6: Inactive hover lifts border to ~16% white
          if (w > 0.45) {
            shell.style.borderColor = `rgba(210, 206, 255, ${(
              0.12 +
              w * 0.14
            ).toFixed(3)})`;
          } else if (isPointedInactive) {
            shell.style.borderColor = "rgba(255, 255, 255, 0.17)";
          } else {
            shell.style.borderColor = "rgba(255, 255, 255, 0.07)";
          }
        }

        const indigoFill = indigoFillRefs.current[i];
        if (indigoFill) {
          indigoFill.style.opacity = w.toFixed(3);
        }

        // Diagonal top-left light-violet sweep overlay peaking mid-expansion
        const sweepEl = sweepGlowRefs.current[i];
        if (sweepEl) {
          const isExpanding = deltaW > 0.0005 || (isScrollTrans && i === toCardIndex);
          const sweepPeak = Math.sin(Math.PI * w) * (isExpanding ? 0.95 : 0.42);
          const sweepShift = (1 - w) * -28;
          sweepEl.style.opacity = sweepPeak.toFixed(3);
          sweepEl.style.transform = `translate3d(${sweepShift.toFixed(
            1
          )}px, ${sweepShift.toFixed(1)}px, 0)`;
        }

        // Collapsed card elements ("02"-"04", bottom caption, halftone dots)
        const inactiveAlpha = Math.max(0, 1 - w * 1.5);
        const numEl = inactiveNumberRefs.current[i];
        if (numEl) {
          numEl.style.opacity = inactiveAlpha.toFixed(3);
          numEl.style.transform = `translate3d(0, ${(-w * 8).toFixed(1)}px, 0)`;
        }

        const botLabelEl = inactiveBottomLabelRefs.current[i];
        if (botLabelEl) {
          botLabelEl.style.opacity = inactiveAlpha.toFixed(3);
        }

        const halftoneEl = halftoneRefs.current[i];
        if (halftoneEl) {
          const baseHalftone = isPointedInactive ? 1.0 : 0.78;
          halftoneEl.style.opacity = (inactiveAlpha * baseHalftone).toFixed(3);
        }

        // Arrow scale/opacity polish (smaller on inactive, full crisp size on active)
        const arrowEl = arrowWrapRefs.current[i];
        if (arrowEl) {
          const arrowScale = 0.86 + 0.14 * w;
          arrowEl.style.transform = `scale(${arrowScale.toFixed(3)})`;
          arrowEl.style.opacity = (0.72 + 0.28 * w).toFixed(3);
        }

        // Staggered inner content reveal (`cubic-bezier(0.22, 1, 0.36, 1)`)
        // When collapsing, content fades out fast in first ~35% BEFORE width finishes collapsing
        const isCollapsing = deltaW < -0.001 && targetW < 0.5;
        let tTitle = 0;
        let tDesc = 0;
        let tCols = 0;
        const slideSign = isCollapsing ? -1 : 1;

        if (isCollapsing) {
          const fastOut = Math.max(0, Math.min(1, (w - 0.58) / 0.42));
          tTitle = fastOut;
          tDesc = fastOut;
          tCols = fastOut;
        } else {
          const revealP = Math.max(0, (w - 0.22) / 0.78);
          tTitle = easeOutOdometer((revealP - 0.0) / 0.42);
          tDesc = easeOutOdometer((revealP - 0.14) / 0.46);
          tCols = easeOutOdometer((revealP - 0.28) / 0.48);
        }

        const titleEl = activeTitleRefs.current[i];
        if (titleEl) {
          titleEl.style.opacity = tTitle.toFixed(3);
          titleEl.style.transform = `translate3d(0, ${(
            (1 - tTitle) *
            8 *
            slideSign
          ).toFixed(1)}px, 0)`;
        }

        const descEl = activeDescRefs.current[i];
        if (descEl) {
          descEl.style.opacity = tDesc.toFixed(3);
          descEl.style.transform = `translate3d(0, ${(
            (1 - tDesc) *
            8 *
            slideSign
          ).toFixed(1)}px, 0)`;
        }

        const colsEl = activeColumnsRefs.current[i];
        if (colsEl) {
          colsEl.style.opacity = tCols.toFixed(3);
          colsEl.style.transform = `translate3d(0, ${(
            (1 - tCols) *
            10 *
            slideSign
          ).toFixed(1)}px, 0)`;
        }

        // Left-to-right staggered reveal on the 3x2 tool icons
        const toolNodes = activeToolItemRefs.current[i] || [];
        for (let k = 0; k < toolNodes.length; k++) {
          const node = toolNodes[k];
          if (!node) continue;
          let tIcon = 0;
          if (isCollapsing) {
            tIcon = Math.max(0, Math.min(1, (w - 0.62) / 0.38));
          } else {
            const revealP = Math.max(0, (w - 0.22) / 0.78);
            const delay = 0.36 + k * 0.065;
            tIcon = easeOutOdometer((revealP - delay) / Math.max(0.24, 1 - delay));
          }
          node.style.opacity = tIcon.toFixed(3);
          node.style.transform = `translate3d(${(
            (1 - tIcon) *
            6 *
            slideSign
          ).toFixed(1)}px, ${((1 - tIcon) * 4 * slideSign).toFixed(1)}px, 0)`;
        }
      }
    };

    rafId = requestAnimationFrame(applyChoreography);

    return () => {
      cancelAnimationFrame(rafId);
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [cardDims, clearHoverTimers, entries, isDesktop, reducedMotion]);

  // --------------------------------------------------------------------------
  // TABLET & MOBILE (< 1024px) SCROLL-SWITCHED STICKY STACK (No Hover Logic)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isDesktop || reducedMotion) return;
    const wrapperEl = mobileWrapperRef.current;
    if (!wrapperEl) return;

    hoverIndexRef.current = null;
    setHoverIndex(null);

    const st = ScrollTrigger.create({
      trigger: wrapperEl,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        const nextIdx = evaluateServicesMasterTimeline(
          self.progress
        ).scrollIndex;
        setScrollIndex((prev) => (prev === nextIdx ? prev : nextIdx));
      },
    });
    scrollTriggerRef.current = st;

    return () => {
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [isDesktop, reducedMotion]);

  // --------------------------------------------------------------------------
  // 1. REDUCED MOTION ACCESSIBLE FALLBACK (`prefers-reduced-motion: reduce`)
  //    No pinning, no morph animation -> static particle shape per service + vertical card list
  // --------------------------------------------------------------------------
  if (reducedMotion) {
    return (
      <section
        id="services"
        aria-labelledby="services-heading-reduced"
        style={{ backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG }}
        className="relative py-24 sm:py-28 text-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <h2
              id="services-heading-reduced"
              className="text-4xl sm:text-5xl font-medium tracking-tight leading-[1.08] text-white"
            >
              Our
              <br />
              Services
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-[280px] leading-relaxed">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          <div className="space-y-6">
            {entries.map((entry, idx) => (
              <article
                key={entry.service.id}
                aria-current={idx === 0 ? "true" : undefined}
                className="grid grid-cols-1 md:grid-cols-[240px_1fr] items-center gap-6 rounded-[22px] p-6 sm:p-8 border border-white/15 bg-gradient-to-br from-[#5650b8] to-[#4a45a6]"
              >
                <div className="relative h-44 w-full rounded-2xl bg-[#05050c]/75 border border-white/10 overflow-hidden">
                  <ServicesParticleCanvas
                    scrollProgressRef={scrollProgressRef}
                    layoutMode="mobile"
                    staticShape={entry.shape}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h3 className="text-xl font-medium text-white">
                        {entry.service.title}
                      </h3>
                      <Link
                        href={`/services/${entry.service.slug}`}
                        aria-label={`Explore ${entry.service.title}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span aria-hidden="true" className="text-lg leading-none">
                          ↗
                        </span>
                      </Link>
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed mb-5 max-w-2xl">
                      {entry.service.shortDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/15">
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
                      <div className="grid grid-cols-3 gap-2.5 max-w-[120px] text-white/95">
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // 2. TABLET & MOBILE (< 1024px) VERTICAL SCROLL-DRIVEN STACK
  //    Top ~40vh particle stage + single active card switching automatically on scroll
  // --------------------------------------------------------------------------
  if (!isDesktop) {
    const activeEntry = entries[scrollIndex] || entries[0];
    return (
      <section
        ref={mobileWrapperRef}
        id="services"
        aria-labelledby="services-heading-mobile"
        style={{
          backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG,
          height: "390vh",
        }}
        className="relative text-white"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 px-5 sm:px-8">
          {/* Deep Navy/Indigo Radial Glow behind Top 40vh Particle Stage */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[6%] left-1/2 -translate-x-1/2 w-[86vw] h-[40vh] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${SERVICES_SECTION_TUNING.RADIAL_GLOW_COLOR} 0%, rgba(20, 20, 68, 0.25) 55%, transparent 76%)`,
            }}
          />

          {/* Compact Header */}
          <div className="relative z-10 max-w-xl w-full mx-auto flex items-end justify-between gap-4">
            <h2
              id="services-heading-mobile"
              className="text-2xl sm:text-3xl font-medium tracking-tight leading-[1.08] text-white"
            >
              Our
              <br />
              Services
            </h2>
            <p className="text-[11px] sm:text-xs text-white/65 max-w-[230px] leading-relaxed">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          {/* ~38-40vh Particle Stage */}
          <div className="relative z-10 w-full h-[36vh] min-h-[210px] my-1">
            <ServicesParticleCanvas
              scrollProgressRef={scrollProgressRef}
              layoutMode="mobile"
              className="w-full h-full"
            />
          </div>

          {/* Step Indicator Rail (Optional tap scrolls smoothly to step) + Active Card */}
          <div className="relative z-10 max-w-xl w-full mx-auto">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {entries.map((entry, idx) => {
                const isSelected = idx === scrollIndex;
                return (
                  <button
                    key={entry.service.id}
                    type="button"
                    onClick={() => scrollToServiceStep(idx)}
                    aria-label={`Jump to service 0${idx + 1}: ${entry.service.title}`}
                    aria-current={isSelected ? "true" : undefined}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isSelected
                        ? "bg-[#5650b8] border-white/25 text-white font-semibold"
                        : "bg-[#0a0a0f] border-white/10 text-white/55"
                    }`}
                  >
                    0{idx + 1}
                  </button>
                );
              })}
            </div>

            <article
              key={activeEntry.service.id}
              aria-current="true"
              className="rounded-[20px] p-5 sm:p-6 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.55)] animate-[fadeIn_280ms_cubic-bezier(0.22,1,0.36,1)]"
              style={{
                background: `linear-gradient(150deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 100%)`,
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                  {activeEntry.service.title}
                </h3>
                <Link
                  href={`/services/${activeEntry.service.slug}`}
                  aria-label={`View ${activeEntry.service.title} page`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      d="M5 15L15 5M7 5h8v8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>

              <p className="text-xs text-white/85 leading-relaxed mb-4">
                {activeEntry.service.shortDesc}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/15">
                <div>
                  <div className="text-[11px] text-white/60 mb-1.5">
                    Services
                  </div>
                  <ul className="space-y-1 text-[11px] text-white/95">
                    {activeEntry.shortCardBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[11px] text-white/60 mb-1.5">Tools</div>
                  <div className="grid grid-cols-3 gap-2.5 max-w-[116px] text-white">
                    {activeEntry.displayTools.map((tool, tIdx) => (
                      <div
                        key={`${tool}-${tIdx}`}
                        title={tool}
                        className="w-6 h-6 flex items-center justify-center text-white/95"
                      >
                        {renderServiceToolIcon(tool)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // 3. DESKTOP (>= 1024px) PINNED HOVER + SCROLL PARTICLE-MORPH SECTION
  //    Single resolved state: `activeIndex = hoverIndex ?? scrollIndex`
  // --------------------------------------------------------------------------
  return (
    <section
      ref={pinSectionRef}
      id="services"
      aria-labelledby="services-heading-desktop"
      style={{ backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG }}
      className="relative w-full h-screen min-h-[660px] overflow-hidden text-white select-none"
    >
      {/* Left-Stage Soft Deep Navy / Indigo Radial Glow (~60% vh, centered on particle shape) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[4.5%] top-1/2 -translate-y-1/2 w-[38vw] max-w-[720px] h-[62vh] max-h-[640px] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${SERVICES_SECTION_TUNING.RADIAL_GLOW_COLOR} 0%, rgba(27, 27, 77, 0.32) 44%, rgba(5, 5, 12, 0) 74%)`,
          filter: "blur(32px)",
        }}
      />

      {/* Right-Half Header + Horizontal Portrait Cards Stage */}
      <div className="relative z-10 w-full h-full flex items-center">
        {/* Left ~44% Spacer reserved for the Particle Sphere / Shape Morph Stage */}
        <div className="w-[43%] xl:w-[45%] shrink-0 h-full pointer-events-none" />

        {/* Right ~55-57% Column: Header on top, Portrait Cards Row running off the right edge */}
        <div className="w-[57%] xl:w-[55%] h-full flex flex-col justify-end pb-[4.5vh] pt-[8vh]">
          {/* Header Row: Two-Line "Our Services" + Muted Intro Copy */}
          <div className="pr-8 lg:pr-14 xl:pr-20 mb-7 xl:mb-8 flex items-start justify-between gap-8 max-w-[760px]">
            <h2
              id="services-heading-desktop"
              className="text-[28px] xl:text-[35px] font-medium tracking-[-0.02em] leading-[1.08] text-white shrink-0"
            >
              Our
              <br />
              Services
            </h2>

            <p className="text-[12px] xl:text-[13px] text-white/65 leading-[1.58] max-w-[280px] pt-1 font-normal">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          {/* Horizontal Portrait Cards Viewport (Clips outgoing cards cleanly on the left; lets upcoming cards peek & crop at right viewport edge) */}
          <div
            ref={cardsViewportRef}
            onPointerLeave={handleRowPointerLeave}
            onBlur={handleRowBlur}
            className="relative w-full overflow-hidden pt-1 pb-2"
          >
            <div
              ref={cardsTrackRef}
              style={{ gap: `${cardDims.gap}px` }}
              className="flex items-start will-change-transform"
            >
              {entries.map((entry, idx) => {
                const isCurrentActive = activeIndex === idx;
                const indexNumber = String(idx + 1).padStart(2, "0");
                const serviceHref = `/services/${entry.service.slug}`;

                return (
                  <div
                    key={entry.service.id}
                    ref={(el) => {
                      cardShellRefs.current[idx] = el;
                    }}
                    role="link"
                    tabIndex={0}
                    aria-label={`${indexNumber} ${entry.service.title}`}
                    aria-current={isCurrentActive ? "true" : undefined}
                    onPointerEnter={() => handleCardPointerEnter(idx)}
                    onPointerMove={() => handleRowPointerMove(idx)}
                    onPointerLeave={() => handleCardPointerLeave(idx)}
                    onFocus={() => handleCardFocus(idx)}
                    onClick={() => {
                      if (!canHover && !isCurrentActive) {
                        scrollToServiceStep(idx);
                        return;
                      }
                      router.push(serviceHref);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(serviceHref);
                      }
                    }}
                    style={{
                      width:
                        idx === 0
                          ? `${cardDims.expandedW}px`
                          : `${cardDims.collapsedW}px`,
                      height: "clamp(380px, 57vh, 500px)",
                      backgroundColor: SERVICES_SECTION_TUNING.INACTIVE_CARD_BG,
                    }}
                    className="group/card relative shrink-0 rounded-[21px] border border-white/[0.07] overflow-hidden cursor-pointer select-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050c]"
                  >
                    {/* Faint Top-Left Sheen on Collapsed Near-Black Glassy Cards */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.015) 28%, transparent 56%)",
                      }}
                    />

                    {/* Inactive Card Decorative Bottom-Right Muted Indigo Halftone Dots */}
                    <div
                      ref={(el) => {
                        halftoneRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 transition-opacity duration-150"
                      style={{
                        opacity: idx === 0 ? 0 : 0.78,
                        backgroundImage:
                          "radial-gradient(circle, rgba(114, 108, 224, 0.5) 1.3px, transparent 1.45px)",
                        backgroundSize: "13px 13px",
                        maskImage:
                          "radial-gradient(circle at 92% 92%, black 0%, rgba(0,0,0,0.55) 36%, transparent 68%)",
                        WebkitMaskImage:
                          "radial-gradient(circle at 92% 92%, black 0%, rgba(0,0,0,0.55) 36%, transparent 68%)",
                      }}
                    />

                    {/* Active Indigo / Violet Fill (`#5650b8 -> #4a45a6`) */}
                    <div
                      ref={(el) => {
                        indigoFillRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        opacity: idx === 0 ? 1 : 0,
                        background: `linear-gradient(148deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 66%, #3f3a94 100%)`,
                      }}
                    />

                    {/* Diagonal Top-Left Light-Violet Sweep Overlay (Animates opacity & translate3d, never CSS gradient transition) */}
                    <div
                      ref={(el) => {
                        sweepGlowRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-8 will-change-transform"
                      style={{
                        opacity: 0,
                        background:
                          "linear-gradient(135deg, rgba(196, 190, 255, 0.65) 0%, rgba(130, 122, 238, 0.30) 38%, rgba(74, 69, 166, 0) 70%)",
                      }}
                    />

                    {/* Top-Right Thin Diagonal "↗" Arrow Link */}
                    <Link
                      ref={(el) => {
                        arrowWrapRefs.current[idx] = el;
                      }}
                      href={serviceHref}
                      tabIndex={-1}
                      aria-label={`Open ${entry.service.title} service page`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="group/arrow absolute top-5 right-5 z-30 w-8 h-8 rounded-lg flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white will-change-transform"
                    >
                      <svg
                        viewBox="0 0 22 22"
                        className="w-[17px] h-[17px] transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                      className="pointer-events-none absolute top-5 left-5 z-20 text-[20px] xl:text-[22px] font-medium tracking-tight text-white tabular-nums will-change-transform"
                    >
                      {indexNumber}
                    </span>

                    {/* Inactive Card Bottom-Left Service Caption */}
                    <div
                      ref={(el) => {
                        inactiveBottomLabelRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      style={{ opacity: idx === 0 ? 0 : 1 }}
                      className="pointer-events-none absolute bottom-5 left-5 right-4 z-20 text-[12.5px] font-medium text-white/85 truncate"
                    >
                      {entry.service.title}
                    </div>

                    {/* Fixed-Width Expanded Inner Content Wrapper (`overflow: hidden` on parent prevents ANY text reflow during width changes) */}
                    <div
                      style={{ width: `${cardDims.expandedW}px` }}
                      className="relative z-20 h-full p-6 pb-5 flex flex-col justify-between pointer-events-none"
                    >
                      {/* 1. Service Title (Top-Left, ~15-17px medium weight) */}
                      <div className="pr-10">
                        <h3
                          ref={(el) => {
                            activeTitleRefs.current[idx] = el;
                          }}
                          className="text-[16px] xl:text-[17px] font-medium tracking-tight text-white will-change-transform"
                        >
                          {entry.service.title}
                        </h3>
                      </div>

                      {/* 2. Short Description (Middle area, ~11px light slightly translucent white) */}
                      <div className="my-auto py-3 pr-2">
                        <p
                          ref={(el) => {
                            activeDescRefs.current[idx] = el;
                          }}
                          className="text-[11px] xl:text-[11.5px] leading-[1.6] text-white/85 font-light max-w-[258px] will-change-transform"
                        >
                          {entry.service.shortDesc}
                        </p>
                      </div>

                      {/* 3 & 4. Bottom Two Columns: "Services" List + "Tools" 3x2 Monoline Icon Grid */}
                      <div
                        ref={(el) => {
                          activeColumnsRefs.current[idx] = el;
                        }}
                        className="grid grid-cols-[1.25fr_1fr] gap-3.5 items-start pt-2 will-change-transform"
                      >
                        <div>
                          <div className="text-[10.5px] text-white/60 font-normal mb-2">
                            Services
                          </div>
                          <ul className="space-y-1.5 text-[10.5px] xl:text-[11px] leading-[1.35] text-white/95 font-normal">
                            {entry.shortCardBullets.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-[10.5px] text-white/60 font-normal mb-2">
                            Tools
                          </div>
                          <div className="grid grid-cols-3 gap-x-2.5 gap-y-2.5 max-w-[104px] text-white/95">
                            {entry.displayTools.map((tool, tIdx) => (
                              <div
                                key={`${tool}-${tIdx}`}
                                ref={(el) => {
                                  if (!activeToolItemRefs.current[idx]) {
                                    activeToolItemRefs.current[idx] = [];
                                  }
                                  activeToolItemRefs.current[idx][tIdx] = el;
                                }}
                                title={tool}
                                className="w-6 h-6 flex items-center justify-center will-change-transform"
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

      {/* Shared GPU Particle Morph Stage (`aria-hidden="true"`, driven by `scrollProgressRef` + `hoverIndexRef`) */}
      <ServicesParticleCanvas
        scrollProgressRef={scrollProgressRef}
        hoverIndexRef={hoverIndexRef}
        layoutMode="desktop"
        className="absolute inset-0 z-20 w-full h-full"
      />
    </section>
  );
}
