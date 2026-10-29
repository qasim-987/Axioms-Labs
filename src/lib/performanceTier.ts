// ============================================================================
// DEVICE PERFORMANCE TIER & ADAPTIVE RUNTIME FPS GOVERNOR
// Shared by `ParticleSphereHero` and `ServicesParticleCanvas`
// ============================================================================

export type PerformanceTier = "high" | "medium" | "low";

export interface PerformanceTierConfig {
  tier: PerformanceTier;
  particleCount: number;
  dprCap: number;
  antialias: boolean;
  fullNoise: boolean;
  idleWobbleMultiplier: number;
}

export const PERFORMANCE_TIER_SPECS: Record<
  PerformanceTier,
  PerformanceTierConfig
> = {
  // Desktop (>= 1024px, fine pointer, normal/high cores): 100% unchanged approved visuals
  high: {
    tier: "high",
    particleCount: 7200,
    dprCap: 2.0,
    antialias: true,
    fullNoise: true,
    idleWobbleMultiplier: 1.0,
  },
  // Tablets & mid/high-range phones: 50% particles, 1.5 DPR cap, simplified noise
  medium: {
    tier: "medium",
    particleCount: 3600,
    dprCap: 1.5,
    antialias: true,
    fullNoise: false,
    idleWobbleMultiplier: 0.75,
  },
  // Low-end phones (<=4 cores, <=4GB RAM, Save-Data, or measured <45fps): 30% particles, DPR 1
  low: {
    tier: "low",
    particleCount: 2160,
    dprCap: 1.0,
    antialias: false,
    fullNoise: false,
    idleWobbleMultiplier: 0.0,
  },
};

export const ADAPTIVE_FPS_TUNING = {
  MIN_TARGET_FPS: 45, // Step down one tier if sustained average FPS < 45
  SAMPLE_WINDOW_MS: 1700, // Measure over ~1.7s of active on-screen rendering
  MIN_SAMPLES: 45, // Require at least 45 rendered frames before judging
  COOLDOWN_MS: 12000, // Hysteresis cooldown; never step back up automatically
} as const;

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  getBattery?: () => Promise<{
    charging: boolean;
    level: number;
  }>;
}

let cachedBatteryLow = false;
let batteryProbed = false;

function probeBatteryOnce(): void {
  if (batteryProbed || typeof navigator === "undefined") return;
  batteryProbed = true;
  const nav = navigator as NavigatorWithHints;
  if (typeof nav.getBattery === "function") {
    nav
      .getBattery()
      .then((bat) => {
        if (!bat.charging && bat.level <= 0.2) {
          cachedBatteryLow = true;
        }
      })
      .catch(() => {
        // Ignore unsupported Battery API
      });
  }
}

/**
 * Determines the initial hardware/network performance tier (`high` | `medium` | `low`).
 * Desktop (`>= 1024px` with fine pointer and normal hardware/network) always resolves to `high`
 * so the approved desktop experience remains 100% unchanged.
 */
export function getPerformanceTier(): PerformanceTierConfig {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return PERFORMANCE_TIER_SPECS.high;
  }

  probeBatteryOnce();

  const nav = navigator as NavigatorWithHints;
  const cores = nav.hardwareConcurrency || 8;
  const memory = nav.deviceMemory ?? 8;
  const saveData = Boolean(nav.connection?.saveData);
  const slowNet =
    nav.connection?.effectiveType === "slow-2g" ||
    nav.connection?.effectiveType === "2g";

  const isCoarse = window.matchMedia(
    "(hover: none), (pointer: coarse)"
  ).matches;
  const vw = window.visualViewport?.width || window.innerWidth;
  const isSmallScreen = vw < 1024;

  // Respect Save-Data, low battery, or constrained CPU/RAM immediately
  if (saveData || slowNet || cachedBatteryLow) {
    return PERFORMANCE_TIER_SPECS.low;
  }

  if (cores <= 4 || memory <= 4) {
    // Only downgrade desktop if severely constrained (<= 2 cores); phones/tablets with <=4 cores/4GB use `low`
    if (isCoarse || isSmallScreen || cores <= 2) {
      return PERFORMANCE_TIER_SPECS.low;
    }
    return PERFORMANCE_TIER_SPECS.medium;
  }

  // Phones & tablets default to `medium` (3,600 particles, DPR 1.5)
  if (isCoarse || isSmallScreen) {
    return PERFORMANCE_TIER_SPECS.medium;
  }

  // Desktop (>= 1024px, fine pointer, >= 6-8 cores): full `high` tier
  return PERFORMANCE_TIER_SPECS.high;
}

export function getNextLowerTier(
  current: PerformanceTier
): PerformanceTier | null {
  if (current === "high") return "medium";
  if (current === "medium") return "low";
  return null;
}

/**
 * Runtime frame-time governor with one-way step-down hysteresis:
 * Monitors active frame deltas over ~1.7s windows and steps down one tier
 * if sustained FPS stays below 45fps. Never steps back up to prevent oscillation.
 */
export function createAdaptiveFpsMonitor(
  initialTier: PerformanceTier,
  onStepDown: (nextSpec: PerformanceTierConfig) => void
) {
  let currentTier: PerformanceTier = initialTier;
  let accumMs = 0;
  let frameCount = 0;
  let cooldownUntil = 0;

  return {
    getCurrentTier: () => currentTier,
    recordFrame(dtSeconds: number, nowMs: number) {
      if (currentTier === "low") return;
      if (nowMs < cooldownUntil) return;
      // Ignore paused/backgrounded tab spikes (> 180ms)
      if (dtSeconds <= 0 || dtSeconds > 0.18) return;

      accumMs += dtSeconds * 1000;
      frameCount += 1;

      if (
        accumMs >= ADAPTIVE_FPS_TUNING.SAMPLE_WINDOW_MS &&
        frameCount >= ADAPTIVE_FPS_TUNING.MIN_SAMPLES
      ) {
        const avgFps = (frameCount * 1000) / accumMs;
        accumMs = 0;
        frameCount = 0;

        if (avgFps < ADAPTIVE_FPS_TUNING.MIN_TARGET_FPS) {
          const lower = getNextLowerTier(currentTier);
          if (lower) {
            currentTier = lower;
            cooldownUntil = nowMs + ADAPTIVE_FPS_TUNING.COOLDOWN_MS;
            onStepDown(PERFORMANCE_TIER_SPECS[lower]);
          }
        }
      }
    },
    resetWindow() {
      accumMs = 0;
      frameCount = 0;
    },
  };
}
