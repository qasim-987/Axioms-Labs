"use client";

import React, { useEffect, useRef, useState } from "react";

interface ViewWorkCursorProps {
  label?: string;
}

/**
 * Exact CSS cubic-bezier(x1, y1, x2, y2) evaluator using Newton-Raphson + bisection fallback.
 * Used for the 450ms enter curve: cubic-bezier(0.22, 1, 0.36, 1) ("power3.out" equivalent).
 */
function createCubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveCurveX = (x: number) => {
    let t2 = x;
    for (let i = 0; i < 6; i++) {
      const x2Est = sampleCurveX(t2) - x;
      if (Math.abs(x2Est) < 1e-6) return t2;
      const d2 = sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-6) break;
      t2 -= x2Est / d2;
    }
    let t0 = 0;
    let t1 = 1;
    t2 = x;
    while (t0 < t1) {
      const x2Est = sampleCurveX(t2);
      if (Math.abs(x2Est - x) < 1e-6) return t2;
      if (x > x2Est) t0 = t2;
      else t1 = t2;
      t2 = (t1 - t0) * 0.5 + t0;
    }
    return t2;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleCurveY(solveCurveX(x));
  };
}

// Tuned Final Constants (documented in Animations.md -> "Case study cursor")
const LERP_FACTOR_60FPS = 0.15; // ~0.12-0.18 per 60fps frame; trails fast motion & settles cleanly
const ENTER_DURATION_MS = 450; // ~450ms grow-in from small dot
const LEAVE_DURATION_MS = 300; // ~300ms shrink-out on leave
const TEXT_FADE_DELAY_MS = 150; // ~150ms delayed label fade-in after card entry
const TEXT_FADE_DURATION_MS = 200; // crisp fade duration for "View Work" text
const ENTER_INITIAL_SCALE = 0.15; // starts as a small dot (~15% scale)
const GAP_DIP_MAX_SCALE = 0.22; // guarantees visible shrink & re-grow even on a fast swipe across the 24px gap
const MAX_SQUASH_STRETCH = 0.08; // up to 8% velocity-proportional elongation
const REDUCED_MOTION_FADE_MS = 160; // quick opacity fade when prefers-reduced-motion is enabled

const easeEnter = createCubicBezier(0.22, 1, 0.36, 1);
const easeLeavePower3In = (t: number) => t * t * t;

