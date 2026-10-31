import * as THREE from "three";

// ============================================================================
// SHARED PARTICLE ENGINE (Used by ParticleSphereHero & ServicesParticleCanvas)
// ============================================================================

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

export interface ProjectionMetrics {
  width: number;
  height: number;
  dpr: number;
  visibleWidthAtZ0: number;
  visibleHeightAtZ0: number;
  pxToWorld: number;
}

export function computeStageProjectionMetrics(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  container: HTMLElement,
  dprCap: number = PARTICLE_ENGINE_DEFAULTS.DPR_CAP
): ProjectionMetrics {
  const rect = container.getBoundingClientRect();
  const width = Math.max(
    1,
    rect.width || container.clientWidth || window.innerWidth
  );
  const height = Math.max(
    1,
    rect.height || container.clientHeight || window.innerHeight
  );
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);

  const visibleHeightAtZ0 =
    2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z;
  const visibleWidthAtZ0 = visibleHeightAtZ0 * camera.aspect;
  const pxToWorld = visibleWidthAtZ0 / width;

  return {
    width,
    height,
    dpr,
    visibleWidthAtZ0,
    visibleHeightAtZ0,
    pxToWorld,
  };
}

export function createRadialGlowSprite(
  stops: Array<{ offset: number; color: string }>,
  blending: THREE.Blending = THREE.NormalBlending
): {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  dispose: () => void;
} {
  const canvasGlow = document.createElement("canvas");
  canvasGlow.width = 256;
  canvasGlow.height = 256;
  const ctx = canvasGlow.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    for (const stop of stops) {
      grad.addColorStop(stop.offset, stop.color);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvasGlow);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);

  return {
    sprite,
    material,
    dispose: () => {
      texture.dispose();
      material.dispose();
    },
  };
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

export interface SharedParticleStage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  getMetrics: () => ProjectionMetrics;
  setMaxDpr: (nextMaxDpr: number) => number;
  isActive: () => boolean;
  isContextLost: () => boolean;
  pointer: {
    targetX: number;
    targetY: number;
    lerpedX: number;
    lerpedY: number;
    inside: boolean;
    stepLerp: (lerpFactor?: number) => void;
  };
  dispose: () => void;
}

/**
 * Shared Three.js WebGL stage lifecycle manager for `ServicesParticleCanvas`:
 * - Creates Scene, PerspectiveCamera, and alpha WebGLRenderer with tier DPR & antialias
 * - Handles ResizeObserver + debounced `onResizeSettled` (180ms)
 * - Tracks off-screen IntersectionObserver + document.visibilitychange pause state
 * - Handles `webglcontextlost` / `webglcontextrestored` cleanly without crashes
 */
