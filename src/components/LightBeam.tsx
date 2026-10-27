"use client";

import React from "react";

export default function LightBeam() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* 1. Dead-Center Antigravity Soft Pastel Halo (50% X, 50% Y — directly behind the 3D Particle Sphere) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[70vw] max-w-[880px] h-[70vw] max-h-[780px] rounded-full animate-beam-pulse"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(49, 134, 255, 0.12) 0%, rgba(116, 155, 255, 0.08) 38%, rgba(239, 242, 247, 0.5) 64%, transparent 78%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* 2. Symmetrical Centered Multicolor Antigravity Top Wash (50% X — zero left/right bias) */}
      <div className="absolute inset-x-0 -top-[16%] flex justify-center pointer-events-none">
        <div
          className="w-[80vw] max-w-[1160px] h-[95vh] animate-beam-pulse"
          style={{
            background: `conic-gradient(
              from 180deg at 50% 0%,
              transparent 36deg,
              rgba(49, 134, 255, 0.09) 64deg,
              rgba(116, 155, 255, 0.13) 86deg,
              rgba(251, 188, 4, 0.07) 96deg,
              rgba(252, 65, 61, 0.06) 112deg,
              rgba(0, 185, 92, 0.06) 126deg,
              transparent 146deg
            )`,
            filter: "blur(110px)",
          }}
        />
      </div>

      {/* 3. Centered Soft Inner Sphere Rim Glow (50% X, 50% Y) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[400px] sm:w-[520px] h-[400px] sm:h-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.72) 0%, rgba(49, 134, 255, 0.06) 52%, transparent 74%)",
            filter: "blur(40px)",
          }}
        />
      </div>
    </div>
  );
}
