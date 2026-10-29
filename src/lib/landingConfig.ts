/**
 * [NAME] Landing — single source of truth for all motion/visual constants.
 * Tweak these values to retime the entire experience. No `any` types.
 */

export const BRAND = {
  // Placeholder — replace `[NAME]` with the real company name.
  name: "[NAME]",
  // Near-black canvas.
  bg: "#05060A",
  surface: "#0A0B0F",
  // Violet / indigo accent (default gradient; supply exact hex when known).
  violet: "#6C6FD8",
  violetDark: "#4B4FD0",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.85)",
  textDim: "rgba(255, 255, 255, 0.5)",
  border: "rgba(255, 255, 255, 0.12)",
  borderDim: "rgba(255, 255, 255, 0.06)",
  // Soft outer glow on the primary pill CTA.
  ctaGlow: "rgba(108, 111, 216, 0.45)",
} as const;

/**
 * Master page-load intro. All times in seconds from intro start.
 * Drive the single `gsap.timeline()` in `IntroController` with these.
 */
export const INTRO = {
  // 0.00 – 0.60s: pure black + watermark only (handled by CSS visibility).
  beam: { start: 0.60, dur: 0.60, ease: "power2.out" },
  // 1.00s: navigation slides down and fades in.
  nav: { start: 1.00, dur: 0.70, y: -12, ease: "power3.out" },
  // Nav pill button: greyed first, then settles to normal.
  navButton: { start: 1.55, dur: 0.40, ease: "power2.out" },
  // 1.10 – 2.60s: headline per-character reveal (both lines in parallel).
  headline: { start: 1.10, dur: 0.90, stagger: 0.025, lineOffset: 0.12, ease: "power4.out" },
  // 2.30 – 3.10s: subtext fades up.
  subtext: { start: 2.30, dur: 0.80, y: 16, ease: "power3.out" },
  // 2.60 – 3.20s: CTA button fades/scales in.
  cta: { start: 2.60, dur: 0.60, fromScale: 0.96, ease: "power2.out" },
  // 2.80 – 4.50s: stats fade in and count up.
  stats: { start: 2.80, dur: 1.60, ease: "power2.out" },
  // 3.00 – 4.00s: particle sphere fades/scales in and starts rotating.
  sphere: { start: 3.00, dur: 1.00, fromScale: 0.85, ease: "power3.out" },
  // Approximate total intro length.
  total: 4.6,
} as const;

/**
 * Reduced-motion intro: a single simple fade, no char animation, no rotation.
 */
export const REDUCED_INTRO = { dur: 0.25, stagger: 0.04, ease: "power2.out" } as const;

/**
 * Scroll-exit choreography out of the hero (scrubbed to scroll progress).
 */
export const HERO_EXIT = {
  content: { y: -40, opacity: 0 },
  sphere: { x: -140, scale: 1.4 },
  scrub: 0.5,
} as const;

/**
 * Particle sphere (WebGL).
 */
export const PARTICLES = {
  desktopCount: 7600, // within the 6,000–9,000 spec range
  mobileCount: 3500,
  dprCap: 1.75,
  rotationSpeedY: 0.075, // rad/s
  wobbleX: 0.02,
  edgeGlowColor: "rgba(108, 111, 216, 0.55)",
} as const;

/**
 * Services particle morph (sphere -> square outline -> "</>" glyph).
 */
export const MORPH = {
  dur: 0.8, // seconds
  ease: "power2.inOut",
} as const;

/**
 * Click transition (card -> service page), total ≈ 2s.
 */
export const TRANSITION = {
  exitDur: 0.40, // card slides left & fades; heading + particles fade out
  bandDur: 0.20, // full-width violet band sweeps upward
  blackMin: 0.50, // near-empty black hold before router.push
  pushAt: 0.60, // router.push() runs here
  enterDur: 0.80, // violet glow from left + fade in
  maxWaitMs: 3200, // give up waiting for slow networks and force enter
  reducedFadeMs: 200, // prefers-reduced-motion: simple fade
} as const;

/**
 * Pinned services stage (desktop).
 */
export const SERVICES = {
  vhPerStep: 82, // scroll distance per service step
  cardGap: 28,
  scrub: 0.5,
} as const;

export const BREAKPOINT = { desktop: 1024 } as const;