export function createSharedParticleStage(
  container: HTMLElement,
  options: {
    enablePointer?: boolean;
    fov?: number;
    cameraZ?: number;
    maxDpr?: number;
    antialias?: boolean;
    onResize?: (metrics: ProjectionMetrics) => void;
    onResizeSettled?: (metrics: ProjectionMetrics) => void;
    onContextLost?: () => void;
    onContextRestored?: () => void;
  } = {}
): SharedParticleStage | null {
  const {
    fov = PARTICLE_ENGINE_DEFAULTS.CAMERA_FOV,
    cameraZ = PARTICLE_ENGINE_DEFAULTS.CAMERA_Z,
    antialias = true,
    onResize,
    onResizeSettled,
    onContextLost,
    onContextRestored,
  } = options;

  let currentDprCap = options.maxDpr ?? PARTICLE_ENGINE_DEFAULTS.DPR_CAP;

  if (!isWebGLAvailable()) {
    return null;
  }

  const initRect = container.getBoundingClientRect();
  const width = Math.max(
    1,
    initRect.width || container.clientWidth || window.innerWidth
  );
  const height = Math.max(
    1,
    initRect.height || container.clientHeight || window.innerHeight
  );

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 2500);
  camera.position.set(0, 0, cameraZ);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  let contextLost = false;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;
  let metrics = computeStageProjectionMetrics(
    camera,
    renderer,
    container,
    currentDprCap
  );
  let lastSettledW = metrics.width;
  let lastSettledH = metrics.height;

  const handleResize = () => {
    if (contextLost) return;
    metrics = computeStageProjectionMetrics(
      camera,
      renderer,
      container,
      currentDprCap
    );
    onResize?.(metrics);

    if (
      onResizeSettled &&
      (Math.abs(metrics.width - lastSettledW) > 2 ||
        Math.abs(metrics.height - lastSettledH) > 2)
    ) {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        lastSettledW = metrics.width;
        lastSettledH = metrics.height;
        onResizeSettled(metrics);
      }, 180);
    }
  };
  onResize?.(metrics);

  const setMaxDpr = (nextMaxDpr: number): number => {
    currentDprCap = Math.max(1, nextMaxDpr);
    if (!contextLost) {
      metrics = computeStageProjectionMetrics(
        camera,
        renderer,
        container,
        currentDprCap
      );
      onResize?.(metrics);
    }
    return metrics.dpr;
  };

  window.addEventListener("resize", handleResize, { passive: true });
  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
  }

  let isTabVisible = !document.hidden;
  const onVisibilityChange = () => {
    isTabVisible = !document.hidden;
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  let isIntersecting = true;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
      });
    },
    { threshold: 0.02, rootMargin: "120px 0px" }
  );
  observer.observe(container);

  const onWebglContextLost = (e: Event) => {
    e.preventDefault();
    contextLost = true;
    onContextLost?.();
  };

  const onWebglContextRestored = () => {
    contextLost = false;
    handleResize();
    onContextRestored?.();
  };

  renderer.domElement.addEventListener("webglcontextlost", onWebglContextLost);
  renderer.domElement.addEventListener(
    "webglcontextrestored",
    onWebglContextRestored
  );

  const fineHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  const pointer = {
    targetX: -9999,
    targetY: -9999,
    lerpedX: -9999,
    lerpedY: -9999,
    inside: false,
    stepLerp(lerpFactor: number = PARTICLE_ENGINE_DEFAULTS.MOUSE_LERP_FACTOR) {
      if (this.inside) {
        if (this.lerpedX <= -9000) {
          this.lerpedX = this.targetX;
          this.lerpedY = this.targetY;
        } else {
          this.lerpedX += (this.targetX - this.lerpedX) * lerpFactor;
          this.lerpedY += (this.targetY - this.lerpedY) * lerpFactor;
        }
      } else {
        this.lerpedX = -9999;
        this.lerpedY = -9999;
      }
    },
  };

  const updatePointerFromCoords = (clientX: number, clientY: number) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (
      rect.width > 0 &&
      rect.height > 0 &&
      x >= 0 &&
      x <= rect.width &&
      y >= 0 &&
      y <= rect.height
    ) {
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.inside = true;
    } else {
      pointer.inside = false;
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !fineHoverQuery.matches) {
      pointer.inside = false;
      return;
    }
    updatePointerFromCoords(e.clientX, e.clientY);
  };

  const onContainerPointerLeave = () => {
    pointer.inside = false;
  };

  const onDocumentMouseLeave = () => {
    pointer.inside = false;
  };

  if (options.enablePointer !== false) {
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  container.addEventListener("pointerleave", onContainerPointerLeave, {
    passive: true,
  });
  document.addEventListener("mouseleave", onDocumentMouseLeave);
  }

  return {
    scene,
    camera,
    renderer,
    getMetrics: () => metrics,
    setMaxDpr,
    isActive: () => isTabVisible && isIntersecting && !contextLost,
    isContextLost: () => contextLost,
    pointer,
    dispose: () => {
      if (settleTimer) clearTimeout(settleTimer);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onContainerPointerLeave);
      document.removeEventListener("mouseleave", onDocumentMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onWebglContextLost
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onWebglContextRestored
      );
      observer.disconnect();
      renderer.dispose();
      // Route transitions must release the GPU context, not just its resources.
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
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
