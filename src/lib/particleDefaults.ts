/**
 * Pure particle-engine tuning constants.
 *
 * Lives in its own dependency-free module so non-WebGL consumers (service
 * timeline math, tuning tables) never pull `three` into their bundle.
 * `particleEngine.ts` re-exports this for backwards compatibility.
 */

export const PARTICLE_ENGINE_DEFAULTS = {
  DESKTOP_COUNT: 7200, // Shared count across Hero sphere & Services morph stage
  MOBILE_COUNT: 3600,
  LOW_TIER_COUNT: 2160,
  CAMERA_FOV: 45,
  CAMERA_Z: 800,
  DPR_CAP: 2,
  ROTATION_TILT_X: 0.15,
  HERO_ROTATION_SPEED_Y: 0.095,
  MOUSE_INFLUENCE_RADIUS_PX: 112,
  MOUSE_LERP_FACTOR: 0.14,
  SPRING_STIFFNESS: 0.078,
  SPRING_DAMPING: 0.88,
} as const;
