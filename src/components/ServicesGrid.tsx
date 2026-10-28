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
 * Flip to `true` to show compact, non-overlapping upcoming preview tabs on desktop.
 */
export const SHOW_UPCOMING_PREVIEW: boolean = false;

export const SERVICES_SECTION_TUNING = {
  SHOW_UPCOMING_PREVIEW,
  SECTION_BG: "#FFFFFF",
  ACTIVE_CARD_TOP: "#1A1B22",
  ACTIVE_CARD_BOTTOM: "#121317",
  INACTIVE_CARD_BG: "#F8F9FC",
  SCROLL_VH_PER_STEP: 82, // Desktop: 328vh smooth pinned travel across 4 services (unchanged)
  MOBILE_SCROLL_SVH_PER_STEP: 80, // Mobile/Tablet (<1024px): 80svh per step (target: 70-90svh)
  COMPACT_VIEWPORT_MAX_HEIGHT_PX: 700,
  LANDSCAPE_SHORT_MAX_HEIGHT_PX: 500, // Landscape phone (<500px height): 2-column stage
  MIN_BOTTOM_PADDING_PX: 28,
  HOVER_DEBOUNCE_LEAVE_MS: 60,
  PREVIEW_HOVER_INTENT_DELAY_MS: 100,
  PREVIEW_HOVER_LEAVE_DELAY_MS: 250,
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

interface MobileStageMetrics {
  navH: number;
  isLandscapeShort: boolean;
  isCompactPhone: boolean;
  canvasH: number;
  cardH: number;
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
      className="group/reduced grid grid-cols-1 md:grid-cols-[240px_1fr] items-center gap-6 rounded-[24px] p-5 sm:p-8 border border-[#212226]/[0.1] hover:border-[#3186FF]/55 focus-within:border-[#3186FF]/65 bg-[#121317] text-white shadow-[0_20px_50px_rgba(18,19,23,0.12)] hover:shadow-[0_26px_60px_rgba(18,19,23,0.24)] transition-[border-color,box-shadow] duration-200"
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
  );
}

