"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAppReady } from "@/hooks/useAppReady";

type Timeline = ReturnType<typeof gsap.timeline>;

const elementRefs = new Map<string, { current: HTMLElement | null }>();
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { INTRO } from "@/lib/landingConfig";
import { IntroContext, onMasterComplete } from "@/lib/introContext";

/**
 * Builds the single master page-load intro timeline (`gsap.timeline`) from the
 * tweens registered by the hero parts (beam, nav, headline, subtext, CTA,
 * stats, sphere) and plays it once `document.fonts.ready` and the first
 * WebGL frame are ready. Exposed as `window.__INTRO_TL__` in development so
 * the sequence can be scrubbed/debugged.
 */
export default function IntroController({
  children,
}: {
  children: React.ReactNode;
}) {
  const appReady = useAppReady();
  const prefersReduced = useReducedMotion();
  const [version, setVersion] = useState(0);
  const timelinesRef = useRef<Map<string, () => gsap.core.Timeline>>(new Map());
  const masterCompleteRef = useRef<(() => void) | null>(null);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);

  const registerTimeline = useCallback(
    (key: string, getter: () => Timeline) => {
      timelinesRef.current.set(key, getter);
      setVersion((v) => v + 1);
      return () => {
        timelinesRef.current.delete(key);
        setVersion((v) => v + 1);
      };
    },
    []
  );

  const registerMasterComplete = useCallback((cb: () => void) => {
    masterCompleteRef.current = cb;
  }, []);

  const registerElement = useCallback(
    (key: string, ref: { current: HTMLElement | null }) => {
      elementRefs.set(key, ref);
      return () => elementRefs.delete(key);
    },
    []
  );

  const value = {
    appReady,
    registerElement,
    registerTimeline,
    onMasterComplete: registerMasterComplete,
  };

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
      },
    });

    const add = (key: string, time: number) => {
      const get = timelinesRef.current.get(key);
      if (get) tl.add(get(), time);
    };

    add("beam", INTRO.beam.start);
    add("nav", INTRO.nav.start);
    add("navButton", INTRO.navButton.start);
    add("headline", INTRO.headline.start);
    add("subtext", INTRO.subtext.start);
    add("cta", INTRO.cta.start);
    add("stats", INTRO.stats.start);
    add("sphere", INTRO.sphere.start);

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
  }, [appReady, version, prefersReduced, masterCompleteRef.current]);

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}
