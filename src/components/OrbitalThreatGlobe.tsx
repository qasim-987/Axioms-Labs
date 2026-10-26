"use client";

import React, { useEffect, useRef, useState } from "react";
import { ThreatArcTelemetry } from "@/lib/apiClient";

const DEFAULT_ARCS: ThreatArcTelemetry[] = [
  {
    id: "arc-1",
    sourceCity: "Frankfurt Edge",
    sourceLat: 50.11,
    sourceLng: 8.68,
    targetCity: "Ashburn VPC",
    targetLat: 39.04,
    targetLng: -77.49,
    technique: "RAG Context Poisoning",
    severity: "Critical",
    status: "Blocked",
    latencyMs: 3.4,
  },
  {
    id: "arc-2",
    sourceCity: "Singapore PoP",
    sourceLat: 1.35,
    sourceLng: 103.82,
    targetCity: "London Core",
    targetLat: 51.51,
    targetLng: -0.13,
    technique: "MCP Tool Escalation",
    severity: "Agent-Level",
    status: "Quarantined",
    latencyMs: 4.1,
  },
  {
    id: "arc-3",
    sourceCity: "São Paulo",
    sourceLat: -23.55,
    sourceLng: -46.63,
    targetCity: "Silicon Valley",
    targetLat: 37.39,
    targetLng: -122.08,
    technique: "Adversarial Jailbreak",
    severity: "AI-Assisted",
    status: "Blocked",
    latencyMs: 2.8,
  },
  {
    id: "arc-4",
    sourceCity: "Tokyo IX",
    sourceLat: 35.68,
    sourceLng: 139.65,
    targetCity: "Frankfurt Edge",
    targetLat: 50.11,
    targetLng: 8.68,
    technique: "Gradient Probe",
    severity: "Critical",
    status: "Contained",
    latencyMs: 3.9,
  },
];

function latLngTo3D(lat: number, lng: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

function rotatePoint(
  p: { x: number; y: number; z: number },
  yaw: number,
  pitch: number
) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = p.x * cosY - p.z * sinY;
  const z1 = p.x * sinY + p.z * cosY;

  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = p.y * cosP - z1 * sinP;
  const z2 = p.y * sinP + z1 * cosP;

  return { x: x1, y: y2, z: z2 };
}

export default function OrbitalThreatGlobe({
  arcs = DEFAULT_ARCS,
  isLive = true,
}: {
  arcs?: ThreatArcTelemetry[];
  isLive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yawRef = useRef<number>(0.6);
  const pitchRef = useRef<number>(0.28);
  const zoomRef = useRef<number>(1);
  const draggingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomPct, setZoomPct] = useState<number>(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId = 0;
    let tick = 0;

    // Precompute Fibonacci lattice sphere dots
    const dotCount = 340;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const unitDots = Array.from({ length: dotCount }, (_, i) => {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.36 * zoomRef.current;

      ctx.clearRect(0, 0, w, h);

      if (isLive && !draggingRef.current && !prefersReduced) {
        yawRef.current += 0.0035;
        tick += 0.016;
      }

      // Outer atmospheric rim halo
      const halo = ctx.createRadialGradient(
        cx,
        cy,
        baseRadius * 0.65,
        cx,
        cy,
        baseRadius * 1.35
      );
      halo.addColorStop(0, "rgba(133, 135, 227, 0.08)");
      halo.addColorStop(0.65, "rgba(105, 106, 172, 0.14)");
      halo.addColorStop(1, "rgba(3, 3, 3, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Sphere outline
      ctx.strokeStyle = "rgba(195, 196, 247, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Lattice surface dots
      for (const ud of unitDots) {
        const rp = rotatePoint(
          {
            x: ud.x * baseRadius,
            y: ud.y * baseRadius,
            z: ud.z * baseRadius,
          },
          yawRef.current,
          pitchRef.current
        );
        const depthAlpha = rp.z > 0 ? 0.55 : 0.1;
        ctx.fillStyle = `rgba(165, 168, 240, ${depthAlpha})`;
        ctx.beginPath();
        ctx.arc(cx + rp.x, cy - rp.y, rp.z > 0 ? 1.35 : 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw orbital threat arcs
      const activeArcs = arcs.length > 0 ? arcs : DEFAULT_ARCS;
      activeArcs.forEach((arc, idx) => {
        const s3 = rotatePoint(
          latLngTo3D(arc.sourceLat, arc.sourceLng, baseRadius),
          yawRef.current,
          pitchRef.current
        );
        const t3 = rotatePoint(
          latLngTo3D(arc.targetLat, arc.targetLng, baseRadius),
          yawRef.current,
          pitchRef.current
        );

        const midRaw = {
          x: ((s3.x + t3.x) / 2) * 1.32,
          y: ((s3.y + t3.y) / 2) * 1.32,
        };

        const sx = cx + s3.x;
        const sy = cy - s3.y;
        const tx = cx + t3.x;
        const ty = cy - t3.y;
        const mx = cx + midRaw.x;
        const my = cy - midRaw.y;

        const strokeColor =
          arc.severity === "Critical"
            ? "rgba(251, 113, 133, 0.78)"
            : arc.severity === "Agent-Level"
            ? "rgba(133, 135, 227, 0.85)"
            : "rgba(52, 211, 153, 0.78)";

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        ctx.stroke();

        // Animated traveling packet along quadratic bezier
        const u = (tick * 0.55 + idx * 0.27) % 1;
        const px =
          (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * tx;
        const py =
          (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * ty;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Source & Target beacons
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.arc(tx, ty, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [arcs, isLive]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    yawRef.current += dx * 0.007;
    pitchRef.current = Math.max(
      -1.1,
      Math.min(1.1, pitchRef.current + dy * 0.007)
    );
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const next = Math.max(
      0.75,
      Math.min(1.35, zoomRef.current - e.deltaY * 0.0006)
    );
    zoomRef.current = next;
    setZoomPct(Math.round(next * 100));
  };

  return (
    <div className="relative rounded-3xl bg-[#07070c] border border-white/[0.08] overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 relative z-10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold block">
            ORBITAL TELEMETRY SPHERE
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Global Adversarial Vector Intercepts
          </h3>
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          Drag: Rotate • Scroll: Zoom ({zoomPct}%)
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        className="w-full h-[300px] sm:h-[340px] cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}
