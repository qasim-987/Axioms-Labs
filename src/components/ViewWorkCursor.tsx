"use client";

import React, { useEffect, useRef, useState } from "react";

interface ViewWorkCursorProps {
  label?: string;
}

/**
 * Exact CSS cubic-bezier(x1, y1, x2, y2) solver (Newton-Raphson + bisection fallback)
 * for the 450ms enter curve: cubic-bezier(0.22, 1, 0.36, 1) ("power3.out" equivalent).
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

// Final Tuned Constants (documented in Animations.md -> "Case study cursor")
const LERP_FACTOR_60FPS = 0.15;
const ENTER_DURATION_MS = 450;
const LEAVE_DURATION_MS = 300;
const TEXT_FADE_DELAY_MS = 150;
const TEXT_FADE_DURATION_MS = 200;
const ENTER_INITIAL_SCALE = 0.15;
const MAX_SQUASH_STRETCH = 0.08;
const REDUCED_MOTION_FADE_MS = 160;

const easeEnter = createCubicBezier(0.22, 1, 0.36, 1);
const easeLeavePower3In = (t: number) => t * t * t;

/**
 * Card-scoped "View Work" magnetic difference cursor.
 * Mount directly inside a `relative w-full overflow-hidden` project card `<a>` / `<Link>`.
 * Strictly bounded and hardware-clipped to 100% of that card image — zero effect ever leaks outside the image.
 */
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
    const cardEl = wrapperEl?.parentElement;
    if (!wrapperEl || !circleEl || !textEl || !cardEl) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let prefersReducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange = (ev: MediaQueryListEvent) => {
      prefersReducedMotion = ev.matches;
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    // Cached card origin (updated ONLY on pointerenter & passive scroll/resize while hovered; zero layout reads in RAF)
    let cardLeft = 0;
    let cardTop = 0;
    let cardWidth = 0;
    let cardHeight = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const refreshCardBounds = () => {
      const rect = cardEl.getBoundingClientRect();
      cardLeft = rect.left;
      cardTop = rect.top;
      cardWidth = rect.width;
      cardHeight = rect.height;
    };

    // Card-local pointer & smoothed follower coordinates
    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let prevX = -9999;
    let prevY = -9999;
    let hasPosition = false;

    let smoothVx = 0;
    let smoothVy = 0;
    let motionAngle = 0;

    type Phase = "idle" | "entering" | "open" | "leaving";
    let phase: Phase = "idle";
    let phaseStartTime = 0;
    let enterStartTime = 0;

    let currentScale = 0;
    let currentOpacity = 0;
    let textOpacity = 0;

    let tweenFromScale = ENTER_INITIAL_SCALE;
    let tweenFromOpacity = 0;

    const clampToCard = (x: number, y: number) => ({
      x: Math.max(0, Math.min(cardWidth, x)),
      y: Math.max(0, Math.min(cardHeight, y)),
    });

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      refreshCardBounds();
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      const local = clampToCard(e.clientX - cardLeft, e.clientY - cardTop);
      const now = performance.now();

      if (!hasPosition || phase === "idle" || currentOpacity < 0.02) {
        targetX = local.x;
        targetY = local.y;
        currentX = local.x;
        currentY = local.y;
        prevX = local.x;
        prevY = local.y;
        smoothVx = 0;
        smoothVy = 0;
        hasPosition = true;
      } else {
        targetX = local.x;
        targetY = local.y;
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

      tweenFromScale =
        phase === "idle" || currentScale < ENTER_INITIAL_SCALE
          ? ENTER_INITIAL_SCALE
          : currentScale;
      tweenFromOpacity =
        phase === "idle" ? 0.08 : Math.max(0.08, currentOpacity);

      if (phase === "idle") {
        textOpacity = 0;
      }

      currentScale = tweenFromScale;
      currentOpacity = tweenFromOpacity;
      phase = "entering";
      phaseStartTime = now;
      enterStartTime = now;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (phase === "idle" || phase === "leaving") return;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      const local = clampToCard(e.clientX - cardLeft, e.clientY - cardTop);
      targetX = local.x;
      targetY = local.y;
    };

    const startLeave = () => {
      if (phase === "idle" || phase === "leaving") return;
      // Freeze targetX/targetY inside the image so the circle shrinks in-bounds and never chases the pointer outside
      tweenFromScale = currentScale;
      tweenFromOpacity = currentOpacity;
      phase = "leaving";
      phaseStartTime = performance.now();
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      startLeave();
    };

    const onViewportShift = () => {
      if (phase === "entering" || phase === "open") {
        refreshCardBounds();
        const rawX = lastClientX - cardLeft;
        const rawY = lastClientY - cardTop;
        if (rawX < 0 || rawX > cardWidth || rawY < 0 || rawY > cardHeight) {
          startLeave();
        } else {
          targetX = rawX;
          targetY = rawY;
        }
      }
    };

    cardEl.addEventListener("pointerenter", onPointerEnter, { passive: true });
    cardEl.addEventListener("pointermove", onPointerMove, { passive: true });
    cardEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onViewportShift, { passive: true });
    window.addEventListener("resize", onViewportShift, { passive: true });
    window.addEventListener("blur", startLeave);

    // Single 60fps+ RAF loop — ONLY transform & opacity writes
    let rafId = 0;
    let lastFrameTime = performance.now();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      const dt = Math.min((now - lastFrameTime) / 1000, 0.064);
      lastFrameTime = now;

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
          phase = "idle";
        }
      }

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

      if (phase === "idle" || currentOpacity <= 0.004 || !hasPosition) {
        wrapperEl.style.opacity = "0";
        wrapperEl.style.transform =
          "translate3d(-9999px, -9999px, 0) translate(-50%, -50%)";
        return;
      }

      if (prefersReducedMotion) {
        currentX = targetX;
        currentY = targetY;
      } else {
        const lerpAlpha = 1 - Math.pow(1 - LERP_FACTOR_60FPS, dt * 60);
        currentX += (targetX - currentX) * lerpAlpha;
        currentY += (targetY - currentY) * lerpAlpha;
      }

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

      wrapperEl.style.opacity =
        currentOpacity >= 0.996 ? "1" : currentOpacity.toFixed(3);
      wrapperEl.style.transform = `translate3d(${currentX.toFixed(
        2
      )}px, ${currentY.toFixed(2)}px, 0) translate(-50%, -50%)`;

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
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      cardEl.removeEventListener("pointerenter", onPointerEnter);
      cardEl.removeEventListener("pointermove", onPointerMove);
      cardEl.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onViewportShift);
      window.removeEventListener("resize", onViewportShift);
      window.removeEventListener("blur", startLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute top-0 left-0 z-30 pointer-events-none select-none will-change-transform opacity-0"
      style={{
        mixBlendMode: "difference",
        width: "clamp(100px, 10.1vw, 190px)",
        height: "clamp(100px, 10.1vw, 190px)",
      }}
    >
      <div
        ref={circleRef}
        className="absolute inset-0 rounded-full bg-white will-change-transform"
        style={{ transformOrigin: "50% 50%" }}
      />
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
