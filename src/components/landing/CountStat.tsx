"use client";

import React, { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { useIntroContext } from "@/lib/introContext";
import { INTRO } from "@/lib/landingConfig";
import type { Stat } from "@/data/brand";

interface CountStatProps {
  stat: Stat;
}

const DIGITS = "0123456789";

export default function CountStat({ stat }: CountStatProps) {
  const { registerTimeline } = useIntroContext();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !valueRef.current) return undefined;

    // Starts hidden; the master intro timeline reveals it at INTRO.stats.start.
    wrapRef.current.style.visibility = "hidden";
    wrapRef.current.style.opacity = "0";

    let tl: gsap.core.Timeline;

    if (stat.format === "odometer") {
      // Stacked digit columns translating on Y (a 0-9 ribbon per digit).
      const columns = Array.from(
        wrapRef.current.querySelectorAll<HTMLElement>(".odometer-column")
      );
      tl = gsap.timeline({ paused: true });
      columns.forEach((col, idx) => {
        const targetDigit = Number.parseInt((stat.text ?? "")[idx] ?? "0", 10);
        tl.to(
          col,
          {
            yPercent: -targetDigit * 100,
            duration: INTRO.stats.dur,
            ease: INTRO.stats.ease,
          },
          idx * 0.06
        );
      });
      tl.to(wrapRef.current, { autoAlpha: 1, duration: 0.4 }, 0);
    } else if (stat.format === "static") {
      // "24/7" — fade/slide in, no counting.
      tl = gsap.timeline({ paused: true });
      tl.fromTo(
        wrapRef.current,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: INTRO.stats.ease,
        }
      );
    } else {
      // Numeric count-up from 0, snapped to integers.
      const proxy = { value: 0 };
      const target = stat.target ?? 0;
      tl = gsap.timeline({ paused: true });
      tl.fromTo(
        proxy,
        { value: 0 },
        {
          value: target,
          duration: INTRO.stats.dur,
          ease: INTRO.stats.ease,
          snap: { value: 1 },
          onUpdate: () => {
            const valueEl = valueRef.current;
            if (!valueEl) return;
            valueEl.textContent =
              Math.floor(proxy.value) + (stat.suffix ?? "");
          },
        }
      );
      tl.to(wrapRef.current, { autoAlpha: 1, duration: 0.4 }, 0);
    }

    const unregister = registerTimeline("stats", () => tl);
    return () => unregister();
  }, [registerTimeline, stat]);

  const renderNumber = () => {
    if (stat.format === "odometer" && stat.text) {
      return (
        <span className="odometer" aria-hidden="true">
          {Array.from(stat.text).map((d, i) => {
            const digit = Number.parseInt(d, 10);
            if (Number.isNaN(digit)) {
              return (
                <span key={i} className="odometer-gap" aria-hidden="true">
                  {d}
                </span>
              );
            }
            return (
              <span key={i} className="odometer-wrap" aria-hidden="true">
                <span className="odometer-column">
                  {DIGITS.split("").map((n) => (
                    <span key={n} className="odometer-digit">{n}</span>
                  ))}
                </span>
              </span>
            );
          })}
        </span>
      );
    }
    return (
      <span ref={valueRef} className="tabular-nums" aria-hidden="true">
        {stat.text ?? ""}
      </span>
    );
  };

  return (
    <span ref={wrapRef} className="count-stat" aria-label={`${stat.label[0]} ${stat.label[1]}`}>
      {renderNumber()}
      <span className="stat-label" aria-hidden="true">
        {stat.label[0]}
        <br />
        {stat.label[1]}
      </span>
    </span>
  );
}
