"use client";

import React, { useEffect, useRef } from "react";

export default function LightRays() {
  const beamWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 32;
      targetY = ny * 16;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.4,
      vy: -(Math.random() * 0.00035 + 0.00012),
      vx: (Math.random() - 0.5) * 0.00018,
      alpha: Math.random() * 0.45 + 0.1,
    }));

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = 950;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      if (beamWrapRef.current) {
        beamWrapRef.current.style.transform = `translate3d(${currentX.toFixed(
          2
        )}px, ${currentY.toFixed(2)}px, 0)`;
      }

      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < 0) {
            p.y = 1;
            p.x = 0.25 + Math.random() * 0.5;
          }
          const distFromCenter = Math.abs(p.x - 0.5) * 2;
          const coneMask =
            Math.max(0, 1 - distFromCenter * 1.4) * (1 - p.y * 0.7);
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(195, 196, 247, ${(p.alpha * coneMask).toFixed(
            3
          )})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden h-[950px] select-none"
    >
      {/* Interactive Lerped Parallax Volumetric Layer */}
      <div
        ref={beamWrapRef}
        className="relative w-full h-full flex justify-center will-change-transform"
      >
        {/* Central Top Source Flare */}
        <div className="absolute -top-36 h-[420px] w-[760px] rounded-full bg-gradient-to-b from-white/20 via-brand-primary/25 to-transparent blur-3xl opacity-85" />

        {/* Main Conic God-Ray Fan */}
        <div
          className="ray-conic animate-pulse-glow"
          style={{ transformOrigin: "50% 0%" }}
        />

        {/* Secondary Counter-Sweeping Ray Striations */}
        <div
          className="ray-striations animate-beam-sweep"
          style={{ transformOrigin: "50% 0%" }}
        />

        {/* Soft Radial Bloom */}
        <div className="ray-glow" />
      </div>

      {/* Atmospheric Dust Motes Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-75"
      />

      {/* Precision Micro-Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Bottom Fade to Solid Obsidian Background */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-transparent" />
    </div>
  );
}
