/**
 * [NAME] Landing — registry for the single master intro timeline.
 *
 * Child components register either a DOM element (beam, nav, subtext, CTA,
 * sphere — standard fade/slide/scale tweens) or a paused GSAP timeline
 * getter (nav button grey->normal, headline character split, stats count-up).
 * IntroController assembles everything into ONE gsap.timeline() keyed to the
 * INTRO config, so the whole sequence can be scrubbed/debugged (exposed as
 * `window.__INTRO_TL__` in development).
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAppReady } from "@/hooks/useAppReady";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { INTRO } from "@/lib/landingConfig";

type Timeline = ReturnType<typeof gsap.timeline>;
type TimelineGetter = () => Timeline;

interface IntroContextValue {
  appReady: boolean;
  registerElement: (
    key: string,
    ref: { current: HTMLElement | null }
  ) => () => void;
  registerTimeline: (key: string, getter: TimelineGetter) => () => void;
  onMasterComplete: (cb: () => void) => void;
}

export const IntroContext = createContext<IntroContextValue | null>(null);

/** Module-level completion bus: the master timeline calls this on finish;
   SplitHeadline subscribes to revert its split DOM to plain text. */
let masterCompleteCbs = new Set<() => void>();

export function onMasterComplete(cb: () => void): () => void {
  masterCompleteCbs.add(cb);
  return () => {
    masterCompleteCbs.delete(cb);
  };
}

export function triggerMasterComplete(): void {
  masterCompleteCbs.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore individual callback failures.
    }
  });
}

export default function IntroController({
  children,
}: {
  children: React.ReactNode;
}) {
  const appReady = useAppReady();
  const prefersReduced = useReducedMotion();
  const [version, setVersion] = useState(0);
  const elementsRef = useRef<Map<string, { current: HTMLElement | null }>>(
    new Map()
  );
  const timelinesRef = useRef<Map<string, TimelineGetter>>(new Map());
  const masterCompleteRef = useRef<(() => void) | null>(null);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);

  const registerElement = useCallback(
    (key: string, ref: { current: HTMLElement | null }) => {
      elementsRef.current.set(key, ref);
      setVersion((v) => v + 1);
      return () => {
        elementsRef.current.delete(key);
        setVersion((v) => v + 1);
      };
    },
    [elementsRef]
  );

  const registerTimeline = useCallback(
    (key: string, getter: TimelineGetter) => {
      timelinesRef.current.set(key, getter);
      setVersion((v) => v + 1);
      return () => {
        timelinesRef.current.delete(key);
        setVersion((v) => v + 1);
      };
    },
    [timelinesRef]
  );

  const registerMasterComplete = useCallback((cb: () => void) => {
    masterCompleteRef.current = cb;
  }, []);

  const value = {
    appReady,
    registerElement,
    registerTimeline,
    onMasterComplete: registerMasterComplete,
  };

  // Build/rebuild the master timeline once fonts + first frame are ready and
  // whenever a child registers a new tween (child effects flush before this
  // parent effect, so everything is registered by the time we build).
  useEffect(() => {
    if (!appReady || prefersReduced) return;
    if (masterTlRef.current) {
      masterTlRef.current.kill();
      masterTlRef.current = null;
    }

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        masterCompleteRef.current?.();
        triggerMasterComplete();
      },
    });

    const getEl = (key: string) =>
      elementsRef.current.get(key)?.current ?? null;

    // 0.60–1.20s: top-left light beam fades in.
    const beamEl = getEl("beam");
    if (beamEl) {
      tl.to(beamEl, {
        autoAlpha: 1,
        duration: INTRO.beam.dur,
        ease: INTRO.beam.ease,
        clearProps: "autoAlpha",
      }, INTRO.beam.start);
    }

    // 1.00s: navigation slides down ~12px and fades in.
    const navEl = getEl("nav");
    if (navEl) {
      tl.fromTo(
        navEl,
        { autoAlpha: 0, y: -12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: INTRO.nav.dur,
          ease: INTRO.nav.ease,
          clearProps: "transform,autoAlpha",
        },
        INTRO.nav.start
      );
    }

    // 1.55s: nav pill button: greyed first, then settles to normal.
    const navButtonGet = timelinesRef.current.get("navButton");
    if (navButtonGet) {
      tl.add(navButtonGet(), INTRO.navButton.start);
    }

    // 1.10–2.60s: headline per-character reveal (both lines in parallel).
    const headlineGet = timelinesRef.current.get("headline");
    if (headlineGet) {
      tl.add(headlineGet(), INTRO.headline.start);
    }

    // 2.30–3.10s: subtext fades up.
    const subEl = getEl("subtext");
    if (subEl) {
      tl.fromTo(
        subEl,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: INTRO.subtext.dur,
          ease: INTRO.subtext.ease,
          clearProps: "transform,autoAlpha",
        },
        INTRO.subtext.start
      );
    }

    // 2.60–3.20s: CTA button fades/scales in (0.96 -> 1).
    const ctaEl = getEl("cta");
    if (ctaEl) {
      tl.fromTo(
        ctaEl,
        { autoAlpha: 0, scale: INTRO.cta.fromScale },
        {
          autoAlpha: 1,
          scale: 1,
          duration: INTRO.cta.dur,
          ease: INTRO.cta.ease,
          clearProps: "transform,autoAlpha",
        },
        INTRO.cta.start
      );
    }

    // 2.80–4.50s: stats fade in and count up.
    const statsGet = timelinesRef.current.get("stats");
    if (statsGet) {
      tl.add(statsGet(), INTRO.stats.start);
    }

    // 3.00–4.00s: particle sphere fades/scales in (0.85 -> 1) and rotates.
    const sphereEl = getEl("sphere");
    if (sphereEl) {
      tl.to(sphereEl, {
        autoAlpha: 1,
        scale: 1,
        duration: INTRO.sphere.dur,
        ease: INTRO.sphere.ease,
        clearProps: "transform,autoAlpha",
      }, INTRO.sphere.start);
    }

    tl.play();

    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __INTRO_TL__?: gsap.core.Timeline }).__INTRO_TL__ =
        tl;
    }
    masterTlRef.current = tl;

    return () => {
      tl.kill();
      masterTlRef.current = null;
    };
  }, [appReady, version, prefersReduced]);

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

// Safe default used when there is no IntroController above (e.g. service
// pages) or during SSR — everything shows immediately, nothing registers.
const EMPTY_INTRO_VALUE: IntroContextValue = {
  appReady: true,
  registerElement: () => () => {},
  registerTimeline: () => () => {},
  onMasterComplete: (cb) => {
    cb();
    return () => {};
  },
};

export function useIntroContext() {
  return (useContext(IntroContext) as IntroContextValue | undefined) ?? EMPTY_INTRO_VALUE;
}
