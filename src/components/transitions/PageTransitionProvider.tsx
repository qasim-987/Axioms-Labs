"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import { getPerformanceTier } from "@/lib/performanceTier";
import { PAGE_TRANSITION as C } from "@/config/pageTransition.config";
import { PageTransitionContext, type TransitionPhase } from "./context";
import { revealPage } from "./revealPage";

gsap.registerPlugin(ScrollTrigger);
type Request = { href: string; replace?: boolean; history?: boolean };
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const label = (href: string) => new URL(href, location.origin).pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") || "Home";

function RouteObserver({ onCommit }: { onCommit: () => void }) {
  const path = usePathname();
  const search = useSearchParams();
  useEffect(onCommit, [path, search, onCommit]);
  return null;
}

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [destination, setDestination] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const content = useRef<HTMLDivElement>(null), overlay = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null), band = useRef<HTMLDivElement>(null), progress = useRef<HTMLDivElement>(null);
  const state = useRef<TransitionPhase>("idle");
  const queued = useRef<Request | null>(null), generation = useRef(0);
  const readQueued = useCallback((): Request | null => queued.current, []);
  const routeResolve = useRef<(() => void) | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout>>(), indicator = useRef<ReturnType<typeof setTimeout>>();
  const tweens = useRef<gsap.core.Tween[]>([]);
  const reveals = useRef<ReturnType<typeof revealPage> | null>(null);
  const previousUrl = useRef("");
  const startRef = useRef<(request: Request) => void>(() => {});
  const setState = useCallback((next: TransitionPhase) => {
    state.current = next;
    setPhase(next);
    document.documentElement.dataset.pageTransition = next;
  }, []);
  const finish = useCallback(() => {
    generation.current++;
    clearTimeout(safety.current); clearTimeout(indicator.current);
    tweens.current.splice(0).forEach(tween => tween.kill());
    reveals.current?.cleanup(); reveals.current = null;
    if (content.current) {
      content.current.removeAttribute("inert");
      gsap.set(content.current, { clearProps: "transform,opacity" });
    }
    if (overlay.current) { overlay.current.style.visibility = "hidden"; overlay.current.style.pointerEvents = "none"; }
    [curtain.current, band.current, progress.current].forEach(node => { if (node) gsap.set(node, { clearProps: "transform,opacity,willChange" }); });
    window.dispatchEvent(new CustomEvent("page-transition:resume"));
    routeResolve.current?.(); routeResolve.current = null;
    setDestination(null); queued.current = null; setState("idle");
    ScrollTrigger.refresh();
  }, [setState]);

  const start = useCallback(async (initial: Request) => {
    const requested = new URL(initial.href, location.href);
    if (requested.origin !== location.origin) { location.assign(requested.href); return; }
    if (!initial.history && state.current === "idle" && requested.pathname + requested.search === location.pathname + location.search) {
      if (requested.hash) { try { document.getElementById(decodeURIComponent(requested.hash.slice(1)))?.scrollIntoView(); } catch { /* Invalid hash does not need a transition. */ } }
      return;
    }
    if (state.current === "covering" || state.current === "revealing") return;
    if (state.current === "waiting") { queued.current = initial; setDestination(initial.href); return; }
    const id = ++generation.current;
    const alive = () => generation.current === id;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const factor = matchMedia("(max-width: 1023px)").matches ? C.MOBILE_DURATION_FACTOR : 1;
    const animate = (target: gsap.TweenTarget, vars: gsap.TweenVars) => new Promise<void>(resolve => {
      const tween = gsap.to(target, { ...vars, onComplete: resolve });
      tweens.current.push(tween);
    });
    let navigationIssued = Boolean(initial.history);
    try {
      setState("covering"); setDestination(initial.href);
      window.dispatchEvent(new CustomEvent("page-transition:start"));
      // Wait for drawer focus/scroll-lock cleanup before locking transition content.
      await sleep(0);
      if (!alive()) return;
      content.current?.setAttribute("inert", "");
      window.dispatchEvent(new CustomEvent("page-transition:pause"));
      overlay.current!.style.visibility = "visible";
      overlay.current!.style.pointerEvents = "auto";
      safety.current = setTimeout(() => {
        if (!navigationIssued) router.push(initial.href);
        finish();
      }, C.SAFETY_TIMEOUT_MS);
      gsap.set(shade.current, { opacity: 0 });
      gsap.set(progress.current, { scaleX: 0, opacity: 0 });
      gsap.set(curtain.current, { y: 0, yPercent: initial.history || reduced ? 0 : 100, opacity: reduced ? 0 : 1, willChange: "transform,opacity" });
      gsap.set(band.current, { yPercent: 0, scaleY: 1, top: 0, bottom: "auto", opacity: reduced ? 0 : 1 });
      if (initial.history) {
        gsap.set(curtain.current, { yPercent: 0 });
      } else if (reduced) {
        await animate(curtain.current, { opacity: 1, duration: .17 });
      } else {
        if (matchMedia("(min-width: 1024px) and (pointer: fine)").matches && getPerformanceTier().tier === "high") {
          tweens.current.push(gsap.to(content.current, { y: -40, duration: C.DURATION_COVER * factor, ease: C.EASE_COVER }));
        }
        tweens.current.push(gsap.to(shade.current, { opacity: .4, duration: C.DURATION_COVER * factor }));
        await animate(curtain.current, { yPercent: 0, duration: C.DURATION_COVER * factor, ease: C.EASE_COVER });
        if (!alive()) return;
        await animate(band.current, { y: -4, scaleY: .92, duration: .06, ease: "power2.out" });
      }
      if (!alive()) return;
      setState("waiting");
      indicator.current = setTimeout(() => {
        tweens.current.push(gsap.to(progress.current, { opacity: 1, scaleX: .9, duration: 1.8, ease: "power1.out" }));
      }, C.PROGRESS_DELAY_MS);
      let request = initial;
      do {
        queued.current = null;
        if (request.history && previousUrl.current !== location.pathname + location.search) {
          await new Promise<void>(resolve => { routeResolve.current = resolve; });
          if (!alive()) return;
        }
        if (!request.history) {
          // Capture only the old page's triggers: never globally kill newly mounted pins.
          const oldTriggers = ScrollTrigger.getAll().filter(trigger => trigger.trigger && content.current?.contains(trigger.trigger));
          const committed = new Promise<void>(resolve => { routeResolve.current = resolve; });
          navigationIssued = true;
          if (request.replace) router.replace(request.href, { scroll: false });
          else router.push(request.href, { scroll: false });
          await committed;
          if (!alive()) return;
          oldTriggers.forEach(trigger => { if (ScrollTrigger.getAll().includes(trigger)) trigger.kill(); });
          // WebGL/RAF/listener disposal belongs to the departing React components' cleanup.
          window.dispatchEvent(new CustomEvent("page-transition:reset-scroll"));
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        await Promise.all([
          sleep(request.history ? 100 : C.MIN_HOLD * 1000),
          Promise.race([
            (async () => {
              await document.fonts.ready;
              const images = Array.from(content.current?.querySelectorAll("img") || []).filter(image => image.getBoundingClientRect().top < innerHeight).slice(0, 8);
              await Promise.allSettled(images.map(image => image.decode()));
              await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            })(),
            sleep(C.READY_TIMEOUT_MS),
          ]),
        ]);
        if (!alive()) return;
        const next = readQueued();
        if (!next) break;
        const nextUrl = new URL(next.href, location.origin);
        if (nextUrl.pathname + nextUrl.search === previousUrl.current) break;
        request = next;
      } while (alive());
      clearTimeout(indicator.current);
      gsap.set(content.current, { clearProps: "transform,opacity" });
      ScrollTrigger.refresh();
      gsap.set(shade.current, { opacity: 0 });
      if (!initial.history) {
        const hash = new URL(request.href, location.origin).hash;
        if (hash) {
          let target: HTMLElement | null = null;
          try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { /* Malformed hashes still navigate normally. */ }
          if (target) window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + scrollY - (document.querySelector("[data-site-navbar]")?.getBoundingClientRect().height || 68)), behavior: "instant" });
        }
      }
      setState("revealing");
      gsap.set(band.current, { top: "auto", bottom: 0, y: 0, scaleY: 1 });
      if (!reduced && content.current) reveals.current = revealPage(content.current);
      await animate(curtain.current, reduced
        ? { opacity: 0, duration: .17 }
        : { yPercent: -100, duration: C.DURATION_REVEAL * factor, ease: C.EASE_COVER });
      if (!alive()) return;
      // Keep originals hidden until their presentation-only line masks finish.
      if (reveals.current?.timeline.isActive()) await reveals.current.timeline.then();
      if (!alive()) return;
      const heading = content.current?.querySelector<HTMLElement>("h1") || content.current?.querySelector<HTMLElement>("main");
      const hadTabIndex = heading?.getAttribute("tabindex");
      finish();
      if (heading) {
        heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true });
        if (hadTabIndex === null) heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
      }
      setAnnouncement(`Navigated to ${document.title.split(/[—|]/)[0].trim()}`);
    } catch {
      if (alive()) { finish(); location.assign(initial.href); }
    }
  }, [router, finish, setState, readQueued]);
  startRef.current = request => { void start(request); };

  const onCommit = useCallback(() => {
    const url = location.pathname + location.search;
    if (url === previousUrl.current) return;
    const first = !previousUrl.current;
    previousUrl.current = url;
    if (routeResolve.current) { const resolve = routeResolve.current; routeResolve.current = null; resolve(); }
    else if (!first && state.current === "idle") startRef.current({ href: url, history: true });
    else if (first && C.PLAY_ON_FIRST_LOAD) startRef.current({ href: url, history: true });
  }, []);

  useEffect(() => {
    const linkFrom = (event: Event) => event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    const eligible = (link: HTMLAnchorElement) => {
      const url = new URL(link.href, location.href);
      return url.origin === location.origin && /^https?:$/.test(url.protocol) && !link.hasAttribute("download") && (!link.target || link.target === "_self") && !link.closest('[data-transition="none"]') && !(url.pathname === location.pathname && url.search === location.search);
    };
    const click = (event: MouseEvent) => {
      const link = linkFrom(event);
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !eligible(link)) return;
      event.preventDefault();
      const url = new URL(link.href);
      startRef.current({ href: url.pathname + url.search + url.hash });
    };
    const prefetch = (event: Event) => { const link = linkFrom(event); if (link && eligible(link)) router.prefetch(link.pathname + link.search); };
    const pop = () => {
      const url = location.pathname + location.search;
      if (url !== previousUrl.current && state.current === "idle") startRef.current({ href: url, history: true });
    };
    window.addEventListener("popstate", pop);
    const blockScroll = (event: Event) => { if (state.current !== "idle") event.preventDefault(); };
    const blockScrollKeys = (event: KeyboardEvent) => {
      if (state.current !== "idle" && ["PageDown", "PageUp", "Home", "End", " ", "ArrowDown", "ArrowUp"].includes(event.key)) event.preventDefault();
    };
    document.addEventListener("keydown", blockScrollKeys);
    document.documentElement.dataset.pageTransition = state.current;
    document.addEventListener("click", click, true);
    document.addEventListener("pointerover", prefetch, { passive: true });
    document.addEventListener("focusin", prefetch);
    document.addEventListener("touchstart", prefetch, { passive: true });
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    return () => {
      document.removeEventListener("keydown", blockScrollKeys);
      window.removeEventListener("popstate", pop);
      document.removeEventListener("click", click, true);
      document.removeEventListener("pointerover", prefetch);
      document.removeEventListener("focusin", prefetch);
      document.removeEventListener("touchstart", prefetch);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      finish();
    };
  }, [router, finish]);

  const styles = {
    "--transition-curtain": C.COLOR_CURTAIN, "--transition-band": C.COLOR_BAND,
    "--transition-progress": C.COLOR_PROGRESS, "--transition-text": C.COLOR_TEXT,
    "--transition-band-height": `${C.BAND_HEIGHT_VH}vh`, "--transition-mobile-band-height": `${C.MOBILE_BAND_HEIGHT_VH}vh`,
    zIndex: C.NAV_ABOVE_CURTAIN ? 45 : 60,
  } as CSSProperties;
  return <PageTransitionContext.Provider value={{ phase, destination, navigate: (href, options) => startRef.current({ href, ...options }) }}>
    <Navbar />
    <div ref={content} data-transition-content>{children}</div>
    <div ref={overlay} className="page-transition-overlay" style={styles} aria-hidden="true" data-phase={phase}>
      <div ref={shade} className="page-transition-shade" />
      <div ref={curtain} className="page-transition-curtain">
        <div ref={band} className="page-transition-band" />
        <div ref={progress} className="page-transition-progress" />
        {C.SHOW_PAGE_LABEL && destination && <span className="page-transition-label">{label(destination)}</span>}
      </div>
    </div>
    <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
    <Suspense fallback={null}><RouteObserver onCommit={onCommit} /></Suspense>
  </PageTransitionContext.Provider>;
}
