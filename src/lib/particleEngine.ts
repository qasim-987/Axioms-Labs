import * as THREE from "three";
import {
  easeInOutQuint,
  easeInOutCubic,
  isWebGLAvailable,
  createSeededRandom,
  generateFibonacciSphereBuffer,
  stepScreenSpaceRepulsionSpring,
  renderStaticParticleCloud2D,
  type ScreenSpaceRepulsionParams,
} from "./particleMath";
export {
  easeInOutQuint,
  easeInOutCubic,
  isWebGLAvailable,
  createSeededRandom,
  generateFibonacciSphereBuffer,
  stepScreenSpaceRepulsionSpring,
  renderStaticParticleCloud2D,
};
export type {
  ScreenSpaceRepulsionParams,
};

// ============================================================================
// SHARED PARTICLE ENGINE (Used by ParticleSphereHero & ServicesParticleCanvas)
// ============================================================================

export { PARTICLE_ENGINE_DEFAULTS } from "./particleDefaults";
import { PARTICLE_ENGINE_DEFAULTS } from "./particleDefaults";

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

