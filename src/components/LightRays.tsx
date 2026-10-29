"use client";

import React, { useEffect, useRef } from "react";

const PARTICLE_COLORS = [
  "rgba(49, 134, 255,",
  "rgba(116, 155, 255,",
  "rgba(252, 65, 61,",
  "rgba(251, 188, 4,",
  "rgba(0, 185, 92,",
];

export default function LightRays() {
  const rootRef = useRef<HTMLDivElement>(null);
  const beamWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const rootEl = rootRef.current;
    const canvas = canvasRef.current;
    if (!rootEl || !canvas) return;

    const fineHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const isSmallScreen = window.innerWidth < 1024;
    const moteCount = isSmallScreen ? 24 : 44;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let isVisible = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!fineHover || !isVisible) return;
      const nx = e.clientX / Math.max(1, window.innerWidth) - 0.5;
      const ny = e.clientY / Math.max(1, window.innerHeight) - 0.5;
      targetX = nx * 32;
      targetY = ny * 16;
    };

    if (fineHover) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: moteCount }, (_, idx) => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.6,
      vy: -(Math.random() * 0.00035 + 0.00012),
      vx: (Math.random() - 0.5) * 0.00018,
      alpha: Math.random() * 0.42 + 0.16,
      colorPrefix: PARTICLE_COLORS[idx % PARTICLE_COLORS.length],
    }));

    const resize = () => {
      const w = Math.max(1, rootEl.clientWidth || window.innerWidth);
      const h = Math.max(1, rootEl.clientHeight || 720);
      canvas.width = w;
      canvas.height = h;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(rootEl);

    const render = () => {
      if (!isVisible || document.hidden) {
        rafId = 0;
        return;
      }

      if (fineHover && beamWrapRef.current) {
        currentX += (targetX - currentX) * 0.045;
        currentY += (targetY - currentY) * 0.045;
        beamWrapRef.current.style.transform = `translate3d(${currentX.toFixed(
          2
        )}px, ${currentY.toFixed(2)}px, 0)`;
      }

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < 0) {
            p.y = 1;
            p.x = 0.2 + Math.random() * 0.6;
          }
          const distFromCenter = Math.abs(p.x - 0.5) * 2;
          const coneMask =
            Math.max(0, 1 - distFromCenter * 1.35) * (1 - p.y * 0.65);
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `${p.colorPrefix} ${(p.alpha * coneMask).toFixed(
            3
          )})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    const ensureRunning = () => {
      if (isVisible && !document.hidden && rafId === 0) {
        rafId = requestAnimationFrame(render);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) ensureRunning();
      },
      { threshold: 0.01 }
    );
    io.observe(rootEl);

    const onVisChange = () => {
      if (!document.hidden) ensureRunning();
    };
    document.addEventListener("visibilitychange", onVisChange);
    ensureRunning();

    return () => {
      io.disconnect();
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (fineHover) {
        window.removeEventListener("mousemove", onMouseMove);
      }
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden h-[680px] sm:h-[950px] select-none"
    >
      <div
        ref={beamWrapRef}
        className="relative w-full h-full flex justify-center lg:will-change-transform"
      >
        <div className="light-rays-bg">
          <div className="ray-conic animate-pulse-glow" />
          <div className="ray-striations" />
          <div className="ray-glow" />
        </div>
      </div>

      {/* Floating Antigravity Multicolor Particle Specks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-80"
      />
    </div>
  );
}
