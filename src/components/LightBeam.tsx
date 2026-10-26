"use client";

import React from "react";

export default function LightBeam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* Centered Symmetrical Top Volumetric Crown Beam */}
      <div
        className="absolute -top-[22%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[1150px] h-[105vh] pointer-events-none animate-beam-pulse"
        style={{
          background: `conic-gradient(
            from 180deg at 50% 0%,
            transparent 32deg,
            rgba(75, 63, 214, 0.46) 62deg,
            rgba(120, 105, 245, 0.58) 90deg,
            rgba(75, 63, 214, 0.46) 118deg,
            transparent 148deg
          )`,
          filter: "blur(135px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle Ambient Violet Halo Behind Centered Particle Sphere */}
      <div
        className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[56vw] max-w-[780px] h-[65vh] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(110, 95, 240, 0.32) 0%, rgba(75, 63, 214, 0.16) 48%, transparent 76%)",
          filter: "blur(120px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Top-Center Soft Source Hotspot */}
      <div
        className="absolute -top-28 left-1/2 -translate-x-1/2 w-[460px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(175, 165, 255, 0.36) 0%, rgba(75, 63, 214, 0.2) 50%, transparent 78%)",
          filter: "blur(80px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
