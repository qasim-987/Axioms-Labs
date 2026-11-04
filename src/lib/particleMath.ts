/**
 * Three-free particle math & 2D fallback renderer.
 *
 * Split out of `particleEngine.ts` so modules that only need the math
 * (services timeline, mobile card transitions, shape generators) never
 * pull `three` into their bundle. `particleEngine.ts` re-exports these
 * symbols for backwards compatibility.
 */

import { PARTICLE_ENGINE_DEFAULTS } from "./particleDefaults";

// Shared easing curves aligned with `src/lib/motionTokens.ts` & `Animations.md`
export function easeInOutQuint(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5
    ? 16 * x * x * x * x * x
    : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

export function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Matches `cubic-bezier(0.22, 1, 0.36, 1)` (`MOTION_EASE.odometer` in `motionTokens.ts`)
export function easeOutOdometer(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3.2);
}

/**
 * Safe feature probe for WebGL support before constructing `THREE.WebGLRenderer`.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  try {
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") ||
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Deterministic 32-bit PRNG (Mulberry32) so particle layouts are reproducible
 * and SSR/client safe without allocations.
 */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function findCoprimeStride(n: number): number {
  if (n <= 2) return 1;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  let candidate = Math.max(3, Math.floor(n * 0.61803398875));
  while (gcd(candidate, n) !== 1) {
    candidate += 1;
  }
  return candidate;
}

/**
 * Shared Fibonacci + volumetric sphere generator derived from `ParticleSphereHero`.
 * Permutes Fibonacci indices via a golden-ratio coprime stride so `geometry.setDrawRange(0, activeCount)`
 * uniformly covers all latitudes from north pole to south pole at any adaptive particle tier!
 */
