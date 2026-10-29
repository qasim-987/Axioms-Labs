"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Prevent mobile Safari/Chrome URL-bar show/hide height deltas from jumping ScrollTrigger pins
if (typeof window !== "undefined") {
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });
}

function getCurrentNavOffset(): number {
  if (typeof window === "undefined") return 68;
  const navEl =
    document.querySelector<HTMLElement>('[data-site-navbar="true"]') ||
    document.querySelector<HTMLElement>("header");
  if (navEl) {
    const h = Math.round(navEl.getBoundingClientRect().height);
    if (h > 0) return h;
  }
  const cssVar = parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
  );
  return Number.isFinite(cssVar) && cssVar > 0 ? Math.round(cssVar) : 68;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Refresh ScrollTrigger cleanly after route changes, webfont load, and image decode
  useEffect(() => {
    let cancelled = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = (delayMs = 180) => {
      if (cancelled) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!cancelled) {
          ScrollTrigger.refresh();
        }
      }, delayMs);
    };

    // 1. Route change settle
    scheduleRefresh(180);

    // 2. Webfonts ready settle
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          scheduleRefresh(160);
        })
        .catch(() => {
          // Ignore font-loading errors
        });
    }

    // 3. Above-the-fold / in-DOM images settle
    const pendingImages = Array.from(document.querySelectorAll("img")).filter(
      (img) => !img.complete
    );
    if (pendingImages.length > 0) {
      Promise.allSettled(
        pendingImages.map((img) =>
          typeof img.decode === "function"
            ? img.decode()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              })
        )
      ).then(() => {
        scheduleRefresh(180);
      });
    }

    const onOrientationChange = () => {
      scheduleRefresh(220);
    };
    window.addEventListener("orientationchange", onOrientationChange, {
      passive: true,
    });

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, [pathname]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const fineDesktopQuery = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)"
    );

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    const mountOrUnmountLenis = () => {
      const shouldUseLenis =
        !prefersReducedMotion && fineDesktopQuery.matches;

      if (shouldUseLenis && !lenis) {
        lenis = new Lenis({
          lerp: 0.075,
          wheelMultiplier: 0.95,
          smoothWheel: true,
          syncTouch: false,
        });

        lenis.on("scroll", ScrollTrigger.update);

        // Connect Lenis to GSAP ScrollTrigger so pinned/scrubbed sections
        // (e.g. the services track) stay in sync with smooth scrolling.
        ScrollTrigger.scrollerProxy(document.documentElement, {
          scrollTop: (value?: number) => {
            if (!lenis) return 0;
            if (arguments.length) {
              lenis.scrollTo(value as number);
              return;
            }
            return lenis.scroll;
          },
          getBoundingClientRect: () => ({
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }),
          scrollHeight: () => document.documentElement.scrollHeight,
        });

        tickerFn = (time: number) => {
          if (!lenis) return;
          lenis.raf(time * 1000);
          ScrollTrigger.update();
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);
      } else if (!shouldUseLenis && lenis) {
        if (tickerFn) {
          gsap.ticker.remove(tickerFn);
          tickerFn = null;
        }
        lenis.destroy();
        lenis = null;
      }
    };

    mountOrUnmountLenis();
    fineDesktopQuery.addEventListener("change", mountOrUnmountLenis);

    // Smoothly handle in-page `#anchor` navigation on BOTH Lenis desktop and native-scroll touch
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(
        'a[href^="#"], a[href^="/#"]'
      ) as HTMLAnchorElement | null;
      if (!target) return;

      const rawHref = target.getAttribute("href");
      if (!rawHref) return;

      const isHomeSlashHash = rawHref.startsWith("/#");
      if (isHomeSlashHash && window.location.pathname !== "/") {
        return; // Let Next.js navigate to `/` first
      }

      const hash = isHomeSlashHash ? rawHref.slice(1) : rawHref;
      if (hash.length <= 1) return;

      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;

      e.preventDefault();
      const navOffset = getCurrentNavOffset();

      if (lenis) {
        lenis.scrollTo(el, {
          offset: -navOffset,
          duration: 1.2,
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        });
      } else {
        const rectTop = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: Math.max(0, rectTop - navOffset),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        window.setTimeout(() => {
          ScrollTrigger.refresh();
        }, 420);
      }
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      fineDesktopQuery.removeEventListener("change", mountOrUnmountLenis);
      document.removeEventListener("click", handleAnchorClick);
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