export default function ServicesGrid() {
  const router = useRouter();
  const entries = useMemo(() => buildOrderedServices(), []);

  // Desktop (>= 1024px) stage refs
  const pinSectionRef = useRef<HTMLElement>(null);
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

  // Mobile & Tablet (< 1024px) pinned stage refs
  const mobilePinSectionRef = useRef<HTMLElement>(null);
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileCardSlotRef = useRef<HTMLDivElement>(null);
  const mobileCardShellRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileCardInnerMeasureRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const [mobileLayout, setMobileLayout] = useState<MobileStageMetrics>({
    navH: 64,
    isLandscapeShort: false,
    isCompactPhone: false,
    canvasH: 220,
    cardH: 310,
  });

  const [cardContentScales, setCardContentScales] = useState<number[]>([
    1, 1, 1, 1,
  ]);
  const [mobileCardScales, setMobileCardScales] = useState<number[]>([
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
    if (mobilePinSectionRef.current) {
      mobilePinSectionRef.current.style.setProperty(
        "--section-nav-h",
        `${navH}px`
      );
    }

    // ========================================================================
    // MOBILE & TABLET (< 1024px): Portrait + Landscape Short (< 500px height)
    // ========================================================================
    if (!desktop) {
      // Measure actual stage height (`100svh - navH`) if mounted, else compute from `vh - navH`
      const stageEl = mobilePinSectionRef.current;
      const stageRectH = stageEl ? stageEl.clientHeight : 0;
      const usableH = Math.max(250, stageRectH > 120 ? stageRectH : vh - navH);

      const isLandscapeShort =
        vh < SERVICES_SECTION_TUNING.LANDSCAPE_SHORT_MAX_HEIGHT_PX && vw > vh;
      const isCompactPhone =
        !isLandscapeShort && (usableH < 630 || vw < 385);

      let canvasH: number;
      let cardH: number;

      if (isLandscapeShort) {
        // Two-column landscape layout (`667x375`, `844x390`): canvas on left, card on right
        const verticalPad = 20;
        cardH = Math.max(180, Math.floor(usableH - verticalPad - 12));
        canvasH = Math.max(170, Math.floor(usableH - 56));
      } else {
        // Portrait layout (`360px - 820px`): top header + 34-38% particle canvas + full unclipped card
        const stageStyle = stageEl ? getComputedStyle(stageEl) : null;
        const safeBottom = stageStyle ? parseFloat(stageStyle.paddingBottom) || 12 : 12;
        const topBottomPad = (vw >= 640 ? 16 : 10) + safeBottom + 8;
        let measuredHeaderH = isCompactPhone ? 52 : vw >= 640 ? 78 : 56;
        if (mobileHeaderRef.current) {
          const hRect = mobileHeaderRef.current.getBoundingClientRect();
          if (hRect.height > 0) {
            measuredHeaderH = Math.ceil(hRect.height);
          }
        }

        const innerUsable = Math.max(
          0,
          usableH - topBottomPad - measuredHeaderH - 10
        );
        const maxCanvasCap = vw >= 640 ? 400 : isCompactPhone ? 220 : 290;
        const targetCanvasRatio = vw >= 640 ? 0.42 : 0.37;

        // Prioritize readable card content over decorative canvas height on short screens.
        const minCardNeeded = isCompactPhone ? 328 : 344;
        const rawCanvas = Math.round(innerUsable * targetCanvasRatio);
        canvasH = Math.max(
          96,
          Math.min(maxCanvasCap, rawCanvas, innerUsable - minCardNeeded)
        );
        cardH = Math.min(
          vw >= 640 ? 396 : 368,
          Math.max(236, Math.floor(innerUsable - canvasH))
        );
      }

      setMobileLayout((prev) => {
        if (
          prev.navH === navH &&
          prev.isLandscapeShort === isLandscapeShort &&
          prev.isCompactPhone === isCompactPhone &&
          prev.canvasH === canvasH &&
          prev.cardH === cardH
        ) {
          return prev;
        }
        return {
          navH,
          isLandscapeShort,
          isCompactPhone,
          canvasH,
          cardH,
        };
      });

      // Last-resort proportional scale safety net on ultra-tight viewports (`360x640` / `667x375`)
      requestAnimationFrame(() => {
        const nextScales: number[] = [];
        let changed = false;
        for (let i = 0; i < entries.length; i++) {
          const el = mobileCardInnerMeasureRefs.current[i];
          let s = 1;
          if (el && cardH > 0) {
            const prevH = el.style.height;
            const prevMinH = el.style.minHeight;
            const prevTransform = el.style.transform;
            el.style.transform = "none";
            el.style.height = "auto";
            el.style.minHeight = "0px";
            const naturalH = el.scrollHeight;
            el.style.height = prevH;
            el.style.minHeight = prevMinH;
            el.style.transform = prevTransform;
            if (naturalH > cardH - 2) {
              s = Number(Math.max(0.78, (cardH - 2) / naturalH).toFixed(3));
            }
          }
          nextScales.push(s);
        }
        setMobileCardScales((prev) => {
          for (let i = 0; i < nextScales.length; i++) {
            if (Math.abs((prev[i] ?? 1) - nextScales[i]) > 0.005) {
              changed = true;
              break;
            }
          }
          return changed ? nextScales : prev;
        });
      });

      return;
    }

    // ========================================================================
    // DESKTOP (>= 1024px): 100% Unchanged Approved Stage Sizing
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
      if (mobileHeaderRef.current) ro.observe(mobileHeaderRef.current);
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
    recomputeLayoutMetrics,
    scheduleScrollTriggerRefresh,
  ]);

  useEffect(() => {
    recomputeLayoutMetrics();
    scheduleScrollTriggerRefresh();
  }, [isDesktop, reducedMotion, recomputeLayoutMetrics, scheduleScrollTriggerRefresh]);

  const scrollToServiceStep = useCallback((stepIdx: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const targetP = STEP_HOLD_PROGRESS[stepIdx] ?? STEP_HOLD_PROGRESS[0];
    const targetScrollY = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  }, []);

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

    const mm = gsap.matchMedia();

    // 1. DESKTOP (>= 1024px): 100% Unchanged Approved Choreography
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

        const liveWeights: number[] = entries.map((_, idx) =>
          idx === 0 ? 1 : 0
        );
        const prevWeights: number[] = [...liveWeights];
        let liveTrackX = 0;
        let liveHoverLift = 0;

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

          const { expandedW, collapsedW } = layout;
          const previewIdx = hoverBridgeRef.current.previewIndex;
          const hoveredFlag = isCardHoveredRef.current;

          const targetLift = hoveredFlag ? 1 : 0;
          liveHoverLift += (targetLift - liveHoverLift) * 0.18;

          if (!SHOW_UPCOMING_PREVIEW) {
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
              const isPrimaryInteractive = !isScrollTrans
                ? i === state.scrollIndex
                : cardTransitionT < 0.5
                ? i === fromCardIndex
                : i === toCardIndex;

              const liftY =
                isPrimaryInteractive && !isScrollTrans ? -4 * liveHoverLift : 0;

              shell.style.visibility = isVisible ? "visible" : "hidden";
              shell.style.opacity = cardOpacity.toFixed(3);
              shell.style.pointerEvents = isPrimaryInteractive
                ? "auto"
                : "none";
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
                discLabel.style.color = isHoveredActiveCard
                  ? "#A8C7FA"
                  : "#749BFF";
                discLabel.style.opacity = isHoveredActiveCard ? "1" : "0.9";
              }

              const settleT =
                isScrollTrans && i === toCardIndex
                  ? easeOutOdometer(Math.max(0, (t - 0.12) / 0.88))
                  : 1;
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

          const isScrollTrans = fromCardIndex !== toCardIndex;
          const easedScrollMove = easeInOutCubic(cardTransitionT);

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
            const isHoveredActive =
              i === resolvedActive && hoveredFlag && w > 0.7;
            const liftY = isHoveredActive ? -4 * liveHoverLift : (1 - w) * 8;
            const isPointedCollapsed =
              rawPointedTabRef.current === i && w < 0.25;

            const shell = cardShellRefs.current[i];
            if (shell) {
              shell.style.width = `${widthPx.toFixed(1)}px`;
              shell.style.transform = `translate3d(0, ${liftY.toFixed(
                2
              )}px, 0)`;
              if (w > 0.45) {
                shell.style.borderColor = isHoveredActive
                  ? "rgba(49, 134, 255, 0.52)"
                  : "rgba(18, 19, 23, 0.92)";
                shell.style.boxShadow = isHoveredActive
                  ? "0 28px 62px -12px rgba(18, 19, 23, 0.32)"
                  : "0 20px 48px -14px rgba(18, 19, 23, 0.20)";
              } else if (isPointedCollapsed) {
                shell.style.borderColor = "rgba(49, 134, 255, 0.45)";
                shell.style.boxShadow =
                  "0 14px 32px -12px rgba(49, 134, 255, 0.14)";
              } else {
                shell.style.borderColor = "rgba(33, 34, 38, 0.09)";
                shell.style.boxShadow =
                  "0 4px 18px -6px rgba(18, 19, 23, 0.05)";
              }
            }

            const darkFill = darkFillRefs.current[i];
            if (darkFill) darkFill.style.opacity = w.toFixed(3);

            const sweepEl = sweepGlowRefs.current[i];
            if (sweepEl) {
              const isExpanding = deltaW > 0.0005;
              const sweepPeak =
                Math.sin(Math.PI * w) * (isExpanding ? 0.9 : 0.3);
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
              node.style.transitionDelay = isHoveredActive
                ? `${k * 36}ms`
                : "0ms";
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
      });
    } else {
      // 2. MOBILE & TABLET (< 1024px): Pinned `100svh - navHeight` Stage + Soft Snap
      mm.add("(max-width: 1023px)", () => {
        const mobileEl = mobilePinSectionRef.current;
        if (!mobileEl) return;

        isCardHoveredRef.current = false;
        setIsCardHovered(false);
        setHoverIndex(null);

        const totalMobileSvh =
          entries.length * SERVICES_SECTION_TUNING.MOBILE_SCROLL_SVH_PER_STEP;

        const st = ScrollTrigger.create({
          trigger: mobileEl,
          start: () => `top ${getMeasuredNavHeight()}px`,
          end: `+=${totalMobileSvh}%`,
          pin: true,
          pinSpacing: true,
          scrub: 0.38,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Gentle soft-snap onto the nearest service step once touch scroll settles
          snap: {
            snapTo: [...STEP_HOLD_PROGRESS],
            duration: { min: 0.18, max: 0.42 },
            delay: 0.1,
            ease: "power2.out",
            directional: false,
          },
          onRefreshInit: () => {
            const h = getMeasuredNavHeight();
            document.documentElement.style.setProperty("--nav-h", `${h}px`);
            mobileEl.style.setProperty("--section-nav-h", `${h}px`);
          },
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
          },
        });
        scrollTriggerRef.current = st;

        let rafId = 0;
        let smoothP = scrollProgressRef.current;
        let lastReportedIdx = -1;

        // Vertical-friendly transform + opacity card choreography (GPU-only, reversible)
        const applyMobileChoreography = () => {
          rafId = requestAnimationFrame(applyMobileChoreography);

          smoothP +=
            (scrollProgressRef.current - smoothP) *
            PARTICLE_TUNING.PROGRESS_LERP;

          const state = evaluateServicesMasterTimeline(smoothP);
          const { fromCardIndex, toCardIndex, cardTransitionT } = state;

          if (state.scrollIndex !== lastReportedIdx) {
            lastReportedIdx = state.scrollIndex;
            setScrollIndex(state.scrollIndex);
          }

          const isScrollTrans =
            fromCardIndex !== toCardIndex && cardTransitionT > 0.001;
          const t = easeInOutCubic(cardTransitionT);

          for (let i = 0; i < entries.length; i++) {
            const shell = mobileCardShellRefs.current[i];
            if (!shell) continue;

            let opacity = 0;
            let slideY = 0;
            let scale = 1;

            if (!isScrollTrans) {
              if (i === state.scrollIndex) {
                opacity = 1;
                slideY = 0;
                scale = 1;
              }
            } else if (i === fromCardIndex) {
              opacity = Math.max(
                0,
                1 - easeInOutCubic(Math.min(1, cardTransitionT * 1.18))
              );
              slideY = -t * 24;
              scale = 1 - t * 0.02;
            } else if (i === toCardIndex) {
              opacity = easeInOutCubic(
                Math.max(0, (cardTransitionT - 0.06) / 0.94)
              );
              slideY = (1 - t) * 24;
              scale = 0.98 + t * 0.02;
            }

            const isVisible = opacity > 0.004;
            const isPrimary = !isScrollTrans
              ? i === state.scrollIndex
              : cardTransitionT < 0.5
              ? i === fromCardIndex
              : i === toCardIndex;

            shell.style.visibility = isVisible ? "visible" : "hidden";
            shell.style.opacity = opacity.toFixed(3);
            shell.style.pointerEvents = isPrimary ? "auto" : "none";
            shell.style.zIndex = isPrimary ? "20" : "10";
            shell.style.transform = `translate3d(0, ${slideY.toFixed(
              1
            )}px, 0) scale(${scale.toFixed(4)})`;
          }
        };

        rafId = requestAnimationFrame(applyMobileChoreography);

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
      <section
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
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // 2. MOBILE & TABLET (< 1024px) PINNED STAGE (`100svh - navHeight`)
  //    - Portrait: Top compact heading + step indicator, centered particle canvas
  //      (~34-40% height, tap-to-pulse!), and unclipped bottom active card.
  //    - Landscape (< 500px height): Two-column side-by-side canvas + compact card.
  // --------------------------------------------------------------------------
  if (!isDesktop) {
    const activeNumStr = String(scrollIndex + 1).padStart(2, "0");
    const totalNumStr = String(entries.length).padStart(2, "0");

    return (
      <section
        ref={mobilePinSectionRef}
        id="services"
        aria-labelledby="services-heading-mobile"
        style={
          {
            backgroundColor: SERVICES_SECTION_TUNING.SECTION_BG,
            "--section-nav-h": `${mobileLayout.navH}px`,
            paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
            paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
            paddingBottom:
              "calc(max(12px, env(safe-area-inset-bottom, 0px) + 8px))",
          } as React.CSSProperties
        }
        className="services-mobile-pinned-stage relative w-full text-[#121317] border-t border-[#212226]/[0.07] select-none"
      >
        {/* Soft behind-cloud Antigravity radial glow */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute rounded-full blur-3xl ${
            mobileLayout.isLandscapeShort
              ? "left-[4%] top-1/2 -translate-y-1/2 w-[38vw] h-[72%]"
              : "top-[8%] left-1/2 -translate-x-1/2 w-[82vw] max-w-[460px] h-[34%]"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(49, 134, 255, 0.16) 0%, rgba(116, 155, 255, 0.11) 48%, rgba(255, 255, 255, 0) 76%)",
          }}
        />

        {mobileLayout.isLandscapeShort ? (
          /* ==================================================================
             LANDSCAPE PHONE STAGE (`height < 500px`, e.g. `667x375`, `844x390`)
             Two-column stage: Left particle canvas + Right compact active card
             ================================================================== */
          <div className="relative z-10 w-full h-full max-w-4xl mx-auto pt-2.5 flex items-center gap-4 min-h-0">
            {/* Left Column (42%): Compact Heading + Tap-to-Pulse Particle Stage */}
            <div className="w-[42%] h-full min-h-0 flex flex-col justify-between">
              <div className="shrink-0 flex items-center justify-between gap-2">
                <div>
                  <span className="block text-[9.5px] font-mono uppercase tracking-widest text-[#3186FF]">
                    04 CAPABILITIES
                  </span>
                  <h2
                    id="services-heading-mobile"
                    className="text-lg font-bold tracking-tight leading-tight text-[#121317]"
                  >
                    Our <span className="text-[#3186FF]">Services</span>
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.09] text-[11px] font-mono font-semibold text-[#121317] tabular-nums">
                  {activeNumStr} / {totalNumStr}
                </span>
              </div>

              <div
                style={{ height: `${mobileLayout.canvasH}px` }}
                className="relative w-full flex-1 min-h-0 pointer-events-auto"
              >
                <ServicesParticleCanvas
                  scrollProgressRef={scrollProgressRef}
                  hoverBridgeRef={hoverBridgeRef}
                  layoutMode="mobile"
                  onResizeSettled={scheduleScrollTriggerRefresh}
                  onWebGLUnavailable={handleWebGLUnavailable}
                  className="w-full h-full pointer-events-auto"
                />
              </div>
            </div>

            {/* Right Column (58%): Full Unclipped Single Active Service Card */}
            <div
              ref={mobileCardSlotRef}
              style={{ height: `${mobileLayout.cardH}px` }}
              className="relative flex-1 min-w-0"
            >
              {entries.map((entry, idx) => {
                const isCurrentActive = idx === scrollIndex;
                const indexNumber = String(idx + 1).padStart(2, "0");
                const serviceHref = `/services/${entry.service.slug}`;
                const mScale = mobileCardScales[idx] ?? 1;

                return (
                  <article
                    key={entry.service.id}
                    ref={(el) => {
                      mobileCardShellRefs.current[idx] = el;
                    }}
                    role="link"
                    tabIndex={isCurrentActive ? 0 : -1}
                    aria-hidden={!isCurrentActive}
                    aria-current={isCurrentActive ? "true" : undefined}
                    aria-label={`${indexNumber} ${entry.service.title}`}
                    onClick={() => router.push(serviceHref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(serviceHref);
                      }
                    }}
                    style={{
                      height: `${mobileLayout.cardH}px`,
                      opacity: idx === 0 ? 1 : 0,
                      visibility: idx === 0 ? "visible" : "hidden",
                      pointerEvents: idx === 0 ? "auto" : "none",
                      background: `linear-gradient(152deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 65%, #0D0E12 100%)`,
                    }}
                    className="absolute inset-x-0 top-0 rounded-[20px] border border-[#121317] text-white shadow-[0_18px_44px_rgba(18,19,23,0.2)] cursor-pointer will-change-transform active:scale-[0.99] transition-[border-color] duration-150"
                  >
                    <div
                      ref={(el) => {
                        mobileCardInnerMeasureRefs.current[idx] = el;
                      }}
                      style={
                        mScale < 0.999
                          ? {
                              transform: `scale(${mScale})`,
                              transformOrigin: "top left",
                              width: `${(100 / mScale).toFixed(2)}%`,
                              height: `${(100 / mScale).toFixed(2)}%`,
                            }
                          : undefined
                      }
                      className="h-full min-h-0 flex flex-col justify-between p-3.5"
                    >
                      <div className="shrink-0 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block text-[9.5px] font-mono uppercase tracking-widest text-[#749BFF]">
                            {indexNumber} / DISCIPLINE
                          </span>
                          <h3 className="text-base font-bold text-white tracking-tight truncate">
                            {entry.service.title}
                          </h3>
                        </div>
                        <Link
                          href={serviceHref}
                          tabIndex={isCurrentActive ? 0 : -1}
                          aria-label={`Open ${entry.service.title} service page`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-11 h-11 rounded-full bg-white/10 active:bg-[#3186FF] active:scale-95 flex items-center justify-center text-white shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
                        >
                          <svg
                            viewBox="0 0 22 22"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              d="M5.5 16.5L15.5 6.5M7.5 6.5h8v8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </div>

                      <div className="flex-1 min-h-0 flex items-center py-1.5">
                        <p className="text-xs leading-[1.42] text-[#B2BBC5] line-clamp-2">
                          {entry.service.shortDesc}
                        </p>
                      </div>

                      <div className="shrink-0 grid grid-cols-[1.35fr_0.95fr] gap-3 pt-2 border-t border-white/10">
                        <div>
                          <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#749BFF] mb-1">
                            Services
                          </div>
                          <ul className="space-y-0.5 text-[11px] leading-[1.28] text-white/95">
                            {entry.compactBullets.map((item) => (
                              <li key={item} >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#749BFF] mb-1">
                            Tools
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 max-w-[92px] text-white/95">
                            {entry.displayTools.map((tool, tIdx) => (
                              <div
                                key={`${tool}-${tIdx}`}
                                title={tool}
                                className="w-5 h-5 flex items-center justify-center"
                              >
                                {renderServiceToolIcon(tool)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* ==================================================================
             PORTRAIT PHONE & TABLET STAGE (`360px - 1023px`, `height >= 500px`)
             Top: Compact heading + Step Indicator (`01 / 04` + 44x44 step dots)
             Middle: Centered Particle Canvas (~34-40% usable height, tap-to-pulse!)
             Bottom: Full-width (minus 16px gutters) single unclipped active card
             ================================================================== */
          <div className="relative z-10 w-full h-full max-w-2xl mx-auto pt-2.5 sm:pt-4 flex flex-col justify-between min-h-0">
            {/* 1. Compact Heading + Step Indicator (`shrink-0`) */}
            <div
              ref={mobileHeaderRef}
              className="shrink-0 flex items-end justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] font-mono text-[10px] text-[#45474D] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
                  <span>04 CORE CAPABILITIES</span>
                </div>
                <h2
                  id="services-heading-mobile"
                  className="text-[clamp(1.35rem,4.8vw,2rem)] font-bold tracking-[-0.025em] leading-[1.06] text-[#121317]"
                >
                  Our <span className="text-[#3186FF]">Services</span>
                </h2>
                <p className="hidden sm:block mt-1 text-xs text-[#45474D] max-w-md leading-relaxed">
                  Comprehensive digital solutions that transform your business
                  across web, design, and AI.
                </p>
              </div>

              {/* Accessible Step Counter + 44x44px Interactive Step Dots */}
              <div className="shrink-0 flex flex-col items-end">
                <span
                  aria-live="polite"
                  className="text-xs font-mono font-bold text-[#121317] tabular-nums pr-1"
                >
                  <span className="text-[#3186FF]">{activeNumStr}</span>
                  <span className="text-[#6A6A71]"> / {totalNumStr}</span>
                </span>
                <div
                  role="tablist"
                  aria-label="Service steps"
                  className="hidden sm:flex items-center -mr-2"
                >
                  {entries.map((entry, idx) => {
                    const isSelected = idx === scrollIndex;
                    return (
                      <button
                        key={entry.service.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-label={`Step 0${idx + 1}: ${entry.service.title}`}
                        onClick={() => scrollToServiceStep(idx)}
                        className="w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] rounded-full"
                      >
                        <span
                          className={`block rounded-full transition-all duration-300 ${
                            isSelected
                              ? "w-5 h-2 bg-[#121317]"
                              : "w-2 h-2 bg-[#CDD4DC]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Top Particle Morph Canvas (~34-40% usable height; tap triggers ~36% pulse!) */}
            <div
              style={{ height: `${mobileLayout.canvasH}px` }}
              className="relative w-full shrink-0 my-1 pointer-events-auto"
            >
              <ServicesParticleCanvas
                scrollProgressRef={scrollProgressRef}
                hoverBridgeRef={hoverBridgeRef}
                layoutMode="mobile"
                onResizeSettled={scheduleScrollTriggerRefresh}
                onWebGLUnavailable={handleWebGLUnavailable}
                className="w-full h-full pointer-events-auto"
              />
            </div>

            {/* 3. Bottom Single Active Service Card (100% visible, zero clipped content) */}
            <div
              ref={mobileCardSlotRef}
              style={{ height: `${mobileLayout.cardH}px` }}
              className="relative w-full shrink-0"
            >
              {entries.map((entry, idx) => {
                const isCurrentActive = idx === scrollIndex;
                const indexNumber = String(idx + 1).padStart(2, "0");
                const serviceHref = `/services/${entry.service.slug}`;
                const bullets = mobileLayout.isCompactPhone
                  ? entry.compactBullets
                  : entry.normalBullets;
                const mScale = mobileCardScales[idx] ?? 1;

                return (
                  <article
                    key={entry.service.id}
                    ref={(el) => {
                      mobileCardShellRefs.current[idx] = el;
                    }}
                    role="link"
                    tabIndex={isCurrentActive ? 0 : -1}
                    aria-hidden={!isCurrentActive}
                    aria-current={isCurrentActive ? "true" : undefined}
                    aria-label={`${indexNumber} ${entry.service.title}`}
                    onClick={() => router.push(serviceHref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(serviceHref);
                      }
                    }}
                    style={{
                      height: `${mobileLayout.cardH}px`,
                      opacity: idx === 0 ? 1 : 0,
                      visibility: idx === 0 ? "visible" : "hidden",
                      pointerEvents: idx === 0 ? "auto" : "none",
                      background: `linear-gradient(152deg, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_TOP} 0%, ${SERVICES_SECTION_TUNING.ACTIVE_CARD_BOTTOM} 65%, #0D0E12 100%)`,
                    }}
                    className="absolute inset-x-0 top-0 rounded-[22px] sm:rounded-[24px] border border-[#121317] text-white shadow-[0_20px_48px_-12px_rgba(18,19,23,0.24)] cursor-pointer select-text will-change-transform active:scale-[0.988] transition-[border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
                  >
                    {/* Clipped decorative corner sheen (never clips text!) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[21px] sm:rounded-[23px] overflow-hidden"
                    >
                      <div
                        className="pointer-events-none absolute -bottom-16 -right-14 w-44 h-44 rounded-full blur-3xl opacity-35"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(49, 134, 255, 0.55) 0%, transparent 72%)",
                        }}
                      />
                    </div>

                    {/* Flex Content Column (`min-h-0` + last-resort proportional scale safety net) */}
                    <div
                      ref={(el) => {
                        mobileCardInnerMeasureRefs.current[idx] = el;
                      }}
                      style={
                        mScale < 0.999
                          ? {
                              transform: `scale(${mScale})`,
                              transformOrigin: "top left",
                              width: `${(100 / mScale).toFixed(2)}%`,
                              height: `${(100 / mScale).toFixed(2)}%`,
                            }
                          : undefined
                      }
                      className={`relative z-20 h-full min-h-0 flex flex-col justify-between ${
                        mobileLayout.isCompactPhone
                          ? "p-4"
                          : "p-4 sm:p-6"
                      }`}
                    >
                      {/* Card Header (shrink-0) */}
                      <div className="shrink-0 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-widest text-[#749BFF] mb-0.5">
                            {indexNumber} / DISCIPLINE
                          </span>
                          <h3
                            className={`font-bold tracking-tight text-white leading-[1.18] ${
                              mobileLayout.isCompactPhone
                                ? "text-[18px]"
                                : "text-[clamp(18.5px,3.2vw,22px)]"
                            }`}
                          >
                            {entry.service.title}
                          </h3>
                        </div>

                        {/* >= 44x44px Tap Target Arrow Link with Quick Press Feedback */}
                        <Link
                          href={serviceHref}
                          tabIndex={isCurrentActive ? 0 : -1}
                          aria-label={`Open ${entry.service.title} service page`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-11 h-11 rounded-full bg-white/10 active:bg-[#3186FF] active:scale-95 flex items-center justify-center text-white shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
                        >
                          <svg
                            viewBox="0 0 22 22"
                            className="w-4 h-4"
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

                      {/* Card Description (`flex-1 min-h-0`, 3-4 clamped lines, readable >= 14px where space allows) */}
                      <div
                        className={`flex-1 min-h-0 flex items-center ${
                          mobileLayout.isCompactPhone ? "py-1.5" : "py-2"
                        }`}
                      >
                        <p
                          className={`text-[#B2BBC5] font-normal ${
                            mobileLayout.isCompactPhone
                              ? "text-[13.5px] leading-[1.45]"
                              : "text-[14px] sm:text-[14.5px] leading-[1.52]"
                          }`}
                        >
                          {entry.service.shortDesc}
                        </p>
                      </div>

                      {/* Card Footer (shrink-0): First 3-4 bullets + 6 Tool Icons */}
                      <div
                        className={`shrink-0 grid grid-cols-[1.38fr_0.92fr] gap-3 sm:gap-5 items-start border-t border-white/10 ${
                          mobileLayout.isCompactPhone ? "pt-2.5" : "pt-3"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF] mb-1.5">
                            Services
                          </div>
                          <ul
                            className={`text-white/95 font-normal ${
                              mobileLayout.isCompactPhone
                                ? "space-y-1 text-[11.5px] leading-[1.3]"
                                : "space-y-1.5 text-[12px] sm:text-[12.5px] leading-[1.35]"
                            }`}
                          >
                            {bullets.map((line) => (
                              <li key={line} >
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#749BFF] mb-1.5">
                            Tools
                          </div>
                          <div
                            className={`grid grid-cols-3 max-w-[108px] text-white/95 ${
                              mobileLayout.isCompactPhone
                                ? "gap-2"
                                : "gap-2.5"
                            }`}
                          >
                            {entry.displayTools.map((tool, tIdx) => (
                              <div
                                key={`${tool}-${tIdx}`}
                                title={tool}
                                className={`flex items-center justify-center ${
                                  mobileLayout.isCompactPhone
                                    ? "w-5 h-5"
                                    : "w-6 h-6"
                                }`}
                              >
                                {renderServiceToolIcon(tool)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // 3. DESKTOP (>= 1024px) PINNED STAGE (`100dvh - navHeight` — 100% UNCHANGED)
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
        <div className="relative w-[45%] xl:w-[46%] shrink-0 h-full pointer-events-auto">
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

            {/* 2. Card Stage Area */}
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
                <div
                  ref={cardsTrackRef}
                  style={{
                    gap: `${layout.gap}px`,
                    height: `${layout.cardH}px`,
                  }}
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
