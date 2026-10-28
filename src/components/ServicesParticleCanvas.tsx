"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  PARTICLE_ENGINE_DEFAULTS,
  ProjectionMetrics,
  createSeededRandom,
  createSharedParticleStage,
  easeInOutQuint,
} from "@/lib/particleEngine";
import {
  SERVICE_STAGE_ORDER,
  ServiceShapeId,
  buildAllServiceShapes,
} from "@/lib/serviceParticleShapes";

// ============================================================================
// TUNABLE PARTICLE CONSTANTS
// ============================================================================
export const PARTICLE_TUNING = {
  DESKTOP_COUNT: PARTICLE_ENGINE_DEFAULTS.DESKTOP_COUNT, // 7,200 (matches ParticleSphereHero)
  MOBILE_COUNT: PARTICLE_ENGINE_DEFAULTS.MOBILE_COUNT, // 3,600 (matches ParticleSphereHero)
  PROGRESS_LERP: 0.08, // Per-frame scroll smoothing (`current += (target - current) * 0.08`)
  HOVER_MORPH_DURATION_S: 0.84, // Duration of hover/focus-triggered shape morph through dust sphere
  SWAY_AMPLITUDE_Y: 0.26, // ~15 deg gentle Y-axis depth sway for wireframe, </> & growth chart
  SWAY_SPEED: 0.52, // rad/s idle sway frequency
  HELIX_ROTATION_SPEED: 0.34, // rad/s continuous Y-axis spin for initial sphere & DNA helix
  MIDPOINT_NOISE_AMOUNT: 0.44, // Outward curl turbulence peaking at `uMorph = 0.5`
  INTRO_BURST_AMOUNT: 0.46, // Subtle outward stardust expansion as initial sphere forms Step 1
  IDLE_WOBBLE_AMOUNT: 0.018, // Continuous per-particle organic breathing wobble
  HOVER_ENERGY_SWELL: 0.045, // +4.5% gentle scale swell while a card is hovered/focused
  HOVER_ENERGY_BRIGHTNESS: 0.14, // +14% subtle brightness lift while hovered/focused
  HOVER_ENERGY_SPIN_BOOST: 0.48, // +48% faster idle sway/spin while hovered/focused
  STAGE_CENTER_X_DESKTOP: 0.23, // Left-half particle center (~23% of viewport width)
  STAGE_CENTER_Y_DESKTOP: 0.51, // Vertically centered in pinned viewport
  SHAPE_RADIUS_CLAMP_MIN: 150, // ~300px diameter min on desktop
  SHAPE_RADIUS_CLAMP_MAX: 190, // ~380px diameter max at 1900px wide
} as const;

export const ORDERED_SERVICE_SHAPES: ServiceShapeId[] = SERVICE_STAGE_ORDER.map(
  (s) => s.shape
);

/**
 * Shared scroll-progress -> master state function used by BOTH the particle stage
 * and the cards row so scroll-driven particles and cards can NEVER disagree.
 */
export interface MasterTimelineState {
  scrollIndex: number; // 0..3 scroll-resolved active service index
  fromCardIndex: number; // 0..3 outgoing card during scroll transition
  toCardIndex: number; // 0..3 incoming card during scroll transition
  cardTransitionT: number; // 0..1 progress between fromCardIndex -> toCardIndex
  fromShape: ServiceShapeId;
  toShape: ServiceShapeId;
  shapeMorphT: number; // 0..1 morph progress between fromShape and toShape
  introBurst: number; // 0..1 stardust dispersion during initial sphere -> Step 1 morph
}

// Snap / Hold scroll anchors (0 = initial sphere + Card 0, then centered holds for Steps 0..3)
export const STEP_SNAP_POINTS = [0, 0.16, 0.43, 0.7, 0.95] as const;
export const STEP_HOLD_PROGRESS = [0.16, 0.43, 0.7, 0.95] as const;

