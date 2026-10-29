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
import { easeInOutCubic } from "@/lib/particleEngine";
import {
  SERVICE_STAGE_ORDER,
  ServiceShapeId,
} from "@/lib/serviceParticleShapes";
import ServicesParticleCanvas, {
  PARTICLE_TUNING,
  ServicesHoverBridge,
  evaluateServicesMasterTimeline,
} from "./ServicesParticleCanvas";
import MobileServices from "./MobileServices";
import SplitTextReveal from "./SplitTextReveal";
import { renderServiceToolIcon } from "./ServiceToolIcons";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TOP-LEVEL FEATURE & TUNING CONSTANTS
// ============================================================================

/** Upcoming full-size decorative cards replace the old collapsed tabs. */
export const SHOW_UPCOMING_PREVIEW: boolean = true;
export const DECK_TUNING = {
  FIRST_VW: 0.05, FIRST_MIN: 56, FIRST_MAX: 96,
  SECOND_VW: 0.095, SECOND_MIN: 108, SECOND_MAX: 176,
  FIRST_SCALE: 0.96, SECOND_SCALE: 0.92,
  FIRST_GHOST: 0.35, SECOND_GHOST: 0.18,
  EXIT_X: -40,
  FROST: "linear-gradient(135deg, rgba(230,232,239,.92), rgba(236,238,244,.90)), #fff",
  DETAIL_GHOST_MULTIPLIER: 0.5,
} as const;

export const SERVICES_SECTION_TUNING = {
  SHOW_UPCOMING_PREVIEW,
  SECTION_BG: "#FFFFFF",
  ACTIVE_CARD_TOP: "#1A1B22",
  ACTIVE_CARD_BOTTOM: "#121317",
  INACTIVE_CARD_BG: "#F8F9FC",
  SCROLL_VH_PER_STEP: 82, // Desktop: 328vh smooth pinned travel across 4 services (unchanged)
  MOBILE_SCROLL_SVH_PER_STEP: 80, // Mobile/Tablet (<1024px): 80svh per step (target: 70-90svh)
  COMPACT_VIEWPORT_MAX_HEIGHT_PX: 720,
  LANDSCAPE_SHORT_MAX_HEIGHT_PX: 500, // Landscape phone (<500px height): 2-column stage
  MIN_BOTTOM_PADDING_PX: 28,
  HOVER_DEBOUNCE_LEAVE_MS: 60,
  HOVER_PULSE_STRENGTH: PARTICLE_TUNING.HOVER_PULSE_STRENGTH, // 0.36
  HOVER_PULSE_DURATION_MS: PARTICLE_TUNING.HOVER_PULSE_DURATION_MS, // 820ms
  HOVER_ROTATION_MULTIPLIER: PARTICLE_TUNING.HOVER_ROTATION_MULTIPLIER, // 1.5x
  HOVER_LEAVE_EASE_MS: PARTICLE_TUNING.HOVER_LEAVE_EASE_MS, // 500ms
  REPEL_RADIUS_PX: PARTICLE_TUNING.REPEL_RADIUS_PX, // 112px
  COLLAPSED_LABEL_MIN_WIDTH_PX: 190,
} as const;

interface OrderedServiceEntry {
  service: ServiceItem;
  shape: ServiceShapeId;
  normalBullets: string[]; // First 4 whole service items
  compactBullets: string[]; // First 3 whole service items (compact viewports)
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
  const navBar =
    document.querySelector<HTMLElement>(
      '[data-site-navbar="true"] > div:first-child'
    ) ||
    document.querySelector<HTMLElement>('[data-site-navbar="true"]') ||
    document.querySelector<HTMLElement>("header");

