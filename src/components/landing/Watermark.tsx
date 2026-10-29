"use client";

import React, { useEffect, useRef } from "react";
import { useAppReady } from "@/hooks/useAppReady";

/**
 * Giant uppercase brand watermark spanning wider than the viewport, cropped on
 * both sides, vertically centered, ~5% white opacity. Not selectable,
 * aria-hidden — decorative only.
 */
export default function Watermark() {
  const appReady = useAppReady();
  const ref = useRef<HTMLSpanElement>(null);

  // Before the intro starts everything except the watermark is hidden;
  // the watermark itself is visible from the first frame.
  useEffect(() => {
    if (ref.current) {
      ref.current.style.visibility = "visible";
    }
  }, [appReady]);

  return (
    <div
      className="inset-0 absolute flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 [mask-image:none]"
      aria-hidden="true"
    >
      <span
        ref={ref}
        className="font-extrabold uppercase tracking-[0.04em] whitespace-nowrap leading-none text-center mx-auto select-none"
        style={{
          visibility: "visible",
          color: "rgba(255, 255, 255, 0.05)",
          fontSize: "clamp(18vw, 55vw, 220px)",
        }}
      >
        [NAME]
      </span>
    </div>
  );
}