export function evaluateServicesMasterTimeline(
  rawP: number
): MasterTimelineState {
  const p = Math.max(0, Math.min(1, rawP));

  // Initial entry [0.00 .. 0.11]: Default rotating Particle Sphere (`blob`) morphs into
  // Service 0's shape (`wireframe`) while Service 0 card is expanded.
  // At p = 0 (upon pinning), the left stage shows the exact rotating sphere!
  const INTRO_HOLD_SPHERE = 0.025;
  const INTRO_END = 0.115;

  if (p <= INTRO_HOLD_SPHERE) {
    return {
      scrollIndex: 0,
      fromCardIndex: 0,
      toCardIndex: 0,
      cardTransitionT: 0,
      fromShape: "blob",
      toShape: ORDERED_SERVICE_SHAPES[0],
      shapeMorphT: 0,
      introBurst: 0,
    };
  }

  if (p <= INTRO_END) {
    const introT = (p - INTRO_HOLD_SPHERE) / (INTRO_END - INTRO_HOLD_SPHERE);
    const burst = Math.sin(Math.PI * introT);
    return {
      scrollIndex: 0,
      fromCardIndex: 0,
      toCardIndex: 0,
      cardTransitionT: 0,
      fromShape: "blob",
      toShape: ORDERED_SERVICE_SHAPES[0],
      shapeMorphT: introT,
      introBurst: burst,
    };
  }

  // Remaining scroll [0.115 .. 1.00] maps across 4 holds (~70% of each step) and 3 transitions (~28%):
  const u = (p - INTRO_END) / (1 - INTRO_END);

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
          introBurst: 0,
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
        introBurst: 0,
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
    introBurst: 0,
  };
}

interface ServicesParticleCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  hoverIndexRef?: React.MutableRefObject<number | null>;
  layoutMode: "desktop" | "mobile";
  staticShape?: ServiceShapeId; // Used for `prefers-reduced-motion: reduce`
  className?: string;
}

