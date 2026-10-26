"use client";

import React from "react";

export default function LightBeam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* 1. Dead-Center Core Volumetric Halo (50% X, 50% Y — directly behind the 3D Particle Sphere) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[72vw] max-w-[920px] h-[72vw] max-h-[820px] rounded-full animate-beam-pulse"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(116, 102, 245, 0.42) 0%, rgba(75, 63, 214, 0.24) 38%, rgba(45, 36, 140, 0.08) 62%, transparent 78%)",
            filter: "blur(95px)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* 2. Symmetrical Centered Volumetric Light Cone (50% X — zero left/right bias) */}
      <div className="absolute inset-x-0 -top-[18%] flex justify-center pointer-events-none">
        <div
          className="w-[82vw] max-w-[1180px] h-[105vh] animate-beam-pulse"
          style={{
            background: `conic-gradient(
              from 180deg at 50% 0%,
              transparent 36deg,
              rgba(75, 63, 214, 0.34) 64deg,
              rgba(130, 118, 250, 0.48) 90deg,
              rgba(75, 63, 214, 0.34) 116deg,
              transparent 144deg
            )`,
            filter: "blur(130px)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* 3. Centered Soft Inner Sphere Rim Spotlight (50% X, 50% Y) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(175, 165, 255, 0.22) 0%, rgba(95, 82, 225, 0.12) 48%, transparent 74%)",
            filter: "blur(65px)",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
}
