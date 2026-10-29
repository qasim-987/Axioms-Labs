"use client";

import React from "react";

/**
 * Service page background: a violet diagonal glow entering from the left edge
 * plus a pixelated/dithered noise texture. Pure CSS — no canvas, no imagery.
 */
export default function ServicePageGlare() {
  // Dithered noise texture as an inline SVG data URI (no external image).
  const noise =
    "data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.55%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.10%22/%3E%3C/svg%3E";

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: "#05060A" }}
    >
      {/* Violet diagonal glow from the left edge. */}
      <div
        className="absolute inset-y-0 left-0 w-[22vw]"
        style={{
          background: "radial-gradient(circle at 0% 50%, rgba(108, 111, 216, 0.30), rgba(75, 79, 208, 0.08) 40%, transparent 70%)",
          mixBlendMode: "screen",
          transform: "translateX(-10%)",
        }}
      />
      {/* Pixelated/dithered noise overlay. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${noise})`,
          opacity: 0.12,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