export function generateFibonacciSphereBuffer(
  count: number,
  options: {
    jitter?: number;
    surfaceBias?: number;
    seed?: number;
  } = {}
): Float32Array {
  const { jitter = 0.05, surfaceBias = 1.0, seed = 104729 } = options;
  const rand = createSeededRandom(seed);
  const out = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const stride = findCoprimeStride(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const fibIdx = count === 7200 ? i : (i * stride) % Math.max(1, count);
    if (rand() <= surfaceBias) {
      const y = 1 - (fibIdx / Math.max(1, count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * fibIdx;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const j = 1 + (rand() - 0.5) * jitter;

      out[i3] = x * j;
      out[i3 + 1] = y * j;
      out[i3 + 2] = z * j;
    } else {
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      const isHalo = rand() > 0.84;
      const r = isHalo
        ? 0.96 + rand() * 0.22
        : 0.18 + Math.pow(rand(), 0.62) * 0.8;

      out[i3] = r * s * Math.cos(theta);
      out[i3 + 1] = r * u;
      out[i3 + 2] = r * s * Math.sin(theta);
    }
  }

  return out;
}

export interface ScreenSpaceRepulsionParams {
  count: number;
  startPositions: Float32Array;
  targetPositions: Float32Array;
  seeds: Float32Array;
  morphProgress: number;
  displacements: Float32Array;
  velocities: Float32Array;
  highlights: Float32Array;
  shapeScaleWorld: number;
  rotationX: number;
  rotationY: number;
  groupX: number;
  groupY: number;
  groupZ: number;
  cameraZ: number;
  stageWidth: number;
  stageHeight: number;
  pxToWorld: number;
  cursorX: number;
  cursorY: number;
  cursorActive: boolean;
  time: number;
  influenceRadiusPx?: number;
  repelStrengthPx?: number;
  springStiffness?: number;
  springDamping?: number;
}

/**
 * Shared screen-space damped-spring repulsion solver reused from `ParticleSphereHero`.
 */
export function stepScreenSpaceRepulsionSpring(
  params: ScreenSpaceRepulsionParams
): boolean {
  const {
    count,
    startPositions,
    targetPositions,
    seeds,
    morphProgress,
    displacements,
    velocities,
    highlights,
    shapeScaleWorld,
    rotationX,
    rotationY,
    groupX,
    groupY,
    groupZ,
    cameraZ,
    stageWidth,
    stageHeight,
    pxToWorld,
    cursorX,
    cursorY,
    cursorActive,
    time,
    influenceRadiusPx = PARTICLE_ENGINE_DEFAULTS.MOUSE_INFLUENCE_RADIUS_PX,
    repelStrengthPx = 76,
    springStiffness = PARTICLE_ENGINE_DEFAULTS.SPRING_STIFFNESS,
    springDamping = PARTICLE_ENGINE_DEFAULTS.SPRING_DAMPING,
  } = params;

  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const invScale = 1 / Math.max(1, shapeScaleWorld);

  let hasResidualMotion = false;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const seed = seeds[i];
    const stag = Math.max(0, Math.min(1, morphProgress * 1.3 - seed * 0.3));
    const eased =
      stag * stag * stag * (stag * (stag * 6.0 - 15.0) + 10.0);

    const bx =
      startPositions[i3] + (targetPositions[i3] - startPositions[i3]) * eased;
    const by =
      startPositions[i3 + 1] +
      (targetPositions[i3 + 1] - startPositions[i3 + 1]) * eased;
    const bz =
      startPositions[i3 + 2] +
      (targetPositions[i3 + 2] - startPositions[i3 + 2]) * eased;

    let dx = displacements[i3];
    let dy = displacements[i3 + 1];
    let dz = displacements[i3 + 2];
    let vx = velocities[i3];
    let vy = velocities[i3 + 1];
    let vz = velocities[i3 + 2];
    let hl = highlights[i];

    if (cursorActive) {
      const px = (bx + dx) * shapeScaleWorld;
      const py = (by + dy) * shapeScaleWorld;
      const pz = (bz + dz) * shapeScaleWorld;

      const x1 = px * cosY + pz * sinY;
      const y1 = py;
      const z1 = -px * sinY + pz * cosY;

      const rx = x1;
      const ry = y1 * cosX - z1 * sinX;
      const rz = y1 * sinX + z1 * cosX;

      const wx = rx + groupX;
      const wy = ry + groupY;
      const wz = rz + groupZ;

      const distZ = cameraZ - wz;
      const projScale = cameraZ / Math.max(20, distZ);
      const screenX = stageWidth * 0.5 + (wx * projScale) / pxToWorld;
      const screenY = stageHeight * 0.5 - (wy * projScale) / pxToWorld;

      const fromCursorX = screenX - cursorX;
      const fromCursorY = screenY - cursorY;
      const screenDist = Math.sqrt(
        fromCursorX * fromCursorX + fromCursorY * fromCursorY
      );

      if (screenDist < influenceRadiusPx) {
        const normDist = screenDist / influenceRadiusPx;
        const falloff =
          Math.exp(-screenDist / (influenceRadiusPx * 0.42)) *
          (1.0 - normDist);
        const targetHl = Math.min(1.0, falloff * 1.45);
        hl += (targetHl - hl) * 0.24;

        const dirX = fromCursorX / (screenDist + 1e-4);
        const dirY = fromCursorY / (screenDist + 1e-4);
        const tanX = -dirY;
        const tanY = dirX;
        const swirl = 0.26 * Math.sin(seed * 24.0 + time * 2.1);

        const pushPxX = (dirX + tanX * swirl) * falloff * repelStrengthPx;
        const pushPxY = (dirY + tanY * swirl) * falloff * repelStrengthPx;

        const pushWorldX = (pushPxX * pxToWorld) / projScale;
        const pushWorldY = -(pushPxY * pxToWorld) / projScale;

        const invRy = pushWorldY * cosX;
        const invRz = pushWorldY * sinX;
        const localPushX = (pushWorldX * cosY - invRz * sinY) * invScale;
        const localPushY = invRy * invScale;
        const localPushZ = (pushWorldX * sinY + invRz * cosY) * invScale;

        vx += (localPushX - dx) * 0.16;
        vy += (localPushY - dy) * 0.16;
        vz += (localPushZ - dz) * 0.16;
      } else {
        hl *= 0.88;
      }
    } else {
      hl *= 0.88;
    }

    vx = (vx - dx * springStiffness) * springDamping;
    vy = (vy - dy * springStiffness) * springDamping;
    vz = (vz - dz * springStiffness) * springDamping;

    dx += vx;
    dy += vy;
    dz += vz;

    const magSq = dx * dx + dy * dy + dz * dz + vx * vx + vy * vy + vz * vz;
    if (magSq > 1e-6 || hl > 0.004) {
      hasResidualMotion = true;
    } else {
      dx = 0;
      dy = 0;
      dz = 0;
      vx = 0;
      vy = 0;
      vz = 0;
      hl = 0;
    }

    displacements[i3] = dx;
    displacements[i3 + 1] = dy;
    displacements[i3 + 2] = dz;
    velocities[i3] = vx;
    velocities[i3 + 1] = vy;
    velocities[i3 + 2] = vz;
    highlights[i] = hl;
  }

  return hasResidualMotion || cursorActive;
}

/**
 * Lightweight zero-WebGL 2D static particle-cloud renderer used for:
 * - `prefers-reduced-motion: reduce` non-pinned fallback cards (avoids spawning 4 WebGL contexts!)
 * - Browsers/devices where WebGL is unavailable or evicted without recovery
 */
export function renderStaticParticleCloud2D(
  canvas: HTMLCanvasElement,
  positions: Float32Array,
  options?: {
    maxPoints?: number;
    yawRad?: number;
    pitchRad?: number;
    fitPadding?: number;
  }
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(120, rect.width || canvas.clientWidth || 240);
  const cssH = Math.max(120, rect.height || canvas.clientHeight || 180);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const cx = cssW * 0.5;
  const cy = cssH * 0.5;
  const radius = Math.min(cssW, cssH) * 0.46;
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.06, cx, cy, radius);
  glow.addColorStop(0, "rgba(49, 134, 255, 0.14)");
  glow.addColorStop(0.55, "rgba(116, 155, 255, 0.05)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, cssW, cssH);

  const total = Math.floor(positions.length / 3);
  if (total === 0) return;

  const targetCount = Math.min(total, options?.maxPoints ?? 900);
  const stride = Math.max(1, Math.floor(total / targetCount));
  const yaw = options?.yawRad ?? 0.28;
  const pitch = options?.pitchRad ?? -0.14;
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);

  let maxExtent = 1;
  for (let i = 0; i < total; i += stride) {
    const i3 = i * 3;
    const x = Math.abs(positions[i3]);
    const y = Math.abs(positions[i3 + 1]);
    const z = Math.abs(positions[i3 + 2]);
    if (x > maxExtent) maxExtent = x;
    if (y > maxExtent) maxExtent = y;
    if (z > maxExtent) maxExtent = z;
  }

  const fitScale =
    (Math.min(cssW, cssH) * (options?.fitPadding ?? 0.39)) / maxExtent;

  for (let i = 0; i < total; i += stride) {
    const i3 = i * 3;
    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    const rx = px * cosY + pz * sinY;
    const rz1 = -px * sinY + pz * cosY;
    const ry = py * cosX - rz1 * sinX;
    const rz = py * sinX + rz1 * cosX;

    const perspective = 260 / Math.max(110, 260 - rz);
    const sx = cx + rx * fitScale * perspective;
    const sy = cy - ry * fitScale * perspective;

    const depthAlpha = Math.max(
      0.24,
      Math.min(0.86, 0.48 + (rz / maxExtent) * 0.3)
    );
    const mod = i % 11;
    if (mod === 0) {
      ctx.fillStyle = `rgba(49, 134, 255, ${depthAlpha.toFixed(2)})`;
    } else if (mod === 3) {
      ctx.fillStyle = `rgba(116, 155, 255, ${(depthAlpha * 0.9).toFixed(2)})`;
    } else {
      ctx.fillStyle = `rgba(18, 19, 23, ${(depthAlpha * 0.85).toFixed(2)})`;
    }

    const r = mod === 0 ? 1.55 : 1.15;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