export default function ServicesParticleCanvas({
  scrollProgressRef,
  hoverIndexRef,
  layoutMode,
  staticShape,
  className = "",
}: ServicesParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count =
      layoutMode === "desktop"
        ? PARTICLE_TUNING.DESKTOP_COUNT
        : PARTICLE_TUNING.MOBILE_COUNT;

    const shapes = buildAllServiceShapes(count);
    const cloudGroup = new THREE.Group();

    let shapeScaleWorld = 170;
    let baseCenterWorldX = 0;
    let baseCenterWorldY = 0;

    const applyStageMetrics = (metrics: ProjectionMetrics) => {
      const { width, height, pxToWorld } = metrics;
      if (layoutMode === "desktop") {
        const targetScreenX = width * PARTICLE_TUNING.STAGE_CENTER_X_DESKTOP;
        const targetScreenY = height * PARTICLE_TUNING.STAGE_CENTER_Y_DESKTOP;
        const radiusPx = Math.max(
          PARTICLE_TUNING.SHAPE_RADIUS_CLAMP_MIN,
          Math.min(
            width * 0.098,
            PARTICLE_TUNING.SHAPE_RADIUS_CLAMP_MAX,
            height * 0.255
          )
        );
        shapeScaleWorld = radiusPx * pxToWorld;
        baseCenterWorldX = (targetScreenX - width * 0.5) * pxToWorld;
        baseCenterWorldY = -(targetScreenY - height * 0.5) * pxToWorld;
      } else {
        const radiusPx = Math.max(
          100,
          Math.min(width * 0.29, height * 0.35, 155)
        );
        shapeScaleWorld = radiusPx * pxToWorld;
        baseCenterWorldX = 0;
        baseCenterWorldY = 0;
      }
      cloudGroup.position.set(baseCenterWorldX, baseCenterWorldY, 0);
    };

    const stage = createSharedParticleStage(container, {
      fov: PARTICLE_ENGINE_DEFAULTS.CAMERA_FOV,
      cameraZ: PARTICLE_ENGINE_DEFAULTS.CAMERA_Z,
      onResize: applyStageMetrics,
    });

    // ------------------------------------------------------------------------
    // 2D CANVAS FALLBACK (Only if WebGL is unavailable)
    // ------------------------------------------------------------------------
    if (!stage) {
      const canvas2d = document.createElement("canvas");
      canvas2d.style.width = "100%";
      canvas2d.style.height = "100%";
      container.appendChild(canvas2d);
      const ctx = canvas2d.getContext("2d");

      let raf2d = 0;
      let smoothP = scrollProgressRef.current;

      const drawFallback = () => {
        if (!ctx) return;
        const w = container.clientWidth || 360;
        const h = container.clientHeight || 320;
        if (canvas2d.width !== w || canvas2d.height !== h) {
          canvas2d.width = w;
          canvas2d.height = h;
        }
        ctx.clearRect(0, 0, w, h);

        smoothP +=
          (scrollProgressRef.current - smoothP) * PARTICLE_TUNING.PROGRESS_LERP;
        const hIdx = hoverIndexRef?.current ?? null;
        const state = staticShape
          ? { fromShape: staticShape, toShape: staticShape, shapeMorphT: 0 }
          : hIdx !== null
          ? {
              fromShape: ORDERED_SERVICE_SHAPES[hIdx],
              toShape: ORDERED_SERVICE_SHAPES[hIdx],
              shapeMorphT: 0,
            }
          : evaluateServicesMasterTimeline(smoothP);

        const src = shapes[state.fromShape];
        const dst = shapes[state.toShape];
        const cx =
          layoutMode === "desktop"
            ? w * PARTICLE_TUNING.STAGE_CENTER_X_DESKTOP
            : w * 0.5;
        const cy = h * 0.5;
        const scale = Math.min(w, h) * 0.3;

        ctx.fillStyle = "rgba(226, 232, 255, 0.72)";
        const stride = 9;
        for (let i = 0; i < src.length; i += stride) {
          const x = src[i] + (dst[i] - src[i]) * state.shapeMorphT;
          const y = src[i + 1] + (dst[i + 1] - src[i + 1]) * state.shapeMorphT;
          ctx.fillRect(cx + x * scale, cy - y * scale, 1.5, 1.5);
        }

        if (!staticShape) {
          raf2d = requestAnimationFrame(drawFallback);
        }
      };

      drawFallback();
      return () => {
        cancelAnimationFrame(raf2d);
        canvas2d.remove();
      };
    }

    stage.scene.add(cloudGroup);

    // ------------------------------------------------------------------------
    // GPU THREE.JS POINTS + CUSTOM GLSL SHADER MORPH
    // ------------------------------------------------------------------------
    const geometry = new THREE.BufferGeometry();

    const startArray = new Float32Array(
      staticShape ? shapes[staticShape] : shapes.blob
    );
    const targetArray = new Float32Array(
      staticShape ? shapes[staticShape] : ORDERED_SERVICE_SHAPES[0] ? shapes[ORDERED_SERVICE_SHAPES[0]] : shapes.wireframe
    );
    const blobArray = new Float32Array(shapes.blob);

    const rng = createSeededRandom(7719);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r1 = rng();
      const r2 = rng();
      const r3 = rng();

      seeds[i] = r1;
      // Tiny soft dots (~1.0-2.5px) with varied stardust sizes
      sizes[i] = r2 > 0.86 ? 2.0 + r3 * 0.65 : 0.95 + r2 * 1.1;
      // Varied luminosity so cloud reads as volumetric stardust, never a uniform grid
      alphas[i] = 0.24 + Math.pow(r3, 1.3) * 0.76;
    }

    const startAttr = new THREE.BufferAttribute(startArray, 3);
    const targetAttr = new THREE.BufferAttribute(targetArray, 3);
    geometry.setAttribute("position", startAttr);
    geometry.setAttribute("aTarget", targetAttr);
    geometry.setAttribute("aBlob", new THREE.BufferAttribute(blobArray, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      PARTICLE_ENGINE_DEFAULTS.DPR_CAP
    );

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uBurst: { value: 0 },
      uMidpointDust: { value: 0 },
      uPixelRatio: { value: dpr },
      uShapeScale: { value: shapeScaleWorld },
      uIdleWobble: {
        value: staticShape ? 0.0 : PARTICLE_TUNING.IDLE_WOBBLE_AMOUNT,
      },
      uNoiseAmount: { value: PARTICLE_TUNING.MIDPOINT_NOISE_AMOUNT },
      uHoverEnergy: { value: 0 },
      uCursorLocal: { value: new THREE.Vector3(99, 99, 0) },
      uCursorStrength: { value: 0 },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        attribute vec3 aTarget;
        attribute vec3 aBlob;
        attribute float aSeed;
        attribute float aSize;
        attribute float aAlpha;

        uniform float uTime;
        uniform float uMorph;
        uniform float uBurst;
        uniform float uMidpointDust;
        uniform float uPixelRatio;
        uniform float uShapeScale;
        uniform float uIdleWobble;
        uniform float uNoiseAmount;
        uniform float uHoverEnergy;
        uniform vec3 uCursorLocal;
        uniform float uCursorStrength;

        varying float vAlpha;
        varying float vDepthTint;

        // 3D divergence-free-inspired trigonometric curl turbulence on GPU
        vec3 curlNoise3D(vec3 p, float t, float seed) {
          float ph = seed * 6.2831853;
          float nx = sin(p.y * 3.1 + t * 0.85 + ph) - cos(p.z * 2.7 - t * 0.65);
          float ny = sin(p.z * 3.3 + t * 0.78 + ph * 1.3) - cos(p.x * 2.9 + t * 0.62);
          float nz = sin(p.x * 2.8 - t * 0.82 + ph * 0.7) - cos(p.y * 3.2 + t * 0.71);
          return vec3(nx, ny, nz) * 0.5;
        }

        void main() {
          // Per-particle timing offset so shapes assemble in an organic ripple
          float staggered = clamp((uMorph * 1.30) - aSeed * 0.30, 0.0, 1.0);
          // Smooth quintic ease-in-out
          float eased = staggered * staggered * staggered * (staggered * (staggered * 6.0 - 15.0) + 10.0);

          vec3 basePos = mix(position, aTarget, eased);

          // Signature dust-sphere midpoint: peaks at uMorph = 0.5 (sin(PI * staggered))
          float midBell = sin(3.14159265 * staggered) * uMidpointDust;
          basePos = mix(basePos, aBlob * 1.06, midBell * 0.68);
          vec3 midNoise = curlNoise3D(basePos * 1.45, uTime, aSeed) * midBell * uNoiseAmount * (0.45 + aSeed * 0.75);
          basePos += midNoise;

          // Initial sphere outward dispersion when entering Step 1
          if (uBurst > 0.001) {
            vec3 radialDir = normalize(position + vec3(0.0001));
            vec3 burstScatter = radialDir * (0.3 + aSeed * 0.85) * uBurst * ${PARTICLE_TUNING.INTRO_BURST_AMOUNT.toFixed(2)};
            burstScatter += curlNoise3D(position * 1.7, uTime * 0.9, aSeed) * uBurst * 0.22;
            basePos += burstScatter;
          }

          // Left-stage cursor repulsion/swirl (consistent with ParticleSphereHero)
          if (uCursorStrength > 0.001) {
            vec3 toParticle = basePos - uCursorLocal;
            float dist2D = length(toParticle.xy);
            float influence = smoothstep(0.62, 0.0, dist2D) * uCursorStrength;
            vec2 repelDir = normalize(toParticle.xy + vec2(0.0001));
            vec2 swirlDir = vec2(-repelDir.y, repelDir.x);
            basePos.xy += (repelDir * 0.16 + swirlDir * 0.09 * sin(uTime * 2.0 + aSeed * 6.28)) * influence;
          }

          // Continuous idle breathing + hover energy gentle swell
          vec3 wobble = curlNoise3D(basePos * 2.2, uTime * 0.75, aSeed) * uIdleWobble;
          float breathe = 1.0 + sin(uTime * 1.1) * (uIdleWobble * 0.8) + uHoverEnergy * ${PARTICLE_TUNING.HOVER_ENERGY_SWELL.toFixed(3)};
          vec3 scaledPos = (basePos * breathe + wobble) * uShapeScale;

          vec4 mvPosition = modelViewMatrix * vec4(scaledPos, 1.0);
          float dist = max(120.0, -mvPosition.z);

          // Volumetric 3D depth cues: nearer particles brighter & larger, farther ones dimmer & smaller
          float relDepth = clamp((mvPosition.z + 800.0) / (uShapeScale * 2.2) + 0.5, 0.0, 1.0);
          float depthAlpha = mix(0.38, 1.16, relDepth);
          float depthSize = mix(0.74, 1.26, relDepth);

          // Dim slightly during wide dust-cloud dispersion; boost subtly on card hover
          float scatterDim = 1.0 - 0.20 * max(uBurst, midBell);
          float hoverBoost = 1.0 + uHoverEnergy * ${PARTICLE_TUNING.HOVER_ENERGY_BRIGHTNESS.toFixed(2)};

          vAlpha = clamp(aAlpha * depthAlpha * scatterDim * hoverBoost, 0.05, 1.0);
          vDepthTint = relDepth;

          gl_PointSize = aSize * depthSize * uPixelRatio * (680.0 / dist);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vDepthTint;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if (d > 0.5) discard;

          // Soft round stardust dot via smoothstep
          float core = smoothstep(0.5, 0.07, d);
          float alpha = core * core * vAlpha;

          // Off-white / silver with faint cool-blue cast
          vec3 farTint = vec3(0.77, 0.82, 0.98);
          vec3 nearTint = vec3(0.96, 0.98, 1.0);
          vec3 col = mix(farTint, nearTint, vDepthTint);

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, shaderMaterial);
    cloudGroup.add(points);

    /**
     * Snapshots the exact current interpolated 3D position of every particle
     * into `startArray` whenever a hover/focus override interrupts a morph,
     * ensuring transitions ALWAYS morph smoothly from the *current* cloud state
     * toward the newest target without snapping or queueing.
     */
    const snapshotCurrentCloudIntoStart = (
      currentMorph: number,
      midpointDustWeight: number
    ) => {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const seed = seeds[i];
        const stag = Math.max(0, Math.min(1, currentMorph * 1.3 - seed * 0.3));
        const eased = easeInOutQuint(stag);

        let x = startArray[i3] + (targetArray[i3] - startArray[i3]) * eased;
        let y =
          startArray[i3 + 1] +
          (targetArray[i3 + 1] - startArray[i3 + 1]) * eased;
        let z =
          startArray[i3 + 2] +
          (targetArray[i3 + 2] - startArray[i3 + 2]) * eased;

        if (midpointDustWeight > 0.001) {
          const midBell =
            Math.sin(Math.PI * stag) * midpointDustWeight * 0.68;
          x += (blobArray[i3] * 1.06 - x) * midBell;
          y += (blobArray[i3 + 1] * 1.06 - y) * midBell;
          z += (blobArray[i3 + 2] * 1.06 - z) * midBell;
        }

        startArray[i3] = x;
        startArray[i3 + 1] = y;
        startArray[i3 + 2] = z;
      }
      startAttr.needsUpdate = true;
    };

    let scrollFromShape: ServiceShapeId = "blob";
    let scrollToShape: ServiceShapeId = ORDERED_SERVICE_SHAPES[0];

    // Override morph state (used when `hoverIndex !== null` and during smooth return to scroll)
    let isOverrideMode = false;
    let overrideTargetShape: ServiceShapeId | null = null;
    let overrideMorphT = 1;
    let hoverEnergy = 0;

    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;
    let smoothProgress = scrollProgressRef.current;
    let lastRawProgress = scrollProgressRef.current;
    let spinAngleY = 0;

    const renderLoop = (now: number) => {
      if (staticShape) {
        uniforms.uShapeScale.value = shapeScaleWorld;
        stage.renderer.render(stage.scene, stage.camera);
        return;
      }

      rafId = requestAnimationFrame(renderLoop);

      if (!stage.isActive()) {
        lastNow = now;
        return;
      }

      const dt = Math.min((now - lastNow) / 1000, 0.06);
      lastNow = now;
      elapsed += dt;

      const rawP = scrollProgressRef.current;
      const rawScrollMoved = Math.abs(rawP - lastRawProgress) > 0.004;
      lastRawProgress = rawP;

      smoothProgress +=
        (rawP - smoothProgress) * PARTICLE_TUNING.PROGRESS_LERP;

      const scrollState = evaluateServicesMasterTimeline(smoothProgress);
      const currentHoverIdx = hoverIndexRef?.current ?? null;

      // Smoothly ease hover energy boost
      const targetEnergy = currentHoverIdx !== null ? 1 : 0;
      hoverEnergy += (targetEnergy - hoverEnergy) * 0.09;
      uniforms.uHoverEnergy.value = hoverEnergy;

      // Determine active shape / morph driver
      let activeFromShapeForSpin: ServiceShapeId = scrollState.fromShape;
      let activeToShapeForSpin: ServiceShapeId = scrollState.toShape;
      let activeSpinBlend = scrollState.shapeMorphT;

      if (currentHoverIdx !== null) {
        const desiredShape =
          ORDERED_SERVICE_SHAPES[currentHoverIdx] ?? ORDERED_SERVICE_SHAPES[0];

        if (!isOverrideMode) {
          // Entering hover override from scroll mode
          isOverrideMode = true;
          const settledScrollShape =
            scrollState.shapeMorphT < 0.04
              ? scrollState.fromShape
              : scrollState.shapeMorphT > 0.96
              ? scrollState.toShape
              : null;

          if (settledScrollShape === desiredShape) {
            // Hovered card already matches fully settled particle shape -> boost energy without re-exploding
            startArray.set(shapes[desiredShape]);
            targetArray.set(shapes[desiredShape]);
            startAttr.needsUpdate = true;
            targetAttr.needsUpdate = true;
            overrideTargetShape = desiredShape;
            overrideMorphT = 1;
          } else {
            snapshotCurrentCloudIntoStart(
              uniforms.uMorph.value,
              uniforms.uMidpointDust.value
            );
            targetArray.set(shapes[desiredShape]);
            targetAttr.needsUpdate = true;
            overrideTargetShape = desiredShape;
            overrideMorphT = 0;
          }
        } else if (overrideTargetShape !== desiredShape) {
          // Switching hovered card mid-morph -> morph directly from live cloud toward newest target
          snapshotCurrentCloudIntoStart(
            overrideMorphT,
            uniforms.uMidpointDust.value
          );
          targetArray.set(shapes[desiredShape]);
          targetAttr.needsUpdate = true;
          overrideTargetShape = desiredShape;
          overrideMorphT = 0;
        }

        if (overrideMorphT < 1) {
          overrideMorphT = Math.min(
            1,
            overrideMorphT + dt / PARTICLE_TUNING.HOVER_MORPH_DURATION_S
          );
        }

        uniforms.uMorph.value = overrideMorphT;
        uniforms.uBurst.value = 0;
        uniforms.uMidpointDust.value = overrideMorphT < 1 ? 1.0 : 0.0;

        activeFromShapeForSpin = desiredShape;
        activeToShapeForSpin = desiredShape;
        activeSpinBlend = 1;
      } else if (isOverrideMode) {
        // Hover just ended -> morph smoothly back to scroll-implied shape (or yield immediately if user actively scrolls)
        const scrollImpliedShape =
          scrollState.shapeMorphT >= 0.5
            ? scrollState.toShape
            : scrollState.fromShape;

        if (rawScrollMoved && overrideMorphT > 0.65) {
          isOverrideMode = false;
          overrideTargetShape = null;
          scrollFromShape = "" as ServiceShapeId; // force buffer sync below
        } else {
          if (overrideTargetShape !== scrollImpliedShape) {
            snapshotCurrentCloudIntoStart(
              overrideMorphT,
              uniforms.uMidpointDust.value
            );
            targetArray.set(shapes[scrollImpliedShape]);
            targetAttr.needsUpdate = true;
            overrideTargetShape = scrollImpliedShape;
            overrideMorphT = 0;
          }

          overrideMorphT = Math.min(
            1,
            overrideMorphT + dt / PARTICLE_TUNING.HOVER_MORPH_DURATION_S
          );
          uniforms.uMorph.value = overrideMorphT;
          uniforms.uBurst.value = 0;
          uniforms.uMidpointDust.value = 1.0;

          activeFromShapeForSpin = scrollImpliedShape;
          activeToShapeForSpin = scrollImpliedShape;
          activeSpinBlend = 1;

          if (overrideMorphT >= 1) {
            isOverrideMode = false;
            overrideTargetShape = null;
            scrollFromShape = "" as ServiceShapeId; // force clean buffer resync on next frame
          }
        }
      }

      if (!isOverrideMode && currentHoverIdx === null) {
        if (scrollState.fromShape !== scrollFromShape) {
          startArray.set(shapes[scrollState.fromShape]);
          startAttr.needsUpdate = true;
          scrollFromShape = scrollState.fromShape;
        }
        if (scrollState.toShape !== scrollToShape) {
          targetArray.set(shapes[scrollState.toShape]);
          targetAttr.needsUpdate = true;
          scrollToShape = scrollState.toShape;
        }

        uniforms.uMorph.value = scrollState.shapeMorphT;
        uniforms.uBurst.value = scrollState.introBurst;
        uniforms.uMidpointDust.value =
          scrollState.fromShape === "blob" ? 0.0 : 1.0;
      }

      // Left-stage cursor repulsion/swirl (only when pointer is over the left particle stage)
      stage.pointer.stepLerp();
      const { width, height, pxToWorld } = stage.getMetrics();
      const inLeftHalf =
        stage.pointer.inside &&
        (layoutMode !== "desktop" || stage.pointer.lerpedX < width * 0.45);

      const targetCursorStrength = inLeftHalf ? 1 : 0;
      uniforms.uCursorStrength.value +=
        (targetCursorStrength - uniforms.uCursorStrength.value) * 0.12;

      if (uniforms.uCursorStrength.value > 0.005) {
        const cursorWorldX = (stage.pointer.lerpedX - width * 0.5) * pxToWorld;
        const cursorWorldY =
          -(stage.pointer.lerpedY - height * 0.5) * pxToWorld;
        const localX =
          (cursorWorldX - cloudGroup.position.x) / Math.max(1, shapeScaleWorld);
        const localY =
          (cursorWorldY - cloudGroup.position.y) / Math.max(1, shapeScaleWorld);
        uniforms.uCursorLocal.value.set(localX, localY, 0);
      }

      // Idle motion + hover spin boost:
      // Continuous spin for Initial Sphere (`blob`) & DNA Helix; +/-15 deg sway for Wireframe, </> & Growth Chart
      const speedMul =
        1 + hoverEnergy * PARTICLE_TUNING.HOVER_ENERGY_SPIN_BOOST;
      spinAngleY += dt * PARTICLE_TUNING.HELIX_ROTATION_SPEED * speedMul;

      const swayY =
        Math.sin(elapsed * PARTICLE_TUNING.SWAY_SPEED * speedMul) *
        PARTICLE_TUNING.SWAY_AMPLITUDE_Y;

      const fromSpins =
        activeFromShapeForSpin === "blob" ||
        activeFromShapeForSpin === "dnaHelix"
          ? 1
          : 0;
      const toSpins =
        activeToShapeForSpin === "blob" || activeToShapeForSpin === "dnaHelix"
          ? 1
          : 0;
      const spinWeight =
        fromSpins + (toSpins - fromSpins) * activeSpinBlend;

      const wrappedSpin =
        (((spinAngleY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) -
        Math.PI;
      points.rotation.y = swayY * (1 - spinWeight) + wrappedSpin * spinWeight;
      points.rotation.x =
        PARTICLE_ENGINE_DEFAULTS.ROTATION_TILT_X * 0.4 +
        Math.sin(elapsed * 0.42) * 0.06;

      uniforms.uTime.value = elapsed;
      uniforms.uShapeScale.value = shapeScaleWorld;

      cloudGroup.position.set(
        baseCenterWorldX,
        baseCenterWorldY + Math.sin(elapsed * 0.85) * (4.5 * pxToWorld),
        0
      );

      stage.renderer.render(stage.scene, stage.camera);
    };

    if (staticShape) {
      points.rotation.y = staticShape === "dnaHelix" ? 0.35 : 0.16;
      points.rotation.x = 0.08;
      uniforms.uShapeScale.value = shapeScaleWorld;
      stage.renderer.render(stage.scene, stage.camera);
    } else {
      rafId = requestAnimationFrame(renderLoop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      geometry.dispose();
      shaderMaterial.dispose();
      stage.dispose();
    };
  }, [hoverIndexRef, layoutMode, scrollProgressRef, staticShape]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    />
  );
}
