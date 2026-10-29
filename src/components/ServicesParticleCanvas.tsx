"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  PARTICLE_ENGINE_DEFAULTS,
  ProjectionMetrics,
  createRadialGlowSprite,
  createSeededRandom,
  createSharedParticleStage,
  easeInOutCubic,
  easeInOutQuint,
  renderStaticParticleCloud2D,
  stepScreenSpaceRepulsionSpring,
} from "@/lib/particleEngine";
import {
  createAdaptiveFpsMonitor,
  getPerformanceTier,
  type PerformanceTierConfig,
} from "@/lib/performanceTier";
import {
  SERVICE_STAGE_ORDER,
  ServiceShapeId,
  buildAllServiceShapes,
} from "@/lib/serviceParticleShapes";

// ============================================================================
// TUNABLE PARTICLE & HOVER CONSTANTS (Light Theme + Antigravity Palette)
// ============================================================================
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

// Exact Black & White + Antigravity Spectrum matching `ParticleSphereHero.tsx`
const ANTIGRAVITY_BW_PALETTE = [
  new THREE.Color("#121317"), // Obsidian Black (primary contrast anchor on #FFFFFF)
  new THREE.Color("#3186FF"), // Antigravity Electric Blue
  new THREE.Color("#202124"), // Crisp Charcoal Ink
  new THREE.Color("#1E3A8A"), // Deep Antigravity Navy
  new THREE.Color("#3186FF"), // Antigravity Electric Blue
  new THREE.Color("#749BFF"), // Soft Periwinkle
  new THREE.Color("#FC413D"), // Antigravity Coral Speck
  new THREE.Color("#FBBC04"), // Antigravity Signal Amber Speck
  new THREE.Color("#00B95C"), // Antigravity Vivid Green Speck
];

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

interface ServicesParticleCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  hoverBridgeRef?: React.MutableRefObject<ServicesHoverBridge>;
  layoutMode: "desktop" | "mobile";
  staticShape?: ServiceShapeId;
  onResizeSettled?: () => void;
  onWebGLUnavailable?: () => void;
  className?: string;
}

