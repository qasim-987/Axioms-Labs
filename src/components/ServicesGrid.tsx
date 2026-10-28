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
  ServicesHoverBridge,
  evaluateServicesMasterTimeline,
} from "./ServicesParticleCanvas";
import SplitTextReveal from "./SplitTextReveal";
import { renderServiceToolIcon } from "./ServiceToolIcons";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TOP-LEVEL FEATURE & TUNING CONSTANTS
// ============================================================================

/**
 * When `false` (default), only one service card is visible at a time and
 * upcoming cards remain hidden (`opacity: 0; visibility: hidden; pointer-events: none`)
 * until the scroll transition slides them in.
 * Flip to `true` to show compact, non-overlapping upcoming preview tabs inside the viewport.
 */
export const SHOW_UPCOMING_PREVIEW: boolean = false;

export const SERVICES_SECTION_TUNING = {
  SHOW_UPCOMING_PREVIEW,
  SECTION_BG: "#FFFFFF", // Existing light theme background
  ACTIVE_CARD_TOP: "#1A1B22", // Existing near-black active card top sheen
  ACTIVE_CARD_BOTTOM: "#121317", // Existing near-black active card base
  INACTIVE_CARD_BG: "#F8F9FC", // Existing cool light surface for optional preview tabs
  SCROLL_VH_PER_STEP: 82, // 328vh smooth pinned travel across 4 services
  COMPACT_VIEWPORT_MAX_HEIGHT_PX: 700, // Compact mode when visible viewport height < 700px
  MIN_BOTTOM_PADDING_PX: 28, // Guaranteed 26-34px bottom clearance below active card
  HOVER_DEBOUNCE_LEAVE_MS: 60, // Anti-flicker micro-debounce on active-card leave
  PREVIEW_HOVER_INTENT_DELAY_MS: 100, // Preview-tab hover intent delay (when SHOW_UPCOMING_PREVIEW=true)
  PREVIEW_HOVER_LEAVE_DELAY_MS: 250, // Preview-tab return-to-scroll delay on leave
  HOVER_PULSE_STRENGTH: PARTICLE_TUNING.HOVER_PULSE_STRENGTH, // 0.36 (36% loosen + re-assemble)
  HOVER_PULSE_DURATION_MS: PARTICLE_TUNING.HOVER_PULSE_DURATION_MS, // 820ms breathing pulse
  HOVER_ROTATION_MULTIPLIER: PARTICLE_TUNING.HOVER_ROTATION_MULTIPLIER, // 1.5x spin while hovered
  HOVER_LEAVE_EASE_MS: PARTICLE_TUNING.HOVER_LEAVE_EASE_MS, // 500ms ease-back on leave
  REPEL_RADIUS_PX: PARTICLE_TUNING.REPEL_RADIUS_PX, // 112px cursor repel radius on left canvas
  COLLAPSED_LABEL_MIN_WIDTH_PX: 190, // Hide "DISCIPLINE" on preview tabs narrower than 190px
} as const;

interface OrderedServiceEntry {
  service: ServiceItem;
  shape: ServiceShapeId;
  normalBullets: string[]; // First 4 whole service items (normal viewports)
  compactBullets: string[]; // First 3 whole service items (compact < 700px viewports)
  displayTools: string[]; // Strictly 6 tool icons
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

    const titles = found.deliverables.map((d) => d.title);
    ordered.push({
      service: found,
      shape: cfg.shape,
      normalBullets: titles.slice(0, 4),
      compactBullets: titles.slice(0, 3),
      displayTools: baseTools,
    });
  }

  return ordered;
}

/**
 * Reads the real sticky navbar height from the DOM (or `--nav-h` CSS variable),
 * never relying on a hardcoded pixel constant.
 */
function getMeasuredNavHeight(): number {
  if (typeof window === "undefined") return 68;
  const navEl =
    document.querySelector<HTMLElement>('[data-site-navbar="true"]') ||
    document.querySelector<HTMLElement>("header");

  if (navEl) {
    const rectH = navEl.getBoundingClientRect().height;
    if (rectH > 0) {
      // Navbar transitions from `py-4` at scrollY <= 20 to `py-3.5` + 1px border (-3px)
      // when scrolled. Because #services pins well below scrollY = 20, compensate if
      // measured while still at the top of the page so pin alignment is pixel-exact.
      const unscrolledAtTop = window.scrollY <= 20;
      return Math.max(48, Math.round(unscrolledAtTop ? rectH - 3 : rectH));
    }
  }

  const varVal = parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
  );
  return Number.isFinite(varVal) && varVal > 0 ? Math.round(varVal) : 68;
}

interface StageLayoutMetrics {
  navH: number;
  isCompact: boolean;
  padTop: number;
  padBottom: number;
  cardH: number;
  expandedW: number;
  collapsedW: number;
  gap: number;
}

