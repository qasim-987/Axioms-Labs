"use client";

import React, { useEffect, useRef } from "react";
import { useIntroContext } from "@/lib/introContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Top-left volumetric light beam: a diagonal cone, white-lavender at the
 * source fading to blue-violet then transparent, ~35-45% of viewport width,
 * blurred 40-80px, mix-blend: screen. Fades in 0.60-1.20s of the intro.
 */
export default function LightBeam() {
  const { registerElement } = useIntroContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!wrapRef.current || !beamRef.current) return undefined;

    const unregister = registerElement("beam", beamRef);
    return () => unregister();
  }, [registerElement]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      <div
        ref={beamRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          // Diagonal cone entering from the top-left, ~40% of viewport wide.
          width: "42vw",
          height: "110vh",
          transformOrigin: "0% 0%",
          transform: "rotate(-22deg) translate(-8%, -18%)",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(108, 111, 216, 0.5) 42%, rgba(75, 79, 208, 0.12) 74%, transparent 100%)`,
          filter: "blur(64px)",
          mixBlendMode: "screen",
          opacity: prefersReduced ? 1 : 0,
        }}
      />
    </div>
  );
}