export default function ViewWorkCursor({
  label = "View Work",
}: ViewWorkCursorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!hoverQuery.matches) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const wrapperEl = wrapperRef.current;
    const circleEl = circleRef.current;
    const textEl = textRef.current;
    if (!wrapperEl || !circleEl || !textEl) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let prefersReducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange = (ev: MediaQueryListEvent) => {
      prefersReducedMotion = ev.matches;
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    // Pointer & smoothed follower coordinates (no layout reads in RAF)
    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let prevX = -9999;
    let prevY = -9999;
    let hasPosition = false;

    // Smoothed velocity & angle for subtle squash-and-stretch without atan2 jitter
    let smoothVx = 0;
    let smoothVy = 0;
    let motionAngle = 0;

    // Tween state machine ("idle" | "entering" | "open" | "leaving")
    type Phase = "idle" | "entering" | "open" | "leaving";
    let phase: Phase = "idle";
    let phaseStartTime = 0;
    let enterStartTime = 0;

    let currentScale = 0;
    let currentOpacity = 0;
    let textOpacity = 0;

    let tweenFromScale = ENTER_INITIAL_SCALE;
    let tweenFromOpacity = 0;

    let activeCard: HTMLElement | null = null;
    let lastHoveredCard: HTMLElement | null = null;

    const startEnter = (card: HTMLElement, clientX: number, clientY: number) => {
      const now = performance.now();
      const switchedCards = lastHoveredCard !== null && lastHoveredCard !== card;
      activeCard = card;
      lastHoveredCard = card;

      const customLabel = card.getAttribute("data-cursor-label") || label;
      if (textEl.textContent !== customLabel) {
        textEl.textContent = customLabel;
      }

      // Initialize position directly at entry point so the circle never flies in from (0, 0)
      if (!hasPosition || phase === "idle" || currentOpacity < 0.02) {
        targetX = clientX;
        targetY = clientY;
        currentX = clientX;
        currentY = clientY;
        prevX = clientX;
        prevY = clientY;
        smoothVx = 0;
        smoothVy = 0;
        hasPosition = true;
      } else {
        targetX = clientX;
        targetY = clientY;
      }

      if (prefersReducedMotion) {
        tweenFromScale = 1;
        currentScale = 1;
        tweenFromOpacity = currentOpacity;
        phase = "entering";
        phaseStartTime = now;
        enterStartTime = now;
        return;
      }

      // Fresh entry starts from small dot (~0.15 scale); rapid card-to-card crossing dips & re-grows
      if (phase === "idle" || currentScale < ENTER_INITIAL_SCALE) {
        tweenFromScale = ENTER_INITIAL_SCALE;
        tweenFromOpacity = 0.08;
        textOpacity = 0;
      } else if (switchedCards) {
        tweenFromScale = Math.min(currentScale, GAP_DIP_MAX_SCALE);
        tweenFromOpacity = Math.min(currentOpacity, 0.45);
        textOpacity = 0;
      } else {
        tweenFromScale = Math.max(ENTER_INITIAL_SCALE, currentScale);
        tweenFromOpacity = currentOpacity;
      }

      currentScale = tweenFromScale;
      currentOpacity = tweenFromOpacity;
      phase = "entering";
      phaseStartTime = now;
      enterStartTime = now;
    };

    const startLeave = () => {
      if (phase === "idle" || phase === "leaving") return;
      activeCard = null;
      tweenFromScale = currentScale;
      tweenFromOpacity = currentOpacity;
      phase = "leaving";
      phaseStartTime = performance.now();
    };

    const onWindowPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasPosition) {
        currentX = e.clientX;
        currentY = e.clientY;
        prevX = e.clientX;
        prevY = e.clientY;
        hasPosition = true;
      }
    };

    // Bind pointerenter & pointerleave directly to each [data-cursor="view-work"] card
    const boundCards = new Set<HTMLElement>();
    const cardHandlers = new WeakMap<
      HTMLElement,
      { enter: (e: PointerEvent) => void; leave: (e: PointerEvent) => void }
    >();

    const attachCardListeners = () => {
      const cards = document.querySelectorAll<HTMLElement>(
        '[data-cursor="view-work"]'
      );
      cards.forEach((card) => {
        if (boundCards.has(card)) return;
        const enter = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          startEnter(card, e.clientX, e.clientY);
        };
        const leave = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          if (activeCard === card) {
            startLeave();
          }
        };
        card.addEventListener("pointerenter", enter, { passive: true });
        card.addEventListener("pointerleave", leave, { passive: true });
        boundCards.add(card);
        cardHandlers.set(card, { enter, leave });
      });
    };

    attachCardListeners();

    const mutationObserver = new MutationObserver(() => {
      attachCardListeners();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const onDocumentLeave = () => {
      if (activeCard) startLeave();
    };

    window.addEventListener("pointermove", onWindowPointerMove, {
      passive: true,
    });
    document.documentElement.addEventListener("mouseleave", onDocumentLeave);
    window.addEventListener("blur", onDocumentLeave);

    // Single 60fps+ requestAnimationFrame loop — transform & opacity writes ONLY
    let rafId = 0;
    let lastFrameTime = performance.now();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      const dt = Math.min((now - lastFrameTime) / 1000, 0.064);
      lastFrameTime = now;

      // 1. Update scale & opacity state machine
      if (phase === "entering") {
        const duration = prefersReducedMotion
          ? REDUCED_MOTION_FADE_MS
          : ENTER_DURATION_MS;
        const rawT = Math.min(1, (now - phaseStartTime) / duration);
        const eased = prefersReducedMotion ? rawT : easeEnter(rawT);

        currentScale = prefersReducedMotion
          ? 1
          : tweenFromScale + (1 - tweenFromScale) * eased;
        currentOpacity = tweenFromOpacity + (1 - tweenFromOpacity) * eased;

        if (rawT >= 1) {
          currentScale = 1;
          currentOpacity = 1;
          phase = "open";
        }
      } else if (phase === "open") {
        currentScale = 1;
        currentOpacity = 1;
      } else if (phase === "leaving") {
        const duration = prefersReducedMotion
          ? REDUCED_MOTION_FADE_MS
          : LEAVE_DURATION_MS;
        const rawT = Math.min(1, (now - phaseStartTime) / duration);
        const easedIn = prefersReducedMotion ? rawT : easeLeavePower3In(rawT);

        currentScale = prefersReducedMotion
          ? 1
          : tweenFromScale * (1 - easedIn);
        currentOpacity = tweenFromOpacity * (1 - easedIn);

        if (rawT >= 1) {
          currentScale = 0;
          currentOpacity = 0;
          textOpacity = 0;
          lastHoveredCard = null;
          phase = "idle";
        }
      }

      // 2. Delayed "View Work" label fade (~150ms delay on enter)
      if (phase === "entering" || phase === "open") {
        if (prefersReducedMotion) {
          textOpacity = currentOpacity;
        } else {
          const sinceEnter = now - enterStartTime;
          if (sinceEnter <= TEXT_FADE_DELAY_MS) {
            textOpacity = 0;
          } else {
            const textT = Math.min(
              1,
              (sinceEnter - TEXT_FADE_DELAY_MS) / TEXT_FADE_DURATION_MS
            );
            textOpacity = easeEnter(textT);
          }
        }
      } else if (phase === "leaving") {
        const leaveT = Math.min(1, (now - phaseStartTime) / 140);
        textOpacity = Math.min(textOpacity, 1 - leaveT);
      } else {
        textOpacity = 0;
      }

      // 3. Early hide when idle (zero GPU overdraw when not over project cards)
      if (phase === "idle" || currentOpacity <= 0.004 || !hasPosition) {
        wrapperEl.style.opacity = "0";
        wrapperEl.style.transform =
          "translate3d(-9999px, -9999px, 0) translate(-50%, -50%)";
        return;
      }

      // 4. Smoothed pointer position (60fps-normalized lerp)
      if (prefersReducedMotion) {
        currentX = targetX;
        currentY = targetY;
      } else {
        const lerpAlpha = 1 - Math.pow(1 - LERP_FACTOR_60FPS, dt * 60);
        currentX += (targetX - currentX) * lerpAlpha;
        currentY += (targetY - currentY) * lerpAlpha;
      }

      // 5. Velocity-proportional subtle squash & stretch (max 8%, circle stays round & text never shears)
      const instVx = (currentX - prevX) / Math.max(dt * 60, 0.25);
      const instVy = (currentY - prevY) / Math.max(dt * 60, 0.25);
      prevX = currentX;
      prevY = currentY;

      smoothVx += (instVx - smoothVx) * 0.35;
      smoothVy += (instVy - smoothVy) * 0.35;

      const speed = Math.hypot(smoothVx, smoothVy);
      if (speed > 0.35) {
        motionAngle = Math.atan2(smoothVy, smoothVx);
      }

      const stretch = prefersReducedMotion
        ? 0
        : Math.min(MAX_SQUASH_STRETCH, speed * 0.0038);
      const scaleX = (1 + stretch) * currentScale;
      const scaleY = (1 - stretch * 0.85) * currentScale;

      // Exact "1" opacity when settled so mix-blend-mode: difference operates at full strength
      wrapperEl.style.opacity =
        currentOpacity >= 0.996 ? "1" : currentOpacity.toFixed(3);
      wrapperEl.style.transform = `translate3d(${currentX.toFixed(
        2
      )}px, ${currentY.toFixed(2)}px, 0) translate(-50%, -50%)`;

      // Apply directional squash/stretch ONLY to the rotationally symmetric circle; keep label upright
      circleEl.style.transform = `rotate(${motionAngle.toFixed(
        3
      )}rad) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;

      textEl.style.opacity =
        textOpacity >= 0.996 ? "1" : Math.max(0, textOpacity).toFixed(3);
      textEl.style.transform = `scale(${currentScale.toFixed(4)})`;
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      window.removeEventListener("pointermove", onWindowPointerMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        onDocumentLeave
      );
      window.removeEventListener("blur", onDocumentLeave);
      boundCards.forEach((card) => {
        const handlers = cardHandlers.get(card);
        if (handlers) {
          card.removeEventListener("pointerenter", handlers.enter);
          card.removeEventListener("pointerleave", handlers.leave);
        }
      });
      boundCards.clear();
    };
  }, [enabled, label]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-40 pointer-events-none select-none will-change-transform opacity-0"
      style={{
        mixBlendMode: "difference",
        width: "clamp(100px, 10.1vw, 190px)",
        height: "clamp(100px, 10.1vw, 190px)",
      }}
    >
      {/* Solid #ffffff circle blended via difference:
          - Over #000000 dark areas -> pure white (#ffffff)
          - Over #e8e8e8 light areas -> dark near-black (#171717) with inverted imagery underneath
          - Over mixed edges -> sharp split inversion */}
      <div
        ref={circleRef}
        className="absolute inset-0 rounded-full bg-white will-change-transform"
        style={{ transformOrigin: "50% 50%" }}
      />

      {/* Upright centered label (#000000 inside difference group -> #000 on white circle, #e8e8e8 on dark circle) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          ref={textRef}
          className="text-black font-normal whitespace-nowrap tracking-normal leading-none select-none will-change-transform opacity-0"
          style={{
            fontSize: "clamp(13px, 0.85vw, 16px)",
            transformOrigin: "50% 50%",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