export default function ServicesGrid() {
  const router = useRouter();
  const entries = useMemo(() => buildOrderedServices(), []);

  const pinSectionRef = useRef<HTMLElement>(null);
  const mobileWrapperRef = useRef<HTMLElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const headerBlockRef = useRef<HTMLDivElement>(null);
  const cardsViewportRef = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const singleCardHitboxRef = useRef<HTMLDivElement>(null);

  const cardShellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerMeasureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeContentWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const collapsedOverlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const darkFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sweepGlowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const halftoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const arrowWrapRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const arrowIconRefs = useRef<(SVGSVGElement | null)[]>([]);
  const disciplineLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const activeTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const activeDescRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const activeColumnsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeToolItemRefs = useRef<(HTMLDivElement | null)[][]>([]);

  // Shared master refs consumed by BOTH ServicesGrid & ServicesParticleCanvas
  const scrollProgressRef = useRef<number>(0);
  const hoverBridgeRef = useRef<ServicesHoverBridge>({
    previewIndex: null,
    cardHovered: false,
    pulseSeq: 0,
  });
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardHoverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hoverLockedScrollStepRef = useRef<number>(0);
  const hoverSuppressedByScrollRef = useRef<boolean>(false);
  const rawPointedTabRef = useRef<number | null>(null);
  const isCardHoveredRef = useRef<boolean>(false);

  // Single source of truth: `activeIndex = hoverIndex ?? scrollIndex`
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const activeIndex = hoverIndex ?? scrollIndex;

  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [canHover, setCanHover] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [layout, setLayout] = useState<StageLayoutMetrics>({
    navH: 68,
    isCompact: false,
    padTop: 20,
    padBottom: 30,
    cardH: 440,
    expandedW: 384,
    collapsedW: 164,
    gap: 14,
  });

  // Last-resort proportional scale per card if content ever exceeds available inner height
  const [cardContentScales, setCardContentScales] = useState<number[]>([
    1, 1, 1, 1,
  ]);

  const clearAllHoverTimers = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    if (cardHoverDebounceRef.current) {
      clearTimeout(cardHoverDebounceRef.current);
      cardHoverDebounceRef.current = null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // DYNAMIC STAGE & CARD SIZING (`100dvh - navHeight` + Real Header Subtraction)
  // --------------------------------------------------------------------------
  const recomputeLayoutMetrics = useCallback(() => {
    if (typeof window === "undefined") return;

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const vw = window.visualViewport?.width || window.innerWidth;
    const vh = window.visualViewport?.height || window.innerHeight;
    const desktop = vw >= 1024;
    const compact =
      vh < SERVICES_SECTION_TUNING.COMPACT_VIEWPORT_MAX_HEIGHT_PX;
    const navH = getMeasuredNavHeight();

    setIsDesktop(desktop);
    setCanHover(mqHover.matches);
    setReducedMotion(mqReduced.matches);

    document.documentElement.style.setProperty("--nav-h", `${navH}px`);
    if (pinSectionRef.current) {
      pinSectionRef.current.style.setProperty("--section-nav-h", `${navH}px`);
    }
    if (mobileWrapperRef.current) {
      mobileWrapperRef.current.style.setProperty(
        "--section-nav-h",
        `${navH}px`
      );
    }

    if (!desktop) return;

    const usableH = Math.max(320, vh - navH);
    const padTop = compact
      ? 12
      : Math.round(Math.min(26, Math.max(16, usableH * 0.026)));
    const padBottom = compact
      ? 26
      : Math.round(
          Math.min(
            34,
            Math.max(
              SERVICES_SECTION_TUNING.MIN_BOTTOM_PADDING_PX,
              usableH * 0.038
            )
          )
        );

    let headerTotalH = compact ? 64 : 88;
    if (headerBlockRef.current) {
      const hRect = headerBlockRef.current.getBoundingClientRect();
      const hStyle = window.getComputedStyle(headerBlockRef.current);
      const mb = parseFloat(hStyle.marginBottom) || 0;
      if (hRect.height > 0) {
        headerTotalH = Math.ceil(hRect.height + mb);
      }
    }

    const availableForCard = Math.max(
      248,
      Math.floor(usableH - padTop - padBottom - headerTotalH)
    );
    const preferredMaxCardH = compact ? 404 : 472;
    const cardH = Math.min(preferredMaxCardH, availableForCard);

    const rightColTotalW =
      rightColRef.current?.clientWidth || Math.round(vw * 0.54);
    const rightMarginPx = Math.round(Math.min(56, Math.max(24, vw * 0.032)));
    const availRightW = Math.max(320, rightColTotalW - rightMarginPx);
    const gap = vw >= 1440 ? 14 : 11;

    let expandedW: number;
    let collapsedW: number;

    if (SHOW_UPCOMING_PREVIEW) {
      // Fit active card + 3 collapsed preview tabs strictly inside `availRightW` (zero right-edge crop)
      expandedW = Math.round(
        Math.max(292, Math.min(availRightW * 0.45, 368))
      );
      collapsedW = Math.round(
        Math.max(
          92,
          Math.min(196, Math.floor((availRightW - expandedW - 3 * gap) / 3))
        )
      );
    } else {
      // Single-card mode: comfortable readable portrait width with generous right breathing room
      expandedW = Math.round(
        Math.max(336, Math.min(vw * 0.235, availRightW - 16, 416))
      );
      collapsedW = 160;
    }

    setLayout((prev) => {
      if (
        prev.navH === navH &&
        prev.isCompact === compact &&
        prev.padTop === padTop &&
        prev.padBottom === padBottom &&
        prev.cardH === cardH &&
        prev.expandedW === expandedW &&
        prev.collapsedW === collapsedW &&
        prev.gap === gap
      ) {
        return prev;
      }
      return {
        navH,
        isCompact: compact,
        padTop,
        padBottom,
        cardH,
        expandedW,
        collapsedW,
        gap,
      };
    });

    // Tier-4 safety net: measure each card's natural intrinsic height vs `cardH`
    requestAnimationFrame(() => {
      const nextScales: number[] = [];
      let changed = false;
      for (let i = 0; i < entries.length; i++) {
        const el = cardInnerMeasureRefs.current[i];
        let s = 1;
        if (el && cardH > 0) {
          const prevHeight = el.style.height;
          const prevMinHeight = el.style.minHeight;
          el.style.height = "auto";
          el.style.minHeight = "0px";
          const naturalH = el.scrollHeight;
          el.style.height = prevHeight;
          el.style.minHeight = prevMinHeight;
          if (naturalH > cardH - 2) {
            s = Number(Math.max(0.76, (cardH - 2) / naturalH).toFixed(3));
          }
        }
        nextScales.push(s);
      }
      setCardContentScales((prev) => {
        for (let i = 0; i < nextScales.length; i++) {
          if (Math.abs((prev[i] ?? 1) - nextScales[i]) > 0.005) {
            changed = true;
            break;
          }
        }
        return changed ? nextScales : prev;
      });
    });
  }, [entries.length]);

  useEffect(() => {
    recomputeLayoutMetrics();

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    window.addEventListener("resize", recomputeLayoutMetrics);
    window.visualViewport?.addEventListener("resize", recomputeLayoutMetrics);
    mqReduced.addEventListener("change", recomputeLayoutMetrics);
    mqHover.addEventListener("change", recomputeLayoutMetrics);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        recomputeLayoutMetrics();
      });
      if (pinSectionRef.current) ro.observe(pinSectionRef.current);
      if (headerBlockRef.current) ro.observe(headerBlockRef.current);
      const navEl = document.querySelector<HTMLElement>(
        '[data-site-navbar="true"]'
      );
      if (navEl) ro.observe(navEl);
    }

    return () => {
      window.removeEventListener("resize", recomputeLayoutMetrics);
      window.visualViewport?.removeEventListener(
        "resize",
        recomputeLayoutMetrics
      );
      mqReduced.removeEventListener("change", recomputeLayoutMetrics);
      mqHover.removeEventListener("change", recomputeLayoutMetrics);
      ro?.disconnect();
      clearAllHoverTimers();
    };
  }, [clearAllHoverTimers, recomputeLayoutMetrics]);

  const scrollToServiceStep = useCallback((stepIdx: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const targetP = STEP_HOLD_PROGRESS[stepIdx] ?? STEP_HOLD_PROGRESS[0];
    const targetScrollY = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  }, []);

  // --------------------------------------------------------------------------
  // HOVER & KEYBOARD FOCUS HANDLERS (Single Source of Truth + Zero Flicker)
  // --------------------------------------------------------------------------
  const triggerVisibleCardHoverOn = useCallback(() => {
    if (cardHoverDebounceRef.current) {
      clearTimeout(cardHoverDebounceRef.current);
      cardHoverDebounceRef.current = null;
    }

    const currentScrollIdx = evaluateServicesMasterTimeline(
      scrollProgressRef.current
    ).scrollIndex;
    hoverLockedScrollStepRef.current = currentScrollIdx;

    const wasAlreadyHovered = isCardHoveredRef.current;
    isCardHoveredRef.current = true;
    setIsCardHovered(true);
    setHoverIndex(currentScrollIdx);

    hoverBridgeRef.current = {
      previewIndex: null,
      cardHovered: true,
      pulseSeq: wasAlreadyHovered
        ? hoverBridgeRef.current.pulseSeq
        : hoverBridgeRef.current.pulseSeq + 1,
    };
  }, []);

  const triggerVisibleCardHoverOff = useCallback((immediate = false) => {
    if (cardHoverDebounceRef.current) {
      clearTimeout(cardHoverDebounceRef.current);
      cardHoverDebounceRef.current = null;
    }

    const clear = () => {
      isCardHoveredRef.current = false;
      setIsCardHovered(false);
      setHoverIndex(null);
      hoverBridgeRef.current = {
        previewIndex: null,
        cardHovered: false,
        pulseSeq: hoverBridgeRef.current.pulseSeq,
      };
    };

    if (immediate) {
      clear();
    } else {
      cardHoverDebounceRef.current = setTimeout(
        clear,
        SERVICES_SECTION_TUNING.HOVER_DEBOUNCE_LEAVE_MS
      );
    }
  }, []);

  // Single-card stationary wrapper pointer/focus handlers (`SHOW_UPCOMING_PREVIEW === false`)
  const handleSingleSlotPointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch" || !canHover || !isDesktop) return;
      if (hoverSuppressedByScrollRef.current) return;
      triggerVisibleCardHoverOn();
    },
    [canHover, isDesktop, triggerVisibleCardHoverOn]
  );

  const handleSingleSlotPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch" || !canHover || !isDesktop) return;
      if (hoverSuppressedByScrollRef.current) {
        hoverSuppressedByScrollRef.current = false;
        triggerVisibleCardHoverOn();
      } else if (!isCardHoveredRef.current) {
        triggerVisibleCardHoverOn();
      }
    },
    [canHover, isDesktop, triggerVisibleCardHoverOn]
  );

  const handleSingleSlotPointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch") return;
      hoverSuppressedByScrollRef.current = false;
      triggerVisibleCardHoverOff(false);
    },
    [triggerVisibleCardHoverOff]
  );

  const handleSingleSlotFocus = useCallback(() => {
    if (!isDesktop) return;
    hoverSuppressedByScrollRef.current = false;
    triggerVisibleCardHoverOn();
  }, [isDesktop, triggerVisibleCardHoverOn]);

  const handleSingleSlotBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        triggerVisibleCardHoverOff(true);
      }
    },
    [triggerVisibleCardHoverOff]
  );

  // Preview-tab handlers (`SHOW_UPCOMING_PREVIEW === true`)
  const activatePreviewTab = useCallback(
    (idx: number, immediate = false) => {
      clearAllHoverTimers();
      const apply = () => {
        const currentScrollIdx = evaluateServicesMasterTimeline(
          scrollProgressRef.current
        ).scrollIndex;
        hoverLockedScrollStepRef.current = currentScrollIdx;
        const isSameAsScroll = idx === currentScrollIdx;
        const wasHovered = isCardHoveredRef.current;

        isCardHoveredRef.current = true;
        setIsCardHovered(true);
        setHoverIndex(idx);

        hoverBridgeRef.current = {
          previewIndex: isSameAsScroll ? null : idx,
          cardHovered: true,
          pulseSeq:
            isSameAsScroll && !wasHovered
              ? hoverBridgeRef.current.pulseSeq + 1
              : hoverBridgeRef.current.pulseSeq,
        };
      };

      if (immediate) {
        apply();
      } else {
        hoverIntentTimerRef.current = setTimeout(
          apply,
          SERVICES_SECTION_TUNING.PREVIEW_HOVER_INTENT_DELAY_MS
        );
      }
    },
    [clearAllHoverTimers]
  );

  const schedulePreviewTabClear = useCallback(
    (delayMs: number = SERVICES_SECTION_TUNING.PREVIEW_HOVER_LEAVE_DELAY_MS) => {
      clearAllHoverTimers();
      hoverLeaveTimerRef.current = setTimeout(() => {
        isCardHoveredRef.current = false;
        setIsCardHovered(false);
        setHoverIndex(null);
        hoverBridgeRef.current = {
          previewIndex: null,
          cardHovered: false,
          pulseSeq: hoverBridgeRef.current.pulseSeq,
        };
      }, delayMs);
    },
    [clearAllHoverTimers]
  );

  // --------------------------------------------------------------------------
  // DESKTOP GSAP SCROLLTRIGGER PIN (`top ${navHeight}px`, `100dvh - navHeight`)
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
      start: () => `top ${getMeasuredNavHeight()}px`,
      end: `+=${totalScrollVh}%`,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        const h = getMeasuredNavHeight();
        document.documentElement.style.setProperty("--nav-h", `${h}px`);
        sectionEl.style.setProperty("--section-nav-h", `${h}px`);
      },
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;

        const timeline = evaluateServicesMasterTimeline(self.progress);
        const liveScrollIdx = timeline.scrollIndex;
        const stepChanged = liveScrollIdx !== hoverLockedScrollStepRef.current;
        const enteredScrollTransition = timeline.cardTransitionT > 0.04;

        // Scroll always wins ONLY when the scroll step changes or enters a step transition
        // (tiny scroll ticks within the same hold step never clobber hover!)
        if (
          (isCardHoveredRef.current ||
            hoverBridgeRef.current.previewIndex !== null) &&
          (stepChanged || enteredScrollTransition)
        ) {
          clearAllHoverTimers();
          hoverSuppressedByScrollRef.current = true;
          isCardHoveredRef.current = false;
          setIsCardHovered(false);
          setHoverIndex(null);
          hoverBridgeRef.current = {
            previewIndex: null,
            cardHovered: false,
            pulseSeq: hoverBridgeRef.current.pulseSeq,
          };
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
    let liveHoverLift = 0;

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

      const { expandedW, collapsedW, gap } = layout;
      const previewIdx = hoverBridgeRef.current.previewIndex;
      const hoveredFlag = isCardHoveredRef.current;

      const targetLift = hoveredFlag ? 1 : 0;
      liveHoverLift += (targetLift - liveHoverLift) * 0.18;

      if (!SHOW_UPCOMING_PREVIEW) {
        // ====================================================================
        // SINGLE-CARD MODE (`SHOW_UPCOMING_PREVIEW === false`):
        // Only the active card is visible (`opacity: 1`). Upcoming cards stay
        // `opacity: 0; visibility: hidden; pointer-events: none` until scroll
        // transitions `fromCardIndex` out left and `toCardIndex` in from right.
        // ====================================================================
        const isScrollTrans =
          fromCardIndex !== toCardIndex && cardTransitionT > 0.001;
        const t = easeInOutCubic(cardTransitionT);

        for (let i = 0; i < entries.length; i++) {
          const shell = cardShellRefs.current[i];
          if (!shell) continue;

          let cardOpacity = 0;
          let slideX = 0;
          let cardScale = 1;
          let revealWeight = 0;
          let sweepAmount = 0;

          if (!isScrollTrans) {
            if (i === state.scrollIndex) {
              cardOpacity = 1;
              slideX = 0;
              cardScale = 1;
              revealWeight = 1;
              sweepAmount = liveHoverLift * 0.34;
            }
          } else if (i === fromCardIndex) {
            cardOpacity = Math.max(
              0,
              1 - easeInOutCubic(Math.min(1, cardTransitionT * 1.16))
            );
            slideX = -t * 82;
            cardScale = 1 - t * 0.032;
            revealWeight = 1 - t * 0.45;
            sweepAmount = Math.sin(Math.PI * t) * 0.25;
          } else if (i === toCardIndex) {
            cardOpacity = easeInOutCubic(
              Math.max(0, (cardTransitionT - 0.05) / 0.95)
            );
            slideX = (1 - t) * 82;
            cardScale = 0.968 + t * 0.032;
            revealWeight = t;
            sweepAmount = Math.sin(Math.PI * t) * 0.85;
          }

          const isVisible = cardOpacity > 0.004;
          const isPrimaryInteractive =
            !isScrollTrans
              ? i === state.scrollIndex
              : cardTransitionT < 0.5
              ? i === fromCardIndex
              : i === toCardIndex;

          const liftY =
            isPrimaryInteractive && !isScrollTrans ? -4 * liveHoverLift : 0;

          shell.style.visibility = isVisible ? "visible" : "hidden";
          shell.style.opacity = cardOpacity.toFixed(3);
          shell.style.pointerEvents = isPrimaryInteractive ? "auto" : "none";
          shell.style.zIndex = isPrimaryInteractive ? "20" : "10";
          shell.style.transform = `translate3d(${slideX.toFixed(
            2
          )}px, ${liftY.toFixed(2)}px, 0) scale(${cardScale.toFixed(4)})`;

          if (liveHoverLift > 0.05 && isPrimaryInteractive) {
            shell.style.borderColor = `rgba(49, 134, 255, ${(
              0.18 +
              liveHoverLift * 0.42
            ).toFixed(2)})`;
            shell.style.boxShadow =
              "0 30px 66px -12px rgba(18, 19, 23, 0.34), 0 10px 28px -8px rgba(49, 134, 255, 0.20)";
          } else {
            shell.style.borderColor = "rgba(18, 19, 23, 0.92)";
            shell.style.boxShadow =
              "0 20px 48px -14px rgba(18, 19, 23, 0.20)";
          }

          const sweepEl = sweepGlowRefs.current[i];
          if (sweepEl) {
            sweepEl.style.opacity = sweepAmount.toFixed(3);
            sweepEl.style.transform = `translate3d(${(
              (1 - revealWeight) *
              -20
            ).toFixed(1)}px, 0, 0)`;
          }

          // Hover reactions on arrow button, discipline label & 6 tool icons
          const isHoveredActiveCard = isPrimaryInteractive && hoveredFlag;
          const arrowEl = arrowWrapRefs.current[i];
          if (arrowEl) {
            arrowEl.style.backgroundColor = isHoveredActiveCard
              ? "#3186FF"
              : "rgba(255, 255, 255, 0.10)";
            arrowEl.style.color = "#FFFFFF";
            arrowEl.style.transform = isHoveredActiveCard
              ? "scale(1.06)"
              : "scale(1)";
          }

          const arrowSvg = arrowIconRefs.current[i];
          if (arrowSvg) {
            arrowSvg.style.transform = isHoveredActiveCard
              ? "translate3d(2.5px, -2.5px, 0)"
              : "translate3d(0, 0, 0)";
          }

          const discLabel = disciplineLabelRefs.current[i];
          if (discLabel) {
            discLabel.style.color = isHoveredActiveCard ? "#A8C7FA" : "#749BFF";
            discLabel.style.opacity = isHoveredActiveCard ? "1" : "0.9";
          }

          // Subtle staggered entrance during scroll transitions + stagger "pop" on hover
          const settleT = isScrollTrans && i === toCardIndex ? easeOutOdometer(Math.max(0, (t - 0.12) / 0.88)) : 1;
          const titleEl = activeTitleRefs.current[i];
          if (titleEl) {
            titleEl.style.opacity = settleT.toFixed(3);
            titleEl.style.transform = `translate3d(0, ${(
              (1 - settleT) *
              8
            ).toFixed(1)}px, 0)`;
          }
          const descEl = activeDescRefs.current[i];
          if (descEl) {
            descEl.style.opacity = settleT.toFixed(3);
            descEl.style.transform = `translate3d(0, ${(
              (1 - settleT) *
              8
            ).toFixed(1)}px, 0)`;
          }
          const colsEl = activeColumnsRefs.current[i];
          if (colsEl) {
            colsEl.style.opacity = settleT.toFixed(3);
            colsEl.style.transform = `translate3d(0, ${(
              (1 - settleT) *
              10
            ).toFixed(1)}px, 0)`;
          }

          const toolNodes = activeToolItemRefs.current[i] || [];
          for (let k = 0; k < toolNodes.length; k++) {
            const node = toolNodes[k];
            if (!node) continue;
            node.style.opacity = settleT.toFixed(3);
            node.style.transitionDelay = isHoveredActiveCard
              ? `${k * 36}ms`
              : `${(toolNodes.length - 1 - k) * 20}ms`;
            node.style.transform = isHoveredActiveCard
              ? "translate3d(0, -2.5px, 0) scale(1.15)"
              : "translate3d(0, 0, 0) scale(1)";
          }
        }
        return;
      }

      // ======================================================================
      // OPTIONAL PREVIEW-TABS MODE (`SHOW_UPCOMING_PREVIEW === true`):
      // Fits all 4 cards inside the viewport with non-overlapping flex headers.
      // ======================================================================
      const isScrollTrans = fromCardIndex !== toCardIndex;
      const easedScrollMove = easeInOutCubic(cardTransitionT);

      // Keep all 4 cards inside the right column without cropping at the right edge
      const targetTrackX = 0;
      liveTrackX += (targetTrackX - liveTrackX) * 0.2;
      if (cardsTrackRef.current) {
        cardsTrackRef.current.style.transform = `translate3d(${liveTrackX.toFixed(
          2
        )}px, 0, 0)`;
      }

      const resolvedActive = previewIdx ?? state.scrollIndex;

      for (let i = 0; i < entries.length; i++) {
        let targetW = 0;
        if (previewIdx !== null) {
          targetW = i === previewIdx ? 1 : 0;
        } else if (!isScrollTrans) {
          targetW = i === state.scrollIndex ? 1 : 0;
        } else if (i === fromCardIndex) {
          targetW = 1 - easedScrollMove;
        } else if (i === toCardIndex) {
          targetW = easedScrollMove;
        }

        prevWeights[i] = liveWeights[i];
        const wRate = previewIdx !== null ? 0.16 : 0.24;
        liveWeights[i] += (targetW - liveWeights[i]) * wRate;
        const w = Math.max(0, Math.min(1, liveWeights[i]));
        const deltaW = w - prevWeights[i];

        const widthPx = collapsedW + (expandedW - collapsedW) * w;
        const isHoveredActive = i === resolvedActive && hoveredFlag && w > 0.7;
        const liftY = isHoveredActive ? -4 * liveHoverLift : (1 - w) * 8;
        const isPointedCollapsed = rawPointedTabRef.current === i && w < 0.25;

        const shell = cardShellRefs.current[i];
        if (shell) {
          shell.style.width = `${widthPx.toFixed(1)}px`;
          shell.style.transform = `translate3d(0, ${liftY.toFixed(2)}px, 0)`;
          if (w > 0.45) {
            shell.style.borderColor = isHoveredActive
              ? "rgba(49, 134, 255, 0.52)"
              : "rgba(18, 19, 23, 0.92)";
            shell.style.boxShadow = isHoveredActive
              ? "0 28px 62px -12px rgba(18, 19, 23, 0.32)"
              : "0 20px 48px -14px rgba(18, 19, 23, 0.20)";
          } else if (isPointedCollapsed) {
            shell.style.borderColor = "rgba(49, 134, 255, 0.45)";
            shell.style.boxShadow = "0 14px 32px -12px rgba(49, 134, 255, 0.14)";
          } else {
            shell.style.borderColor = "rgba(33, 34, 38, 0.09)";
            shell.style.boxShadow = "0 4px 18px -6px rgba(18, 19, 23, 0.05)";
          }
        }

        const darkFill = darkFillRefs.current[i];
        if (darkFill) darkFill.style.opacity = w.toFixed(3);

        const sweepEl = sweepGlowRefs.current[i];
        if (sweepEl) {
          const isExpanding = deltaW > 0.0005;
          const sweepPeak = Math.sin(Math.PI * w) * (isExpanding ? 0.9 : 0.3);
          sweepEl.style.opacity = sweepPeak.toFixed(3);
        }

        const inactiveAlpha = Math.max(0, 1 - w * 1.85);
        const collapsedEl = collapsedOverlayRefs.current[i];
        if (collapsedEl) {
          collapsedEl.style.opacity = inactiveAlpha.toFixed(3);
          collapsedEl.style.visibility =
            inactiveAlpha > 0.02 ? "visible" : "hidden";
        }

        const halftoneEl = halftoneRefs.current[i];
        if (halftoneEl) {
          halftoneEl.style.opacity = (inactiveAlpha * 0.72).toFixed(3);
        }

        const activeWrap = activeContentWrapRefs.current[i];
        if (activeWrap) {
          const activeAlpha = Math.max(0, Math.min(1, (w - 0.28) / 0.72));
          activeWrap.style.opacity = activeAlpha.toFixed(3);
          activeWrap.style.visibility =
            activeAlpha > 0.02 ? "visible" : "hidden";
        }

        const arrowEl = arrowWrapRefs.current[i];
        if (arrowEl) {
          arrowEl.style.backgroundColor = isHoveredActive
            ? "#3186FF"
            : "rgba(255, 255, 255, 0.10)";
          arrowEl.style.color = "#FFFFFF";
        }

        const arrowSvg = arrowIconRefs.current[i];
        if (arrowSvg) {
          arrowSvg.style.transform = isHoveredActive
            ? "translate3d(2.5px, -2.5px, 0)"
            : "translate3d(0, 0, 0)";
        }

        const discLabel = disciplineLabelRefs.current[i];
        if (discLabel) {
          discLabel.style.color = isHoveredActive ? "#A8C7FA" : "#749BFF";
        }

        const toolNodes = activeToolItemRefs.current[i] || [];
        for (let k = 0; k < toolNodes.length; k++) {
          const node = toolNodes[k];
          if (!node) continue;
          node.style.transitionDelay = isHoveredActive ? `${k * 36}ms` : "0ms";
          node.style.transform = isHoveredActive
            ? "translate3d(0, -2.5px, 0) scale(1.15)"
            : "translate3d(0, 0, 0) scale(1)";
        }
      }
    };

    rafId = requestAnimationFrame(applyChoreography);

    return () => {
      cancelAnimationFrame(rafId);
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [clearAllHoverTimers, entries, isDesktop, layout, reducedMotion]);

  // Tablet & Mobile (< 1024px) Scroll-Switched Sticky Stack
  useEffect(() => {
    if (isDesktop || reducedMotion) return;
    const wrapperEl = mobileWrapperRef.current;
    if (!wrapperEl) return;

    isCardHoveredRef.current = false;
    setIsCardHovered(false);
    setHoverIndex(null);

    const st = ScrollTrigger.create({
      trigger: wrapperEl,
      start: () => `top ${getMeasuredNavHeight()}px`,
      end: "bottom bottom",
      scrub: 0.5,
      invalidateOnRefresh: true,
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
  // 1. REDUCED MOTION ACCESSIBLE VIEW (Color/Shadow Hover Only — Zero Pulse/Repel)
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
                className="group/reduced grid grid-cols-1 md:grid-cols-[240px_1fr] items-center gap-6 rounded-[24px] p-6 sm:p-8 border border-[#212226]/[0.1] hover:border-[#3186FF]/55 focus-within:border-[#3186FF]/65 bg-[#121317] text-white shadow-[0_20px_50px_rgba(18,19,23,0.12)] hover:shadow-[0_26px_60px_rgba(18,19,23,0.24)] transition-[border-color,box-shadow] duration-200"
              >
                <div className="relative h-44 w-full rounded-2xl bg-[#FFFFFF] border border-white/10 overflow-hidden">
                  <ServicesParticleCanvas
                    scrollProgressRef={scrollProgressRef}
                    layoutMode="mobile"
                    staticShape={entry.shape}
                    className="w-full h-full pointer-events-none"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <span className="block text-[10.5px] font-mono uppercase tracking-widest text-[#749BFF] group-hover/reduced:text-[#A8C7FA] transition-colors mb-1">
                          {String(idx + 1).padStart(2, "0")} / DISCIPLINE
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          {entry.service.title}
                        </h3>
                      </div>
                      <Link
                        href={`/services/${entry.service.slug}`}
                        aria-label={`Explore ${entry.service.title}`}
                        className="w-9 h-9 rounded-full bg-white/10 group-hover/reduced:bg-[#3186FF] hover:bg-[#3186FF] flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
                      >
                        <span
                          aria-hidden="true"
                          className="text-base leading-none"
                        >
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
                      <div className="text-xs font-mono uppercase tracking-wider text-[#749BFF] mb-2">
                        Services
                      </div>
                      <ul className="space-y-1 text-xs text-white/95">
                        {entry.normalBullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-[#749BFF] mb-2">
                        Tools
                      </div>
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
  // 2. TABLET & MOBILE (< 1024px) VERTICAL SCROLL-DRIVEN STACK (`100dvh - navHeight`)
  // --------------------------------------------------------------------------
  if (!isDesktop) {
    const activeEntry = entries[scrollIndex] || entries[0];
    return (
      <section
        ref={mobileWrapperRef}
        id="services"
        aria-labelledby="services-heading-mobile"
        style={{ height: "340vh" }}
        className="relative bg-[#FFFFFF] text-[#121317] border-t border-[#212226]/[0.07]"
      >
        <div className="sticky services-mobile-sticky w-full overflow-hidden flex flex-col justify-between py-4 px-5 sm:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[6%] left-1/2 -translate-x-1/2 w-[86vw] h-[36vh] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(49, 134, 255, 0.14) 0%, rgba(183, 191, 217, 0.24) 52%, transparent 76%)",
            }}
          />

          <div className="relative z-10 max-w-xl w-full mx-auto flex items-end justify-between gap-4 pt-2 shrink-0">
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

          <div className="relative z-10 w-full flex-1 min-h-[150px] max-h-[32vh] my-1">
            <ServicesParticleCanvas
              scrollProgressRef={scrollProgressRef}
              layoutMode="mobile"
              className="w-full h-full pointer-events-none"
            />
          </div>

          <div className="relative z-10 max-w-xl w-full mx-auto shrink-0 pb-2">
            <div className="grid grid-cols-4 gap-2 mb-2.5">
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
              className="rounded-[22px] p-4 sm:p-5 border border-[#212226]/[0.12] bg-[#121317] text-white shadow-[0_20px_50px_rgba(18,19,23,0.16)]"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#749BFF] mb-0.5">
                    0{scrollIndex + 1} / DISCIPLINE
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {activeEntry.service.title}
                  </h3>
                </div>
                <Link
                  href={`/services/${activeEntry.service.slug}`}
                  aria-label={`View ${activeEntry.service.title} page`}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#3186FF] flex items-center justify-center text-white shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
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

              <p className="text-xs text-[#B2BBC5] leading-relaxed mb-3 line-clamp-3">
                {activeEntry.service.shortDesc}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <div className="text-[10.5px] text-[#749BFF] font-mono uppercase tracking-wider mb-1.5">
                    Services
                  </div>
                  <ul className="space-y-1 text-[11px] text-white/95">
                    {activeEntry.compactBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[10.5px] text-[#749BFF] font-mono uppercase tracking-wider mb-1.5">
                    Tools
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-w-[110px] text-white">
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
  // 3. DESKTOP (>= 1024px) PINNED STAGE (`100dvh - navHeight` Flush Below Navbar)
  // --------------------------------------------------------------------------
  const showCollapsedSubLabel =
    layout.collapsedW >= SERVICES_SECTION_TUNING.COLLAPSED_LABEL_MIN_WIDTH_PX;

  return (
    <section
      ref={pinSectionRef}
      id="services"
      aria-labelledby="services-heading-desktop"
      style={
        {
          backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG,
          "--section-nav-h": `${layout.navH}px`,
        } as React.CSSProperties
      }
      className="services-pinned-stage relative w-full overflow-hidden text-[#121317] border-y border-[#212226]/[0.07] select-none"
    >
      {/* Subtle Precision Dot Grid (strictly pointer-events-none) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(18, 19, 23, 0.8) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "radial-gradient(circle at 24% 50%, black 15%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle at 24% 50%, black 15%, transparent 72%)",
        }}
      />

      {/* Left-Stage Soft Accent Aura (rises subtly when card is hovered; pointer-events-none) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[2.5%] top-1/2 -translate-y-1/2 w-[40vw] max-w-[700px] h-[66%] max-h-[580px] rounded-full transition-opacity duration-500"
        style={{
          opacity: isCardHovered ? 1 : 0.72,
          background: isCardHovered
            ? "radial-gradient(circle at 50% 50%, rgba(49, 134, 255, 0.24) 0%, rgba(116, 155, 255, 0.16) 40%, rgba(239, 242, 247, 0.65) 66%, rgba(255, 255, 255, 0) 80%)"
            : "radial-gradient(circle at 50% 50%, rgba(49, 134, 255, 0.13) 0%, rgba(116, 155, 255, 0.09) 38%, rgba(239, 242, 247, 0.6) 64%, rgba(255, 255, 255, 0) 78%)",
          filter: "blur(36px)",
        }}
      />

      {/* Two-Column Stage Inside `100dvh - navHeight` */}
      <div className="relative z-10 w-full h-full flex items-stretch min-h-0">
        {/* LEFT COLUMN (~45%): Dedicated Interactive Particle Canvas Stage (receives real pointer events for repulsion!) */}
        <div className="relative w-[45%] xl:w-[46%] shrink-0 h-full pointer-events-auto">
          <ServicesParticleCanvas
            scrollProgressRef={scrollProgressRef}
            hoverBridgeRef={hoverBridgeRef}
            layoutMode="desktop"
            className="w-full h-full pointer-events-auto"
          />
        </div>

        {/* RIGHT COLUMN (~55%): Header Block + Sized Card Stage (fits inside `100dvh - navHeight` with 26-34px bottom padding) */}
        <div
          ref={rightColRef}
          style={{
            paddingTop: `${layout.padTop}px`,
            paddingBottom: `${layout.padBottom}px`,
          }}
          className="w-[55%] xl:w-[54%] h-full min-h-0 flex flex-col justify-center pr-6 lg:pr-10 xl:pr-14"
        >
          <div className="w-full max-h-full min-h-0 flex flex-col">
            {/* 1. Section Header Block (shrink-0) */}
            <div
              ref={headerBlockRef}
              className={`shrink-0 flex items-end justify-between gap-6 max-w-[760px] ${
                layout.isCompact ? "mb-3" : "mb-[clamp(14px,2dvh,22px)]"
              }`}
            >
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] font-mono text-[#45474D] ${
                    layout.isCompact
                      ? "px-2.5 py-0.5 text-[10px] mb-1.5"
                      : "px-3 py-1 text-[10.5px] mb-2"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
                  <span>04 CORE CAPABILITIES</span>
                </div>
                <SplitTextReveal
                  as="h2"
                  text="Our Services"
                  accentFromWordIndex={1}
                  accentClassName="text-[#3186FF]"
                  className={
                    layout.isCompact
                      ? "text-[clamp(24px,3.6dvh,28px)] font-bold tracking-[-0.025em] leading-[1.06] text-[#121317]"
                      : "text-[clamp(28px,3.9dvh,40px)] font-bold tracking-[-0.025em] leading-[1.06] text-[#121317]"
                  }
                />
              </div>

              <p
                className={`text-[#45474D] max-w-[285px] pb-0.5 font-normal ${
                  layout.isCompact
                    ? "text-[11.5px] leading-[1.45]"
                    : "text-[clamp(12px,1.5dvh,13.5px)] leading-[1.55]"
                }`}
              >
                We offer comprehensive digital solutions that transform your
                business and drive innovation across every touchpoint.
              </p>
            </div>

            {/* 2. Card Stage Area (sized strictly from remaining space; clips horizontal slide only) */}
            <div
              ref={cardsViewportRef}
              style={{ height: `${layout.cardH}px` }}
              onPointerLeave={
                SHOW_UPCOMING_PREVIEW
                  ? () => {
                      rawPointedTabRef.current = null;
                      hoverSuppressedByScrollRef.current = false;
                      if (canHover) schedulePreviewTabClear();
                    }
                  : undefined
              }
              onBlur={
                SHOW_UPCOMING_PREVIEW
                  ? (e) => {
                      if (
                        !e.currentTarget.contains(
                          e.relatedTarget as Node | null
                        )
                      ) {
                        schedulePreviewTabClear(160);
                      }
                    }
                  : undefined
              }
              className="relative shrink-0 w-full [overflow-x:clip] overflow-y-visible"
            >
              {!SHOW_UPCOMING_PREVIEW ? (
                /* ============================================================
                   DEFAULT SINGLE-CARD STAGE (`SHOW_UPCOMING_PREVIEW === false`)
                   Stationary outer wrapper handles pointerenter/leave/focus so
                   card lift (-4px) and slide transitions NEVER cause hover flicker.
                   ============================================================ */
                <div
                  ref={singleCardHitboxRef}
                  style={{
                    width: `${layout.expandedW}px`,
                    height: `${layout.cardH}px`,
                  }}
                  onPointerEnter={handleSingleSlotPointerEnter}
                  onPointerMove={handleSingleSlotPointerMove}
                  onPointerLeave={handleSingleSlotPointerLeave}
                  onFocus={handleSingleSlotFocus}
                  onBlur={handleSingleSlotBlur}
                  className="relative"
                >
                  {entries.map((entry, idx) => {
                    const isCurrentActive = activeIndex === idx;
                    const indexNumber = String(idx + 1).padStart(2, "0");
                    const serviceHref = `/services/${entry.service.slug}`;
                    const bullets = layout.isCompact
                      ? entry.compactBullets
                      : entry.normalBullets;
                    const contentScale = cardContentScales[idx] ?? 1;

                    return (
                      <div
                        key={entry.service.id}
                        ref={(el) => {
                          cardShellRefs.current[idx] = el;
                        }}
                        role="link"
                        tabIndex={isCurrentActive ? 0 : -1}
                        aria-hidden={!isCurrentActive}
                        aria-label={`${indexNumber} ${entry.service.title}`}
                        aria-current={isCurrentActive ? "true" : undefined}
                        onClick={() => {
                          router.push(serviceHref);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(serviceHref);
                          }
                        }}
                        style={{
                          width: `${layout.expandedW}px`,
                          height: `${layout.cardH}px`,
                          opacity: idx === 0 ? 1 : 0,
                          visibility: idx === 0 ? "visible" : "hidden",
                          pointerEvents: idx === 0 ? "auto" : "none",
                          background: `linear-gradient(152deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 65%, #0D0E12 100%)`,
                          transition:
                            "box-shadow 260ms ease, border-color 260ms ease",
                        }}
                        className="absolute top-0 left-0 rounded-[24px] border border-[#121317] cursor-pointer select-text will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFFF]"
                      >
                        {/* Decorative Background Clip Layer (keeps rounded glow clipped without hiding card content) */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[23px] overflow-hidden"
                        >
                          <div
                            className="pointer-events-none absolute -bottom-20 -right-16 w-52 h-52 rounded-full blur-3xl transition-opacity duration-300"
                            style={{
                              opacity: isCardHovered && isCurrentActive ? 0.48 : 0.3,
                              background:
                                "radial-gradient(circle, rgba(49, 134, 255, 0.58) 0%, transparent 72%)",
                            }}
                          />
                          <div
                            ref={(el) => {
                              sweepGlowRefs.current[idx] = el;
                            }}
                            className="pointer-events-none absolute -inset-8 will-change-transform"
                            style={{
                              opacity: 0,
                              background:
                                "linear-gradient(135deg, rgba(49, 134, 255, 0.40) 0%, rgba(116, 155, 255, 0.20) 38%, rgba(18, 19, 23, 0) 70%)",
                            }}
                          />
                        </div>

                        {/* Sized Column Flex Content Wrapper (`flex-col h-full min-h-0` + Tier-4 scale safety net) */}
                        <div
                          ref={(el) => {
                            cardInnerMeasureRefs.current[idx] = el;
                          }}
                          style={
                            contentScale < 0.999
                              ? {
                                  transform: `scale(${contentScale})`,
                                  transformOrigin: "top left",
                                  width: `${(100 / contentScale).toFixed(2)}%`,
                                  height: `${(100 / contentScale).toFixed(2)}%`,
                                }
                              : undefined
                          }
                          className={`relative z-20 h-full min-h-0 flex flex-col ${
                            layout.isCompact
                              ? "p-4 sm:p-[18px]"
                              : "p-[clamp(18px,2.3dvh,24px)]"
                          }`}
                        >
                          {/* Card Header (shrink-0): Label + Title on left, Circular Arrow on right */}
                          <div className="shrink-0 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span
                                ref={(el) => {
                                  disciplineLabelRefs.current[idx] = el;
                                }}
                                className="inline-block text-[10px] xl:text-[10.5px] font-mono uppercase tracking-widest text-[#749BFF] mb-1 transition-colors duration-200"
                              >
                                {indexNumber} / DISCIPLINE
                              </span>
                              <h3
                                ref={(el) => {
                                  activeTitleRefs.current[idx] = el;
                                }}
                                className={`font-bold tracking-tight text-white leading-[1.18] will-change-transform ${
                                  layout.isCompact
                                    ? "text-[16.5px]"
                                    : "text-[clamp(17.5px,2.25dvh,21px)]"
                                }`}
                              >
                                {entry.service.title}
                              </h3>
                            </div>

                            <Link
                              ref={(el) => {
                                arrowWrapRefs.current[idx] = el;
                              }}
                              href={serviceHref}
                              tabIndex={isCurrentActive ? 0 : -1}
                              aria-label={`Open ${entry.service.title} service page`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.10)",
                                color: "#FFFFFF",
                              }}
                              className={`shrink-0 rounded-full flex items-center justify-center transition-[background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] ${
                                layout.isCompact ? "w-8 h-8" : "w-9 h-9"
                              }`}
                            >
                              <svg
                                ref={(el) => {
                                  arrowIconRefs.current[idx] = el;
                                }}
                                viewBox="0 0 22 22"
                                className="w-[15px] h-[15px] transition-transform duration-200"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                              >
                                <path
                                  d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </Link>
                          </div>

                          {/* Card Description Area (`flex: 1; min-height: 0` — absorbs remaining space cleanly) */}
                          <div
                            className={`flex-1 min-h-0 flex items-center ${
                              layout.isCompact ? "py-2" : "py-2.5"
                            }`}
                          >
                            <p
                              ref={(el) => {
                                activeDescRefs.current[idx] = el;
                              }}
                              className={`text-[#B2BBC5] font-normal will-change-transform ${
                                layout.isCompact
                                  ? "text-[11.5px] leading-[1.48] line-clamp-3"
                                  : "text-[clamp(11.8px,1.5dvh,13px)] leading-[1.56] line-clamp-4"
                              }`}
                            >
                              {entry.service.shortDesc}
                            </p>
                          </div>

                          {/* Card Footer (shrink-0): Services (3-4 whole items) + Tools (6 icons) */}
                          <div
                            ref={(el) => {
                              activeColumnsRefs.current[idx] = el;
                            }}
                            className={`shrink-0 grid grid-cols-[1.42fr_0.92fr] gap-3.5 items-start border-t border-white/10 will-change-transform ${
                              layout.isCompact ? "pt-2.5" : "pt-3"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF] mb-1.5">
                                Services
                              </div>
                              <ul
                                className={`text-white/95 font-normal ${
                                  layout.isCompact
                                    ? "space-y-1 text-[11px] leading-[1.32]"
                                    : "space-y-1.5 text-[clamp(11px,1.38dvh,12px)] leading-[1.36]"
                                }`}
                              >
                                {bullets.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF] mb-1.5">
                                Tools
                              </div>
                              <div
                                className={`grid grid-cols-3 max-w-[106px] text-white/95 ${
                                  layout.isCompact ? "gap-2" : "gap-2.5"
                                }`}
                              >
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
                                    className={`flex items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                                      layout.isCompact ? "w-5 h-5" : "w-6 h-6"
                                    }`}
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
              ) : (
                /* ============================================================
                   OPTIONAL PREVIEW TABS MODE (`SHOW_UPCOMING_PREVIEW === true`)
                   Non-overlapping flex header on collapsed tabs + full viewport fit
                   ============================================================ */
                <div
                  ref={cardsTrackRef}
                  style={{ gap: `${layout.gap}px`, height: `${layout.cardH}px` }}
                  className="flex items-start h-full will-change-transform"
                >
                  {entries.map((entry, idx) => {
                    const isCurrentActive = activeIndex === idx;
                    const indexNumber = String(idx + 1).padStart(2, "0");
                    const serviceHref = `/services/${entry.service.slug}`;
                    const bullets = layout.isCompact
                      ? entry.compactBullets
                      : entry.normalBullets;
                    const contentScale = cardContentScales[idx] ?? 1;

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
                        onPointerEnter={(e) => {
                          if (e.pointerType === "touch" || !canHover) return;
                          rawPointedTabRef.current = idx;
                          if (!hoverSuppressedByScrollRef.current) {
                            activatePreviewTab(idx, false);
                          }
                        }}
                        onPointerMove={(e) => {
                          if (e.pointerType === "touch" || !canHover) return;
                          rawPointedTabRef.current = idx;
                          if (hoverSuppressedByScrollRef.current) {
                            hoverSuppressedByScrollRef.current = false;
                            activatePreviewTab(idx, false);
                          }
                        }}
                        onPointerLeave={() => {
                          if (rawPointedTabRef.current === idx) {
                            rawPointedTabRef.current = null;
                          }
                        }}
                        onFocus={() => activatePreviewTab(idx, true)}
                        onClick={() => router.push(serviceHref)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(serviceHref);
                          }
                        }}
                        style={{
                          width:
                            idx === 0
                              ? `${layout.expandedW}px`
                              : `${layout.collapsedW}px`,
                          height: `${layout.cardH}px`,
                          backgroundColor:
                            SERVICES_SECTION_TUNING.INACTIVE_CARD_BG,
                        }}
                        className="relative shrink-0 rounded-[24px] border border-[#212226]/[0.09] overflow-hidden cursor-pointer select-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFFF]"
                      >
                        <div
                          ref={(el) => {
                            halftoneRefs.current[idx] = el;
                          }}
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
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

                        <div
                          ref={(el) => {
                            sweepGlowRefs.current[idx] = el;
                          }}
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-8 will-change-transform"
                          style={{
                            opacity: 0,
                            background:
                              "linear-gradient(135deg, rgba(49, 134, 255, 0.40) 0%, rgba(116, 155, 255, 0.20) 38%, rgba(18, 19, 23, 0) 70%)",
                          }}
                        />

                        {/* Collapsed Preview Tab Flex Layout (Never overlaps!) */}
                        <div
                          ref={(el) => {
                            collapsedOverlayRefs.current[idx] = el;
                          }}
                          aria-hidden="true"
                          style={{
                            opacity: idx === 0 ? 0 : 1,
                            visibility: idx === 0 ? "hidden" : "visible",
                          }}
                          className="pointer-events-none absolute inset-0 z-20 p-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[20px] font-mono font-bold tracking-tight text-[#121317] tabular-nums leading-none">
                                {indexNumber}
                              </span>
                              <span className="w-8 h-8 rounded-full bg-[#121317]/[0.06] text-[#121317] flex items-center justify-center shrink-0">
                                <svg
                                  viewBox="0 0 22 22"
                                  className="w-[14px] h-[14px]"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                >
                                  <path
                                    d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                            {showCollapsedSubLabel && (
                              <span className="block mt-2 text-[10px] font-mono uppercase tracking-widest text-[#3186FF]">
                                DISCIPLINE
                              </span>
                            )}
                          </div>

                          <div className="text-[12px] font-semibold text-[#121317] truncate">
                            {entry.service.title}
                          </div>
                        </div>

                        {/* Active Expanded Content Wrapper (Hidden when collapsed so labels never overlap!) */}
                        <div
                          ref={(el) => {
                            activeContentWrapRefs.current[idx] = el;
                            cardInnerMeasureRefs.current[idx] = el;
                          }}
                          style={{
                            width: `${layout.expandedW}px`,
                            opacity: idx === 0 ? 1 : 0,
                            visibility: idx === 0 ? "visible" : "hidden",
                            ...(contentScale < 0.999
                              ? {
                                  transform: `scale(${contentScale})`,
                                  transformOrigin: "top left",
                                }
                              : {}),
                          }}
                          className={`relative z-20 h-full min-h-0 flex flex-col ${
                            layout.isCompact ? "p-4" : "p-5"
                          }`}
                        >
                          <div className="shrink-0 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span
                                ref={(el) => {
                                  disciplineLabelRefs.current[idx] = el;
                                }}
                                className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#749BFF] mb-1"
                              >
                                {indexNumber} / DISCIPLINE
                              </span>
                              <h3 className="text-[18px] font-bold tracking-tight text-white leading-[1.2]">
                                {entry.service.title}
                              </h3>
                            </div>

                            <Link
                              ref={(el) => {
                                arrowWrapRefs.current[idx] = el;
                              }}
                              href={serviceHref}
                              tabIndex={-1}
                              aria-label={`Open ${entry.service.title} service page`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0"
                            >
                              <svg
                                ref={(el) => {
                                  arrowIconRefs.current[idx] = el;
                                }}
                                viewBox="0 0 22 22"
                                className="w-[14px] h-[14px] transition-transform duration-200"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                              >
                                <path
                                  d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </Link>
                          </div>

                          <div className="flex-1 min-h-0 flex items-center py-2">
                            <p className="text-[12px] leading-[1.52] text-[#B2BBC5] line-clamp-4">
                              {entry.service.shortDesc}
                            </p>
                          </div>

                          <div className="shrink-0 grid grid-cols-[1.35fr_0.95fr] gap-3 items-start pt-2.5 border-t border-white/10">
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF] mb-1.5">
                                Services
                              </div>
                              <ul className="space-y-1 text-[11px] leading-[1.34] text-white/95">
                                {bullets.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF] mb-1.5">
                                Tools
                              </div>
                              <div className="grid grid-cols-3 gap-2 max-w-[100px] text-white/95">
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
                                    className="w-5 h-5 flex items-center justify-center transition-transform duration-200"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
