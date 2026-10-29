"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { killAllScrollTriggers, disposeAllStages } from "@/lib/registry";
import { TRANSITION, BRAND } from "@/lib/landingConfig";

export type TransitionStatus =
  | "idle"
  | "exiting"
  | "black"
  | "entering"
  | "entered";

// Runtime shape of next/navigation's router.events (present at runtime, not
// in this toolchain's router types).
type RouterEvents = {
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
};

interface TransitionContextValue {
  status: TransitionStatus;
  start: (href: string) => Promise<void>;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Persistent full-viewport transition overlay (root layout). Plays the card ->
 * service page click transition:
 *
 *   a) 0–0.4s   current content slides left & fades; heading + particles fade out
 *   b) 0.4–0.6s full-width violet band sweeps upward across the screen
 *   c) 0.6–1.1s near-empty black; router.push() runs now
 *   d) 1.1–2.0s violet glow from the left edge (dithered), page fades in
 *
 * Skips the animation for Cmd/Ctrl/Shift/middle-click, locks while running
 * (double-click guard), enforces a minimum duration and a max timeout for slow
 * networks, and falls back to a simple 200ms fade under
 * `prefers-reduced-motion: reduce`. Moves focus to the new <h1> on enter.
 */
export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const routeEvents = (router as unknown as { events: RouterEvents }).events;
  const [status, setStatus] = useState<TransitionStatus>("idle");
  const lock = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const focusHeading = useCallback(() => {
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>(
        "[data-focus-heading], h1"
      );
      heading?.focus({ preventScroll: true });
    });
  }, []);

  // External navigation (back/forward, typed URL): quick fade overlay.
  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (lock.current || status !== "idle") return;
      lock.current = true;
      setStatus("exiting");
      killAllScrollTriggers();
      disposeAllStages();
      void gsap
        .to(contentRef.current, {
          autoAlpha: 0,
          duration: 0.15,
          ease: "power2.in",
        })
        .then(() => setStatus("black"));
    };
    const handleRouteChangeComplete = () => {
      void playEnter();
    };
    routeEvents.on("routeChangeStart", handleRouteChangeStart);
    routeEvents.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      routeEvents.off("routeChangeStart", handleRouteChangeStart);
      routeEvents.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [status]);

  const playEnter = useCallback(async () => {
    if (status === "idle" || status === "entering") return;
    setStatus("entering");

    await Promise.all([
      gsap.to(glowRef.current, {
        x: "0%",
        duration: TRANSITION.enterDur,
        ease: "power2.out",
      }),
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: TRANSITION.enterDur,
        ease: "power2.out",
      }),
    ]);

    setStatus("entered");
    focusHeading();

    await sleep(600);
    setStatus("idle");
    lock.current = false;
  }, [status, focusHeading]);

  const start = useCallback(async (href: string) => {
    if (lock.current) return;
    lock.current = true;

    if (prefersReduced) {
      setStatus("exiting");
      killAllScrollTriggers();
      disposeAllStages();
      await gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: TRANSITION.reducedFadeMs / 1000,
        ease: "power2.inOut",
      });
      setStatus("black");
      void router.push(href);
      routeEvents.on("routeChangeComplete", () => {
        void gsap
          .to(overlayRef.current, {
            autoAlpha: 0,
            duration: TRANSITION.reducedFadeMs / 1000,
            ease: "power2.inOut",
          })
          .then(() => {
            setStatus("idle");
            lock.current = false;
          });
      });
      return;
    }

    let routeComplete = false;
    const onRouteComplete = () => {
      routeComplete = true;
    };
    routeEvents.on("routeChangeComplete", onRouteComplete);

    try {
      // a) exit: current content slides left & fades out.
      setStatus("exiting");
      killAllScrollTriggers();
      disposeAllStages();

      await gsap.to(contentRef.current, {
        x: -60,
        autoAlpha: 0,
        duration: TRANSITION.exitDur,
        ease: "power2.in",
      });

      // b) violet band sweeps upward across the screen.
      await gsap.to(bandRef.current, {
        y: "-100%",
        duration: TRANSITION.bandDur,
        ease: "power2.inOut",
      });
      await gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.08 });

      // c) near-empty black hold, then router.push() runs now.
      setStatus("black");
      const phaseEndMs =
        Date.now() +
        TRANSITION.exitDur * 1000 +
        TRANSITION.bandDur * 1000 +
        80;
      await sleep(Math.max(0, phaseEndMs - Date.now()));

      void router.push(href);

      // Wait for the destination route, bounded by a max timeout so slow
      // networks cannot leave the screen stuck on black.
      await Promise.race([
        sleep(TRANSITION.maxWaitMs),
        new Promise<void>((resolve) => {
          const poll = () => {
            if (routeComplete) {
              resolve();
            } else {
              requestAnimationFrame(poll);
            }
          };
          poll();
        }),
      ]);

      // d) enter: violet glow from the left edge + fade in.
      setStatus("entering");
      await Promise.all([
        gsap.to(glowRef.current, {
          x: "0%",
          duration: TRANSITION.enterDur,
          ease: "power2.out",
        }),
        gsap.to(overlayRef.current, {
          autoAlpha: 0,
          duration: TRANSITION.enterDur,
          ease: "power2.out",
        }),
      ]);

      setStatus("entered");
      focusHeading();

      await sleep(600);
      setStatus("idle");
    } finally {
      lock.current = false;
      routeEvents.off("routeChangeComplete", onRouteComplete);
    }
  }, [prefersReduced, focusHeading]);

  return (
    <TransitionContext.Provider value={{ status, start }}>
      {/* Content wrapper: exits slide left & fade under the overlay. */}
      <div ref={contentRef} className="min-h-svh">
        {children}
      </div>

      {/* Transition overlay (paints above everything, including the navbar). */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: "#000000", opacity: 0, visibility: "hidden" }}
        aria-hidden="true"
      />
      {/* Violet full-width band (~10% viewport height) sweeping upward. */}
      <div
        ref={bandRef}
        className="fixed left-0 right-0 bottom-0 z-[61]"
        style={{
          height: "10vh",
          background: `linear-gradient(to right, ${BRAND.violet}, ${BRAND.violetDark})`,
          mixBlendMode: "screen",
          transform: "translateY(100%)",
        }}
        aria-hidden="true"
      />
      {/* Enter glow: violet dithered texture entering from the left edge. */}
      <div
        ref={glowRef}
        className="fixed inset-y-0 left-0 z-[61]"
        style={{
          width: "16vw",
          background: `radial-gradient(circle at 0% 50%, rgba(108, 111, 216, 0.35), transparent 60%)`,
          mixBlendMode: "screen",
          transform: "translateX(-100%)",
          imageRendering: "pixelated",
        }}
        aria-hidden="true"
      />
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error(
      "useTransitionContext must be used within TransitionProvider"
    );
  }
  return ctx;
}
