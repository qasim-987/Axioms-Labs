"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { useIntroContext, onMasterComplete } from "@/lib/introContext";
import { splitHeadline, type SplitResult, type HeadlineLike } from "@/lib/splitText";
import { INTRO } from "@/lib/landingConfig";

/**
 * Generic multi-line kinetic headline driven by the single master intro
 * timeline. Emphasised words are bold italic (700).
 *
 * After the intro completes the split DOM is reverted to plain, selectable
 * text (`aria-label` on the <h1>, `aria-hidden` on the split spans).
 *
 * Usage:
 *   <SplitHeadline lines={[line1Words, line2Words]} lineIndents={["0%", "26%"]} />
 */
interface SplitHeadlineProps {
  lines: HeadlineLike[][];
  lineIndents?: string[];
  as?: "h1" | "h2";
}

export default function SplitHeadline({
  lines,
  lineIndents = [],
  as = "h1",
}: SplitHeadlineProps) {
  const prefersReduced = useReducedMotion();
  const { registerTimeline } = useIntroContext();
  const rootRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitResult | null>(null);

  const fullText = lines.map((line) => line.map((w) => w.word).join(" ")).join(" ");

  const buildCharTimeline = useCallback(() => {
    const split = splitRef.current;
    if (!split) return gsap.timeline({ paused: true });
    return split.buildCharTimeline({
      duration: INTRO.headline.dur,
      stagger: INTRO.headline.stagger,
      lineOffset: INTRO.headline.lineOffset,
      ease: INTRO.headline.ease,
    });
  }, []);

  useEffect(() => {
    const unregister = onMasterComplete(() => {
      splitRef.current?.revert();
    });
    return () => unregister();
  }, []);

  useEffect(() => {
    if (!rootRef.current) return undefined;
    if (prefersReduced) {
      // Reduced motion: plain text, no animation, no extra DOM.
      return undefined;
    }
    const split = splitHeadline(rootRef.current);
    if (!split) return undefined;
    splitRef.current = split;
    const unregister = registerTimeline("headline", buildCharTimeline);
    return () => {
      unregister();
      split.revert();
      splitRef.current = null;
    };
  }, [registerTimeline, buildCharTimeline, prefersReduced]);

  const Tag = as;

  return (
    <Tag
      ref={rootRef}
      aria-label={fullText}
      className="flex flex-col items-center justify-center text-center tracking-tight leading-[1.05] select-none pointer-events-auto"
      style={{
        fontSize: "clamp(40px, 5.2vw, 96px)",
        marginBottom: 0,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          data-line={li + 1}
          className="flex items-center justify-center whitespace-nowrap"
          aria-hidden="true"
          style={{
            marginTop: li === 0 ? 0 : "0.5rem",
            marginLeft: lineIndents[li] ?? 0,
          }}
        >
          {line.map((w, i) => (
            <span
              key={i}
              className={`inline-block whitespace-nowrap ${w.emphasis ? "font-bold italic" : "font-light"}`}
            >
              {w.word}{i < line.length - 1 ? " " : null}
            </span>
          ))}
        </div>
      ))}
    </Tag>
  );
}
