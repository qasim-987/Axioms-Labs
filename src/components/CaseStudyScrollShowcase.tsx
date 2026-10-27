"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ClientCaseStudy } from "@/data/clients";

gsap.registerPlugin(ScrollTrigger);

interface StageLayer {
  index: string;
  label: string;
  sublabel: string;
  accent: string;
}

export default function CaseStudyScrollShowcase({
  study,
}: {
  study: ClientCaseStudy;
}) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<number>(0.18);
  const [activeLayer, setActiveLayer] = useState<number>(0);

  const stages: StageLayer[] = useMemo(
    () => [
      {
        index: "01",
        label:
          study.architectureHighlights[0]?.title || "Edge Ingress & Telemetry",
        sublabel:
          study.architectureHighlights[0]?.description ||
          "Zero-trust request ingestion with sub-millisecond schema validation.",
        accent: "#3186FF",
      },
      {
        index: "02",
        label:
          study.architectureHighlights[1]?.title ||
          "Deterministic Guardrail Mesh",
        sublabel:
          study.architectureHighlights[1]?.description ||
          "Isolated tenant execution boundaries with strict policy verification.",
        accent: "#FC413D",
      },
      {
        index: "03",
        label:
          study.architectureHighlights[2]?.title || "Autonomous Core & Evals",
        sublabel:
          study.architectureHighlights[2]?.description ||
          "Continuous canary verification and regression benchmarking before commit.",
        accent: "#00B95C",
      },
      {
        index: "04",
        label: `Concept Target Benchmark (${study.impactMetric})`,
        sublabel: study.impactLabel,
        accent: "#FBBC04",
      },
    ],
    [study]
  );

  useEffect(() => {
    const runway = runwayRef.current;
    const canvas = canvasRef.current;
    if (!runway || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId = 0;
    let tick = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let trigger: ScrollTrigger | null = null;
    if (!prefersReduced) {
      trigger = ScrollTrigger.create({
        trigger: runway,
        start: "top 65%",
        end: "bottom 75%",
        scrub: 0.5,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const idx = Math.min(3, Math.floor(self.progress * 4));
          setActiveLayer(idx);
        },
      });
    } else {
      progressRef.current = 0.85;
    }

    const drawIsoPlane = (
      cx: number,
      cy: number,
      halfW: number,
      halfH: number,
      isHighlighted: boolean,
      accentHex: string,
      layerTitle: string,
      layerIndex: string
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - halfH);
      ctx.lineTo(cx + halfW, cy);
      ctx.lineTo(cx, cy + halfH);
      ctx.lineTo(cx - halfW, cy);
      ctx.closePath();

      const grad = ctx.createLinearGradient(
        cx - halfW,
        cy - halfH,
        cx + halfW,
        cy + halfH
      );
      if (isHighlighted) {
        grad.addColorStop(0, "rgba(49, 134, 255, 0.36)");
        grad.addColorStop(0.5, "rgba(24, 25, 29, 0.94)");
        grad.addColorStop(1, "rgba(0, 185, 92, 0.24)");
      } else {
        grad.addColorStop(0, "rgba(255, 255, 255, 0.06)");
        grad.addColorStop(1, "rgba(18, 19, 23, 0.88)");
      }

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = isHighlighted ? 1.8 : 1;
      ctx.strokeStyle = isHighlighted
        ? accentHex
        : "rgba(255, 255, 255, 0.16)";
      ctx.stroke();

      ctx.strokeStyle = isHighlighted
        ? "rgba(116, 155, 255, 0.22)"
        : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.75;
      for (let step = 0.25; step < 1; step += 0.25) {
        const sx = cx - halfW + halfW * step;
        const sy = cy - halfH * step;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + halfW, sy + halfH);
        ctx.stroke();
      }

      ctx.fillStyle = isHighlighted ? "#ffffff" : "rgba(230, 234, 240, 0.65)";
      ctx.font = "600 11px ui-monospace, SFMono-Regular, monospace";
      ctx.fillText(
        `${layerIndex} // ${layerTitle.slice(0, 26)}`,
        cx - halfW * 0.52,
        cy + 4
      );
      ctx.restore();
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      if (!prefersReduced) {
        tick += 0.018;
      }

      const p = progressRef.current;
      const cx = w * 0.5;
      const baseCy = h * 0.52;
      const halfW = Math.min(w * 0.38, 175);
      const halfH = halfW * 0.42;
      const gap = 26 + p * 36;

      const glow = ctx.createRadialGradient(
        cx,
        baseCy,
        15,
        cx,
        baseCy,
        halfW * 1.4
      );
      glow.addColorStop(0, "rgba(49, 134, 255, 0.22)");
      glow.addColorStop(1, "rgba(18, 19, 23, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, baseCy, halfW * 1.4, 0, Math.PI * 2);
      ctx.fill();

      const topY = baseCy - 1.5 * gap;
      const botY = baseCy + 1.5 * gap;
      ctx.strokeStyle = "rgba(116, 155, 255, 0.45)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, topY - halfH * 0.5);
      ctx.lineTo(cx, botY + halfH * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      const activeIdx = Math.min(3, Math.floor(p * 4));
      for (let i = 3; i >= 0; i--) {
        const offsetFromCenter = (i - 1.5) * gap;
        const floatY = prefersReduced
          ? 0
          : Math.sin(tick + i * 0.9) * (i === activeIdx ? 3 : 1.2);
        drawIsoPlane(
          cx,
          baseCy + offsetFromCenter + floatY,
          halfW,
          halfH,
          i === activeIdx,
          stages[i].accent,
          stages[i].label,
          stages[i].index
        );
      }

      const packetU = (tick * 0.45 + p) % 1;
      const packetY = botY - packetU * (botY - topY);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, packetY, 3, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (trigger) trigger.kill();
    };
  }, [stages]);

  return (
    <section
      ref={runwayRef}
      aria-label="Scroll-Scrubbed Architecture Disassembly"
      className="mb-20 rounded-3xl border border-[#212226]/[0.08] bg-[#F8F9FC] p-6 sm:p-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold block mb-2">
            INTERACTIVE SYSTEM DISASSEMBLY • SCROLL SCRUBBED
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121317] tracking-tight">
            4-Layer Execution Topology
          </h2>
        </div>
        <span className="text-xs font-mono text-[#45474D]">
          Active Plane:{" "}
          <strong className="text-[#3186FF]">0{activeLayer + 1} / 04</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Inverse Dark Canvas Viewport (#121317 Antigravity Obsidian Frame) */}
        <div className="lg:col-span-6 lg:sticky lg:top-28 rounded-2xl bg-[#121317] border border-[#212226]/20 p-4 shadow-[0_20px_48px_rgba(18,19,23,0.18)]">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#B2BBC5] pb-2 border-b border-white/10 mb-2">
            <span>AXIOM TOPOLOGY RENDERER • 60FPS</span>
            <span className="text-[#4ADE80]">LIVE SYNC</span>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-[320px] sm:h-[380px] block"
          />
        </div>

        {/* Scroll-Synced Parallax Architecture Layer Cards */}
        <div className="lg:col-span-6 space-y-5">
          {stages.map((stage, idx) => {
            const isCurrent = activeLayer === idx;
            return (
              <div
                key={stage.index}
                onMouseEnter={() => {
                  progressRef.current = (idx + 0.5) / 4;
                  setActiveLayer(idx);
                }}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? "bg-[#FFFFFF] border-[#3186FF] shadow-[0_14px_34px_rgba(49,134,255,0.12)] translate-x-1"
                    : "bg-[#FFFFFF]/80 border-[#212226]/[0.08] hover:border-[#212226]/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#3186FF]">
                    LAYER {stage.index}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6A6A71]">
                    {study.techStack[idx % study.techStack.length]}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#121317] mb-2">
                  {stage.label}
                </h3>
                <p className="text-xs sm:text-sm text-[#45474D] leading-relaxed">
                  {stage.sublabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
