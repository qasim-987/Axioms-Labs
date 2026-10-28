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
  evaluateServicesMasterTimeline,
} from "./ServicesParticleCanvas";
import SplitTextReveal from "./SplitTextReveal";
import { renderServiceToolIcon } from "./ServiceToolIcons";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TUNABLE SECTION, CARD & HOVER CONSTANTS (Black & White + Antigravity Palette)
// ============================================================================
export const SERVICES_SECTION_TUNING = {
  SECTION_BG: "#FFFFFF", // Crisp Antigravity pure white surface
  ACTIVE_CARD_TOP: "#1A1B22", // Obsidian black top-left sheen
  ACTIVE_CARD_BOTTOM: "#121317", // Signature Antigravity `.card.dark` obsidian fill
  INACTIVE_CARD_BG: "#F8F9FC", // Cool alabaster surface-container (`--palette-grey-10`)
  SCROLL_VH_PER_STEP: 82, // Smooth 328vh pinned travel across 4 services (zero drag)
  HOVER_INTENT_DELAY_MS: 95, // Prevents flicker when sweeping across cards
  HOVER_LEAVE_DELAY_MS: 240, // Smoothly returns to scroll-dictated state after leave
  CARD_EXPANDED_AT_1900_PX: 324, // Active expanded card width (~1.85x inactive)
  CARD_COLLAPSED_AT_1900_PX: 172, // Collapsed card width
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
  const darkFillRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLockedScrollStepRef = useRef<number>(0);
  const hoverSuppressedByScrollRef = useRef<boolean>(false);
  const rawPointedCardRef = useRef<number | null>(null);

  // Single resolved active state: `activeIndex = hoverIndex ?? scrollIndex`
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
          276,
          Math.min(
            vw * 0.175,
            SERVICES_SECTION_TUNING.CARD_EXPANDED_AT_1900_PX + 24
          )
        )
      );
      const collapsedW = Math.round(
        Math.max(
          150,
          Math.min(
            vw * 0.092,
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

  const scrollToServiceStep = useCallback((stepIdx: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const targetP = STEP_HOLD_PROGRESS[stepIdx] ?? STEP_HOLD_PROGRESS[0];
    const targetScrollY = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  }, []);

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

  const handleCardPointerLeave = useCallback((idx: number) => {
    if (rawPointedCardRef.current === idx) {
      rawPointedCardRef.current = null;
    }
  }, []);

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
  // DESKTOP GSAP SCROLLTRIGGER PIN (scrub: 0.5, zero snap conflict with Lenis!)
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
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;

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

      const scrollTrackX = -(
        (isScrollTrans ? fromCardIndex : state.scrollIndex) *
          (collapsedW + gap) +
        (isScrollTrans ? easedScrollMove * (collapsedW + gap) : 0)
      );

      let targetTrackX = scrollTrackX;
      if (currentHover !== null) {
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

      const lerpRate = currentHover !== null ? 0.14 : 0.25;
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
        if (
          currentHover !== null ||
          Math.abs(liveWeights[i] - targetW) > 0.002
        ) {
          const wRate = currentHover !== null ? 0.14 : 0.26;
          liveWeights[i] += (targetW - liveWeights[i]) * wRate;
        } else {
          liveWeights[i] = targetW;
        }

        const w = Math.max(0, Math.min(1, liveWeights[i]));
        const deltaW = w - prevWeights[i];
        const isPointedInactive = rawPointedCardRef.current === i && w < 0.25;

        const widthPx = collapsedW + (expandedW - collapsedW) * w;
        const yOffsetPx =
          SERVICES_SECTION_TUNING.INACTIVE_TOP_OFFSET_PX * (1 - w);

        const shell = cardShellRefs.current[i];
        if (shell) {
          shell.style.width = `${widthPx.toFixed(1)}px`;
          shell.style.transform = `translate3d(0, ${yOffsetPx.toFixed(
            2
          )}px, 0)`;
          if (w > 0.45) {
            shell.style.borderColor = "rgba(18, 19, 23, 0.92)";
            shell.style.boxShadow = "0 24px 56px -14px rgba(18, 19, 23, 0.22)";
          } else if (isPointedInactive) {
            shell.style.borderColor = "rgba(49, 134, 255, 0.45)";
            shell.style.boxShadow = "0 16px 36px -12px rgba(49, 134, 255, 0.14)";
          } else {
            shell.style.borderColor = "rgba(33, 34, 38, 0.09)";
            shell.style.boxShadow = "0 4px 20px -6px rgba(18, 19, 23, 0.05)";
          }
        }

        const darkFill = darkFillRefs.current[i];
        if (darkFill) {
          darkFill.style.opacity = w.toFixed(3);
        }

        // Diagonal top-left Antigravity Electric Blue / Periwinkle light sweep peaking mid-expansion
        const sweepEl = sweepGlowRefs.current[i];
        if (sweepEl) {
          const isExpanding =
            deltaW > 0.0005 || (isScrollTrans && i === toCardIndex);
          const sweepPeak = Math.sin(Math.PI * w) * (isExpanding ? 0.92 : 0.35);
          const sweepShift = (1 - w) * -28;
          sweepEl.style.opacity = sweepPeak.toFixed(3);
          sweepEl.style.transform = `translate3d(${sweepShift.toFixed(
            1
          )}px, ${sweepShift.toFixed(1)}px, 0)`;
        }

        // Collapsed light card elements ("02"-"04", bottom caption, halftone dots)
        const inactiveAlpha = Math.max(0, 1 - w * 1.55);
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
          const baseHalftone = isPointedInactive ? 1.0 : 0.72;
          halftoneEl.style.opacity = (inactiveAlpha * baseHalftone).toFixed(3);
        }

        // Arrow badge color & scale transition (dark ink on light card -> crisp white on #121317 active card)
        const arrowEl = arrowWrapRefs.current[i];
        if (arrowEl) {
          const arrowScale = 0.88 + 0.12 * w;
          arrowEl.style.transform = `scale(${arrowScale.toFixed(3)})`;
          arrowEl.style.color = w > 0.45 ? "#FFFFFF" : "#121317";
          arrowEl.style.backgroundColor =
            w > 0.45
              ? "rgba(255, 255, 255, 0.10)"
              : "rgba(18, 19, 23, 0.05)";
        }

        // Staggered inner content reveal (`cubic-bezier(0.22, 1, 0.36, 1)`)
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
            tIcon = easeOutOdometer(
              (revealP - delay) / Math.max(0.24, 1 - delay)
            );
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

  // Tablet & Mobile (< 1024px) Scroll-Switched Sticky Stack
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
      scrub: 0.5,
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
  // 1. REDUCED MOTION ACCESSIBLE FALLBACK
  // --------------------------------------------------------------------------
  if (reducedMotion) {
    return (
      <section
        id="services"
        aria-labelledby="services-heading-reduced"
        className="relative py-24 sm:py-28 bg-[#FFFFFF] text-[#121317] border-t border-[#212226]/[0.07] overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <h2
              id="services-heading-reduced"
              className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-[#121317]"
            >
              Our <span className="text-[#3186FF]">Services</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#45474D] max-w-[300px] leading-relaxed">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          <div className="space-y-6">
            {entries.map((entry, idx) => (
              <article
                key={entry.service.id}
                aria-current={idx === 0 ? "true" : undefined}
                className="grid grid-cols-1 md:grid-cols-[240px_1fr] items-center gap-6 rounded-[24px] p-6 sm:p-8 border border-[#212226]/[0.1] bg-[#121317] text-white shadow-[0_20px_50px_rgba(18,19,23,0.12)]"
              >
                <div className="relative h-44 w-full rounded-2xl bg-[#FFFFFF] border border-white/10 overflow-hidden">
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
                      <h3 className="text-xl font-bold text-white">
                        {entry.service.title}
                      </h3>
                      <Link
                        href={`/services/${entry.service.slug}`}
                        aria-label={`Explore ${entry.service.title}`}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#3186FF] flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
                      >
                        <span aria-hidden="true" className="text-base leading-none">
                          ↗
                        </span>
                      </Link>
                    </div>
                    <p className="text-sm text-[#B2BBC5] leading-relaxed mb-5 max-w-2xl">
                      {entry.service.shortDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/10">
                    <div>
                      <div className="text-xs text-[#B2BBC5] mb-2">Services</div>
                      <ul className="space-y-1 text-xs text-white/95">
                        {entry.shortCardBullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-[#B2BBC5] mb-2">Tools</div>
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
  // --------------------------------------------------------------------------
  if (!isDesktop) {
    const activeEntry = entries[scrollIndex] || entries[0];
    return (
      <section
        ref={mobileWrapperRef}
        id="services"
        aria-labelledby="services-heading-mobile"
        style={{ height: "360vh" }}
        className="relative bg-[#FFFFFF] text-[#121317] border-t border-[#212226]/[0.07]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 px-5 sm:px-8">
          {/* Soft Antigravity Pastel Aura behind Top 40vh Particle Stage */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[6%] left-1/2 -translate-x-1/2 w-[86vw] h-[40vh] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(49, 134, 255, 0.14) 0%, rgba(183, 191, 217, 0.24) 52%, transparent 76%)",
            }}
          />

          <div className="relative z-10 max-w-xl w-full mx-auto flex items-end justify-between gap-4 pt-12">
            <h2
              id="services-heading-mobile"
              className="text-2xl sm:text-3xl font-bold tracking-tight leading-[1.08] text-[#121317]"
            >
              Our <span className="text-[#3186FF]">Services</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#45474D] max-w-[230px] leading-relaxed">
              Comprehensive digital solutions engineered for speed, clarity, and
              real-world impact.
            </p>
          </div>

          <div className="relative z-10 w-full h-[34vh] min-h-[200px] my-1">
            <ServicesParticleCanvas
              scrollProgressRef={scrollProgressRef}
              layoutMode="mobile"
              className="w-full h-full"
            />
          </div>

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
                    className={`py-1.5 px-2 rounded-full text-[11px] font-mono transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] ${
                      isSelected
                        ? "bg-[#121317] border-[#121317] text-white font-semibold shadow-sm"
                        : "bg-[#F8F9FC] border-[#212226]/[0.09] text-[#45474D]"
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
              className="rounded-[22px] p-5 sm:p-6 border border-[#212226]/[0.12] bg-[#121317] text-white shadow-[0_20px_50px_rgba(18,19,23,0.16)]"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeEntry.service.title}
                </h3>
                <Link
                  href={`/services/${activeEntry.service.slug}`}
                  aria-label={`View ${activeEntry.service.title} page`}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#3186FF] flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
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

              <p className="text-xs text-[#B2BBC5] leading-relaxed mb-4">
                {activeEntry.service.shortDesc}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/10">
                <div>
                  <div className="text-[11px] text-[#749BFF] font-mono uppercase tracking-wider mb-1.5">
                    Services
                  </div>
                  <ul className="space-y-1 text-[11px] text-white/95">
                    {activeEntry.shortCardBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[11px] text-[#749BFF] font-mono uppercase tracking-wider mb-1.5">
                    Tools
                  </div>
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
  // 3. DESKTOP (>= 1024px) PINNED ANTIMATTER CHOREOGRAPHY IN BLACK/WHITE/ANTIGRAVITY
  // --------------------------------------------------------------------------
  return (
    <section
      ref={pinSectionRef}
      id="services"
      aria-labelledby="services-heading-desktop"
      style={{ backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG }}
      className="relative w-full h-screen min-h-[660px] overflow-hidden text-[#121317] border-y border-[#212226]/[0.07] select-none"
    >
      {/* Subtle Precision Dot Grid matching Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(18, 19, 23, 0.8) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "radial-gradient(circle at 26% 52%, black 15%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle at 26% 52%, black 15%, transparent 72%)",
        }}
      />

      {/* Left-Stage Soft Antigravity Pastel & Electric Blue Radial Aura (~60% vh) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[3.5%] top-1/2 -translate-y-1/2 w-[39vw] max-w-[720px] h-[64vh] max-h-[660px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(49, 134, 255, 0.14) 0%, rgba(116, 155, 255, 0.10) 38%, rgba(239, 242, 247, 0.65) 64%, rgba(255, 255, 255, 0) 78%)",
          filter: "blur(38px)",
        }}
      />

      {/* Right-Half Header + Horizontal Portrait Cards Stage */}
      <div className="relative z-10 w-full h-full flex items-center">
        {/* Left ~43% Spacer reserved for the 3D Antigravity Particle Morph Stage */}
        <div className="w-[43%] xl:w-[44%] shrink-0 h-full pointer-events-none" />

        {/* Right ~56-57% Column */}
        <div className="w-[57%] xl:w-[56%] h-full flex flex-col justify-end pb-[5vh] pt-[10vh]">
          {/* Header Row: Character-Split "Our Services" + Muted Slate Intro Copy */}
          <div className="pr-8 lg:pr-14 xl:pr-20 mb-7 xl:mb-8 flex items-end justify-between gap-8 max-w-[780px]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-[11px] font-mono text-[#45474D] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
                <span>04 CORE CAPABILITIES</span>
              </div>
              <SplitTextReveal
                as="h2"
                text="Our Services"
                accentFromWordIndex={1}
                accentClassName="text-[#3186FF]"
                className="text-[32px] xl:text-[42px] font-bold tracking-[-0.025em] leading-[1.06] text-[#121317]"
              />
            </div>

            <p className="text-[12.5px] xl:text-[13.5px] text-[#45474D] leading-[1.6] max-w-[290px] pb-1 font-normal">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          {/* Horizontal Portrait Cards Viewport */}
          <div
            ref={cardsViewportRef}
            onPointerLeave={handleRowPointerLeave}
            onBlur={handleRowBlur}
            className="relative w-full overflow-hidden pt-1 pb-4"
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
                      height: "clamp(380px, 56vh, 496px)",
                      backgroundColor: SERVICES_SECTION_TUNING.INACTIVE_CARD_BG,
                    }}
                    className="group/card relative shrink-0 rounded-[24px] border border-[#212226]/[0.09] overflow-hidden cursor-pointer select-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFFF]"
                  >
                    {/* Inactive Card Decorative Bottom-Right Obsidian & Electric Blue Halftone Dot Matrix */}
                    <div
                      ref={(el) => {
                        halftoneRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 transition-opacity duration-150"
                      style={{
                        opacity: idx === 0 ? 0 : 0.72,
                        backgroundImage:
                          "radial-gradient(circle, rgba(49, 134, 255, 0.36) 1.35px, transparent 1.5px)",
                        backgroundSize: "13px 13px",
                        maskImage:
                          "radial-gradient(circle at 92% 92%, black 0%, rgba(0,0,0,0.55) 36%, transparent 68%)",
                        WebkitMaskImage:
                          "radial-gradient(circle at 92% 92%, black 0%, rgba(0,0,0,0.55) 36%, transparent 68%)",
                      }}
                    />

                    {/* Active Obsidian Black `.card.dark` Fill (`#1A1B22 -> #121317`) */}
                    <div
                      ref={(el) => {
                        darkFillRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        opacity: idx === 0 ? 1 : 0,
                        background: `linear-gradient(152deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 65%, #0D0E12 100%)`,
                      }}
                    />

                    {/* Subtle Ambient Electric Blue Corner Aura inside Active `#121317` Card */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-20 -right-16 w-52 h-52 rounded-full blur-3xl transition-opacity duration-300"
                      style={{
                        opacity: isCurrentActive ? 0.32 : 0,
                        background:
                          "radial-gradient(circle, rgba(49, 134, 255, 0.55) 0%, transparent 72%)",
                      }}
                    />

                    {/* Diagonal Top-Left Antigravity Electric Blue / Periwinkle Sweep Overlay */}
                    <div
                      ref={(el) => {
                        sweepGlowRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-8 will-change-transform"
                      style={{
                        opacity: 0,
                        background:
                          "linear-gradient(135deg, rgba(49, 134, 255, 0.42) 0%, rgba(116, 155, 255, 0.22) 38%, rgba(18, 19, 23, 0) 70%)",
                      }}
                    />

                    {/* Top-Right Circular "↗" Launch Badge */}
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
                      className="group/arrow absolute top-5 right-5 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 group-hover/card:!bg-[#3186FF] group-hover/card:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] will-change-transform"
                    >
                      <svg
                        viewBox="0 0 22 22"
                        className="w-[16px] h-[16px] transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>

                    {/* Inactive Card Top-Left Number ("02", "03", "04") in Crisp #121317 */}
                    <span
                      ref={(el) => {
                        inactiveNumberRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      style={{ opacity: idx === 0 ? 0 : 1 }}
                      className="pointer-events-none absolute top-5 left-5 z-20 text-[21px] xl:text-[23px] font-mono font-bold tracking-tight text-[#121317] tabular-nums will-change-transform"
                    >
                      {indexNumber}
                    </span>

                    {/* Inactive Card Bottom-Left Service Caption in #121317 / #45474D */}
                    <div
                      ref={(el) => {
                        inactiveBottomLabelRefs.current[idx] = el;
                      }}
                      aria-hidden="true"
                      style={{ opacity: idx === 0 ? 0 : 1 }}
                      className="pointer-events-none absolute bottom-5 left-5 right-4 z-20 text-[13px] font-semibold text-[#121317] truncate"
                    >
                      {entry.service.title}
                    </div>

                    {/* Fixed-Width Expanded Inner Content Wrapper (Zero text reflow during width changes) */}
                    <div
                      style={{ width: `${cardDims.expandedW}px` }}
                      className="relative z-20 h-full p-6 pb-6 flex flex-col justify-between pointer-events-none"
                    >
                      {/* 1. Service Index Pill + Title */}
                      <div className="pr-11">
                        <span className="inline-block text-[10.5px] font-mono uppercase tracking-widest text-[#749BFF] mb-1">
                          {indexNumber} / DISCIPLINE
                        </span>
                        <h3
                          ref={(el) => {
                            activeTitleRefs.current[idx] = el;
                          }}
                          className="text-[18px] xl:text-[19.5px] font-bold tracking-tight text-white will-change-transform"
                        >
                          {entry.service.title}
                        </h3>
                      </div>

                      {/* 2. Concise Description */}
                      <div className="my-auto py-3 pr-2">
                        <p
                          ref={(el) => {
                            activeDescRefs.current[idx] = el;
                          }}
                          className="text-[12px] xl:text-[12.5px] leading-[1.6] text-[#B2BBC5] font-normal max-w-[268px] will-change-transform"
                        >
                          {entry.service.shortDesc}
                        </p>
                      </div>

                      {/* 3 & 4. Bottom Two Columns: "Services" List + "Tools" 3x2 White Monoline Icon Grid */}
                      <div
                        ref={(el) => {
                          activeColumnsRefs.current[idx] = el;
                        }}
                        className="grid grid-cols-[1.28fr_1fr] gap-3.5 items-start pt-3 border-t border-white/10 will-change-transform"
                      >
                        <div>
                          <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#749BFF] mb-2">
                            Services
                          </div>
                          <ul className="space-y-1.5 text-[11px] xl:text-[11.5px] leading-[1.35] text-white/95 font-normal">
                            {entry.shortCardBullets.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#749BFF] mb-2">
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

      {/* Shared Black/White/Antigravity GPU Particle Morph Stage */}
      <ServicesParticleCanvas
        scrollProgressRef={scrollProgressRef}
        hoverIndexRef={hoverIndexRef}
        layoutMode="desktop"
        className="absolute inset-0 z-20 w-full h-full"
      />
    </section>
  );
}
