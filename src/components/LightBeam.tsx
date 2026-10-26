"use client";

import React from "react";

export default function LightBeam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* Top-Left Volumetric Light Beam with slow breathing pulse */}
      <div
        className="absolute -top-[18%] -left-[10%] w-[68vw] max-w-[1100px] h-[120vh] origin-top-left pointer-events-none animate-beam-pulse"
        style={{
          transform: "rotate(32deg)",
          background: `conic-gradient(
            from 270deg at 0% 0%,
            transparent 0deg,
            rgba(75, 63, 214, 0.68) 22deg,
            rgba(110, 95, 240, 0.52) 36deg,
            rgba(65, 52, 190, 0.35) 48deg,
            transparent 65deg
          )`,
          filter: "blur(140px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Secondary softer broad ambient beam flare */}
      <div
        className="absolute -top-[25%] -left-[15%] w-[55vw] max-w-[900px] h-[95vh] origin-top-left pointer-events-none"
        style={{
          transform: "rotate(28deg)",
          background: `radial-gradient(
            ellipse 80% 50% at 20% 15%,
            rgba(90, 75, 230, 0.45) 0%,
            rgba(75, 63, 214, 0.28) 40%,
            transparent 75%
          )`,
          filter: "blur(160px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Top-left corner origin hotspot */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(160, 150, 255, 0.4) 0%, rgba(75, 63, 214, 0.25) 45%, transparent 75%)",
          filter: "blur(80px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
