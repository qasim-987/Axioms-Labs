/**
 * [NAME] Landing — global cleanup registry for route changes.
 *
 * Tracks WebGL particle stages so they can be disposed when the router leaves
 * the landing page, and kills every ScrollTrigger so pinned/scrubbed sections
 * do not desync after a client-side navigation.
 */

import { ScrollTrigger } from "gsap/ScrollTrigger";

const stageDisposers = new Set<() => void>();

export function registerStage(dispose: () => void): () => void {
  stageDisposers.add(dispose);
  return () => {
    stageDisposers.delete(dispose);
  };
}

export function disposeAllStages(): void {
  stageDisposers.forEach((dispose) => {
    try {
      dispose();
    } catch {
      // Ignore individual disposal failures.
    }
  });
  stageDisposers.clear();
}

export function killAllScrollTriggers(): void {
  if (typeof ScrollTrigger === "undefined") return;
  ScrollTrigger.getAll().forEach((trigger) => {
    try {
      trigger.kill();
    } catch {
      // Ignore individual kill failures.
    }
  });
}
