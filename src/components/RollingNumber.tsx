"use client";

import React, { useEffect, useRef, useState } from "react";

interface RollingNumberProps {
  value: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

// 20-row two-revolution strip (0..9, 0..9) so even `0` in `100%` physically spins a full 10-step turn!
const DOUBLE_DIGITS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
];

export default function RollingNumber({
  value,
  duration = 1650,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: RollingNumberProps) {
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setReducedMotion(true);
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const formattedString =
    typeof value === "string"
      ? value
      : decimals > 0
      ? value.toFixed(decimals)
      : Math.floor(value).toString();
  const characters = Array.from(formattedString);

  let digitColumnIndex = 0;

  return (
    <span
      ref={containerRef}
      aria-label={`${prefix}${formattedString}${suffix}`}
      className={`inline-flex items-baseline tabular-nums font-mono tracking-tight leading-none ${className}`}
    >
      {prefix && <span aria-hidden="true">{prefix}</span>}

      {characters.map((ch, idx) => {
        const numericDigit = Number.parseInt(ch, 10);
        if (Number.isNaN(numericDigit)) {
          return (
            <span
              key={idx}
              aria-hidden="true"
              className="inline-block px-[0.02em]"
            >
              {ch}
            </span>
          );
        }

        const colDelay = digitColumnIndex * 115;
        digitColumnIndex += 1;

        // Target index in 20-row strip (`10 + numericDigit` -> each row is 5% of strip height)
        const targetIndex = 10 + numericDigit;

        if (reducedMotion) {
          return (
            <span key={idx} aria-hidden="true" className="inline-block">
              {numericDigit}
            </span>
          );
        }

        return (
          <span
            key={idx}
            aria-hidden="true"
            className="relative inline-block h-[1em] overflow-hidden align-baseline"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            <span
              className="flex flex-col will-change-transform"
              style={{
                transform: inView
                  ? `translate3d(0, -${targetIndex * 5}%, 0)`
                  : "translate3d(0, 0%, 0)",
                transitionProperty: "transform",
                transitionDuration: `${duration}ms`,
                transitionDelay: `${colDelay}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {DOUBLE_DIGITS.map((d, rowIdx) => (
                <span
                  key={rowIdx}
                  className="h-[1em] flex items-center justify-center select-none"
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}

      {suffix && (
        <span
          aria-hidden="true"
          className="ml-0.5 transition-opacity duration-700"
          style={{ opacity: inView ? 1 : 0.35 }}
        >
          {suffix}
        </span>
      )}
    </span>
  );
}
