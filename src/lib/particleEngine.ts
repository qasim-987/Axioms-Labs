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
  MOUSE_INFLUENCE_RADIUS_PX: 118,
  MOUSE_LERP_FACTOR: 0.12,
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
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
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
    dispose: () => {
      texture.dispose();
      material.dispose();
    },
  };
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
 * - Tracks container-relative smoothed mouse coordinates for particle repulsion
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

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

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

  const pointer = {
    targetX: -9999,
    targetY: -9999,
    lerpedX: -9999,
    lerpedY: -9999,
    inside: false,
    stepLerp(lerpFactor: number = PARTICLE_ENGINE_DEFAULTS.MOUSE_LERP_FACTOR) {
      if (this.inside) {
        if (this.lerpedX === -9999) {
          this.lerpedX = this.targetX;
          this.lerpedY = this.targetY;
        } else {
          this.lerpedX += (this.targetX - this.lerpedX) * lerpFactor;
          this.lerpedY += (this.targetY - this.lerpedY) * lerpFactor;
        }
      } else {
        this.lerpedX += (-9999 - this.lerpedX) * 0.06;
        this.lerpedY += (-9999 - this.lerpedY) * 0.06;
      }
    },
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.inside = true;
    } else {
      pointer.inside = false;
    }
  };

  const onMouseLeave = () => {
    pointer.inside = false;
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mouseleave", onMouseLeave);

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
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
