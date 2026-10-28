"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Intercept hash anchor links so Lenis smoothly glides without fighting native jumps
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const el = document.querySelector(href);
      if (el instanceof HTMLElement) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -72, duration: 1.15 });
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Ensure ScrollTrigger pin positions refresh cleanly once fonts/layout settle
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      window.clearTimeout(refreshTimer);
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