  if (navBar) {
    const rectH = navBar.getBoundingClientRect().height;
    if (rectH > 0) {
      const unscrolledAtTop = window.scrollY <= 20;
      return Math.max(48, Math.round(unscrolledAtTop ? rectH - 2 : rectH));
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

/**
 * Non-pinned fallback card with lightweight zero-WebGL 2D shape visual and
 * `IntersectionObserver` viewport fade-in (`prefers-reduced-motion` or no-WebGL).
 */
function FallbackServiceCard({
  entry,
  idx,
  animateIn,
}: {
  entry: OrderedServiceEntry;
  idx: number;
  animateIn: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(!animateIn);
  const dummyProgressRef = useRef<number>(0);

  useEffect(() => {
    if (!animateIn) {
      setVisible(true);
      return;
    }
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.14 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animateIn]);

  return (
    <article
      ref={cardRef}
      aria-current={idx === 0 ? "true" : undefined}
      style={
        animateIn
          ? {
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translate3d(0, 0, 0)"
                : "translate3d(0, 20px, 0)",
              transition:
                "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
            }
          : undefined
      }
      className="services-static-card group/reduced grid grid-cols-1 md:grid-cols-[240px_1fr] items-center gap-6 rounded-[24px] p-5 sm:p-8 border border-[#212226]/[0.1] hover:border-[#3186FF]/55 focus-within:border-[#3186FF]/65 bg-[#121317] text-white shadow-[0_20px_50px_rgba(18,19,23,0.12)] hover:shadow-[0_26px_60px_rgba(18,19,23,0.24)] transition-[border-color,box-shadow] duration-200"
    >
      <div className="relative h-44 w-full rounded-2xl bg-[#FFFFFF] border border-white/10 overflow-hidden">
        <ServicesParticleCanvas
          scrollProgressRef={dummyProgressRef}
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
              className="w-11 h-11 rounded-full bg-white/10 group-hover/reduced:bg-[#3186FF] hover:bg-[#3186FF] active:scale-95 flex items-center justify-center text-white shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
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
            <div className="text-xs font-mono uppercase tracking-wider text-[#749BFF] mb-2">
              Services
            </div>
            <ul className="space-y-1 text-xs sm:text-[13px] text-white/95">
              {entry.normalBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#749BFF] mb-2">
              Tools
            </div>
            <div className="static-service-tools grid grid-cols-3 gap-2.5 max-w-[120px] text-white/95">
              {entry.displayTools.map((tool, tIdx) => (
                <span
                  key={`${tool}-${tIdx}`}
                  title={tool}
                  aria-label={tool}
                  role="img"
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
  );
}

/** Resize-only fallback: tighten in two levels before proportional scaling. */
function measureCardFit(el: HTMLDivElement | null, height: number): number {
  if (!el || height <= 0) return 1;
  const saved = {height: el.style.height, minHeight: el.style.minHeight, transform: el.style.transform, width: el.style.width};
  el.style.height = "auto";
  el.style.minHeight = "0px";
  el.style.transform = "none";
  el.style.width = "100%";
  let level = 0;
  el.dataset.fitLevel = "0";
  let natural = el.scrollHeight;
  while (natural > height - 2 && level < 2) {
    el.dataset.fitLevel = `${++level}`;
    natural = el.scrollHeight;
  }
  Object.assign(el.style, saved);
  return Number(Math.min(1, (height - 2) / Math.max(1, natural)).toFixed(3));
}

export default function ServicesGrid() {
  const router = useRouter();
  const entries = useMemo(() => buildOrderedServices(), []);

  // Desktop (>= 1024px) stage refs
  const pinSectionRef = useRef<HTMLElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const headerBlockRef = useRef<HTMLDivElement>(null);
  const cardsViewportRef = useRef<HTMLDivElement>(null);
  const singleCardHitboxRef = useRef<HTMLDivElement>(null);

  const cardShellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerMeasureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeContentWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const darkFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sweepGlowRefs = useRef<(HTMLDivElement | null)[]>([]);
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
  const refreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);

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

  const scheduleScrollTriggerRefresh = useCallback(() => {
    if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
    refreshDebounceRef.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 180);
  }, []);

  const handleWebGLUnavailable = useCallback(() => {
    setWebglUnavailable(true);
  }, []);

  // --------------------------------------------------------------------------
  // DYNAMIC STAGE & CARD SIZING (Desktop `>= 1024px` + Mobile/Tablet `< 1024px`)
  // --------------------------------------------------------------------------
  const recomputeLayoutMetrics = useCallback(() => {
    if (typeof window === "undefined") return;

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const vw = window.innerWidth;
    // Use stable layout innerHeight for desktop dvh and mobile svh sizing
    const vh = window.innerHeight;
    const desktop = vw >= 1024;
    const navH = getMeasuredNavHeight();

    setIsDesktop(desktop);
    setCanHover(mqHover.matches);
    setReducedMotion(mqReduced.matches);

    document.documentElement.style.setProperty("--nav-h", `${navH}px`);
    if (pinSectionRef.current) {
      pinSectionRef.current.style.setProperty("--section-nav-h", `${navH}px`);
    }
    // The mobile component owns its own sizing, pin and gesture lifecycle.
    if (!desktop) return;

    // ========================================================================
    // DESKTOP: measured header, fully visible card and reserved deck width
    // ========================================================================
    const compact =
      vh < SERVICES_SECTION_TUNING.COMPACT_VIEWPORT_MAX_HEIGHT_PX;
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

    let headerTotalH = compact ? 78 : 104;
    if (headerBlockRef.current) {
      const hRect = headerBlockRef.current.getBoundingClientRect();
      const hStyle = window.getComputedStyle(headerBlockRef.current);
      const mb = parseFloat(hStyle.marginBottom) || 0;
      if (hRect.height > 0) {
        headerTotalH = Math.ceil(hRect.height + mb);
      }
    }

    const availableForCard = Math.max(180, Math.floor(usableH - padTop - padBottom - headerTotalH));
    const preferredMaxCardH = compact ? 404 : 480;
    const cardH = Math.min(preferredMaxCardH, availableForCard);

    const rightColTotalW =
      rightColRef.current?.clientWidth || Math.round(vw * 0.54);
    const rightMarginPx = Math.round(Math.min(56, Math.max(24, vw * 0.032)));
    const availRightW = Math.max(320, rightColTotalW - rightMarginPx);
    const gap = vw >= 1440 ? 14 : 11;



    const deckReserve = SHOW_UPCOMING_PREVIEW
      ? Math.min(DECK_TUNING.SECOND_MAX, Math.max(DECK_TUNING.SECOND_MIN, vw * DECK_TUNING.SECOND_VW))
      : 0;
    const expandedW = Math.floor(Math.min(680, availRightW - deckReserve));
    const collapsedW = expandedW;

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

    requestAnimationFrame(() => {
      const nextScales: number[] = [];
      let changed = false;
      for (let i = 0; i < entries.length; i++) {
        const s = measureCardFit(cardInnerMeasureRefs.current[i], cardH);
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

    let lastW = window.innerWidth;
    let lastOrientation = window.innerWidth > window.innerHeight ? "l" : "p";

    const handleWindowResize = () => {
      const nowW = window.innerWidth;
      const nowOrientation =
        window.innerWidth > window.innerHeight ? "l" : "p";
      // On coarse mobile pointers, ignore small height-only URL-bar shifts (< 90px)
      // so the pinned `100svh` layout never jumps while scrolling!
      const isCoarse = !mqHover.matches && nowW < 1024;
      if (isCoarse && nowW === lastW && nowOrientation === lastOrientation) {
        return;
      }
      lastW = nowW;
      lastOrientation = nowOrientation;
      recomputeLayoutMetrics();
      scheduleScrollTriggerRefresh();
    };

    window.addEventListener("resize", handleWindowResize, { passive: true });
    window.addEventListener("orientationchange", recomputeLayoutMetrics, {
      passive: true,
    });
    mqReduced.addEventListener("change", recomputeLayoutMetrics);
    mqHover.addEventListener("change", recomputeLayoutMetrics);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        recomputeLayoutMetrics();
      });
      if (pinSectionRef.current) ro.observe(pinSectionRef.current);
      if (headerBlockRef.current) ro.observe(headerBlockRef.current);
      if (cardsViewportRef.current) ro.observe(cardsViewportRef.current);
      const navEl = document.querySelector<HTMLElement>(
        '[data-site-navbar="true"]'
      );
      if (navEl) ro.observe(navEl);
    }

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("orientationchange", recomputeLayoutMetrics);
      mqReduced.removeEventListener("change", recomputeLayoutMetrics);
      mqHover.removeEventListener("change", recomputeLayoutMetrics);
      ro?.disconnect();
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
      clearAllHoverTimers();
    };
  }, [
    clearAllHoverTimers,
    isDesktop,
    recomputeLayoutMetrics,
    scheduleScrollTriggerRefresh,
  ]);

  useEffect(() => {
    recomputeLayoutMetrics();
    scheduleScrollTriggerRefresh();
  }, [isDesktop, reducedMotion, recomputeLayoutMetrics, scheduleScrollTriggerRefresh]);

  // --------------------------------------------------------------------------
  // DESKTOP HOVER & KEYBOARD FOCUS HANDLERS (100% Unchanged)
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

  // --------------------------------------------------------------------------
  // GSAP `matchMedia()` SCROLLTRIGGER PINNING:
  // Cleanly switches between Desktop `(min-width: 1024px)` and Mobile/Tablet
  // `(max-width: 1023px)` on resize/orientation change with full pin cleanup!
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (reducedMotion || webglUnavailable) {
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
      return;
    }

    if (!isDesktop) return;
    const mm = gsap.matchMedia();

    // 1. DESKTOP (>= 1024px): existing pin and progress driver; opaque deck choreography
    if (isDesktop) {
      mm.add("(min-width: 1024px)", () => {
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
            const stepChanged =
              liveScrollIdx !== hoverLockedScrollStepRef.current;
            const enteredScrollTransition = timeline.cardTransitionT > 0.04;

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

        let liveHoverLift = 0;
        const firstX = Math.min(DECK_TUNING.FIRST_MAX, Math.max(DECK_TUNING.FIRST_MIN, window.innerWidth * DECK_TUNING.FIRST_VW));
        const secondX = Math.min(DECK_TUNING.SECOND_MAX, Math.max(DECK_TUNING.SECOND_MIN, window.innerWidth * DECK_TUNING.SECOND_VW));

        const applyChoreography = () => {
          rafId = requestAnimationFrame(applyChoreography);

          smoothP +=
            (scrollProgressRef.current - smoothP) *
            PARTICLE_TUNING.PROGRESS_LERP;

          const state = evaluateServicesMasterTimeline(smoothP);
          const { fromCardIndex, toCardIndex, cardTransitionT } = state;

          if (state.scrollIndex !== lastReportedScrollIdx) {
            lastReportedScrollIdx = state.scrollIndex;
            setScrollIndex(state.scrollIndex);
          }

          const t = easeInOutCubic(cardTransitionT);
          const transitioning = fromCardIndex !== toCardIndex;
          const front = transitioning ? fromCardIndex : state.scrollIndex;
          const active = state.scrollIndex;
          const hovered = isCardHoveredRef.current;
          liveHoverLift += ((hovered ? 1 : 0) - liveHoverLift) * 0.18;
          for (let i = 0; i < entries.length; i++) {
            const shell = cardShellRefs.current[i];
            if (!shell) continue;
            const slot = i - front;
            let x = 0, scale = 1, dark = 0, content = 0, visible = false, z = 10;
            if (slot === 0) {
              visible = !transitioning || cardTransitionT < 0.999;
              x = transitioning ? DECK_TUNING.EXIT_X * t : 0;
              dark = 1;
              content = transitioning ? Math.max(0, 1 - cardTransitionT / 0.45) : 1;
              z = !transitioning || cardTransitionT < 0.5 ? 40 : 20;
            } else if (slot === 1) {
              visible = SHOW_UPCOMING_PREVIEW || transitioning;
              x = firstX * (transitioning ? 1 - t : 1);
              scale = DECK_TUNING.FIRST_SCALE + (transitioning ? t * (1 - DECK_TUNING.FIRST_SCALE) : 0);
              dark = transitioning ? easeInOutCubic(Math.max(0, (cardTransitionT - 0.4) / 0.6)) : 0;
              content = transitioning
                ? Math.max(0, (cardTransitionT - 0.45) / 0.55)
                : DECK_TUNING.FIRST_GHOST;
              z = transitioning && cardTransitionT >= 0.5 ? 40 : 30;
            } else if (slot === 2 && SHOW_UPCOMING_PREVIEW) {
              visible = true;
              x = secondX + (transitioning ? (firstX - secondX) * t : 0);
              scale = DECK_TUNING.SECOND_SCALE + (transitioning ? (DECK_TUNING.FIRST_SCALE - DECK_TUNING.SECOND_SCALE) * t : 0);
              content = DECK_TUNING.SECOND_GHOST + (transitioning ? (DECK_TUNING.FIRST_GHOST - DECK_TUNING.SECOND_GHOST) * t : 0);
              z = 15;
            } else if (slot === 3 && transitioning && SHOW_UPCOMING_PREVIEW) {
              visible = t > 0.02;
              x = secondX;
              scale = DECK_TUNING.SECOND_SCALE;
              content = DECK_TUNING.SECOND_GHOST * t;
              z = 10;
            }
            const primary = i === active;
            shell.style.visibility = visible ? "visible" : "hidden";
            shell.style.opacity = "1"; // Backgrounds NEVER fade through another card.
            shell.style.zIndex = `${z}`;
            shell.style.pointerEvents = primary ? "auto" : "none";
            shell.style.transform = `translate3d(${x}px, ${primary && !transitioning ? -4 * liveHoverLift : 0}px, 0) scale(${scale})`;
            shell.style.borderColor = dark > 0.5 ? "rgba(18,19,23,.92)" : "rgba(15,15,30,.06)";
            shell.style.boxShadow = "0 20px 48px -14px rgba(18,19,23,.16)";
            shell.setAttribute("aria-hidden", primary ? "false" : "true");
            shell.tabIndex = primary ? 0 : -1;
            const link = arrowWrapRefs.current[i];
            if (link) link.tabIndex = primary ? 0 : -1;
            shell.dataset.preview = dark < 0.5 ? "true" : "false";
            const fill = darkFillRefs.current[i];
            if (fill) fill.style.opacity = `${dark}`;
            const wrap = activeContentWrapRefs.current[i];
            if (wrap) wrap.style.opacity = `${content}`;
            [activeTitleRefs.current[i], activeDescRefs.current[i], activeColumnsRefs.current[i]].forEach((node, order) => {
              if (!node) return;
              const reveal = transitioning && slot === 1 ? Math.max(0, Math.min(1, (cardTransitionT - 0.45 - order * 0.035) / (0.55 - order * 0.035))) : 1;
              node.style.opacity = `${reveal * (dark < 0.5 && order > 0 ? DECK_TUNING.DETAIL_GHOST_MULTIPLIER : 1)}`;
              node.style.transform = `translate3d(0, ${(1 - reveal) * 8}px, 0)`;
            });
            const arrow = arrowWrapRefs.current[i];
            if (arrow) arrow.style.backgroundColor = hovered && primary ? "#3186FF" : "rgba(255,255,255,.10)";
            const arrowIcon = arrowIconRefs.current[i];
            if (arrowIcon) arrowIcon.style.transform = hovered && primary ? "translate3d(2.5px,-2.5px,0)" : "none";
            (activeToolItemRefs.current[i] || []).forEach((node, k) => {
              if (!node) return;
              node.style.transitionDelay = `${k * 36}ms`;
              node.style.transform = hovered && primary ? "translateY(-2.5px) scale(1.15)" : "none";
            });
          }
        };

        rafId = requestAnimationFrame(applyChoreography);

        return () => {
          cancelAnimationFrame(rafId);
          st.kill();
          scrollTriggerRef.current = null;
        };
      });
    }

    return () => {
      mm.revert();
      scrollTriggerRef.current = null;
    };
  }, [
    clearAllHoverTimers,
    entries,
    isDesktop,
    layout,
    reducedMotion,
    webglUnavailable,
  ]);

  // --------------------------------------------------------------------------
  // 1. NON-PINNED FALLBACK (`prefers-reduced-motion: reduce` or WebGL unavailable)
  //    Zero WebGL contexts — lightweight 2D static shapes + IntersectionObserver fade-in
  // --------------------------------------------------------------------------
  if (reducedMotion || webglUnavailable) {
    return (
      <div key="static-services" style={{display:"contents"}}><section
        id="services"
        aria-labelledby="services-heading-reduced"
        className="relative py-20 sm:py-28 bg-[#FFFFFF] text-[#121317] border-t border-[#212226]/[0.07] overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] font-mono text-[10.5px] text-[#45474D] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
                <span>04 CORE CAPABILITIES</span>
              </div>
              <h2
                id="services-heading-reduced"
                className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-[#121317]"
              >
                Our <span className="text-[#3186FF]">Services</span>
              </h2>
            </div>
            <p className="text-sm text-[#45474D] max-w-[320px] leading-relaxed">
              We offer comprehensive digital solutions that transform your
              business and drive innovation across every touchpoint.
            </p>
          </div>

          <div className="space-y-6">
            {entries.map((entry, idx) => (
              <FallbackServiceCard
                key={entry.service.id}
                entry={entry}
                idx={idx}
                animateIn={!reducedMotion}
              />
            ))}
          </div>
        </div>
      </section></div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. MOBILE & TABLET (< 1024px) PINNED STAGE (`100svh - navHeight`)
  //    - Portrait: Top compact heading + step indicator, centered particle canvas
  //      (~34-40% height, tap-to-pulse!), and unclipped bottom active card.
  //    - Landscape (< 500px height): Two-column side-by-side canvas + compact card.
  // --------------------------------------------------------------------------
  if (!isDesktop) return <div key="mobile-services" style={{display:"contents"}}><MobileServices entries={entries} progress={scrollProgressRef} bridge={hoverBridgeRef} onWebGLUnavailable={handleWebGLUnavailable} /></div>;

  // --------------------------------------------------------------------------
  // 3. DESKTOP (>= 1024px) PINNED STAGE (`100dvh - navHeight` — measured deck layout)
  // --------------------------------------------------------------------------
  const showCollapsedSubLabel =
    layout.collapsedW >= SERVICES_SECTION_TUNING.COLLAPSED_LABEL_MIN_WIDTH_PX;

  return (
    <div key="desktop-services" style={{display:"contents"}}><section
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

      {/* Left-Stage Soft Accent Aura */}
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
        {/* LEFT COLUMN (~45%): Dedicated Interactive Particle Canvas Stage */}
        <div className="relative w-[43%] xl:w-[43%] shrink-0 h-full pointer-events-auto">
          <ServicesParticleCanvas
            scrollProgressRef={scrollProgressRef}
            hoverBridgeRef={hoverBridgeRef}
            layoutMode="desktop"
            onResizeSettled={scheduleScrollTriggerRefresh}
            onWebGLUnavailable={handleWebGLUnavailable}
            className="w-full h-full pointer-events-auto"
          />
        </div>

        {/* RIGHT COLUMN (~55%): Header Block + Sized Card Stage */}
        <div
          ref={rightColRef}
          style={{
            paddingTop: `${layout.padTop}px`,
            paddingBottom: `${layout.padBottom}px`,
          }}
          className="w-[57%] xl:w-[57%] h-full min-h-0 flex flex-col justify-center pr-6 lg:pr-10 xl:pr-14"
        >
          <div className="w-full max-h-full min-h-0 flex flex-col">
            {/* 1. Section Header Block (shrink-0) */}
            <div
              ref={headerBlockRef}
              className={`shrink-0 flex items-start justify-between gap-5 max-w-[856px] ${
                layout.isCompact ? "mb-6" : "mb-7"
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
                <div className="flex items-baseline flex-wrap gap-x-4 gap-y-2">
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
                <div className="flex items-center gap-2 text-[11px] font-mono" aria-label={`Service ${scrollIndex + 1} of 4`}>
                  <span className="text-[#3186FF]">0{scrollIndex + 1} / 04</span>
                  {entries.map((_, index) => <span key={index} aria-hidden="true" className={`h-1 rounded-full ${index === scrollIndex ? "w-5 bg-[#121317]" : "w-1 bg-[#C8CED8]"}`} />)}
                </div>
                </div>
              </div>

              <p
                className={`text-[#45474D] max-w-[285px] pb-0.5 font-normal ${
                  layout.isCompact
                    ? "hidden"
                    : "text-[clamp(12px,1.5dvh,13.5px)] leading-[1.55]"
                }`}
              >
                We offer comprehensive digital solutions that transform your
                business and drive innovation across every touchpoint.
              </p>
            </div>

            {/* 2. Card Stage Area */}
            <div
              ref={cardsViewportRef}
              style={{ height: `${layout.cardH}px` }}
              className="relative shrink-0 w-full overflow-visible"
            >
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
                          opacity: 1,
                          visibility: idx === 0 ? "visible" : "hidden",
                          pointerEvents: idx === 0 ? "auto" : "none",
                          background: DECK_TUNING.FROST,
                          isolation: "isolate",
                          transformOrigin: "left center",
                          transition:
                            "box-shadow 260ms ease, border-color 260ms ease",
                        }}
                        className="absolute top-0 left-0 rounded-[28px] border border-[#121317] cursor-pointer select-text will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFFF]"
                      >
                        <div
                          ref={(el) => { darkFillRefs.current[idx] = el; }}
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[27px]"
                          style={{ background: `linear-gradient(152deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP}, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 65%, #0D0E12)`, opacity: idx === 0 ? 1 : 0 }}
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[23px] overflow-hidden"
                        >
                          <div
                            className="pointer-events-none absolute -bottom-20 -right-16 w-52 h-52 rounded-full blur-3xl transition-opacity duration-300"
                            style={{
                              opacity:
                                isCardHovered && isCurrentActive ? 0.48 : 0.3,
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

                        <div
                          ref={(el) => {
                            cardInnerMeasureRefs.current[idx] = el;
                            activeContentWrapRefs.current[idx] = el;
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
                                    ? "text-[20px]"
                                    : "text-[clamp(22px,2.7dvh,26px)]"
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
                                "w-11 h-11"
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

                          <div
                            className={`shrink-0 min-h-0 ${
                              layout.isCompact ? "mt-4 mb-4" : "mt-5 mb-5"
                            }`}
                          >
                            <p
                              ref={(el) => {
                                activeDescRefs.current[idx] = el;
                              }}
                              className={`text-[#B2BBC5] font-normal will-change-transform ${
                                layout.isCompact
                                  ? "text-[13px] leading-[1.48] line-clamp-3"
                                  : "text-[15px] leading-[1.56] line-clamp-4"
                              }`}
                            >
                              {entry.service.shortDesc}
                            </p>
                          </div>

                          <div
                            ref={(el) => {
                              activeColumnsRefs.current[idx] = el;
                            }}
                            className={`mt-auto shrink-0 grid grid-cols-[1.42fr_0.92fr] gap-3.5 items-start border-t border-white/10 will-change-transform ${
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
                                    ? "space-y-1 text-[12px] leading-[1.32]"
                                    : "space-y-1.5 text-[13.5px] leading-[1.36]"
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
                                className={`grid text-white/95 ${
                                  layout.isCompact ? "grid-cols-6 gap-1.5" : "grid-cols-3 max-w-[120px] gap-2.5"
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

            </div>
          </div>
        </div>
      </div>
    </section></div>
  );
}