export default function ServicesParticleCanvas({
  scrollProgressRef,
  hoverBridgeRef,
  layoutMode,
  staticShape,
  onResizeSettled,
  onWebGLUnavailable,
  className = "",
}: ServicesParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ------------------------------------------------------------------------
    // LIGHTWEIGHT ZERO-WEBGL STATIC SHAPE MODE (`staticShape` prop):
    // Used by the non-pinned fallback (`prefers-reduced-motion` / no-WebGL) so
    // rendering 4 stacked service cards uses 0 WebGL contexts and 0 rAF loops!
    // ------------------------------------------------------------------------
    if (staticShape) {
      const staticShapes = buildAllServiceShapes(900);
      const pts = staticShapes[staticShape] ?? staticShapes.wireframe;
      const canvas2d = document.createElement("canvas");
      canvas2d.style.width = "100%";
      canvas2d.style.height = "100%";
      canvas2d.style.display = "block";
      container.appendChild(canvas2d);

      const draw = () => {
        renderStaticParticleCloud2D(canvas2d, pts, {
          maxPoints: 900,
          yawRad: staticShape === "dnaHelix" ? 0.35 : 0.16,
          pitchRad: -0.08,
          fitPadding: 0.37,
        });
      };
      draw();
      const ro = new ResizeObserver(draw);
      ro.observe(container);

      return () => {
        ro.disconnect();
        if (canvas2d.parentNode === container) {
          container.removeChild(canvas2d);
        }
      };
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const fineHoverQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    const detectedTier = getPerformanceTier();
    // Preserve exact 7,200 count on desktop `high` tier; scale down cleanly on mobile/tablet
    const maxCount = detectedTier.particleCount;
    let activeCount = maxCount;

    const shapes = buildAllServiceShapes(maxCount);
    const cloudGroup = new THREE.Group();

    const accentGlow = createRadialGlowSprite(
      [
        { offset: 0, color: "rgba(49, 134, 255, 0.34)" },
        { offset: 0.38, color: "rgba(116, 155, 255, 0.18)" },
        { offset: 0.72, color: "rgba(49, 134, 255, 0.05)" },
        { offset: 1, color: "rgba(255, 255, 255, 0.0)" },
      ],
      THREE.NormalBlending
    );
    accentGlow.sprite.position.set(0, 0, -28);
    accentGlow.material.opacity = 0.16;
    cloudGroup.add(accentGlow.sprite);

    let shapeScaleWorld = 164;
    let baseCenterWorldX = 0;
    let baseCenterWorldY = 0;

    const applyStageMetrics = (metrics: ProjectionMetrics) => {
      const { width, height, pxToWorld } = metrics;
      if (layoutMode === "desktop") {
        // Fit the requested larger shape into the existing desktop canvas.
        const targetScreenX = width * 0.5;
        const targetScreenY = height * 0.5;
        const radiusPx = Math.max(
          PARTICLE_TUNING.SHAPE_RADIUS_CLAMP_MIN,
          Math.min(
            width * 0.37,
            height * 0.37,
            PARTICLE_TUNING.SHAPE_RADIUS_CLAMP_MAX
          )
        );
        shapeScaleWorld = radiusPx * pxToWorld;
        baseCenterWorldX = (targetScreenX - width * 0.5) * pxToWorld;
        baseCenterWorldY = -(targetScreenY - height * 0.5) * pxToWorld;
      } else {
        // Mobile & Tablet (Portrait + Landscape): fit cleanly to smaller dimension
        // with comfortable margin so shapes never clip top/bottom or left/right!
        const radiusPx = Math.max(
          52,
          Math.min(width * 0.37, height * 0.39, 220)
        );
        shapeScaleWorld = radiusPx * pxToWorld;
        baseCenterWorldX = 0;
        baseCenterWorldY = 0;
      }
      cloudGroup.position.set(baseCenterWorldX, baseCenterWorldY, 0);
      const baseGlowScale = shapeScaleWorld * 2.85;
      accentGlow.sprite.scale.set(baseGlowScale, baseGlowScale, 1);
    };

    const stage = createSharedParticleStage(container, {
      fov: PARTICLE_ENGINE_DEFAULTS.CAMERA_FOV,
      cameraZ: PARTICLE_ENGINE_DEFAULTS.CAMERA_Z,
      maxDpr:
        layoutMode === "desktop" && detectedTier.tier === "high"
          ? PARTICLE_ENGINE_DEFAULTS.DPR_CAP
          : detectedTier.dprCap,
      antialias: layoutMode === "desktop" ? true : detectedTier.antialias,
      onContextLost: onWebGLUnavailable,
      onResize: applyStageMetrics,
      onResizeSettled: () => {
        onResizeSettled?.();
      },
    });

    // Graceful 2D Canvas Fallback if WebGL is unavailable
    if (!stage) {
      accentGlow.dispose();
      onWebGLUnavailable?.();
      const canvas2d = document.createElement("canvas");
      canvas2d.style.width = "100%";
      canvas2d.style.height = "100%";
      canvas2d.style.display = "block";
      container.appendChild(canvas2d);
      const ctx = canvas2d.getContext("2d");

      let raf2d = 0;
      let smoothP = scrollProgressRef.current;
      let isVisible2d = true;

      const io2d = new IntersectionObserver(
        ([entry]) => {
          isVisible2d = entry.isIntersecting;
        },
        { threshold: 0.02 }
      );
      io2d.observe(container);

      const drawFallback = () => {
        raf2d = requestAnimationFrame(drawFallback);
        if (!ctx || !isVisible2d || document.hidden) return;
        const w = container.clientWidth || 360;
        const h = container.clientHeight || 260;
        if (canvas2d.width !== w || canvas2d.height !== h) {
          canvas2d.width = w;
          canvas2d.height = h;
        }
        ctx.clearRect(0, 0, w, h);

        smoothP +=
          (scrollProgressRef.current - smoothP) * PARTICLE_TUNING.PROGRESS_LERP;
        const previewIdx = hoverBridgeRef?.current.previewIndex ?? null;
        const state =
          previewIdx !== null
            ? {
                fromShape: ORDERED_SERVICE_SHAPES[previewIdx],
                toShape: ORDERED_SERVICE_SHAPES[previewIdx],
                shapeMorphT: 0,
              }
            : evaluateServicesMasterTimeline(smoothP);

        const src = shapes[state.fromShape];
        const dst = shapes[state.toShape];
        const cx = w * 0.5;
        const cy = h * 0.5;
        const scale = Math.min(w, h) * 0.31;

        const stride = 9;
        for (let i = 0; i < src.length; i += stride) {
          const x = src[i] + (dst[i] - src[i]) * state.shapeMorphT;
          const y = src[i + 1] + (dst[i + 1] - src[i + 1]) * state.shapeMorphT;
          ctx.fillStyle =
            i % 18 === 0
              ? "rgba(49, 134, 255, 0.78)"
              : "rgba(18, 19, 23, 0.72)";
          ctx.fillRect(cx + x * scale, cy - y * scale, 1.8, 1.8);
        }
      };

      drawFallback();
      return () => {
        io2d.disconnect();
        cancelAnimationFrame(raf2d);
        canvas2d.remove();
      };
    }

    stage.scene.add(cloudGroup);

    // ------------------------------------------------------------------------
    // GPU THREE.JS POINTS + CUSTOM GLSL SHADER MORPH + SPRING REPULSION
    // ------------------------------------------------------------------------
    const geometry = new THREE.BufferGeometry();

    const startArray = new Float32Array(shapes[ORDERED_SERVICE_SHAPES[0]]);
    const targetArray = new Float32Array(
      ORDERED_SERVICE_SHAPES[0]
        ? shapes[ORDERED_SERVICE_SHAPES[0]]
        : shapes.wireframe
    );
    // Independent seeded, axis-stretched volume: no sphere target or shell.
    const cloudArray = new Float32Array(maxCount * 3);
    const cloudRng = createSeededRandom(18391);
    let shapeRadius = 0;
    for (const id of ORDERED_SERVICE_SHAPES) {
      const points = shapes[id];
      for (let i = 0; i < points.length; i += 3) {
        shapeRadius = Math.max(shapeRadius, Math.hypot(points[i], points[i + 1], points[i + 2]));
      }
    }
    const cloudRadius = shapeRadius * 1.3;
    for (let i = 0; i < maxCount; i++) {
      const x = (cloudRng() - 0.5) * 2.4;
      const y = (cloudRng() - 0.5) * 1.35;
      const z = (cloudRng() - 0.5) * 1.7;
      const scale = Math.min(1, cloudRadius / Math.max(0.001, Math.hypot(x, y, z)));
      cloudArray.set([x * scale, y * scale, z * scale], i * 3);
    }

    const repelDisplacements = new Float32Array(maxCount * 3);
    const repelVelocities = new Float32Array(maxCount * 3);
    const repelHighlights = new Float32Array(maxCount);

    const rng = createSeededRandom(7719);
    const seeds = new Float32Array(maxCount);
    const sizes = new Float32Array(maxCount);
    const alphas = new Float32Array(maxCount);
    const colors = new Float32Array(maxCount * 3);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < maxCount; i++) {
      const r1 = rng();
      const r2 = rng();
      const r3 = rng();

      seeds[i] = r1;
      sizes[i] = r2 > 0.84 ? 2.3 + r3 * 0.75 : 1.35 + r2 * 1.05;
      alphas[i] = 0.38 + Math.pow(r3, 1.15) * 0.56;

      const y = 1 - (i / Math.max(1, maxCount - 1)) * 2;
      const theta = goldenAngle * i;
      const bandSeed =
        Math.abs(Math.sin(theta * 0.5 + y * 2.4)) *
        ANTIGRAVITY_BW_PALETTE.length;
      const paletteIdx =
        (Math.floor(bandSeed) +
          (i % 3 === 0 ? 0 : i % ANTIGRAVITY_BW_PALETTE.length)) %
        ANTIGRAVITY_BW_PALETTE.length;
      const chosen = ANTIGRAVITY_BW_PALETTE[paletteIdx];

      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;
    }

    const startAttr = new THREE.BufferAttribute(startArray, 3);
    const targetAttr = new THREE.BufferAttribute(targetArray, 3);
    const repelOffsetAttr = new THREE.BufferAttribute(repelDisplacements, 3);
    const repelHighlightAttr = new THREE.BufferAttribute(repelHighlights, 1);

    geometry.setAttribute("position", startAttr);
    geometry.setAttribute("aTarget", targetAttr);
    geometry.setAttribute("aCloud", new THREE.BufferAttribute(cloudArray, 3));
    geometry.setAttribute("aRepelOffset", repelOffsetAttr);
    geometry.setAttribute("aRepelHighlight", repelHighlightAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
    geometry.setDrawRange(0, activeCount);

    const initialMetrics = stage.getMetrics();
    const initialWobbleMul =
      layoutMode === "desktop" ? 1.0 : detectedTier.idleWobbleMultiplier;

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uAssemble: { value: 0 },
      uCloudRadius: { value: cloudRadius },
      uMidpointDust: { value: 0 },
      uPixelRatio: { value: initialMetrics.dpr },
      uShapeScale: { value: shapeScaleWorld },
      uIdleWobble: {
        value: prefersReducedMotion
          ? 0.0
          : PARTICLE_TUNING.IDLE_WOBBLE_AMOUNT * initialWobbleMul,
      },
      uNoiseAmount: {
        value:
          layoutMode === "mobile" && detectedTier.tier === "low"
            ? PARTICLE_TUNING.MIDPOINT_NOISE_AMOUNT * 0.65
            : PARTICLE_TUNING.MIDPOINT_NOISE_AMOUNT,
      },
      uHoverEnergy: { value: 0 },
      uPulseActive: { value: 0 },
      uPulseProgress: { value: 0 },
      uPulseStrength: { value: PARTICLE_TUNING.HOVER_PULSE_STRENGTH },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        attribute vec3 aTarget;
        attribute vec3 aCloud;
        attribute vec3 aRepelOffset;
        attribute float aRepelHighlight;
        attribute vec3 aColor;
        attribute float aSeed;
        attribute float aSize;
        attribute float aAlpha;

        uniform float uTime;
        uniform float uMorph;
        uniform float uAssemble;
        uniform float uCloudRadius;
        uniform float uMidpointDust;
        uniform float uPixelRatio;
        uniform float uShapeScale;
        uniform float uIdleWobble;
        uniform float uNoiseAmount;
        uniform float uHoverEnergy;
        uniform float uPulseActive;
        uniform float uPulseProgress;
        uniform float uPulseStrength;

        varying float vAlpha;
        varying vec3 vColor;

        vec3 curlNoise3D(vec3 p, float t, float seed) {
          float ph = seed * 6.2831853;
          float nx = sin(p.y * 3.1 + t * 0.85 + ph) - cos(p.z * 2.7 - t * 0.65);
          float ny = sin(p.z * 3.3 + t * 0.78 + ph * 1.3) - cos(p.x * 2.9 + t * 0.62);
          float nz = sin(p.x * 2.8 - t * 0.82 + ph * 0.7) - cos(p.y * 3.2 + t * 0.71);
          return vec3(nx, ny, nz) * 0.5;
        }

        void main() {
          float staggered = clamp((uMorph * 1.30) - aSeed * 0.30, 0.0, 1.0);
          float eased = staggered * staggered * staggered * (staggered * (staggered * 6.0 - 15.0) + 10.0);

          vec3 basePos = mix(position, aTarget, eased);

          float midBell = sin(3.14159265 * staggered) * uMidpointDust;
          basePos = mix(basePos, aCloud, midBell * ${MORPH_DISPERSAL.toFixed(2)});
          if (midBell > 0.002) {
            vec3 midNoise = curlNoise3D(basePos * 1.45, uTime, aSeed) * midBell * uNoiseAmount * (0.45 + aSeed * 0.75);
            basePos += midNoise * vec3(1.3, 0.65, 0.9) * ${MORPH_DISPERSAL.toFixed(2)};
            basePos *= min(1.0, uCloudRadius / max(length(basePos), 0.001));
          }

          float entryRipple = mix(aSeed, clamp(length(aTarget.xy) / max(uCloudRadius, 0.001), 0.0, 1.0), 0.65);
          float assemble = smoothstep(0.0, 1.0, clamp(uAssemble * 1.25 - entryRipple * 0.25, 0.0, 1.0));
          basePos = mix(aCloud, basePos, assemble);

          // Card-hover OR mobile canvas-tap breathing pulse (~36% loosen + re-assemble)
          float pulseWave = 0.0;
          if (uPulseActive > 0.5) {
            float pStagger = clamp((uPulseProgress * 1.28) - aSeed * 0.28, 0.0, 1.0);
            float bell = sin(3.14159265 * pStagger);
            pulseWave = bell * bell;
            vec3 outwardDir = normalize(basePos + aCloud * 0.32 + vec3(0.0001));
            vec3 loosenedPos = basePos * (1.0 + 0.94 * uPulseStrength) + outwardDir * (0.28 * uPulseStrength);
            vec3 pulseCurl = curlNoise3D(basePos * 1.65, uTime * 1.2, aSeed) * pulseWave * uPulseStrength * 0.92;
            basePos = mix(basePos, loosenedPos, pulseWave) + pulseCurl;
          }

          basePos += aRepelOffset;

          vec3 wobble = uIdleWobble > 0.0001
            ? curlNoise3D(basePos * 2.2, uTime * 0.75, aSeed) * uIdleWobble
            : vec3(0.0);
          float breathe = 1.0 + sin(uTime * 1.1) * (uIdleWobble * 0.8) + uHoverEnergy * 0.032;
          vec3 scaledPos = (basePos * breathe + wobble) * uShapeScale;

          vec4 mvPosition = modelViewMatrix * vec4(scaledPos, 1.0);
          float dist = max(120.0, -mvPosition.z);

          float relDepth = clamp((mvPosition.z + 800.0) / (uShapeScale * 2.2) + 0.5, 0.0, 1.0);
          float depthAlpha = mix(0.28, 0.96, relDepth);
          float depthSize = mix(0.76, 1.28, relDepth);

          float scatterDim = 1.0 - 0.16 * max(1.0 - uAssemble, midBell);
          vAlpha = clamp(aAlpha * depthAlpha * scatterDim * (1.0 + uHoverEnergy * 0.14 + pulseWave * 0.12), 0.10, 0.96);

          vec3 electricBlue = vec3(0.192, 0.525, 1.0);
          float tintMix = clamp(aRepelHighlight * 0.78 + pulseWave * 0.48 + uHoverEnergy * 0.24, 0.0, 0.88);
          vColor = mix(aColor, electricBlue, tintMix);

          gl_PointSize = aSize * depthSize * uPixelRatio * (700.0 / dist) * (1.0 + aRepelHighlight * 0.38 + pulseWave * 0.18);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if (d > 0.5) discard;

          float softEdge = smoothstep(0.5, 0.12, d);
          gl_FragColor = vec4(vColor, softEdge * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, shaderMaterial);
    cloudGroup.add(points);

    // Runtime adaptive FPS governor with hysteresis (steps down drawRange & DPR if < 45fps)
    const fpsMonitor = createAdaptiveFpsMonitor(
      detectedTier.tier,
      (nextSpec: PerformanceTierConfig) => {
        activeCount = Math.min(maxCount, nextSpec.particleCount);
        geometry.setDrawRange(0, activeCount);
        const appliedDpr = stage.setMaxDpr(nextSpec.dprCap);
        uniforms.uPixelRatio.value = appliedDpr;
        if (nextSpec.tier === "low") {
          uniforms.uIdleWobble.value = 0;
        }
      }
    );

    const snapshotCurrentCloudIntoStart = (
      currentMorph: number,
      midpointDustWeight: number,
      activePulse: boolean,
      currentPulseProg: number
    ) => {
      const pStrength = PARTICLE_TUNING.HOVER_PULSE_STRENGTH;
      for (let i = 0; i < activeCount; i++) {
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
            Math.sin(Math.PI * stag) * midpointDustWeight * MORPH_DISPERSAL;
          x += (cloudArray[i3] - x) * midBell;
          y += (cloudArray[i3 + 1] - y) * midBell;
          z += (cloudArray[i3 + 2] - z) * midBell;
        }

        if (activePulse) {
          const pStag = Math.max(
            0,
            Math.min(1, currentPulseProg * 1.28 - seed * 0.28)
          );
          const bell = Math.sin(Math.PI * pStag);
          const pw = bell * bell;
          if (pw > 0.001) {
            const ox = x + cloudArray[i3] * 0.32;
            const oy = y + cloudArray[i3 + 1] * 0.32;
            const oz = z + cloudArray[i3 + 2] * 0.32;
            const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
            const lx =
              x * (1 + 0.94 * pStrength) + (ox / len) * (0.28 * pStrength);
            const ly =
              y * (1 + 0.94 * pStrength) + (oy / len) * (0.28 * pStrength);
            const lz =
              z * (1 + 0.94 * pStrength) + (oz / len) * (0.28 * pStrength);
            x += (lx - x) * pw;
            y += (ly - y) * pw;
            z += (lz - z) * pw;
          }
        }

        startArray[i3] = x;
        startArray[i3 + 1] = y;
        startArray[i3 + 2] = z;
      }
      startAttr.needsUpdate = true;
    };

    let scrollFromShape: ServiceShapeId = ORDERED_SERVICE_SHAPES[0];
    let scrollToShape: ServiceShapeId = ORDERED_SERVICE_SHAPES[0];

    let isPreviewOverride = false;
    let overrideTargetShape: ServiceShapeId | null = null;
    let overrideMorphT = 1;

    let lastPulseSeq = hoverBridgeRef?.current.pulseSeq ?? 0;
    let localTouchPulsePending = false;
    let pulseActive = false;
    let pulseProgress = 0;

    // Touch tap-to-pulse listener gated strictly to coarse/touch pointers (`(hover: none), (pointer: coarse)`)
    const coarsePointerQuery = window.matchMedia(
      "(hover: none), (pointer: coarse)"
    );
    const handleCanvasTap = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      if (e.pointerType === "touch" || coarsePointerQuery.matches) {
        localTouchPulsePending = true;
      }
    };
    container.addEventListener("pointerdown", handleCanvasTap, {
      passive: true,
    });

    let hoverEnergy = 0;
    let hoverTweenFrom = 0;
    let hoverTweenTarget = 0;
    let hoverTweenElapsedMs = 0;
    let hoverTweenDurationMs: number = PARTICLE_TUNING.HOVER_ENTER_EASE_MS;

    let hasRepelResidual = false;
    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;
    let entryStartedAt: number | null = null;
    const entryObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entryStartedAt === null) {
        entryStartedAt = performance.now();
        entryObserver.disconnect();
      }
    }, { threshold: 0.02 });
    entryObserver.observe(container);
    let smoothProgress = scrollProgressRef.current;
    let spinAngleY = 0;

    const renderLoop = (now: number) => {
      rafId = requestAnimationFrame(renderLoop);

      if (!stage.isActive()) {
        lastNow = now;
        fpsMonitor.resetWindow();
        return;
      }

      const dt = Math.min((now - lastNow) / 1000, 0.05);
      const dtMs = dt * 1000;
      lastNow = now;
      elapsed += dt;
      uniforms.uAssemble.value = prefersReducedMotion ? 1 : entryStartedAt === null ? 0 : Math.min(1, (now - entryStartedAt) / ENTRY_ASSEMBLE_MS);

      fpsMonitor.recordFrame(dt, now);
      uniforms.uPixelRatio.value = stage.getMetrics().dpr;

      const rawP = scrollProgressRef.current;
      smoothProgress +=
        (rawP - smoothProgress) * PARTICLE_TUNING.PROGRESS_LERP;

      const scrollState = evaluateServicesMasterTimeline(smoothProgress);
      const bridge = hoverBridgeRef?.current;
      const previewIdx = bridge?.previewIndex ?? null;
      const isCardHovered =
        !prefersReducedMotion &&
        Boolean(bridge?.cardHovered || previewIdx !== null);

      const desiredEnergy = isCardHovered ? 1 : 0;
      if (desiredEnergy !== hoverTweenTarget) {
        hoverTweenFrom = hoverEnergy;
        hoverTweenTarget = desiredEnergy;
        hoverTweenElapsedMs = 0;
        hoverTweenDurationMs =
          desiredEnergy > hoverTweenFrom
            ? PARTICLE_TUNING.HOVER_ENTER_EASE_MS
            : PARTICLE_TUNING.HOVER_LEAVE_EASE_MS;
      }
      if (hoverEnergy !== hoverTweenTarget) {
        hoverTweenElapsedMs = Math.min(
          hoverTweenDurationMs,
          hoverTweenElapsedMs + dtMs
        );
        const t = easeInOutCubic(
          hoverTweenElapsedMs / Math.max(1, hoverTweenDurationMs)
        );
        hoverEnergy = hoverTweenFrom + (hoverTweenTarget - hoverTweenFrom) * t;
      }
      uniforms.uHoverEnergy.value = hoverEnergy;

      // Breathing pulse triggered either by desktop card hover OR mobile canvas tap!
      const incomingPulseSeq = bridge?.pulseSeq ?? 0;
      const shouldStartPulse =
        incomingPulseSeq !== lastPulseSeq || localTouchPulsePending;
      if (shouldStartPulse) {
        lastPulseSeq = incomingPulseSeq;
        localTouchPulsePending = false;
        if (!prefersReducedMotion && previewIdx === null) {
          if (pulseActive && pulseProgress > 0.5 && pulseProgress < 1) {
            pulseProgress = 1 - pulseProgress;
          } else if (!pulseActive || pulseProgress >= 1) {
            pulseProgress = 0;
          }
          pulseActive = true;
        }
      }

      if (pulseActive) {
        if (scrollState.cardTransitionT > 0.02 || previewIdx !== null) {
          pulseActive = false;
          pulseProgress = 0;
        } else {
          pulseProgress += dtMs / PARTICLE_TUNING.HOVER_PULSE_DURATION_MS;
          if (pulseProgress >= 1) {
            pulseProgress = 0;
            pulseActive = false;
          }
        }
      }
      uniforms.uPulseActive.value = pulseActive ? 1.0 : 0.0;
      uniforms.uPulseProgress.value = pulseProgress;

      // Boost soft radial glow slightly during mobile tap pulse as well
      const pulseBell = pulseActive ? Math.sin(Math.PI * pulseProgress) : 0;
      const effectiveGlowEnergy = Math.max(hoverEnergy, pulseBell * 0.65);
      accentGlow.material.opacity = 0.14 + effectiveGlowEnergy * 0.78;
      const glowScale = shapeScaleWorld * (2.82 + effectiveGlowEnergy * 0.42);
      accentGlow.sprite.scale.set(glowScale, glowScale, 1);

      let activeFromShapeForSpin: ServiceShapeId = scrollState.fromShape;
      let activeToShapeForSpin: ServiceShapeId = scrollState.toShape;
      let activeSpinBlend = scrollState.shapeMorphT;

      if (previewIdx !== null && !prefersReducedMotion) {
        const desiredShape =
          ORDERED_SERVICE_SHAPES[previewIdx] ?? ORDERED_SERVICE_SHAPES[0];

        if (!isPreviewOverride) {
          isPreviewOverride = true;
          const settledScrollShape =
            scrollState.shapeMorphT < 0.04
              ? scrollState.fromShape
              : scrollState.shapeMorphT > 0.96
              ? scrollState.toShape
              : null;

          if (settledScrollShape === desiredShape) {
            startArray.set(shapes[desiredShape]);
            targetArray.set(shapes[desiredShape]);
            startAttr.needsUpdate = true;
            targetAttr.needsUpdate = true;
            overrideTargetShape = desiredShape;
            overrideMorphT = 1;
          } else {
            snapshotCurrentCloudIntoStart(
              uniforms.uMorph.value,
              uniforms.uMidpointDust.value,
              pulseActive,
              pulseProgress
            );
            targetArray.set(shapes[desiredShape]);
            targetAttr.needsUpdate = true;
            overrideTargetShape = desiredShape;
            overrideMorphT = 0;
          }
        } else if (overrideTargetShape !== desiredShape) {
          snapshotCurrentCloudIntoStart(
            overrideMorphT,
            uniforms.uMidpointDust.value,
            false,
            0
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

        uniforms.uMidpointDust.value = overrideMorphT < 1 ? 1.0 : 0.0;

        activeFromShapeForSpin = desiredShape;
        activeToShapeForSpin = desiredShape;
        activeSpinBlend = 1;
      } else if (isPreviewOverride) {
        const scrollImpliedShape =
          scrollState.shapeMorphT >= 0.5
            ? scrollState.toShape
            : scrollState.fromShape;

        if (scrollState.cardTransitionT > 0.03) {
          isPreviewOverride = false;
          overrideTargetShape = null;
          scrollFromShape = "" as ServiceShapeId;
        } else {
          if (overrideTargetShape !== scrollImpliedShape) {
            snapshotCurrentCloudIntoStart(
              overrideMorphT,
              uniforms.uMidpointDust.value,
              false,
              0
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

          uniforms.uMidpointDust.value = overrideMorphT < 1 ? 1.0 : 0.0;

          activeFromShapeForSpin = scrollImpliedShape;
          activeToShapeForSpin = scrollImpliedShape;
          activeSpinBlend = 1;

          if (overrideMorphT >= 1) {
            isPreviewOverride = false;
            overrideTargetShape = null;
            scrollFromShape = "" as ServiceShapeId;
          }
        }
      }

      if (!isPreviewOverride && previewIdx === null) {
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

        uniforms.uMidpointDust.value =
          1.0;
      }

      const speedMul = prefersReducedMotion
        ? 0
        : 1 +
          effectiveGlowEnergy * (PARTICLE_TUNING.HOVER_ROTATION_MULTIPLIER - 1);
      spinAngleY += dt * PARTICLE_TUNING.HELIX_ROTATION_SPEED * speedMul;

      const swayY =
        Math.sin(elapsed * PARTICLE_TUNING.SWAY_SPEED * speedMul) *
        PARTICLE_TUNING.SWAY_AMPLITUDE_Y;

      const fromSpins =
        activeFromShapeForSpin === "dnaHelix"
          ? 1
          : 0;
      const toSpins =
        activeToShapeForSpin === "dnaHelix"
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
        (prefersReducedMotion ? 0 : Math.sin(elapsed * 0.42) * 0.06);

      const { width, height, pxToWorld } = stage.getMetrics();
      cloudGroup.position.set(
        baseCenterWorldX,
        baseCenterWorldY +
          (prefersReducedMotion
            ? 0
            : Math.sin(elapsed * 0.85) * (4.0 * pxToWorld)),
        0
      );

      // Left-stage cursor repulsion (desktop fine pointer only — zero CPU cost on mobile!)
      stage.pointer.stepLerp();
      const cursorActive =
        !prefersReducedMotion &&
        layoutMode === "desktop" &&
        fineHoverQuery.matches &&
        stage.pointer.inside;

      if (cursorActive || hasRepelResidual) {
        hasRepelResidual = stepScreenSpaceRepulsionSpring({
          count: activeCount,
          startPositions: startArray,
          targetPositions: targetArray,
          seeds,
          morphProgress: uniforms.uMorph.value,
          displacements: repelDisplacements,
          velocities: repelVelocities,
          highlights: repelHighlights,
          shapeScaleWorld,
          rotationX: points.rotation.x,
          rotationY: points.rotation.y,
          groupX: cloudGroup.position.x,
          groupY: cloudGroup.position.y,
          groupZ: cloudGroup.position.z,
          cameraZ: stage.camera.position.z,
          stageWidth: width,
          stageHeight: height,
          pxToWorld,
          cursorX: stage.pointer.lerpedX,
          cursorY: stage.pointer.lerpedY,
          cursorActive,
          time: elapsed,
          influenceRadiusPx: PARTICLE_TUNING.REPEL_RADIUS_PX,
          repelStrengthPx: PARTICLE_TUNING.REPEL_STRENGTH_PX,
        });
        repelOffsetAttr.needsUpdate = true;
        repelHighlightAttr.needsUpdate = true;
      }

      uniforms.uTime.value = elapsed;
      uniforms.uShapeScale.value = shapeScaleWorld;

      stage.renderer.render(stage.scene, stage.camera);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      container.removeEventListener("pointerdown", handleCanvasTap);
      cancelAnimationFrame(rafId);
      entryObserver.disconnect();
      geometry.dispose();
      shaderMaterial.dispose();
      accentGlow.dispose();
      stage.dispose();
    };
  }, [
    hoverBridgeRef,
    layoutMode,
    onResizeSettled,
    onWebGLUnavailable,
    scrollProgressRef,
    staticShape,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`select-none overflow-hidden ${className}`}
    />
  );
}
