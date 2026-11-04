/**
 * Three-free shared state for the Services particle stage.
 *
 * Extracted from `ServicesParticleCanvas.tsx` so the grid (and any other
 * consumer of the timeline math) never pulls `three` into the main bundle;
 * the canvas component itself is code-split and lazy-mounted.
 */

import { PARTICLE_ENGINE_DEFAULTS } from "./particleDefaults";
import { SERVICE_STAGE_ORDER, ServiceShapeId } from "./serviceParticleShapes";

export const PARTICLE_TUNING = {
  DESKTOP_COUNT: PARTICLE_ENGINE_DEFAULTS.DESKTOP_COUNT, // 7,200 (matches ParticleSphereHero)
  MOBILE_COUNT: PARTICLE_ENGINE_DEFAULTS.MOBILE_COUNT, // 3,600 (medium tier)
  LOW_TIER_COUNT: PARTICLE_ENGINE_DEFAULTS.LOW_TIER_COUNT, // 2,160 (low tier)
  PROGRESS_LERP: 0.12, // Crisp follow of GSAP scrubbed scroll progress
  HOVER_MORPH_DURATION_S: 0.78, // Preview-tab shape morph duration through irregular dust midpoint
  HOVER_PULSE_STRENGTH: 0.36, // 36% outward loosening on active-card hover / mobile canvas tap (target: 30-40%)
  HOVER_PULSE_DURATION_MS: 820, // 820ms ease-in-out breathing loosen + re-assemble pulse
  HOVER_ROTATION_MULTIPLIER: 1.5, // 1.5x rotation/sway speed while card is hovered/focused
  HOVER_ENTER_EASE_MS: 320, // Smooth ramp-in for glow & rotation boost on hover enter
  HOVER_LEAVE_EASE_MS: 500, // 500ms smooth ease-back on pointer leave
  REPEL_RADIUS_PX: 112, // 112px cursor repulsion radius on particle stage (target: 90-120px)
  REPEL_STRENGTH_PX: 78, // Crisp tactile repulsion impulse with damped spring return
  SWAY_AMPLITUDE_Y: 0.26, // ~15 deg gentle Y-axis depth sway for wireframe, </> & growth chart
  SWAY_SPEED: 0.55, // rad/s idle sway frequency
  HELIX_ROTATION_SPEED: 0.36, // rad/s continuous Y-axis spin for DNA helix
  MIDPOINT_NOISE_AMOUNT: 0.42, // Outward curl turbulence peaking at uMorph = 0.5
  IDLE_WOBBLE_AMOUNT: 0.015, // Continuous per-particle organic breathing wobble
  SHAPE_RADIUS_CLAMP_MIN: 60,
  SHAPE_RADIUS_CLAMP_MAX: 320,
} as const;

export const ORDERED_SERVICE_SHAPES: ServiceShapeId[] = SERVICE_STAGE_ORDER.map(
  (s) => s.shape
);

export interface MasterTimelineState {
  scrollIndex: number; // 0..3 scroll-resolved active service index
  fromCardIndex: number; // 0..3 outgoing card during scroll transition
  toCardIndex: number; // 0..3 incoming card during scroll transition
  cardTransitionT: number; // 0..1 progress between fromCardIndex -> toCardIndex
  fromShape: ServiceShapeId;
  toShape: ServiceShapeId;
  shapeMorphT: number; // 0..1 morph progress between fromShape and toShape
}

export interface ServicesHoverBridge {
  previewIndex: number | null; // Optional shape override (deck previews themselves are decorative)
  cardHovered: boolean; // True when active card (or its arrow) is hovered or keyboard-focused
  pulseSeq: number; // Increments on each genuine hover/focus enter or mobile canvas tap
}

export const MORPH_DISPERSAL = 0.35;
export const ENTRY_ASSEMBLE_MS = 900;

export const STEP_HOLD_PROGRESS = [0.075, 0.385, 0.695, 0.96] as const;

export function evaluateServicesMasterTimeline(
  rawP: number
): MasterTimelineState {
  const p = Math.max(0, Math.min(1, rawP));

  // Scroll begins and returns to the first service, never the Hero sphere.
  const u = p;

  const windows = [
    { type: "hold" as const, start: 0.0, end: 0.15, idx: 0 },
    { type: "trans" as const, start: 0.15, end: 0.31, from: 0, to: 1 },
    { type: "hold" as const, start: 0.31, end: 0.46, idx: 1 },
    { type: "trans" as const, start: 0.46, end: 0.62, from: 1, to: 2 },
    { type: "hold" as const, start: 0.62, end: 0.77, idx: 2 },
    { type: "trans" as const, start: 0.77, end: 0.92, from: 2, to: 3 },
    { type: "hold" as const, start: 0.92, end: 1.0001, idx: 3 },
  ];

  for (const w of windows) {
    if (u >= w.start && u <= w.end) {
      if (w.type === "hold") {
        return {
          scrollIndex: w.idx,
          fromCardIndex: w.idx,
          toCardIndex: w.idx,
          cardTransitionT: 0,
          fromShape: ORDERED_SERVICE_SHAPES[w.idx],
          toShape: ORDERED_SERVICE_SHAPES[w.idx],
          shapeMorphT: 0,
        };
      }
      const localT = Math.max(
        0,
        Math.min(1, (u - w.start) / (w.end - w.start))
      );
      return {
        scrollIndex: localT < 0.5 ? w.from : w.to,
        fromCardIndex: w.from,
        toCardIndex: w.to,
        cardTransitionT: localT,
        fromShape: ORDERED_SERVICE_SHAPES[w.from],
        toShape: ORDERED_SERVICE_SHAPES[w.to],
        shapeMorphT: localT,
      };
    }
  }

  return {
    scrollIndex: 3,
    fromCardIndex: 3,
    toCardIndex: 3,
    cardTransitionT: 0,
    fromShape: ORDERED_SERVICE_SHAPES[3],
    toShape: ORDERED_SERVICE_SHAPES[3],
    shapeMorphT: 0,
  };
}
