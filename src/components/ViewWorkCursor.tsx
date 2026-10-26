"use client";

import React, { useEffect, useRef, useState } from "react";

interface ViewWorkCursorProps {
  label?: string;
}

export default function ViewWorkCursor({ label = "View Work" }: ViewWorkCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Only enable on devices with hover and fine pointer
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasHover) return;

    setIsSupported(true);

    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    // Physics & smoothing parameters
    const LERP_FACTOR = prefersReducedMotion ? 1.0 : 0.15;
    const SQUASH_STRETCH_MAX = prefersReducedMotion ? 0 : 0.08;

    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let prevX = -9999;
    let prevY = -9999;

    let isHoveringCard = false;
    let activeLabel = label;
    let currentScale = 0;
    let targetScale = 0;
    let currentOpacity = 0;
    let targetOpacity = 0;
    let textOpacity = 0;
    let targetTextOpacity = 0;

    let enterStartTime = 0;
    let rafId = 0;

    // Cubic bezier ease-out approximation: cubic-bezier(0.22, 1, 0.36, 1)
    const easeOutCubic = (t: number) => {
      const p = 1 - t;
      return 1 - p * p * p;
    };

    const easeInCubic = (t: number) => t * t * t;

    // Pointer move updates target position
    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // If just entering, initialize position directly at entry point to prevent flying from (0,0)
      if (currentX === -9999) {
        currentX = targetX;
        currentY = targetY;
        prevX = targetX;
        prevY = targetY;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Track targets with data-cursor="view-work"
    const handlePointerOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("[data-cursor='view-work']");
      if (target) {
        isHoveringCard = true;
        targetScale = 1.0;
        targetOpacity = 1.0;
        targetTextOpacity = 1.0;
        enterStartTime = performance.now();

        // Check for custom card label if provided
        const customLabel = target.getAttribute("data-cursor-label");
        if (customLabel) {
          activeLabel = customLabel;
          if (textRef.current) textRef.current.textContent = customLabel;
        } else {
          activeLabel = label;
          if (textRef.current) textRef.current.textContent = label;
        }

        // Initialize at pointer position immediately
        if (currentX === -9999 || targetScale === 0) {
          currentX = e.clientX;
          currentY = e.clientY;
          prevX = e.clientX;
          prevY = e.clientY;
        }
      }
    };

    const handlePointerOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("[data-cursor='view-work']");
      const related = (e.relatedTarget as HTMLElement)?.closest("[data-cursor='view-work']");

      if (target && !related) {
        // Left the card entirely
        isHoveringCard = false;
        targetScale = 0;
        targetOpacity = 0;
        targetTextOpacity = 0;
      } else if (target && related && target !== related) {
        // Crossing the gap between card 01 and card 02: shrink and regrow
        targetScale = 0.2;
        targetOpacity = 0.5;
        setTimeout(() => {
          if (isHoveringCard) {
            targetScale = 1.0;
            targetOpacity = 1.0;
          }
        }, 120);
      }
    };

    document.addEventListener("mouseover", handlePointerOver, { passive: true });
    document.addEventListener("mouseout", handlePointerOut, { passive: true });

    // 60FPS RAF animation loop
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      rafId = requestAnimationFrame(updateLoop);

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Position lerp
      if (currentX !== -9999) {
        currentX += (targetX - currentX) * LERP_FACTOR;
        currentY += (targetY - currentY) * LERP_FACTOR;
      }

      // Enter scale animation (~450ms power3.out)
      // Leave scale animation (~300ms power3.in)
      const scaleSpeed = targetScale > currentScale ? 3.8 : 5.2;
      currentScale += (targetScale - currentScale) * Math.min(1, dt * scaleSpeed);

      const opacitySpeed = targetOpacity > currentOpacity ? 4.5 : 6.0;
      currentOpacity += (targetOpacity - currentOpacity) * Math.min(1, dt * opacitySpeed);

      // Text fade in with ~150ms delay
      const elapsedSinceEnter = now - enterStartTime;
      if (isHoveringCard && elapsedSinceEnter > 140) {
        textOpacity += (targetTextOpacity - textOpacity) * Math.min(1, dt * 6.0);
      } else if (!isHoveringCard) {
        textOpacity += (0 - textOpacity) * Math.min(1, dt * 8.0);
      }

      // Squash and stretch proportional to velocity
      const vx = currentX - prevX;
      const vy = currentY - prevY;
      prevX = currentX;
      prevY = currentY;

      const velocity = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx);

      const stretch = Math.min(SQUASH_STRETCH_MAX, velocity * 0.0035);
      const scaleX = 1 + stretch;
      const scaleY = 1 - stretch * 0.85;

      if (cursorEl) {
        if (currentOpacity < 0.005) {
          cursorEl.style.opacity = "0";
          cursorEl.style.transform = "translate3d(-9999px, -9999px, 0)";
        } else {
          cursorEl.style.opacity = currentOpacity.toFixed(3);
          // Apply position translation, angle, squash/stretch and enter scale
          cursorEl.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(
            2
          )}px, 0) translate(-50%, -50%) rotate(${angle.toFixed(
            3
          )}rad) scale(${(scaleX * currentScale).toFixed(3)}, ${(scaleY * currentScale).toFixed(
            3
          )}) rotate(${(-angle).toFixed(3)}rad)`;
        }
      }

      if (textRef.current) {
        textRef.current.style.opacity = textOpacity.toFixed(3);
      }
    };

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("mouseout", handlePointerOut);
    };
  }, [label]);

  if (!isSupported) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none select-none will-change-transform opacity-0 z-40"
      style={{
        mixBlendMode: "difference",
      }}
    >
      {/* 
        Solid White Circle with Difference Blend:
        - Over Black areas: appears pure white
        - Over Light Gray areas (#e8e8e8): appears dark near-black
        - Over mixed content: splits inverted across dark/light
      */}
      <div
        className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[160px] md:h-[160px] lg:w-[190px] lg:h-[190px] rounded-full bg-white flex items-center justify-center shadow-sm"
        style={{
          transformOrigin: "center center",
        }}
      >
        {/* 
          Text: Black text inside difference blend container:
          |Pixel - 0| preserves the underlying pixel color:
          - Over black: text appears Black (#000) on White circle!
          - Over light gray: text appears Light Gray (#e8e8e8) on Dark circle!
          It is always 100% legible and perfectly inverted.
        */}
        <span
          ref={textRef}
          className="text-black font-medium text-xs sm:text-sm md:text-base tracking-normal whitespace-nowrap select-none transition-opacity duration-150"
        >
          {label}
        </span>
      </div>
    </div>
  );
}
