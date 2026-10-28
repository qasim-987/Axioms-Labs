import * as THREE from "three";

// ============================================================================
// SHARED PARTICLE ENGINE (Used by ParticleSphereHero & ServicesParticleCanvas)
// ============================================================================

export const PARTICLE_ENGINE_DEFAULTS = {
  DESKTOP_COUNT: 7200, // Shared count across Hero sphere & Services morph stage
  MOBILE_COUNT: 3600,
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

/**
 * Shared Fibonacci + volumetric sphere generator derived from `ParticleSphereHero`.
 * - `surfaceBias = 1.0`: crisp Fibonacci shell with subtle jitter (Hero sphere).
 * - `surfaceBias < 1.0`: blends shell particles with core-weighted volumetric dust
 *   so the sphere reads as a luminous 3D point cloud with soft fuzzy edges.
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

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    if (rand() <= surfaceBias) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const j = 1 + (rand() - 0.5) * jitter;

      out[i3] = x * j;
      out[i3 + 1] = y * j;
      out[i3 + 2] = z * j;
    } else {
      // Core-weighted volumetric stardust interior + faint outer halo
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
  visibleWidthAtZ0: number;
  visibleHeightAtZ0: number;
  pxToWorld: number;
}

export function computeStageProjectionMetrics(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  container: HTMLElement
): ProjectionMetrics {
  const rect = container.getBoundingClientRect();
  const width = rect.width || container.clientWidth || window.innerWidth;
  const height = rect.height || container.clientHeight || window.innerHeight;
  const dpr = Math.min(
    window.devicePixelRatio || 1,
    PARTICLE_ENGINE_DEFAULTS.DPR_CAP
  );

  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height);

  const visibleHeightAtZ0 =
    2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z;
  const visibleWidthAtZ0 = visibleHeightAtZ0 * camera.aspect;
  const pxToWorld = visibleWidthAtZ0 / Math.max(1, width);

  return {
    width,
    height,
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
 * Shared screen-space damped-spring repulsion solver reused from `ParticleSphereHero`:
 * - Projects each particle's live 3D rotated world coordinate to CSS screen pixels
 * - Repels particles within `influenceRadiusPx` (90-120px) away from the cursor with
 *   smooth exponential + linear falloff and subtle tangential swirl
 * - Inverse-rotates the screen-space force back into the cloud's local 3D frame so
 *   repulsion stays 100% accurate regardless of `rotationY` / `rotationX`
 * - Relaxes smoothly back to `(0, 0, 0)` via Hookean spring + velocity damping when
 *   the cursor moves away. Returns `true` while any particle still has residual motion.
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

        // Outward repulsion vector away from cursor + subtle organic tangent swirl
        const dirX = fromCursorX / (screenDist + 1e-4);
        const dirY = fromCursorY / (screenDist + 1e-4);
        const tanX = -dirY;
        const tanY = dirX;
        const swirl = 0.26 * Math.sin(seed * 24.0 + time * 2.1);

        const pushPxX = (dirX + tanX * swirl) * falloff * repelStrengthPx;
        const pushPxY = (dirY + tanY * swirl) * falloff * repelStrengthPx;

        const pushWorldX = (pushPxX * pxToWorld) / projScale;
        const pushWorldY = -(pushPxY * pxToWorld) / projScale;

        // Inverse rotate from world space back into cloud local space: R_y(-rotY) * R_x(-rotX)
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

    // Damped Hookean spring return back to rest shape
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
  isActive: () => boolean;
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
 * Shared Three.js WebGL stage lifecycle manager:
 * - Creates Scene, PerspectiveCamera, and alpha WebGLRenderer (DPR capped at 2)
 * - Handles window resize + ResizeObserver
 * - Tracks off-screen IntersectionObserver + document.visibilitychange pause state
 * - Tracks container-relative smoothed fine-pointer coordinates (accounting for
 *   bounding rect, DPR, and pinned/transformed ancestors; ignores touch pointers)
 * - Cleanly disposes all DOM listeners and WebGL context handles on unmount
 */
export function createSharedParticleStage(
  container: HTMLElement,
  options: {
    fov?: number;
    cameraZ?: number;
    onResize?: (metrics: ProjectionMetrics) => void;
  } = {}
): SharedParticleStage | null {
  const {
    fov = PARTICLE_ENGINE_DEFAULTS.CAMERA_FOV,
    cameraZ = PARTICLE_ENGINE_DEFAULTS.CAMERA_Z,
    onResize,
  } = options;

  // Verify WebGL support cleanly
  try {
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") ||
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    if (!gl) return null;
  } catch {
    return null;
  }

  const initRect = container.getBoundingClientRect();
  const width = initRect.width || container.clientWidth || window.innerWidth;
  const height = initRect.height || container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    fov,
    width / Math.max(1, height),
    0.1,
    2500
  );
  camera.position.set(0, 0, cameraZ);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  let metrics = computeStageProjectionMetrics(camera, renderer, container);

  const handleResize = () => {
    metrics = computeStageProjectionMetrics(camera, renderer, container);
    onResize?.(metrics);
  };
  onResize?.(metrics);

  window.addEventListener("resize", handleResize);
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
    { threshold: 0.03 }
  );
  observer.observe(container);

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
    if (e.pointerType === "touch" || !fineHoverQuery.matches) {
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

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  container.addEventListener("pointerleave", onContainerPointerLeave, {
    passive: true,
  });
  document.addEventListener("mouseleave", onDocumentMouseLeave);

  return {
    scene,
    camera,
    renderer,
    getMetrics: () => metrics,
    isActive: () => isTabVisible && isIntersecting,
    pointer,
    dispose: () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onContainerPointerLeave);
      document.removeEventListener("mouseleave", onDocumentMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
